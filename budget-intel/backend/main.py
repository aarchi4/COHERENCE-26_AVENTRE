from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
from data import USERS, SCHEMES, PROJECTS, COMPLAINTS, ALERTS

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
