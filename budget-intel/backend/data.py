USERS = [
    {"email": "admin@india.gov",       "password": "admin123",  "role": "government", "name": "Central Government"},
    {"email": "maharashtra@state.gov", "password": "maha123",   "role": "state",      "name": "Maharashtra", "state": "Maharashtra"},
    {"email": "gujarat@state.gov",     "password": "guj123",    "role": "state",      "name": "Gujarat",     "state": "Gujarat"},
    {"email": "palghar@district.gov",  "password": "pal123",    "role": "district",   "name": "Palghar",     "state": "Maharashtra", "district": "Palghar"},
    {"email": "pune@district.gov",     "password": "pune123",   "role": "district",   "name": "Pune",        "state": "Maharashtra", "district": "Pune"},
    {"email": "nashik@district.gov",   "password": "nash123",   "role": "district",   "name": "Nashik",      "state": "Maharashtra", "district": "Nashik"},
    {"email": "citizen1@gmail.com",    "password": "user123",   "role": "user",       "name": "Rahul Sharma"},
]

def detect_anomaly(allocated, spent):
    if allocated == 0:
        return {"diff_percent": 0, "status": "No Data", "color": "grey", "auto_report": False}
    diff = abs(allocated - spent)
    pct = round((diff / allocated) * 100, 2)
    if pct <= 5:
        return {"diff_percent": pct, "status": "OK",      "color": "green",  "auto_report": False}
    elif pct <= 15:
        return {"diff_percent": pct, "status": "Warning", "color": "yellow", "auto_report": False}
    else:
        return {"diff_percent": pct, "status": "Anomaly", "color": "red",    "auto_report": True}

RAW_SCHEMES = [
    {
        "scheme_id": "SCH001", "name": "Ayushman Bharat", "ministry": "Health",
        "centre_released": 100000000,
        "state_data": [
            {"state": "Maharashtra", "allocated": 48000000, "spent": 55000000,
             "districts": [
                 {"district": "Palghar", "allocated": 10000000, "spent": 11600000},
                 {"district": "Pune",    "allocated": 18000000, "spent": 17500000},
                 {"district": "Nashik",  "allocated": 12000000, "spent": 10000000},
             ]},
            {"state": "Gujarat", "allocated": 38000000, "spent": 37000000,
             "districts": [
                 {"district": "Surat",    "allocated": 15000000, "spent": 14800000},
                 {"district": "Vadodara", "allocated": 12000000, "spent": 13900000},
             ]},
        ]
    },
    {
        "scheme_id": "SCH002", "name": "PM Awas Yojana", "ministry": "Housing",
        "centre_released": 200000000,
        "state_data": [
            {"state": "Maharashtra", "allocated": 90000000, "spent": 88000000,
             "districts": [
                 {"district": "Palghar", "allocated": 20000000, "spent": 19500000},
                 {"district": "Pune",    "allocated": 35000000, "spent": 40000000},
                 {"district": "Nashik",  "allocated": 25000000, "spent": 15000000},
             ]},
            {"state": "Gujarat", "allocated": 75000000, "spent": 74000000,
             "districts": [
                 {"district": "Surat",    "allocated": 30000000, "spent": 29500000},
                 {"district": "Vadodara", "allocated": 25000000, "spent": 24000000},
             ]},
        ]
    },
    {
        "scheme_id": "SCH003", "name": "PM Gram Sadak Yojana", "ministry": "Infrastructure",
        "centre_released": 150000000,
        "state_data": [
            {"state": "Maharashtra", "allocated": 65000000, "spent": 64000000,
             "districts": [
                 {"district": "Palghar", "allocated": 25000000, "spent": 24500000},
                 {"district": "Pune",    "allocated": 20000000, "spent": 23500000},
                 {"district": "Nashik",  "allocated": 15000000, "spent": 14800000},
             ]},
            {"state": "Gujarat", "allocated": 55000000, "spent": 54000000,
             "districts": [
                 {"district": "Surat",    "allocated": 25000000, "spent": 24800000},
                 {"district": "Vadodara", "allocated": 20000000, "spent": 19500000},
             ]},
        ]
    },
    {
        "scheme_id": "SCH004", "name": "Sarva Shiksha Abhiyan", "ministry": "Education",
        "centre_released": 120000000,
        "state_data": [
            {"state": "Maharashtra", "allocated": 55000000, "spent": 54000000,
             "districts": [
                 {"district": "Palghar", "allocated": 15000000, "spent": 14700000},
                 {"district": "Pune",    "allocated": 22000000, "spent": 21500000},
                 {"district": "Nashik",  "allocated": 12000000, "spent": 9500000},
             ]},
            {"state": "Gujarat", "allocated": 45000000, "spent": 44500000,
             "districts": [
                 {"district": "Surat",    "allocated": 20000000, "spent": 19800000},
                 {"district": "Vadodara", "allocated": 15000000, "spent": 14600000},
             ]},
        ]
    },
    {
        "scheme_id": "SCH005", "name": "Swachh Bharat Mission", "ministry": "Sanitation",
        "centre_released": 80000000,
        "state_data": [
            {"state": "Maharashtra", "allocated": 35000000, "spent": 35500000,
             "districts": [
                 {"district": "Palghar", "allocated": 10000000, "spent": 10200000},
                 {"district": "Pune",    "allocated": 14000000, "spent": 13800000},
                 {"district": "Nashik",  "allocated": 8000000,  "spent": 8100000},
             ]},
            {"state": "Gujarat", "allocated": 30000000, "spent": 29500000,
             "districts": [
                 {"district": "Surat",    "allocated": 13000000, "spent": 12900000},
                 {"district": "Vadodara", "allocated": 10000000, "spent": 9800000},
             ]},
        ]
    },
]

def build_schemes():
    schemes = []
    for s in RAW_SCHEMES:
        scheme = dict(s)
        for state in scheme["state_data"]:
            state.update(detect_anomaly(state["allocated"], state["spent"]))
            for d in state["districts"]:
                d.update(detect_anomaly(d["allocated"], d["spent"]))
        schemes.append(scheme)
    return schemes

SCHEMES = build_schemes()

RAW_PROJECTS = [
    {"project_id":"PRJ001","name":"NH-48 Road Widening","department":"Infrastructure","scheme":"PM Gram Sadak Yojana","state":"Maharashtra","district":"Palghar","contractor":"ABC Infra Pvt Ltd","centre_released":25000000,"state_allocated":24500000,"district_allocated":24000000,"contractor_paid":24200000,"completion_pct":80,"status":"In Progress"},
    {"project_id":"PRJ002","name":"Govt School Renovation - Palghar","department":"Education","scheme":"Sarva Shiksha Abhiyan","state":"Maharashtra","district":"Palghar","contractor":"XYZ Builders Ltd","centre_released":15000000,"state_allocated":14700000,"district_allocated":14000000,"contractor_paid":16500000,"completion_pct":45,"status":"Delayed"},
    {"project_id":"PRJ003","name":"Primary Health Centre - Vasai","department":"Healthcare","scheme":"Ayushman Bharat","state":"Maharashtra","district":"Palghar","contractor":"MediConstruct Pvt Ltd","centre_released":10000000,"state_allocated":9800000,"district_allocated":9500000,"contractor_paid":9400000,"completion_pct":90,"status":"Near Complete"},
    {"project_id":"PRJ004","name":"Pune Metro Phase 3","department":"Infrastructure","scheme":"PM Gram Sadak Yojana","state":"Maharashtra","district":"Pune","contractor":"Metro Rail Corp","centre_released":20000000,"state_allocated":19500000,"district_allocated":19000000,"contractor_paid":23500000,"completion_pct":55,"status":"In Progress"},
    {"project_id":"PRJ005","name":"Nashik Water Supply Scheme","department":"Sanitation","scheme":"Swachh Bharat Mission","state":"Maharashtra","district":"Nashik","contractor":"AquaBuild Ltd","centre_released":8000000,"state_allocated":7800000,"district_allocated":7500000,"contractor_paid":4500000,"completion_pct":20,"status":"Stalled"},
    {"project_id":"PRJ006","name":"Nashik School Digital Labs","department":"Education","scheme":"Sarva Shiksha Abhiyan","state":"Maharashtra","district":"Nashik","contractor":"DigiLearn Systems","centre_released":12000000,"state_allocated":11500000,"district_allocated":11000000,"contractor_paid":10800000,"completion_pct":70,"status":"In Progress"},
    {"project_id":"PRJ007","name":"Pune Housing Complex Phase 1","department":"Housing","scheme":"PM Awas Yojana","state":"Maharashtra","district":"Pune","contractor":"BuildRight Pvt Ltd","centre_released":35000000,"state_allocated":34000000,"district_allocated":33000000,"contractor_paid":38500000,"completion_pct":60,"status":"In Progress"},
    {"project_id":"PRJ008","name":"Surat Solar Power Plant","department":"Infrastructure","scheme":"PM Gram Sadak Yojana","state":"Gujarat","district":"Surat","contractor":"SolarTech Gujarat","centre_released":30000000,"state_allocated":29500000,"district_allocated":29000000,"contractor_paid":28800000,"completion_pct":95,"status":"Near Complete"},
    {"project_id":"PRJ009","name":"Vadodara Rural Health Camps","department":"Healthcare","scheme":"Ayushman Bharat","state":"Gujarat","district":"Vadodara","contractor":"HealthServe NGO","centre_released":13900000,"state_allocated":13500000,"district_allocated":13000000,"contractor_paid":15200000,"completion_pct":85,"status":"In Progress"},
]

def build_projects():
    projects = []
    for p in RAW_PROJECTS:
        proj = dict(p)
        anomaly = detect_anomaly(proj["district_allocated"], proj["contractor_paid"])
        proj.update(anomaly)
        proj["reported_to"] = ["state", "government"] if anomaly["auto_report"] else []
        projects.append(proj)
    return projects

PROJECTS = build_projects()

COMPLAINTS = [
    {"complaint_id":"CMP001","user_email":"citizen1@gmail.com","user_name":"Rahul Sharma","project_id":"PRJ002","project_name":"Govt School Renovation - Palghar","district":"Palghar","state":"Maharashtra","description":"School construction stopped for 2 months. Workers not on site. Funds may be diverted.","status":"Under Review","filed_on":"2024-11-10"},
    {"complaint_id":"CMP002","user_email":"citizen1@gmail.com","user_name":"Rahul Sharma","project_id":"PRJ005","project_name":"Nashik Water Supply Scheme","district":"Nashik","state":"Maharashtra","description":"Water supply pipes delivered but not installed for 3 months. Contractor not responding.","status":"Resolved","filed_on":"2024-10-05"},
]

def build_alerts():
    alerts = []
    for p in PROJECTS:
        if p["auto_report"]:
            direction = "Overspend" if p["contractor_paid"] > p["district_allocated"] else "Underspend"
            alerts.append({
                "alert_id": f"ALT-{p['project_id']}",
                "project_id": p["project_id"],
                "project_name": p["name"],
                "district": p["district"],
                "state": p["state"],
                "department": p["department"],
                "diff_percent": p["diff_percent"],
                "direction": direction,
                "color": p["color"],
                "reported_to": p["reported_to"],
                "message": f"{direction} of {p['diff_percent']}% detected in {p['name']}"
            })
    return alerts

ALERTS = build_alerts()
