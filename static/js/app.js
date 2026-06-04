// StudyHub - Student Portal JavaScript
const API = '/api';

function $(sel){return document.querySelector(sel)}
function $$(sel){return document.querySelectorAll(sel)}

// Auth
function logout(){
    localStorage.removeItem('studyhub_user');
    window.location.href = '/login.html';
}

// Check auth
const user = JSON.parse(localStorage.getItem('studyhub_user') || 'null');
if(user){
    const nameEl = document.getElementById('userName');
    const welEl = document.getElementById('welcomeName');
    if(nameEl) nameEl.textContent = user.name;
    if(welEl) welEl.textContent = user.name;
}

// Load courses
async function loadCourses(){
    try{
        const res = await fetch(`${API}/courses`);
        const courses = await res.json();
        const el = document.getElementById('coursesList');
        if(!el) return;
        if(!courses.length){
            el.innerHTML = '<p style="color:var(--text-light)">No courses enrolled yet.</p>';
            return;
        }
        el.innerHTML = courses.map(c => `
            <div class="card">
                <h3>${c.icon || '📖'} ${c.name}</h3>
                <p>${c.description || 'No description'}</p>
                <div class="meta">
                    <span class="badge badge-info">${c.code || ''}</span>
                    <span class="badge badge-success">${c.credits || 3} credits</span>
                </div>
            </div>
        `).join('');
        const sc = document.getElementById('statCourses');
        if(sc) sc.textContent = courses.length;
    }catch(e){console.error(e)}
}

// Load assignments
async function loadAssignments(){
    try{
        const res = await fetch(`${API}/assignments`);
        const assignments = await res.json();
        const el = document.getElementById('assignmentsList');
        if(!el) return;
        if(!assignments.length){
            el.innerHTML = '<p style="color:var(--text-light)">No assignments yet.</p>';
            return;
        }
        el.innerHTML = assignments.map(a => `
            <div class="list-item">
                <div>
                    <strong>${a.title}</strong>
                    <div style="font-size:0.8rem;color:var(--text-light)">${a.course || ''} · Due: ${a.due || 'TBD'}</div>
                </div>
                <span class="badge ${a.submitted ? 'badge-success' : 'badge-warning'}">${a.submitted ? '✅ Submitted' : '⏳ Pending'}</span>
            </div>
        `).join('');
        const pending = assignments.filter(a => !a.submitted).length;
        const done = assignments.filter(a => a.submitted).length;
        const sp = document.getElementById('statPending');
        const sc = document.getElementById('statCompleted');
        if(sp) sp.textContent = pending;
        if(sc) sc.textContent = done;
    }catch(e){console.error(e)}
}

// Admin Panel
function openAdmin(){
    document.getElementById('adminModal').classList.add('active');
    showTab('users');
}
function closeAdmin(){
    document.getElementById('adminModal').classList.remove('active');
}
function showTab(tab){
    $$('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const content = document.getElementById('adminContent');
    if(tab === 'users'){
        content.innerHTML = `
            <h3>👥 Manage Users</h3>
            <div style="display:flex;gap:0.5rem;margin:1rem 0">
                <input type="text" id="newUserName" placeholder="Name" style="flex:1;padding:0.5rem;border:1px solid var(--border);border-radius:8px">
                <input type="email" id="newUserEmail" placeholder="Email" style="flex:1;padding:0.5rem;border:1px solid var(--border);border-radius:8px">
                <select id="newUserRole" style="padding:0.5rem;border:1px solid var(--border);border-radius:8px">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                </select>
                <button class="btn btn-primary" onclick="addUser()">Add</button>
            </div>
            <div id="usersTable"></div>
        `;
        loadUsers();
    } else if(tab === 'coursesTab'){
        content.innerHTML = `
            <h3>📖 Manage Courses</h3>
            <div class="form-group"><input type="text" id="courseName" placeholder="Course Name"></div>
            <div class="form-group"><input type="text" id="courseCode" placeholder="Course Code (e.g. CS101)"></div>
            <div class="form-group"><textarea id="courseDesc" placeholder="Description"></textarea></div>
            <button class="btn btn-primary" onclick="addCourse()">Create Course</button>
            <div id="coursesTable" style="margin-top:1rem"></div>
        `;
        loadAdminCourses();
    } else if(tab === 'assignTab'){
        content.innerHTML = `
            <h3>📝 Manage Assignments</h3>
            <div class="form-group"><input type="text" id="assignTitle" placeholder="Assignment Title"></div>
            <div class="form-group"><textarea id="assignDesc" placeholder="Description"></textarea></div>
            <div class="form-group"><input type="date" id="assignDue"></div>
            <button class="btn btn-primary" onclick="addAssignment()">Create Assignment</button>
        `;
    } else if(tab === 'stats'){
        content.innerHTML = `
            <h3>📊 Platform Statistics</h3>
            <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
                <div class="stat-card"><h3>Total Users</h3><p id="adminTotalUsers">0</p></div>
                <div class="stat-card"><h3>Total Courses</h3><p id="adminTotalCourses">0</p></div>
                <div class="stat-card"><h3>Total Assignments</h3><p id="adminTotalAssign">0</p></div>
            </div>
        `;
        loadStats();
    }
}

async function loadUsers(){
    try{
        const res = await fetch(`${API}/users`);
        const users = await res.json();
        const el = document.getElementById('usersTable');
        if(!el) return;
        el.innerHTML = `<table><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>` +
            users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td><span class="badge badge-info">${u.role}</span></td><td><button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">Delete</button></td></tr>`).join('') +
            '</table>';
    }catch(e){}
}

async function addUser(){
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    if(!name || !email) return alert('Fill all fields');
    await fetch(`${API}/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,email,role})});
    loadUsers();
}

async function deleteUser(id){
    await fetch(`${API}/users/${id}`, {method:'DELETE'});
    loadUsers();
}

async function loadAdminCourses(){
    try{
        const res = await fetch(`${API}/courses`);
        const courses = await res.json();
        const el = document.getElementById('coursesTable');
        if(!el) return;
        el.innerHTML = `<table><tr><th>Code</th><th>Name</th><th>Credits</th></tr>` +
            courses.map(c => `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.credits}</td></tr>`).join('') + '</table>';
    }catch(e){}
}

async function addCourse(){
    const name = document.getElementById('courseName').value;
    const code = document.getElementById('courseCode').value;
    const description = document.getElementById('courseDesc').value;
    if(!name) return alert('Course name required');
    await fetch(`${API}/courses`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,code,description,credits:3,icon:'📖'})});
    loadAdminCourses();
    loadCourses();
}

async function addAssignment(){
    const title = document.getElementById('assignTitle').value;
    const description = document.getElementById('assignDesc').value;
    const due = document.getElementById('assignDue').value;
    if(!title) return alert('Title required');
    await fetch(`${API}/assignments`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title,description,due,submitted:false,course:'General'})});
    loadAssignments();
}

async function loadStats(){
    try{
        const [users, courses, assigns] = await Promise.all([
            fetch(`${API}/users`).then(r=>r.json()),
            fetch(`${API}/courses`).then(r=>r.json()),
            fetch(`${API}/assignments`).then(r=>r.json())
        ]);
        const tu = document.getElementById('adminTotalUsers');
        const tc = document.getElementById('adminTotalCourses');
        const ta = document.getElementById('adminTotalAssign');
        if(tu) tu.textContent = users.length;
        if(tc) tc.textContent = courses.length;
        if(ta) ta.textContent = assigns.length;
    }catch(e){}
}

// Init
loadCourses();
loadAssignments();
