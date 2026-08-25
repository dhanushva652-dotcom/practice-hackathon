import os
import json
import uuid
import time
import base64
import re
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, 'static'),
    template_folder=os.path.join(BASE_DIR, 'templates')
)

# Use /tmp on Vercel/serverless environments or local directory
if os.environ.get('VERCEL') or os.path.exists('/tmp'):
    DATA_FILE = os.path.join('/tmp', 'data_issues.json')
else:
    DATA_FILE = os.path.join(BASE_DIR, 'data_issues.json')

_memory_issues = None

# Predefined categories and department mapping
DEPARTMENTS = {
    "Electrical": {
        "dept": "Electrical Maintenance",
        "email": "electrical@campus.edu",
        "sla_hours": {"Critical": 2, "High": 6, "Medium": 24, "Low": 48},
        "icon": "zap"
    },
    "Plumbing": {
        "dept": "Water & Sanitation Dept",
        "email": "plumbing@campus.edu",
        "sla_hours": {"Critical": 1, "High": 4, "Medium": 12, "Low": 36},
        "icon": "droplet"
    },
    "Waste Management": {
        "dept": "Sanitation & Grounds",
        "email": "sanitation@campus.edu",
        "sla_hours": {"Critical": 4, "High": 8, "Medium": 24, "Low": 48},
        "icon": "trash-2"
    },
    "IT & Tech": {
        "dept": "Campus IT & Media Services",
        "email": "itsupport@campus.edu",
        "sla_hours": {"Critical": 2, "High": 6, "Medium": 18, "Low": 48},
        "icon": "wifi"
    },
    "Infrastructure & Civil": {
        "dept": "Estate & Civil Works",
        "email": "estate@campus.edu",
        "sla_hours": {"Critical": 3, "High": 12, "Medium": 48, "Low": 72},
        "icon": "tool"
    },
    "HVAC & Cooling": {
        "dept": "HVAC & Mechanical",
        "email": "hvac@campus.edu",
        "sla_hours": {"Critical": 4, "High": 12, "Medium": 24, "Low": 48},
        "icon": "wind"
    },
    "Safety & Security": {
        "dept": "Campus Security & Safety",
        "email": "security@campus.edu",
        "sla_hours": {"Critical": 0.5, "High": 2, "Medium": 8, "Low": 24},
        "icon": "shield-alert"
    },
    "General Maintenance": {
        "dept": "Central Facilities Management",
        "email": "facilities@campus.edu",
        "sla_hours": {"Critical": 3, "High": 8, "Medium": 24, "Low": 48},
        "icon": "home"
    }
}

SEED_ISSUES = [
    {
        "id": "TKT-1001",
        "title": "Damaged Fluorescent Light at Main Library Entry",
        "original_text": "The light near the library entrance hasn't been working and wires look slightly loose.",
        "category": "Electrical",
        "priority": "High",
        "department": "Electrical Maintenance",
        "suggested_action": "Isolate circuit breaker, replace fixture ballast, and secure wiring.",
        "location": "Central Library, South Porch Entrance",
        "status": "In Progress",
        "timestamp": "2026-08-25T08:30:00",
        "estimated_sla": "6 hours",
        "hazard_level": "Medium - Exposed wiring safety concern",
        "confidence": 96,
        "upvotes": 7,
        "assigned_to": "Officer R. Sharma (Electrical Team A)"
    },
    {
        "id": "TKT-1002",
        "title": "Severe Water Pipe Leak in Science Block 2 Restroom",
        "original_text": "Water is gushing out from under the sink on 2nd floor chemistry building bathroom.",
        "category": "Plumbing",
        "priority": "Critical",
        "department": "Water & Sanitation Dept",
        "suggested_action": "Shut off local water valve immediately and replace ruptured connector pipe.",
        "location": "Science Block 2, Floor 2, Restroom B",
        "status": "Assigned",
        "timestamp": "2026-08-25T09:15:00",
        "estimated_sla": "1 hour",
        "hazard_level": "High - Flooding risk & slip hazard",
        "confidence": 98,
        "upvotes": 14,
        "assigned_to": "Plumbing Quick Response Unit"
    },
    {
        "id": "TKT-1003",
        "title": "Overflowing Compost Bin near Cafeteria Gazebo",
        "original_text": "Trash bin near dining hall outdoor benches is overflowing with food boxes attracting birds.",
        "category": "Waste Management",
        "priority": "Medium",
        "department": "Sanitation & Grounds",
        "suggested_action": "Deploy sanitation team for waste clearance and sanitize surrounding area.",
        "location": "Student Activity Center / Cafeteria Lawn",
        "status": "Open",
        "timestamp": "2026-08-25T09:40:00",
        "estimated_sla": "24 hours",
        "hazard_level": "Low - Sanitation & hygiene issue",
        "confidence": 94,
        "upvotes": 5,
        "assigned_to": "Unassigned"
    },
    {
        "id": "TKT-1004",
        "title": "Projector HDMI Port Broken in Auditorium 1",
        "original_text": "Audio visual system in seminar hall has bent HDMI port and no display output for lectures.",
        "category": "IT & Tech",
        "priority": "Medium",
        "department": "Campus IT & Media Services",
        "suggested_action": "Replace wall plate HDMI interface adapter and test audiovisual switcher.",
        "location": "Auditorium 1, Main Stage",
        "status": "Resolved",
        "timestamp": "2026-08-24T14:20:00",
        "estimated_sla": "18 hours",
        "hazard_level": "None - Operational hindrance",
        "confidence": 92,
        "upvotes": 3,
        "assigned_to": "AV Support Team"
    }
]

def load_issues():
    global _memory_issues
    if _memory_issues is not None:
        return _memory_issues
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                _memory_issues = json.load(f)
                return _memory_issues
        except Exception:
            _memory_issues = list(SEED_ISSUES)
            return _memory_issues
    _memory_issues = list(SEED_ISSUES)
    return _memory_issues

def save_issues(issues):
    global _memory_issues
    _memory_issues = issues
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(issues, f, indent=2)
    except Exception:
        pass

def analyze_with_ai(description, image_base64=None, api_key=None):
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            
            prompt = f"""
            You are CampusFix AI, an intelligent campus facilities incident analysis system.
            Analyze the following student campus issue report.
            
            Student Report: "{description}"
            
            Respond strictly in valid JSON with these exact keys:
            {{
                "title": "Short concise summary title",
                "category": "One of: Electrical, Plumbing, Waste Management, IT & Tech, Infrastructure & Civil, HVAC & Cooling, Safety & Security, General Maintenance",
                "priority": "One of: Critical, High, Medium, Low",
                "department": "The most appropriate campus department name",
                "suggested_action": "Actionable technical recommendation for maintenance staff",
                "hazard_level": "Assessment of hazard or urgency (e.g. High - Slip hazard / Electrical shock risk / Operational delay / Minimal risk)",
                "estimated_sla": "Turnaround time in hours or days (e.g., 2 hours, 24 hours)",
                "confidence": 95
            }}
            """
            
            parts = [{"text": prompt}]
            if image_base64:
                clean_b64 = re.sub(r'^data:image\/[a-zA-Z]+;base64,', '', image_base64)
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": clean_b64
                    }
                })
                
            payload = {
                "contents": [{"parts": parts}],
                "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2}
            }
            
            resp = requests.post(url, json=payload, timeout=8)
            if resp.status_code == 200:
                result_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
                data = json.loads(result_text)
                return data
        except Exception as e:
            print(f"[CampusFix AI] Gemini API call failed, falling back to heuristic AI engine: {e}")

    # Fallback to smart heuristic NLP engine
    text = (description or "").lower()
    
    cat_scores = {
        "Electrical": 0,
        "Plumbing": 0,
        "Waste Management": 0,
        "IT & Tech": 0,
        "Infrastructure & Civil": 0,
        "HVAC & Cooling": 0,
        "Safety & Security": 0,
        "General Maintenance": 0
    }
    
    kw_map = {
        "Electrical": ["light", "bulb", "lamp", "wiring", "wire", "switch", "plug", "socket", "power", "blackout", "spark", "fuse", "short circuit", "fan", "flickering", "dark", "electricity", "meter", "streetlight"],
        "Plumbing": ["leak", "leaking", "pipe", "water", "tap", "faucet", "sink", "drain", "clogged", "flush", "toilet", "washroom", "restroom", "overflow", "flooding", "sewage", "gushing", "pressure"],
        "Waste Management": ["garbage", "trash", "bin", "waste", "rubbish", "litter", "dumpster", "overflowing", "smell", "compost", "food waste", "cleaning", "sweep", "dustbin"],
        "IT & Tech": ["projector", "wifi", "internet", "network", "ethernet", "computer", "lab pc", "screen", "monitor", "hdmi", "speaker", "mic", "audio", "software", "printer", "router", "bluetooth"],
        "Infrastructure & Civil": ["broken", "door", "window", "crack", "stairs", "railing", "tiles", "wall", "ceiling", "glass", "pothole", "pavement", "bench", "chair", "desk", "furniture", "roof", "steps"],
        "HVAC & Cooling": ["ac", "air conditioner", "heating", "cooling", "chiller", "vent", "ventilation", "thermostat", "temperature", "humid", "airflow"],
        "Safety & Security": ["fire", "extinguisher", "emergency", "lock", "theft", "hazard", "fall", "injury", "danger", "smoke", "alarm", "cctv", "camera", "gate", "guard", "slippery", "trespass"]
    }
    
    for cat, kws in kw_map.items():
        for kw in kws:
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                cat_scores[cat] += 2
            elif kw in text:
                cat_scores[cat] += 1
                
    best_cat = max(cat_scores, key=cat_scores.get)
    if cat_scores[best_cat] == 0:
        best_cat = "General Maintenance"
        
    critical_terms = ["fire", "spark", "smoke", "flooding", "gushing", "danger", "shock", "emergency", "burst", "collapse", "gas leak"]
    high_terms = ["not working", "broken", "overflowing", "loose wire", "hazard", "heavy leak", "dark entrance", "night", "exam", "lab"]
    low_terms = ["cosmetic", "paint", "squeaky", "minor", "dirty", "dusty", "slow"]
    
    if any(term in text for term in critical_terms):
        priority = "Critical"
        hazard = "Critical - Immediate campus safety hazard detected"
    elif any(term in text for term in high_terms):
        priority = "High"
        hazard = "High - Significant operational or physical disruption"
    elif any(term in text for term in low_terms):
        priority = "Low"
        hazard = "Low - Minor aesthetic or non-urgent maintenance"
    else:
        priority = "Medium"
        hazard = "Medium - Routine maintenance backlog priority"
        
    dept_info = DEPARTMENTS.get(best_cat, DEPARTMENTS["General Maintenance"])
    dept_name = dept_info["dept"]
    sla_h = dept_info["sla_hours"].get(priority, 24)
    sla_str = f"{sla_h} hour{'s' if sla_h != 1 else ''}"
    
    actions = {
        "Electrical": "Dispatch electrician to inspect circuits, test voltage, and replace faulty fixtures or secure loose wiring.",
        "Plumbing": "Isolate local supply valve, clear obstruction or replace ruptured pipe fittings, and restore sanitary pressure.",
        "Waste Management": "Mobilize sanitation crew for immediate waste disposal, bin replacement, and sanitization of affected zone.",
        "IT & Tech": "Assign field technician to diagnose AV/network hardware, replace damaged cables/ports, and verify connectivity.",
        "Infrastructure & Civil": "Conduct structural civil assessment, cordon off unsafe zones, and schedule masonry or carpentry repair.",
        "HVAC & Cooling": "Clean filter coils, inspect compressor pressure, and calibrate thermostat for optimal climate control.",
        "Safety & Security": "Deploy security response personnel, verify safety protocol compliance, and remediate perimeter hazard.",
        "General Maintenance": "Dispatch central facilities handyman to review site condition and perform necessary repairs."
    }
    
    title_words = [w for w in description.split() if len(w) > 2][:8]
    summary_title = " ".join(title_words).capitalize()
    if not summary_title:
        summary_title = f"{best_cat} Issue Reported"
    else:
        summary_title = f"{best_cat}: {summary_title}"
        if len(summary_title) > 60:
            summary_title = summary_title[:57] + "..."
            
    confidence = min(98, 88 + (cat_scores[best_cat] * 3))
    
    return {
        "title": summary_title,
        "category": best_cat,
        "priority": priority,
        "department": dept_name,
        "suggested_action": actions.get(best_cat, "Inspect site and take corrective maintenance measures."),
        "hazard_level": hazard,
        "estimated_sla": sla_str,
        "confidence": confidence
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    data = request.get_json() or {}
    description = data.get('description', '').strip()
    image_base64 = data.get('image', None)
    api_key = request.headers.get('X-Gemini-Key') or data.get('api_key')
    
    if not description and not image_base64:
        return jsonify({"error": "Please provide a description or an image of the campus issue."}), 400
        
    analysis = analyze_with_ai(description or "Campus issue image uploaded", image_base64, api_key)
    return jsonify({
        "success": True,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/issues', methods=['GET'])
def get_issues():
    issues = load_issues()
    category = request.args.get('category')
    priority = request.args.get('priority')
    status = request.args.get('status')
    search = request.args.get('search', '').lower()
    
    filtered = issues
    if category and category != 'All':
        filtered = [i for i in filtered if i.get('category') == category]
    if priority and priority != 'All':
        filtered = [i for i in filtered if i.get('priority') == priority]
    if status and status != 'All':
        filtered = [i for i in filtered if i.get('status') == status]
    if search:
        filtered = [i for i in filtered if search in i.get('title', '').lower() 
                    or search in i.get('location', '').lower() 
                    or search in i.get('original_text', '').lower()
                    or search in i.get('id', '').lower()]
        
    return jsonify({"issues": filtered, "total": len(filtered)})

@app.route('/api/issues', methods=['POST'])
def create_issue():
    data = request.get_json() or {}
    if not data.get('title'):
        return jsonify({"error": "Issue title is required"}), 400
        
    issues = load_issues()
    new_id = f"TKT-{1000 + len(issues) + 1}"
    
    new_issue = {
        "id": new_id,
        "title": data.get('title'),
        "original_text": data.get('original_text', ''),
        "category": data.get('category', 'General Maintenance'),
        "priority": data.get('priority', 'Medium'),
        "department": data.get('department', 'Central Facilities Management'),
        "suggested_action": data.get('suggested_action', 'Inspect and resolve'),
        "location": data.get('location', 'Campus Grounds'),
        "status": "Open",
        "timestamp": datetime.now().isoformat(),
        "estimated_sla": data.get('estimated_sla', '24 hours'),
        "hazard_level": data.get('hazard_level', 'Standard'),
        "confidence": data.get('confidence', 95),
        "upvotes": 1,
        "assigned_to": f"Dispatched to {data.get('department', 'Facilities Team')}",
        "image": data.get('image', None)
    }
    
    issues.insert(0, new_issue)
    save_issues(issues)
    
    return jsonify({
        "success": True,
        "message": f"Issue {new_id} successfully logged and routed to {new_issue['department']}.",
        "issue": new_issue
    }), 201

@app.route('/api/issues/<issue_id>', methods=['PATCH'])
def update_issue(issue_id):
    issues = load_issues()
    data = request.get_json() or {}
    
    updated = None
    for issue in issues:
        if issue['id'] == issue_id:
            if 'status' in data:
                issue['status'] = data['status']
            if 'priority' in data:
                issue['priority'] = data['priority']
            if 'upvotes' in data:
                issue['upvotes'] += 1
            if 'assigned_to' in data:
                issue['assigned_to'] = data['assigned_to']
            updated = issue
            break
            
    if updated:
        save_issues(issues)
        return jsonify({"success": True, "issue": updated})
    return jsonify({"error": "Issue not found"}), 404

@app.route('/api/stats', methods=['GET'])
def get_stats():
    issues = load_issues()
    total = len(issues)
    open_count = sum(1 for i in issues if i.get('status') == 'Open')
    in_progress = sum(1 for i in issues if i.get('status') == 'In Progress' or i.get('status') == 'Assigned')
    resolved = sum(1 for i in issues if i.get('status') == 'Resolved')
    critical_count = sum(1 for i in issues if i.get('priority') == 'Critical')
    
    dept_counts = {}
    for i in issues:
        dept = i.get('category', 'Other')
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
    return jsonify({
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical": critical_count,
        "department_distribution": dept_counts,
        "avg_resolution_sla": "4.2 hours"
    })

@app.route('/api/presets', methods=['GET'])
def get_presets():
    presets = [
        {
            "name": "Broken Streetlight at Library",
            "text": "The light near the library entrance hasn't been working and wires look exposed. It gets very dark and unsafe at night.",
            "location": "Central Library, South Porch Gate",
            "category_hint": "Electrical"
        },
        {
            "name": "Restroom Pipe Gushing Water",
            "text": "Water is leaking heavily from under the washroom sink in Science Block 2nd floor, causing water to pool on the floor.",
            "location": "Science Complex, Floor 2, Wing A",
            "category_hint": "Plumbing"
        },
        {
            "name": "Overflowing Food Waste Bin",
            "text": "The main dumpster outside the cafeteria gazebo is overflowing with cardboard boxes and leftover food, causing foul odors.",
            "location": "Campus Cafeteria Dining Garden",
            "category_hint": "Waste Management"
        },
        {
            "name": "Cracked Concrete Stairs",
            "text": "Several concrete steps on the east walkway staircase have deep cracks and loose bricks, creating a tripping hazard.",
            "location": "East Quad Walkway Staircase",
            "category_hint": "Infrastructure & Civil"
        },
        {
            "name": "Lab Projector & Sound Malfunction",
            "text": "Seminar Hall 3 AV projector flickers purple and the HDMI connection port is physically bent.",
            "location": "Seminar Hall 3, Tech Tower",
            "category_hint": "IT & Tech"
        }
    ]
    return jsonify(presets)

@app.route('/api/reset', methods=['POST'])
def reset_data():
    save_issues(SEED_ISSUES)
    return jsonify({"success": True, "message": "Demo data reset successfully."})

if __name__ == '__main__':
    if not os.path.exists(DATA_FILE):
        save_issues(SEED_ISSUES)
    print("=" * 60)
    print("[CampusFix AI] Campus Issue Reporter is Live!")
    print("[Access URL] http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=False)
