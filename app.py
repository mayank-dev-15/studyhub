#!/usr/bin/env python3
"""
StudyHub - Student Portal Backend
Flask API for student portal with courses, assignments, grades, and admin panel.
Usage: python3 app.py
"""

from flask import Flask, request, jsonify, send_from_directory
import json, os, uuid, datetime

app = Flask(__name__, static_folder='static', template_folder='templates')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ── Data helpers ──
def load(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []

def save(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# ── Seed data if empty ──
if not os.path.exists(os.path.join(DATA_DIR, 'users.json')):
    save('users.json', [
        {'id': str(uuid.uuid4()), 'name': 'Mayank Basena', 'email': '0mayankbasena@gmail.com', 'role': 'admin'},
        {'id': str(uuid.uuid4()), 'name': 'Alex Student', 'email': 'alex@example.com', 'role': 'student'},
    ])
    save('courses.json', [
        {'id': str(uuid.uuid4()), 'name': 'Web Security Fundamentals', 'code': 'SEC101', 'description': 'Learn OWASP Top 10, XSS, SQLi, CSRF and more', 'credits': 4, 'icon': '🔒'},
        {'id': str(uuid.uuid4()), 'name': 'Python Programming', 'code': 'CS101', 'description': 'Python from basics to advanced with projects', 'credits': 3, 'icon': '🐍'},
        {'id': str(uuid.uuid4()), 'name: 'Linux Systems', 'code': 'SYS201', 'description': 'Linux internals, kernel, shell, and system administration', 'credits': 4, 'icon': '🐧'},
        {'id': str(uuid.uuid4()), 'name': 'AI & Machine Learning', 'code': 'AI301', 'description': 'Neural networks, NLP, computer vision fundamentals', 'credits': 3, 'icon': '🤖'},
    ])
    save('assignments.json', [
        {'id': str(uuid.uuid4()), 'title': 'XSS Vulnerability Report', 'course': 'Web Security', 'due': '2026-06-15', 'submitted': False},
        {'id': str(uuid.uuid4()), 'title': 'Python CLI Tool', 'course': 'Python', 'due': '2026-06-10', 'submitted': True},
        {'id': str(uuid.uuid4()), 'title': 'Kernel Module Analysis', 'course': 'Linux Systems', 'due': '2026-06-20', 'submitted': False},
    ])

# ── Static ──
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/login.html')
def login():
    return '''<!DOCTYPE html><html><head><title>StudyHub Login</title><link rel="stylesheet" href="/static/css/style.css"></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg)">
<div class="card" style="max-width:400px;width:90%"><h2 style="text-align:center;margin-bottom:1.5rem">📚 StudyHub Login</h2>
<form onsubmit="event.preventDefault();login()">
<div class="form-group"><label>Email</label><input type="email" id="email" value="0mayankbasena@gmail.com" required></div>
<div class="form-group"><label>Password</label><input type="password" id="password" value="password" required></div>
<button type="submit" class="btn btn-primary" style="width:100%">Login</button>
</form><p style="text-align:center;margin-top:1rem;color:var(--text-light);font-size:0.85rem">Demo: 0mayankbasena@gmail.com / password</p></div>
<script>function login(){localStorage.setItem('studyhub_user',JSON.stringify({name:'Mayank Basena',email:document.getElementById('email').value,role:'admin'}));window.location.href='/'}</script></body></html>'''

# ── API: Users ──
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(load('users.json'))

@app.route('/api/users', methods=['POST'])
def create_user():
    u = request.json
    u['id'] = str(uuid.uuid4())
    users = load('users.json')
    users.append(u)
    save('users.json', users)
    return jsonify(u), 201

@app.route('/api/users/<uid>', methods=['DELETE'])
def delete_user(uid):
    users = [u for u in load('users.json') if u['id'] != uid]
    save('users.json', users)
    return '', 204

# ── API: Courses ──
@app.route('/api/courses', methods=['GET'])
def get_courses():
    return jsonify(load('courses.json'))

@app.route('/api/courses', methods=['POST'])
def create_course():
    c = request.json
    c['id'] = str(uuid.uuid4())
    courses = load('courses.json')
    courses.append(c)
    save('courses.json', courses)
    return jsonify(c), 201

@app.route('/api/courses/<cid>', methods=['DELETE'])
def delete_course(cid):
    courses = [c for c in load('courses.json') if c['id'] != cid]
    save('courses.json', courses)
    return '', 204

# ── API: Assignments ──
@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    return jsonify(load('assignments.json'))

@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    a = request.json
    a['id'] = str(uuid.uuid4())
    assigns = load('assignments.json')
    assigns.append(a)
    save('assignments.json', assigns)
    return jsonify(a), 201

@app.route('/api/assignments/<aid>', methods=['PUT'])
def update_assignment(aid):
    assigns = load('assignments.json')
    for a in assigns:
        if a['id'] == aid:
            a.update(request.json)
            break
    save('assignments.json', assigns)
    return jsonify(a)

@app.route('/api/assignments/<aid>', methods=['DELETE'])
def delete_assignment(aid):
    assigns = [a for a in load('assignments.json') if a['id'] != aid]
    save('assignments.json', assigns)
    return '', 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"📚 StudyHub running at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
