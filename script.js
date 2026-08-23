// script.js - កូដពេញលេញ និងត្រឹមត្រូវសម្រាប់ការគ្រប់គ្រងសាលារៀន

// TODO: ដាក់ URL ដែលបាន Deploy ថ្មី
const API_URL = "https://script.google.com/macros/s/AKfycbzuQdJB8E5ebAlDIV91xFjaFJOACPYAg1ZzmhDnE2VkW87P-rDRB4DYw4WcDbE-RJGvPQ/exec"; 

let db = []; 
let currentClassDb = []; 
let currentClassName = "២ខ"; 

let isLoggedIn = false;
let loggedInUser = ""; 
let loggedInUsername = "";
let dbAttendance = {}; 
let sysSettings = {}; 

const monthsList = ['dec', 'jan', 'feb', 'mar', 'sem1', 'sem2'];
const monthNamesKh = {
    'dec': 'ខែ ធ្នូ', 'jan': 'ខែ មករា', 'feb': 'ខែ កុម្ភៈ', 'mar': 'ខែ មីនា',
    'sem1': 'ប្រឡងឆមាសទី១', 'sem2': 'ប្រឡងឆមាសទី២'
};
let myChart = null;
let dashChart = null; 

// មុខងារ Toast 
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// មុខងារ Auth និង Login
function toggleAuth(type) {
    if(type === 'register') {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('register-container').classList.remove('hidden');
    } else {
        document.getElementById('register-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const level = document.getElementById('reg-level').value;
    const room = document.getElementById('reg-room').value;
    const assignedClass = level + room;
    
    const btn = document.getElementById('btn-register');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងចុះឈ្មោះ...';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'register', name: name, username: user, password: pass, assigned_class: assignedClass })
        });
        const result = await response.json();
        if (result.status === "success") {
            alert(result.message);
            toggleAuth('login');
            document.getElementById('register-form').reset();
        } else alert(result.message);
    } catch (error) { alert("មិនអាចភ្ជាប់ទៅប្រព័ន្ធបានទេ!"); } 
    finally { btn.innerHTML = '<i class="fa-solid fa-user-plus mr-2"></i> ចុះឈ្មោះ'; btn.disabled = false; }
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('btn-login');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងពិនិត្យ...';
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: user, password: pass })
        });
        const result = await response.json();

        if (result.status === "success") {
            isLoggedIn = true;
            loggedInUser = result.name; 
            loggedInUsername = user.trim().toLowerCase();
            currentClassName = result.assigned_class || "២ខ"; 
            
            document.getElementById('user-fullname').innerText = loggedInUser;
            document.getElementById('user-avatar').innerText = loggedInUser.charAt(0);
            document.querySelectorAll('.sys-teacher').forEach(el => el.innerText = loggedInUser);
            
            // កំណត់សិទ្ធិ Admin ឬ គ្រូធម្មតា
            if(loggedInUsername === 'admin') {
                document.getElementById('class-selector-container').classList.remove('hidden');
                document.getElementById('nav-settings-label').classList.remove('hidden');
                document.getElementById('nav-settings').classList.remove('hidden');
            } else {
                document.getElementById('class-selector-container').classList.add('hidden');
                document.getElementById('nav-settings-label').classList.add('hidden');
                document.getElementById('nav-settings').classList.add('hidden');
            }

            let levelMatch = currentClassName.replace(/[ក-ង]/g, ''); 
            let roomMatch = currentClassName.replace(/[១-៦]/g, '');  
            
            if(document.getElementById('filter-level')) document.getElementById('filter-level').value = levelMatch;
            if(document.getElementById('filter-room')) document.getElementById('filter-room').value = roomMatch;

            document.querySelectorAll('.display-current-class').forEach(el => el.innerText = currentClassName);
            document.getElementById('header-class-badge').innerText = "ថ្នាក់ទី " + currentClassName;

            document.getElementById('auth-screen').style.display = 'none'; 
            document.getElementById('main-app').classList.remove('hidden');
            showToast(`ស្វាគមន៍ ${loggedInUser}`);
            
            fetchStudents(); 
        } else { alert(result.message); }
    } catch (error) { alert("មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ!"); } 
    finally { btn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> ចូលប្រើប្រាស់'; btn.disabled = false; }
}

function handleLogout() {
    if(confirm("តើលោកគ្រូពិតជាចង់ចាកចេញមែនទេ?")) location.reload();
}

// មុខងារ SwitchTab
function switchTab(tabId) {
    const tabs = [
        'dashboard', 'manage-students', 'attendance-report', 
        'detailed-sheet', 'monthly-results', 'leaderboard', 
        'honor-roll', 'student', 'tracking-book', 'settings'
    ];

    tabs.forEach(id => {
        const view = document.getElementById(`view-${id}`);
        const nav = document.getElementById(`nav-${id}`);
        if(view) view.classList.add('hidden');
        if(nav) nav.classList.remove('nav-active');
    });

    const selectedView = document.getElementById(`view-${tabId}`);
    const selectedNav = document.getElementById(`nav-${tabId}`);
    
    if(selectedView) selectedView.classList.remove('hidden');
    if(selectedNav) selectedNav.classList.add('nav-active');

    const titles = { 
        'dashboard': 'ផ្ទាំងសង្ខេបរួម', 
        'manage-students': 'បញ្ជីឈ្មោះសិស្ស', 
        'attendance-report': 'របាយការណ៍វត្តមាន', 
        'detailed-sheet': 'បញ្ចូលពិន្ទុ', 
        'monthly-results': 'លទ្ធផលប្រឡងផ្លូវការ', 
        'leaderboard': 'តារាងចំណាត់ថ្នាក់', 
        'honor-roll': 'តារាងកិត្តិយស', 
        'student': 'ការវិវត្តសិស្ស', 
        'tracking-book': 'សៀវភៅតាមដាន', 
        'settings': 'ការកំណត់ប្រព័ន្ធ'
    };
    
    const pageTitleEl = document.getElementById('page-title');
    if(pageTitleEl) pageTitleEl.textContent = titles[tabId] || 'ប្រព័ន្ធគ្រប់គ្រង';
    
    if(tabId === 'detailed-sheet') loadDetailedSheet();
    if(tabId === 'monthly-results') renderMonthlyResults();
    if(tabId === 'dashboard') renderDashboardAdvanced();
    if(tabId === 'attendance-report') {
        const attMonthSel = document.getElementById('att-month-selector');
        if(attMonthSel && !attMonthSel.value) {
            let now = new Date();
            attMonthSel.value = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2);
        }
        handleDateChange();
    }
}

// មុខងារបិទបើក Menu លើទូរសព្ទដៃ
function toggleMobileSidebar() {
    const aside = document.querySelector('aside');
    aside.classList.toggle('mobile-open');
}

const originalSwitchTab = switchTab;
switchTab = function(tabId) {
    originalSwitchTab(tabId);
    const aside = document.querySelector('aside');
    if(aside && aside.classList.contains('mobile-open')) {
        aside.classList.remove('mobile-open');
    }
};

function handleClassChange() {
    let level = document.getElementById('filter-level').value;
    let room = document.getElementById('filter-room').value;
    currentClassName = level + room; 
    
    document.querySelectorAll('.display-current-class').forEach(el => {
        el.innerText = currentClassName;
    });
    document.getElementById('header-class-badge').innerText = "ថ្នាក់ទី " + currentClassName;
    
    currentClassDb = db.filter(s => s.class_name === currentClassName);
    
    updateAllViews();
    fetchAttendanceReport();
}

function updateAllViews() {
    renderManageStudentsTable();
    renderDashboardStats();
    renderDashboardAdvanced();
    populateProfileDropdown();
    renderLeaderboard();
    renderHonorRoll();
    renderMonthlyResults();
}

// Fetch Students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        sysSettings = data.settings || {};
        applySettingsToUI();
        
        db = data.students.map(s => {
            let studentData = { 
                id: s.id.toString(), name: s.name, gender: s.gender, 
                dob: s.dob || '', pob: s.pob || '', father: s.father || '', mother: s.mother || '', 
                class_name: s.class_name || "២ខ", 
                scores: s.scores || {} 
            };
            monthsList.forEach(m => {
                if(!studentData.scores[m]) {
                    studentData.scores[m] = { total:0, avg:0, rank:0, grade:"" };
                    for(let i=1; i<=19; i++) studentData.scores[m][`sub${i}`] = "";
                }
            });
            return studentData;
        });
        
        currentClassDb = db.filter(s => s.class_name === currentClassName);
        updateAllViews();
        
        let now = new Date();
        let monthStr = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2);
        document.getElementById('att-month-selector').value = monthStr;
        
        fetchAttendanceReport(); 
        
    } catch (error) { showToast("បរាជ័យក្នុងការភ្ជាប់ទៅទិន្នន័យ!"); }
}

// Manage Students (Add, Edit, Delete)
async function addStudent(e) {
    e.preventDefault();
    const payload = {
        action: "add_student",
        id: document.getElementById('new-id').value.trim(),
        name: document.getElementById('new-name').value.trim(),
        gender: document.getElementById('new-gender').value,
        dob: document.getElementById('new-dob').value.trim(),
        pob: document.getElementById('new-pob').value.trim(),
        father: document.getElementById('new-father').value.trim(),
        mother: document.getElementById('new-mother').value.trim(),
        class_name: currentClassName
    };

    if(currentClassDb.find(s => s.id === payload.id)) return alert("អត្តលេខនេះមានរួចហើយក្នុងថ្នាក់នេះ!");

    showToast("កំពុងរក្សាទុក...");
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if(result.status === "success") {
            payload.scores = {};
            monthsList.forEach(m => {
                payload.scores[m] = { total:0, avg:0, rank:0, grade:"" };
                for(let i=1; i<=19; i++) payload.scores[m][`sub${i}`] = "";
            });
            db.push(payload);
            currentClassDb.push(payload);
            document.getElementById('add-student-form').reset();
            updateAllViews();
            showToast("បានបន្ថែមសិស្សថ្មី!");
        } else { showToast(result.message); }
    } catch(error) { showToast("បរាជ័យក្នុងការភ្ជាប់!"); }
}

function openEditStudent(id) {
    const s = currentClassDb.find(x => x.id === id);
    if(!s) return;
    document.getElementById('edit-old-id').value = s.id;
    document.getElementById('edit-id').value = s.id;
    document.getElementById('edit-name').value = s.name;
    document.getElementById('edit-gender').value = s.gender;
    document.getElementById('edit-dob').value = s.dob || '';
    document.getElementById('edit-pob').value = s.pob || '';
    document.getElementById('edit-father').value = s.father || '';
    document.getElementById('edit-mother').value = s.mother || '';
    document.getElementById('edit-class').value = s.class_name || currentClassName;
    
    let oldClassInput = document.getElementById('edit-old-class');
    if(!oldClassInput) {
        oldClassInput = document.createElement('input');
        oldClassInput.type = 'hidden';
        oldClassInput.id = 'edit-old-class';
        document.getElementById('edit-student-form').appendChild(oldClassInput);
    }
    oldClassInput.value = s.class_name;
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

async function submitEditStudent(e) {
    e.preventDefault();
    const oldId = document.getElementById('edit-old-id').value;
    const oldClass = document.getElementById('edit-old-class').value;
    const newId = document.getElementById('edit-id').value;
    const newClass = document.getElementById('edit-class').value.trim();
    
    const payload = {
        action: "edit_student",
        old_id: oldId,
        old_class: oldClass,
        id: newId,
        name: document.getElementById('edit-name').value.trim(),
        gender: document.getElementById('edit-gender').value,
        dob: document.getElementById('edit-dob').value.trim(),
        pob: document.getElementById('edit-pob').value.trim(),
        father: document.getElementById('edit-father').value.trim(),
        mother: document.getElementById('edit-mother').value.trim(),
        class_name: newClass
    };

    showToast("កំពុងកែប្រែទិន្នន័យ...");
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if(result.status === "success") {
            const masterIdx = db.findIndex(s => s.id === oldId && s.class_name === oldClass);
            if(masterIdx !== -1) {
                db[masterIdx] = { ...db[masterIdx], ...payload };
            }
            currentClassDb = db.filter(s => s.class_name === currentClassName);
            document.getElementById('edit-modal').classList.add('hidden');
            updateAllViews();
            showToast("បានកែប្រែព័ត៌មានសិស្សជោគជ័យ!");
        } else { showToast("កែប្រែមិនបានសម្រេច"); }
    } catch (err) { showToast("បញ្ហាការភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ!"); }
}

async function deleteStudent(id, name) {
    if(!confirm(`តើអ្នកពិតជាចង់លុបសិស្សឈ្មោះ "${name}" (អត្តលេខ: ${id}) មែនទេ?`)) return;
    showToast("កំពុងលុបទិន្នន័យ...");
    try {
        const response = await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ action: "delete_student", id: id, class_name: currentClassName }) 
        });
        const result = await response.json();
        if(result.status === "success") {
            db = db.filter(s => !(s.id === id && s.class_name === currentClassName));
            currentClassDb = currentClassDb.filter(s => s.id !== id);
            updateAllViews();
            showToast("បានលុបសិស្សចេញពីបញ្ជី!");
        } else { showToast("មិនអាចលុបបានទេ"); }
    } catch (err) { showToast("បញ្ហាការតភ្ជាប់!"); }
}

function renderManageStudentsTable() {
    const tbody = document.getElementById('manage-students-tbody');
    tbody.innerHTML = '';
    const sortedDb = [...currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    document.getElementById('student-list-count').innerText = `សរុប ${currentClassDb.length} នាក់`;
    if (document.getElementById('female-count')) document.getElementById('female-count').innerText = `ស្រី: ${currentClassDb.filter(s => s.gender === 'ស').length} នាក់`;

    sortedDb.forEach((s, idx) => {
        tbody.innerHTML += `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-4 py-3 border-r text-center">${idx + 1}</td>
                <td class="px-4 py-3 border-r font-mono text-gray-500 text-center">${s.id}</td>
                <td class="px-4 py-3 border-r font-bold text-gray-800">${s.name}</td>
                <td class="px-4 py-3 border-r text-center ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'} font-medium">${s.gender}</td>
                <td class="px-4 py-3 border-r">${s.dob || '-'}</td>
                <td class="px-4 py-3 border-r text-center font-bold text-green-700">${s.class_name}</td>
                <td class="px-4 py-3 border-r">${s.pob || '-'}</td>
                <td class="px-4 py-3 border-r text-xs text-gray-500">ឪ៖ ${s.father||'-'}<br>ម៖ ${s.mother||'-'}</td>
                <td class="px-4 py-3 text-center no-print">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="openEditStudent('${s.id}')" class="text-blue-600 hover:text-blue-800"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteStudent('${s.id}', '${s.name}')" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// Settings 
// ==========================================
function applySettingsToUI() {
    document.querySelectorAll('.sys-school').forEach(el => el.innerText = sysSettings.school_name || 'សាលាបឋមសិក្សា ខ្សុំ');
    document.querySelectorAll('.sys-year').forEach(el => el.innerText = sysSettings.academic_year || '២០២៦-២០២៧');
    document.querySelectorAll('.sys-principal').forEach(el => el.innerText = sysSettings.principal_title || 'នាយកសាលា');
    if(document.getElementById('set-school')) document.getElementById('set-school').value = sysSettings.school_name || '';
    if(document.getElementById('set-year')) document.getElementById('set-year').value = sysSettings.academic_year || '';
    if(document.getElementById('set-principal')) document.getElementById('set-principal').value = sysSettings.principal_title || '';
}

async function saveSettings(e) {
    e.preventDefault();
    const payload = {
        action: 'save_settings',
        settings: {
            school_name: document.getElementById('set-school').value.trim(),
            academic_year: document.getElementById('set-year').value.trim(),
            principal_title: document.getElementById('set-principal').value.trim()
        }
    };
    const btn = document.getElementById('btn-save-set');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if(result.status === "success") {
            sysSettings = payload.settings;
            applySettingsToUI();
            showToast("បានរក្សាទុកការកំណត់ជោគជ័យ!");
        } else { showToast("មានបញ្ហា!"); }
    } catch(err) { showToast("បរាជ័យក្នុងការភ្ជាប់!"); }
    finally { btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> រក្សាទុកការកំណត់'; }
}

// ==========================================
// Attendance
// ==========================================
let currentDaysInMonth = 31; 
let currentYear = new Date().getFullYear();
let currentMonthNum = new Date().getMonth() + 1;
const khmerDays = ['អា.', 'ច.', 'អ.', 'ព.', 'ព្រ.', 'សុ.', 'ស.'];

function getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

function handleDateChange() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(yyyyMm) {
        const parts = yyyyMm.split('-');
        currentYear = parseInt(parts[0]);
        currentMonthNum = parseInt(parts[1]);
        currentDaysInMonth = getDaysInMonth(currentYear, currentMonthNum);
    }
    fetchAttendanceReport();
}

async function fetchAttendanceReport() {
    const yyyyMm = document.getElementById('att-month-selector').value; 
    if(!yyyyMm) return;
    showToast("កំពុងទាញយកទិន្នន័យវត្តមាន...");
    try {
        const response = await fetch(`${API_URL}?action=get_attendance&month=${yyyyMm}&class_name=${encodeURIComponent(currentClassName)}`);
        const result = await response.json();
        if(result.status === "success" && result.data) dbAttendance = result.data;
        else dbAttendance = {}; 
    } catch (err) { dbAttendance = {}; }
    renderAttendanceReport();
}

function renderAttendanceReport() {
    const daysRow = document.getElementById('att-days-row');
    const khmerDaysRow = document.getElementById('att-khmer-days-row');
    const tbody = document.getElementById('att-report-tbody');
    const headerColspan = document.getElementById('att-days-header');
    
    if(!daysRow || !khmerDaysRow || !tbody) return;
    if(headerColspan) headerColspan.colSpan = currentDaysInMonth;
    
    daysRow.innerHTML = ''; khmerDaysRow.innerHTML = '';
    
    for(let i=1; i<=currentDaysInMonth; i++) {
        let dateObj = new Date(currentYear, currentMonthNum - 1, i);
        let dayOfWeek = dateObj.getDay(); 
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); 
        let khDayName = khmerDays[dayOfWeek];
        let bgClass = isWeekend ? 'bg-gray-200 text-red-500 font-bold' : 'bg-green-50 text-green-900';
        khmerDaysRow.innerHTML += `<th class="${bgClass} px-0.5 py-1 text-[11px]">${khDayName}</th>`;
        daysRow.innerHTML += `<th class="${bgClass} px-0.5 py-1 text-[10px]">${i}</th>`;
    }
    daysRow.innerHTML += `<th class="bg-blue-50 w-8">វ</th><th class="bg-blue-50 w-8 text-red-600">អ</th><th class="bg-blue-50 w-8 text-yellow-600">ច</th>`;
    khmerDaysRow.innerHTML += `<th colspan="3" class="bg-blue-50">សរុប</th>`;
    
    tbody.innerHTML = '';
    const sortedDb = [...currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    if(sortedDb.length === 0) return tbody.innerHTML = `<tr><td colspan="${currentDaysInMonth + 6}" class="py-8 text-center text-gray-400">គ្មានបញ្ជីសិស្សទេក្នុងថ្នាក់នេះ</td></tr>`;

    sortedDb.forEach((s, idx) => {
        let rowHtml = `<tr class="bg-white border-b hover:bg-gray-50" data-studentid="${s.id}"><td class="text-center">${idx + 1}</td><td class="text-left px-2 font-bold text-gray-800">${s.name}</td><td class="text-center ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'} font-medium">${s.gender}</td>`;
        let studentAtt = dbAttendance[s.id] || {};
        for(let i=1; i<=currentDaysInMonth; i++) {
            let dateObj = new Date(currentYear, currentMonthNum - 1, i);
            let dayOfWeek = dateObj.getDay();
            let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            let val = studentAtt[i] || ''; 
            if(isWeekend && !val) val = '-'; 
            let disabledAttr = isWeekend ? 'disabled' : '';
            let weekendStyle = isWeekend ? 'bg-gray-100 text-gray-400' : '';
            rowHtml += `<td class="${weekendStyle}"><input type="text" class="att-input d${i}" maxlength="1" value="${val}" ${disabledAttr}></td>`;
        }
        rowHtml += `<td class="text-center font-bold text-green-600 bg-gray-50 tot-v">0</td><td class="text-center font-bold text-red-500 bg-gray-50 tot-a">0</td><td class="text-center font-bold text-yellow-500 bg-gray-50 tot-l">0</td></tr>`;
        tbody.innerHTML += rowHtml;
    });
    calculateAttendance();
}

function calculateAttendance() {
    const rows = document.querySelectorAll('#att-report-tbody tr[data-studentid]');
    rows.forEach(row => {
        let v = 0, a = 0, l = 0;
        for(let i=1; i<=currentDaysInMonth; i++) {
            let input = row.querySelector(`.d${i}`);
            if(input && !input.disabled) {
                let val = input.value.toUpperCase();
                input.value = val; 
                if(val === 'V') v++; else if(val === 'A') a++; else if(val === 'L') l++;
            }
        }
        row.querySelector('.tot-v').innerText = v;
        row.querySelector('.tot-a').innerText = a;
        row.querySelector('.tot-l').innerText = l;
    });
}

async function saveMonthlyAttendance() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(!yyyyMm) return alert("សូមជ្រើសរើសខែជាមុនសិន!");
    calculateAttendance();
    const rows = document.querySelectorAll('#att-report-tbody tr[data-studentid]');
    let attData = {}; 
    rows.forEach(row => {
        let id = row.getAttribute('data-studentid');
        let days = {}; let hasData = false;
        for(let i=1; i<=currentDaysInMonth; i++) {
            let input = row.querySelector(`.d${i}`);
            if(input && !input.disabled) {
                let val = input.value.toUpperCase();
                if(val && val !== '-') { days[i] = val; hasData = true; }
            }
        }
        if(hasData) attData[id] = days;
    });
    
    const btn = document.getElementById('btn-save-monthly-att');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'save_monthly_attendance', month: yyyyMm, class_name: currentClassName, data: attData }) });
        const result = await response.json();
        if(result.status === "success") showToast(`រក្សាទុកវត្តមានថ្នាក់ ${currentClassName} បានជោគជ័យ!`);
        else showToast("មានបញ្ហា");
    } catch(e) { showToast("បរាជ័យក្នុងការភ្ជាប់ទៅ Server!"); } 
    finally { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> រក្សាទុកវត្តមាន'; }
}

// ==========================================
// Scores & Results
// ==========================================
function loadDetailedSheet() {
    const m = document.getElementById('month-selector').value;
    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = '';
    const sortedDb = [...currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    
    if(sortedDb.length === 0) return tbody.innerHTML = `<tr><td colspan="25" class="py-8 text-center text-gray-400">មិនមានសិស្សក្នុងថ្នាក់នេះទេ</td></tr>`;
    
    sortedDb.forEach((s, idx) => {
        const sc = s.scores[m] || {};
        let inputHtml = "";
        for(let i=1; i<=19; i++) {
            inputHtml += `<td><input type="number" min="0" max="10" step="0.5" class="grade-input s${i}" value="${sc[`sub${i}`] !== undefined ? sc[`sub${i}`] : ''}"></td>`;
        }
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 transition-colors" data-id="${s.id}">
                <td>${idx + 1}</td>
                <td class="text-left px-4 font-bold text-gray-800">${s.name}</td>
                <td class="font-bold">${s.gender}</td>
                ${inputHtml}
                <td class="font-bold bg-gray-100">${sc.total || ''}</td>
                <td class="font-bold bg-blue-50 text-blue-700">${sc.avg || ''}</td>
                <td class="font-bold bg-red-50 text-red-700">${sc.rank || ''}</td>
                <td class="font-bold bg-green-50 text-green-700">${sc.grade || ''}</td>
            </tr>
        `;
    });
}

async function saveDetailedScores() {
    const m = document.getElementById('month-selector').value;
    const rows = document.querySelectorAll('#detailed-tbody tr[data-id]');
    let monthScoresData = []; 
    rows.forEach(row => {
        let currentStudentScore = { id: row.getAttribute('data-id') };
        for(let i=1; i<=19; i++) currentStudentScore[`sub${i}`] = row.querySelector(`.s${i}`).value !== "" ? parseFloat(row.querySelector(`.s${i}`).value) : ""; 
        monthScoresData.push(currentStudentScore);
    });
    document.body.style.cursor = 'wait'; 
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "save_scores", month: m, class_name: currentClassName, scores: monthScoresData }) });
        await fetchStudents(); 
        loadDetailedSheet(); 
        showToast(`ជោគជ័យ! ទិន្នន័យត្រូវបានគណនា និងរក្សាទុក។`);
    } catch (error) { showToast(`បរាជ័យក្នុងការរក្សាទុក`); } 
    finally { document.body.style.cursor = 'default'; }
}

function renderMonthlyResults() {
    const m = document.getElementById('result-month-selector').value;
    const tbody = document.getElementById('monthly-results-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const sorted = [...currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a, b) => b.scores[m].avg - a.scores[m].avg);
    if(sorted.length === 0) return tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-gray-400">មិនទាន់មានទិន្នន័យលទ្ធផលសម្រាប់ចន្លោះពេលនេះទេ</td></tr>`;

    let passCount = 0, passFemale = 0;
    sorted.forEach((s, idx) => {
        const sc = s.scores[m];
        if(sc.avg >= 5) { passCount++; if(s.gender === 'ស') passFemale++; }
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 border-b">
                <td class="p-3 border-r border-gray-200">${idx + 1}</td>
                <td class="p-3 border-r border-gray-200 text-gray-600">${s.id}</td>
                <td class="p-3 border-r border-gray-200 text-left font-bold text-gray-800">${s.name}</td>
                <td class="p-3 border-r border-gray-200 ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'}">${s.gender}</td>
                <td class="p-3 border-r border-gray-200">${sc.total || 0}</td>
                <td class="p-3 border-r border-gray-200 font-bold text-blue-700">${sc.avg || 0}</td>
                <td class="p-3 border-r border-gray-200 font-bold text-red-700">${sc.rank}</td>
                <td class="p-3 font-bold text-green-700">${sc.grade || '-'}</td>
            </tr>
        `;
    });

    document.getElementById('sum-total').innerText = currentClassDb.length;
    document.getElementById('sum-female').innerText = currentClassDb.filter(s => s.gender === 'ស').length;
    document.getElementById('sum-pass').innerText = passCount;
    document.getElementById('sum-pass-f').innerText = passFemale;
    
    let failCount = currentClassDb.filter(s => s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    let failFemale = currentClassDb.filter(s => s.gender === 'ស' && s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    if(document.getElementById('sum-fail')) document.getElementById('sum-fail').innerText = failCount;
    if(document.getElementById('sum-fail-f')) document.getElementById('sum-fail-f').innerText = failFemale;
    
    if(document.getElementById('result-month-title')) document.getElementById('result-month-title').innerText = monthNamesKh[m] || '';
}

// ==========================================
// Dashboard & Rankings
// ==========================================
function renderDashboardStats() {
    document.getElementById('stat-total').innerHTML = `${currentClassDb.length}`;
    document.getElementById('stat-female').innerHTML = `${currentClassDb.filter(s => s.gender === 'ស').length}`;
    document.getElementById('stat-male').innerHTML = `${currentClassDb.filter(s => s.gender === 'ប').length}`;
}

function renderDashboardAdvanced() {
    let latestMonth = null;
    for(let i=monthsList.length-1; i>=0; i--) {
        let m = monthsList[i];
        if(currentClassDb.some(s => s.scores[m] && s.scores[m].avg > 0)) { latestMonth = m; break; }
    }
    
    const chartDiv = document.getElementById('passFailChart');
    const noDataDiv = document.getElementById('chart-no-data');
    const top3Container = document.getElementById('dash-top3-container');
    
    if(!latestMonth) {
        document.getElementById('dash-chart-month').innerText = "មិនមានទិន្នន័យ";
        noDataDiv.classList.remove('hidden'); chartDiv.classList.add('hidden');
        top3Container.innerHTML = '<p class="text-sm text-gray-400 text-center mt-6">មិនទាន់មានសិស្សឆ្នើមទេ</p>';
        return;
    }
    
    document.getElementById('dash-chart-month').innerText = monthNamesKh[latestMonth];
    noDataDiv.classList.add('hidden'); chartDiv.classList.remove('hidden');
    
    let pass = 0, fail = 0;
    currentClassDb.forEach(s => {
        if(s.scores[latestMonth] && s.scores[latestMonth].avg > 0) {
            if(s.scores[latestMonth].avg >= 5) pass++; else fail++;
        }
    });
    
    const ctx = document.getElementById('passFailChart').getContext('2d');
    if(dashChart) dashChart.destroy();
    dashChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['សិស្សជាប់ (>=5.0)', 'សិស្សធ្លាក់ (<5.0)'],
            datasets: [{ data: [pass, fail], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' }
    });
    
    top3Container.innerHTML = '';
    const top3 = [...currentClassDb].filter(s => s.scores[latestMonth] && s.scores[latestMonth].avg > 0)
                        .sort((a,b) => b.scores[latestMonth].avg - a.scores[latestMonth].avg)
                        .slice(0, 3);
                        
    const medals = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
    top3.forEach((s, idx) => {
        top3Container.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div class="flex items-center gap-3"><i class="fa-solid fa-medal ${medals[idx]} text-2xl"></i>
                <div><h4 class="font-bold text-gray-800 text-sm">${s.name}</h4><p class="text-xs text-gray-500">អត្តលេខ: ${s.id}</p></div></div>
                <div class="text-right"><p class="font-bold text-blue-700">${s.scores[latestMonth].avg}</p><span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${s.scores[latestMonth].grade}</span></div>
            </div>
        `;
    });
}

function renderLeaderboard() {
    const m = document.getElementById('leaderboard-filter').value;
    const tbody = document.getElementById('leaderboard-tbody');
    tbody.innerHTML = '';
    const sorted = [...currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a, b) => b.scores[m].avg - a.scores[m].avg);
    if(sorted.length === 0) return tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-gray-400 text-center">មិនទាន់មានទិន្នន័យ។</td></tr>`;

    sorted.forEach((s) => {
        const sc = s.scores[m];
        let rankStyle = sc.rank <= 3 ? "bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold" : "text-gray-500 font-medium";
        tbody.innerHTML += `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 text-center"><div class="${rankStyle}">${sc.rank}</div></td>
                <td class="px-6 py-4 font-mono text-xs text-gray-400">${s.id}</td>
                <td class="px-6 py-4 font-bold text-gray-800">${s.name}</td>
                <td class="px-6 py-4 text-center ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'} font-medium">${s.gender}</td>
                <td class="px-6 py-4 text-center font-bold text-blue-700 text-lg">${sc.avg}</td>
                <td class="px-6 py-4 text-center"><span class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">${sc.grade}</span></td>
            </tr>
        `;
    });
}

function renderHonorRoll() {
    const m = document.getElementById('honor-month-selector').value;
    const container = document.getElementById('honor-roll-container');
    if(!container) return;
    container.innerHTML = '';

    const top5 = [...currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a,b) => b.scores[m].avg - a.scores[m].avg).slice(0, 5);
    if(top5.length === 0) return container.innerHTML = '<p class="text-gray-400 text-center col-span-5 py-8">មិនទាន់មានទិន្នន័យសម្រាប់ចន្លោះពេលនេះទេ</p>';

    const medals = ['text-yellow-400 text-4xl', 'text-gray-400 text-3xl', 'text-amber-600 text-3xl', 'text-blue-400 text-2xl', 'text-blue-400 text-2xl'];
    top5.forEach((s, idx) => {
        container.innerHTML += `
            <div class="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-5 text-center shadow relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div><i class="fa-solid fa-medal ${medals[idx]} mb-3"></i>
                <div class="w-14 h-14 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-800 text-xl font-bold shadow-inner">${s.name.charAt(0)}</div>
                <h3 class="font-moul text-xs text-gray-800 mb-1 truncate">${s.name}</h3>
                <p class="text-[11px] text-gray-500 mb-2">ចំណាត់ថ្នាក់លេខ ${s.scores[m].rank}</p>
                <div class="bg-blue-100 rounded-lg p-1.5"><p class="text-xs text-blue-800 font-bold">មធ្យមភាគ៖ ${s.scores[m].avg}</p></div>
            </div>
        `;
    });
}

function populateProfileDropdown() {
    const currentVal1 = document.getElementById('profile-student-select') ? document.getElementById('profile-student-select').value : '';
    const currentVal2 = document.getElementById('tracking-student-select') ? document.getElementById('tracking-student-select').value : '';
    let optionsHtml = '<option value="">-- សូមជ្រើសរើសឈ្មោះសិស្ស --</option>';
    const sorted = [...currentClassDb].sort((a,b) => a.name.localeCompare(b.name, 'km'));
    sorted.forEach(s => { optionsHtml += `<option value="${s.id}">${s.name} (${s.gender}) - ${s.id}</option>`; });
    if(document.getElementById('profile-student-select')) { document.getElementById('profile-student-select').innerHTML = optionsHtml; if(currentVal1) document.getElementById('profile-student-select').value = currentVal1; }
    if(document.getElementById('tracking-student-select')) { document.getElementById('tracking-student-select').innerHTML = optionsHtml; if(currentVal2) document.getElementById('tracking-student-select').value = currentVal2; }
}

function renderStudentProfile() {
    const id = document.getElementById('profile-student-select').value;
    const area = document.getElementById('student-profile-area');
    const empty = document.getElementById('student-empty-state');
    if(!id) { area.classList.add('hidden'); empty.classList.remove('hidden'); return; }

    area.classList.remove('hidden'); empty.classList.add('hidden');
    const s = currentClassDb.find(x => x.id === id);

    document.getElementById('student-avatar').textContent = s.name.charAt(0);
    document.getElementById('student-avatar').className = `w-20 h-20 rounded-full text-white text-3xl font-bold mb-3 flex items-center justify-center shadow-md ${s.gender==='ស'?'bg-pink-500':'bg-blue-500'}`;
    document.getElementById('profile-name').textContent = s.name;
    document.getElementById('profile-id-gender').textContent = `អត្តលេខ៖ ${s.id} | ភេទ៖ ${s.gender}`;

    const m = 'sem1'; 
    const sc = s.scores[m] || {total:0, avg:0, rank:0, grade:""};
    document.getElementById('prof-total').textContent = sc.total || '-';
    document.getElementById('prof-avg').textContent = sc.avg || '-';
    document.getElementById('prof-rank').textContent = sc.rank ? `#${sc.rank}` : '-';

    const ctx = document.getElementById('progressChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'ឆមាស១', 'ឆមាស២'],
            datasets: [{
                label: 'មធ្យមភាគការសិក្សា',
                data: [ s.scores.dec?.avg || 0, s.scores.jan?.avg || 0, s.scores.feb?.avg || 0, s.scores.mar?.avg || 0, s.scores.sem1?.avg || 0, s.scores.sem2?.avg || 0 ],
                borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 } } }
    });
}

function generateTrackingBook() {
    const id = document.getElementById('tracking-student-select').value;
    if(!id) return alert("សូមជ្រើសរើសសិស្សជាមុនសិន!");
    const s = currentClassDb.find(x => x.id === id);
    document.getElementById('printable-report').classList.remove('hidden');
    document.getElementById('tb-id').innerText = s.id;
    document.getElementById('tb-name').innerText = s.name;
    document.getElementById('tb-gender').innerText = s.gender;
    const tbody = document.getElementById('tb-scores-body');
    tbody.innerHTML = '';
    monthsList.forEach(m => {
        const sc = s.scores[m];
        if(sc && sc.avg > 0) {
            tbody.innerHTML += `<tr><td class="border border-gray-800 p-2 font-bold">${monthNamesKh[m] || m}</td><td class="border border-gray-800 p-2">${sc.total}</td><td class="border border-gray-800 p-2 font-bold text-blue-800">${sc.avg}</td><td class="border border-gray-800 p-2">${sc.rank}</td><td class="border border-gray-800 p-2">${sc.grade}</td><td class="border border-gray-800 p-2"></td></tr>`;
        }
    });
    if(tbody.innerHTML === '') tbody.innerHTML = `<tr><td colspan="6" class="border border-gray-800 p-4 text-gray-400">មិនទាន់មានទិន្នន័យពិន្ទុឡើយ</td></tr>`;
}