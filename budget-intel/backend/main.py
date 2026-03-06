from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
import joblib
import json
import numpy as np
import os
from data import USERS, SCHEMES, PROJECTS, COMPLAINTS, ALERTS

# Load ML models
try:
    _iso = joblib.load('models/anomaly_model.pkl')
    _scaler = joblib.load('models/anomaly_scaler.pkl')
    ML_MODELS_LOADED = True
except Exception as e:
    print(f"⚠️ Warning: ML models not loaded: {e}")
    ML_MODELS_LOADED = False

app = FastAPI(title="BudgetFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

complaints_db = list(COMPLAINTS)


class LoginBody(BaseModel):
    email: str
    password: str


class ComplaintBody(BaseModel):
    project_id: str
    project_name: str
    district: str
    state: str
    description: str
    user_email: str
    user_name: str


class AnomalyPredictionBody(BaseModel):
    allocated: float
    spent: float
    completion_pct: float
    month: int
    district_tier: int = 2


def _strip_password(u: dict) -> dict:
    safe = dict(u)
    safe.pop("password", None)
    return safe


def _filter_projects_by_scope(role: str, state: str = "", district: str = ""):
    role = (role or "").lower().strip()
    state = (state or "").strip()
    district = (district or "").strip()

    if role == "government":
        return list(PROJECTS)
    if role == "state":
        if not state:
            return []
        return [p for p in PROJECTS if p.get("state") == state]
    if role == "district":
        if not district:
            return []
        return [p for p in PROJECTS if p.get("district") == district]
    if role == "user":
        return list(PROJECTS)
    return list(PROJECTS)


@app.post("/api/login")
def login(body: LoginBody):
    for u in USERS:
        if u["email"].lower() == body.email.lower().strip() and u["password"] == body.password:
            return _strip_password(u)
    return {"error": "Invalid credentials"}


@app.get("/api/summary")
def summary(role: str, state: str = "", district: str = ""):
    projs = _filter_projects_by_scope(role, state=state, district=district)
    total_allocated = sum(p.get("district_allocated", 0) for p in projs)
    total_spent = sum(p.get("contractor_paid", 0) for p in projs)
    total_remaining = total_allocated - total_spent
    anomaly_count = sum(1 for p in projs if p.get("color") == "red")
    return {
        "total_allocated": total_allocated,
        "total_spent": total_spent,
        "total_remaining": total_remaining,
        "anomaly_count": anomaly_count,
    }


@app.get("/api/schemes")
def schemes(state: str = "", district: str = ""):
    state = (state or "").strip()
    district = (district or "").strip()

    if not state and not district:
        return SCHEMES

    out = []
    for s in SCHEMES:
        scheme = {
            "scheme_id": s.get("scheme_id"),
            "name": s.get("name"),
            "ministry": s.get("ministry"),
            "centre_released": s.get("centre_released"),
            "state_data": [],
        }

        for st in s.get("state_data", []):
            if state and st.get("state") != state:
                continue
            st_copy = dict(st)
            if district:
                st_copy["districts"] = [d for d in st_copy.get("districts", []) if d.get("district") == district]
            scheme["state_data"].append(st_copy)

        if scheme["state_data"]:
            out.append(scheme)

    return out


@app.get("/api/projects")
def projects(state: str = "", district: str = ""):
    state = (state or "").strip()
    district = (district or "").strip()
    projs = list(PROJECTS)
    if state:
        projs = [p for p in projs if p.get("state") == state]
    if district:
        projs = [p for p in projs if p.get("district") == district]
    return projs


@app.get("/api/alerts")
def alerts(state: str = ""):
    state = (state or "").strip()
    if not state:
        return ALERTS
    return [a for a in ALERTS if a.get("state") == state]


@app.get("/api/complaints")
def complaints(email: str = "", district: str = ""):
    email = (email or "").strip().lower()
    district = (district or "").strip()
    rows = list(complaints_db)
    if email:
        rows = [c for c in rows if (c.get("user_email") or "").lower() == email]
    if district:
        rows = [c for c in rows if c.get("district") == district]
    return rows


@app.post("/api/complaints")
def create_complaint(body: ComplaintBody):
    new_id = "CMP" + str(len(complaints_db) + 1).zfill(3)
    row = {
        "complaint_id": new_id,
        "user_email": body.user_email,
        "user_name": body.user_name,
        "project_id": body.project_id,
        "project_name": body.project_name,
        "district": body.district,
        "state": body.state,
        "description": body.description,
        "status": "Submitted",
        "filed_on": str(date.today()),
    }
    complaints_db.append(row)
    return row


# ── ML Model Endpoints ────────────────────────────────────────────────

def predict_anomaly(allocated: float, spent: float,
                    completion_pct: float, month: int,
                    district_tier: int = 2) -> dict:
    """ML-based anomaly detection using Isolation Forest"""
    if not ML_MODELS_LOADED:
        return {"error": "ML models not loaded"}
    
    diff_amount = abs(allocated - spent)
    diff_percent = round(diff_amount / allocated * 100, 2) if allocated > 0 else 0
    spending_ratio = round(spent / allocated, 4) if allocated > 0 else 0
    is_overspend = 1 if spent > allocated else 0
    quarter = (month - 1) // 3 + 1

    features = np.array([[
        allocated, spent, diff_amount, diff_percent,
        spending_ratio, is_overspend, completion_pct,
        district_tier, month, quarter
    ]])

    try:
        raw = _iso.decision_function(features)[0]
        score = float(1 - _scaler.transform([[raw]])[0][0])
        score = max(0.0, min(1.0, score))

        if score < 0.40:
            risk = 'green'
        elif score < 0.65:
            risk = 'yellow'
        else:
            risk = 'red'

        return {
            'anomaly_score': round(score, 3),
            'risk_level': risk,
            'diff_percent': diff_percent,
            'direction': 'Overspend' if spent > allocated else 'Underspend',
            'auto_report': risk == 'red'
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}


@app.post("/api/predict-anomaly")
def predict_anomaly_endpoint(body: AnomalyPredictionBody):
    """Predict anomaly score for a budget project"""
    return predict_anomaly(
        allocated=body.allocated,
        spent=body.spent,
        completion_pct=body.completion_pct,
        month=body.month,
        district_tier=body.district_tier
    )


@app.get("/api/recommendations")
def get_recommendations():
    """Get ML-generated reallocation suggestions"""
    try:
        if os.path.exists('models/suggestions.json'):
            with open('models/suggestions.json', 'r') as f:
                return json.load(f)
        else:
            return {"error": "Suggestions file not found", "suggestions": []}
    except Exception as e:
        return {"error": f"Failed to load recommendations: {str(e)}", "suggestions": []}
