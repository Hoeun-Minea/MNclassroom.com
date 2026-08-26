/**
 * ========================================================================
 * ប្រព័ន្ធគ្រប់គ្រងសាលារៀន និងពិន្ទុ (Student Management System - Script.js)
 * ========================================================================
 */

const API_URL = "https://script.google.com/macros/s/AKfycbzXenyp8Qi_NEuOGtMf9dZZ8FbRezr-DkfFX59MeKclO_ENgxnTbsiTj11HYerNQMtNtw/exec";

// អថេរគោលសម្រាប់គ្រប់គ្រងប្រព័ន្ធ (App State)
const AppState = {
    db: [],
    currentClassDb: [],
    currentClassName: "២ខ",
    isLoggedIn: false,
    loggedInUser: "",
    loggedInUsername: "",
    dbAttendance: {},
    sysSettings: {},
    usersDb: []
};

const constants = {
    monthsList: ['dec', 'jan', 'feb', 'mar', 'sem1', 'result_sem1', 'may', 'jun', 'jul', 'aug', 'sem2', 'result_sem2', 'annual'],
    monthNamesKh: {
        'dec': 'ខែ ធ្នូ', 'jan': 'ខែ មករា', 'feb': 'ខែ កុម្ភៈ', 'mar': 'ខែ មីនា', 'sem1': 'ប្រឡងឆមាសទី១', 'result_sem1': 'លទ្ធផលឆមាសទី១',
        'may': 'ខែ ឧសភា', 'jun': 'ខែ មិថុនា', 'jul': 'ខែ កក្កដា', 'aug': 'ខែ សីហា', 'sem2': 'ប្រឡងឆមាសទី២', 'result_sem2': 'លទ្ធផលឆមាសទី២',
        'annual': 'លទ្ធផលប្រចាំឆ្នាំ'
    },
    khmerDays: ['អា.', 'ច.', 'អ.', 'ព.', 'ព្រ.', 'សុ.', 'ស.']
};

let charts = { progress: null, dash: null };
let disciplineRecords = []; 

// ==========================================
// MODAL TOGGLE FUNCTIONS (បើក/បិទ POP-UPS)
// ==========================================
function openAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) modal.classList.add('hidden');
}

function openDisciplineModal() {
    populateDisciplineDropdown(); // ទាញឈ្មោះសិស្សចូល Dropdown ជាមុន
    const modal = document.getElementById('add-discipline-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeDisciplineModal() {
    const modal = document.getElementById('add-discipline-modal');
    if (modal) modal.classList.add('hidden');
}
// ==========================================
// មុខងារ គណនីរបស់ខ្ញុំ (My Profile / Change Password)
// ==========================================
function openMyProfile() {
    document.getElementById('my-username').value = AppState.loggedInUsername;
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeMyProfile() {
    document.getElementById('profile-modal').classList.add('hidden');
}

async function submitChangePassword(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-change-pwd');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
    btn.disabled = true;

    const payload = {
        action: 'change_password',
        username: AppState.loggedInUsername,
        old_password: document.getElementById('old-password').value.trim(),
        new_password: document.getElementById('new-password').value.trim()
    };

    try {
        const result = await fetchAPI(payload);
        if(result.status === "success") {
            showToast("ប្តូរពាក្យសម្ងាត់បានជោគជ័យ!");
            closeMyProfile();
        } else {
            alert(result.message); // បង្ហាញ Error ឧ. "ពាក្យសម្ងាត់ចាស់មិនត្រូវទេ"
        }
    } catch(err) {
        showToast("បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Server");
    } finally {
        btn.innerHTML = 'ប្តូរពាក្យសម្ងាត់';
        btn.disabled = false;
    }
}

// ==========================================
// មុខងារបោះពុម្ពបញ្ជីទទេ (Print Blank Roster)
// ==========================================
function printBlankList() {
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    if(sortedDb.length === 0) return alert("មិនទាន់មានសិស្សក្នុងថ្នាក់នេះទេ!");

    let html = `
    <div id="blank-list-print" class="print-area p-8 bg-white w-full">
        <h2 class="font-moul text-xl text-center mb-6 text-gray-800">បញ្ជីឈ្មោះសិស្សថ្នាក់ទី ${AppState.currentClassName})</h2>
        <table class="w-full border-collapse border border-gray-800 text-sm mb-15 justify-center">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-800 p-3 w-12 text-center font-bold">ល.រ</th>
                    <th class="border border-gray-800 p-3 text-left font-bold w-48">ឈ្មោះសិស្ស</th>
                    <th class="border border-gray-800 p-3 w-16 text-center font-bold">ភេទ</th>
                    <th class="border border-gray-800 p-3"></th>
                    <th class="border border-gray-800 p-3"></th>
                    <th class="border border-gray-800 p-3"></th>
                    <th class="border border-gray-800 p-3"></th>
                    <th class="border border-gray-800 p-3"></th>
                </tr>
            </thead>
            <tbody>
    `;
    sortedDb.forEach((s, i) => {
        html += `<tr>
            <td class="border border-gray-800 p-2 text-center text-gray-700">${i+1}</td>
            <td class="border border-gray-800 p-2 font-bold text-gray-800">${s.name}</td>
            <td class="border border-gray-800 p-2 text-center text-gray-700">${s.gender}</td>
            <td class="border border-gray-800 p-2 w-20"></td>
            <td class="border border-gray-800 p-2 w-20"></td>
            <td class="border border-gray-800 p-2 w-20"></td>
            <td class="border border-gray-800 p-2 w-20"></td>
            <td class="border border-gray-800 p-2 w-20"></td>
        </tr>`;
    });
    html += `</tbody></table></div>`;

    // បង្កើត div ថ្មីបណ្តោះអាសន្ន
    let printDiv = document.createElement('div');
    printDiv.id = 'temp-print-div';
    printDiv.innerHTML = html;
    document.body.appendChild(printDiv);
    
    // លាក់កូដ App ទាំងមូលសិន
    document.getElementById('main-app').style.display = 'none';
    
    window.print();
    
    // លុបវាចោលវិញ ហើយបង្ហាញ App មកធម្មតា
    document.body.removeChild(printDiv);
    document.getElementById('main-app').style.display = 'flex';
}
// ==========================================
// API SERVICE 
// ==========================================
async function fetchAPI(payload, method = 'POST', queryParams = '') {
    try {
        let url = API_URL + queryParams;
        let options = {};
        if (method === 'POST') {
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            };
        }
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

async function sendPostRequest(payload) {
    return await fetchAPI(payload);
}

// ==========================================
// TOAST NOTIFICATION & UI HELPERS
// ==========================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    document.getElementById('toast-msg').innerText = msg;
    toast.className = 'show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function toggleAuth(type) {
    const isLogin = type !== 'register';
    document.getElementById('login-container').classList.toggle('hidden', !isLogin);
    document.getElementById('register-container').classList.toggle('hidden', isLogin);
}

// ==========================================
// AUTHENTICATION
// ==========================================
async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        action: 'register',
        name: document.getElementById('reg-name').value.trim(),
        username: document.getElementById('reg-user').value.trim(),
        password: document.getElementById('reg-pass').value.trim(),
        assigned_class: document.getElementById('reg-level').value + document.getElementById('reg-room').value
    };

    const btn = document.getElementById('btn-register');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងចុះឈ្មោះ...';
    btn.disabled = true;

    try {
        const result = await fetchAPI(payload);
        alert(result.message);
        if (result.status === "success") {
            toggleAuth('login');
            document.getElementById('register-form').reset();
        }
    } catch (error) {
        alert("មិនអាចភ្ជាប់ទៅប្រព័ន្ធបានទេ! សូមពិនិត្យមើលបណ្តាញអ៊ីនធឺណិត។");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-user-plus mr-2"></i> ចុះឈ្មោះ';
        btn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const btn = document.getElementById('btn-login');

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងពិនិត្យ...';
    btn.disabled = true;

    try {
        const result = await fetchAPI({ action: 'login', username: user, password: pass });

        if (result.status === "success") {
            AppState.isLoggedIn = true;
            AppState.loggedInUser = result.name;
            AppState.loggedInUsername = result.username.trim().toLowerCase();
            AppState.currentClassName = result.assigned_class || "២ខ";

            document.getElementById('user-fullname').innerText = AppState.loggedInUser;
            document.getElementById('user-avatar').innerText = AppState.loggedInUser.charAt(0);
            document.querySelectorAll('.sys-teacher').forEach(el => el.innerText = AppState.loggedInUser);

            const isAdmin = AppState.loggedInUsername === 'admin';
            ['class-selector-container', 'nav-settings-label', 'nav-settings', 'nav-admin-label', 'nav-manage-users'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.toggle('hidden', !isAdmin);
            });

            let levelMatch = AppState.currentClassName.replace(/[ក-ង]/g, '');
            let roomMatch = AppState.currentClassName.replace(/[១-៦]/g, '');
            if(document.getElementById('filter-level')) document.getElementById('filter-level').value = levelMatch;
            if(document.getElementById('filter-room')) document.getElementById('filter-room').value = roomMatch;

            updateClassDisplayUI();

            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').classList.remove('hidden');
            showToast(`ស្វាគមន៍ ${AppState.loggedInUser}`);

            await fetchStudents();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ! បញ្ហា CORS ឬ URL ខុស។");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> ចូលប្រើប្រាស់';
        btn.disabled = false;
    }
}

function handleLogout() {
    if(confirm("តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញមែនទេ?")) location.reload();
}

function updateClassDisplayUI() {
    document.querySelectorAll('.display-current-class').forEach(el => el.innerText = AppState.currentClassName);
    document.getElementById('header-class-badge').innerText = "ថ្នាក់ទី " + AppState.currentClassName;
}

function getGrade(avg) {
    if(avg >= 8) return "ល្អ";
    if(avg >= 6.5) return "ល្អបង្គួរ";
    if(avg >= 5) return "មធ្យម";
    if(avg > 0) return "ខ្សោយ";
    return "";
}

function calculateSemesterResults() {
    AppState.currentClassDb.forEach(s => {
        let s1Sum = (s.scores['dec']?.avg||0) + (s.scores['jan']?.avg||0) + (s.scores['feb']?.avg||0) + (s.scores['mar']?.avg||0);
        let s1Exam = s.scores['sem1']?.avg||0;
        let s1Final = 0;
        if (s1Sum > 0 || s1Exam > 0) {
            s1Final = ((s1Sum / 4) + s1Exam) / 2;
            s.scores['result_sem1'] = { avg: parseFloat(s1Final.toFixed(2)), total: "-", rank: 0, grade: getGrade(s1Final) };
        } else s.scores['result_sem1'] = { avg: 0, total: 0, rank: 0, grade: "" };

        let s2Sum = (s.scores['may']?.avg||0) + (s.scores['jun']?.avg||0) + (s.scores['jul']?.avg||0) + (s.scores['aug']?.avg||0);
        let s2Exam = s.scores['sem2']?.avg||0;
        let s2Final = 0;
        if (s2Sum > 0 || s2Exam > 0) {
            s2Final = ((s2Sum / 4) + s2Exam) / 2;
            s.scores['result_sem2'] = { avg: parseFloat(s2Final.toFixed(2)), total: "-", rank: 0, grade: getGrade(s2Final) };
        } else s.scores['result_sem2'] = { avg: 0, total: 0, rank: 0, grade: "" };

        if (s1Final > 0 && s2Final > 0) {
            let annualFinal = (s1Final + s2Final) / 2;
            s.scores['annual'] = { avg: parseFloat(annualFinal.toFixed(2)), total: "-", rank: 0, grade: getGrade(annualFinal) };
        } else {
            s.scores['annual'] = { avg: 0, total: 0, rank: 0, grade: "" };
        }
    });

    ['result_sem1', 'result_sem2', 'annual'].forEach(resKey => {
        let sorted = [...AppState.currentClassDb].filter(s => s.scores[resKey] && s.scores[resKey].avg > 0).sort((a,b) => b.scores[resKey].avg - a.scores[resKey].avg);
        let currRank = 1;
        sorted.forEach((s, idx) => {
            if(idx > 0 && s.scores[resKey].avg < sorted[idx-1].scores[resKey].avg) currRank = idx + 1;
            s.scores[resKey].rank = currRank;
        });
    });
}

async function fetchStudents() {
    try {
        const data = await fetchAPI(null, 'GET');
        AppState.sysSettings = data.settings || {};
        applySettingsToUI();

        AppState.db = data.students.map(s => {
            let studentData = {
                id: s.id.toString(), name: s.name, gender: s.gender, dob: s.dob || '',
                pob: s.pob || '', father: s.father || '', mother: s.mother || '',
                class_name: s.class_name || "២ខ", photo: s.photo || "", scores: s.scores || {}
            };
            constants.monthsList.forEach(m => {
                if(!studentData.scores[m]) {
                    studentData.scores[m] = { total:0, avg:0, rank:0, grade:"" };
                    for(let i=1; i<=19; i++) studentData.scores[m][`sub${i}`] = "";
                }
            });
            return studentData;
        });

        refreshClassData();
        fetchAttendanceReport();
    } catch (error) {
        showToast("បរាជ័យក្នុងការទាញយកទិន្នន័យសិស្ស!");
    }
}

function refreshClassData() {
    AppState.currentClassDb = AppState.db.filter(s => s.class_name === AppState.currentClassName);
    calculateSemesterResults();
    updateAllViews();
}

function handleClassChange() {
    let level = document.getElementById('filter-level').value;
    let room = document.getElementById('filter-room').value;
    AppState.currentClassName = level + room;

    updateClassDisplayUI();
    refreshClassData();
    fetchAttendanceReport();

    const aside = document.getElementById('main-sidebar');
    if(aside && aside.classList.contains('mobile-open')) {
        toggleMobileSidebar();
    }
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

async function fetchUsers() {
    if (AppState.loggedInUsername !== 'admin') return;
    const tbody = document.getElementById('manage-users-tbody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងទាញយកទិន្នន័យ...</td></tr>';

    try {
        const result = await fetchAPI({ action: 'get_users' });
        if(result.status === "success") {
            AppState.usersDb = result.data;
            renderUsersTable();
        } else {
            alert("បញ្ហាពី Server: " + result.message);
            if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">${result.message}</td></tr>`;
        }
    } catch (error) { 
        alert("បរាជ័យក្នុងការតភ្ជាប់ទាញយកគណនី!");
        if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-red-500">បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Server!</td></tr>';
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('manage-users-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    if(!AppState.usersDb || AppState.usersDb.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">មិនទាន់មានគណនីគ្រូនៅក្នុងប្រព័ន្ធទេ</td></tr>';
        return;
    }

    AppState.usersDb.forEach((u, idx) => {
        let uName = String(u.username || "");
        let uPass = String(u.password || "");
        let fName = String(u.name || "");
        let aClass = String(u.assigned_class || "ទូទៅ");

        let roleBadge = uName.toLowerCase() === 'admin' 
            ? '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold ml-2">Admin</span>' 
            : '<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold ml-2">Teacher</span>';
        
        tbody.innerHTML += `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 text-center">${idx + 1}</td>
                <td class="px-6 py-4 font-bold text-gray-800">${uName} ${roleBadge}</td>
                <td class="px-6 py-4 font-mono text-gray-500">${uPass}</td>
                <td class="px-6 py-4 font-bold text-blue-700">${fName}</td>
                <td class="px-6 py-4 text-center font-bold text-green-600">${aClass}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="openEditUserModal('${uName}')" class="text-blue-600 hover:text-blue-800 mx-1" title="កែប្រែ"><i class="fa-solid fa-pen-to-square"></i></button>
                    ${uName.toLowerCase() !== 'admin' ? `<button onclick="deleteUserAccount('${uName}')" class="text-red-500 hover:text-red-700 mx-1" title="លុប"><i class="fa-solid fa-trash"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
}

function openEditUserModal(username) {
    const u = AppState.usersDb.find(x => x.username === username);
    if(!u) return;
    document.getElementById('edit-u-old-username').value = u.username;
    document.getElementById('edit-u-username').value = u.username;
    document.getElementById('edit-u-password').value = u.password;
    document.getElementById('edit-u-name').value = u.name;
    document.getElementById('edit-u-class').value = u.assigned_class || '';
    document.getElementById('edit-user-modal').classList.remove('hidden');
}

function closeEditUserModal() {
    document.getElementById('edit-user-modal').classList.add('hidden');
}

async function submitEditUser(e) {
    e.preventDefault();
    const payload = {
        action: 'update_user',
        old_username: document.getElementById('edit-u-old-username').value,
        username: document.getElementById('edit-u-username').value.trim(),
        password: document.getElementById('edit-u-password').value.trim(),
        name: document.getElementById('edit-u-name').value.trim(),
        assigned_class: document.getElementById('edit-u-class').value.trim()
    };
    showToast("កំពុងកែប្រែគណនី...");
    try {
        const result = await fetchAPI(payload);
        if(result.status === "success") {
            closeEditUserModal();
            fetchUsers();
            showToast("បានកែប្រែជោគជ័យ!");
        } else { showToast(result.message); }
    } catch (err) { showToast("មានបញ្ហា!"); }
}

async function deleteUserAccount(username) {
    if(!confirm(`តើអ្នកពិតជាចង់លុបគណនី "${username}" មែនទេ?`)) return;
    showToast("កំពុងលុប...");
    try {
        const result = await fetchAPI({ action: 'delete_user_account', username: username });
        if(result.status === "success") {
            fetchUsers();
            showToast("បានលុបជោគជ័យ!");
        } else { showToast(result.message); }
    } catch (err) { showToast("មានបញ្ហា!"); }
}

async function processAndUploadImage(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return "";
    
    const file = fileInput.files[0];
    const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 400; canvas.height = 600; 
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    showToast("កំពុងបញ្ជូនរូបថតទៅ Drive...");
    const result = await fetchAPI({ action: "upload_photo", filename: file.name, mimeType: file.type, base64: base64Data });
    return result.status === "success" ? result.url : "";
}

async function addStudent(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';

    let photoUrl = await processAndUploadImage('new-photo');

    const payload = {
        action: "add_student",
        id: document.getElementById('new-id').value.trim(),
        name: document.getElementById('new-name').value.trim(),
        gender: document.getElementById('new-gender').value,
        dob: document.getElementById('new-dob').value.trim(),
        pob: document.getElementById('new-pob').value.trim(),
        father: document.getElementById('new-father').value.trim(),
        mother: document.getElementById('new-mother').value.trim(),
        class_name: AppState.currentClassName,
        photo: photoUrl
    };

    if(AppState.currentClassDb.find(s => s.id === payload.id)) {
        btn.disabled = false; btn.innerHTML = 'រក្សាទុកសិស្ស';
        return alert("អត្តលេខនេះមានរួចហើយក្នុងថ្នាក់នេះ!");
    }

    try {
        const result = await fetchAPI(payload);
        if(result.status === "success") {
            payload.scores = {};
            constants.monthsList.forEach(m => {
                payload.scores[m] = { total:0, avg:0, rank:0, grade:"" };
                for(let i=1; i<=19; i++) payload.scores[m][`sub${i}`] = "";
            });
            AppState.db.push(payload);
            refreshClassData();
            document.getElementById('add-student-form').reset();
            closeAddStudentModal(); // បិទ Pop-up ពេលបញ្ចូលជោគជ័យ
            showToast("បានបន្ថែមសិស្សថ្មីជោគជ័យ!");
        } else { showToast(result.message); }
    } catch(error) { showToast("បរាជ័យក្នុងការភ្ជាប់ Server!"); }
    finally { btn.disabled = false; btn.innerHTML = 'រក្សាទុកសិស្ស'; }
}

function openEditStudent(id) {
    const s = AppState.currentClassDb.find(x => x.id === id);
    if(!s) return;
    document.getElementById('edit-old-id').value = s.id;
    document.getElementById('edit-id').value = s.id;
    document.getElementById('edit-name').value = s.name;
    document.getElementById('edit-gender').value = s.gender;
    document.getElementById('edit-dob').value = s.dob || '';
    document.getElementById('edit-pob').value = s.pob || '';
    document.getElementById('edit-father').value = s.father || '';
    document.getElementById('edit-mother').value = s.mother || '';
    document.getElementById('edit-class').value = s.class_name || AppState.currentClassName;

    let oldClassInput = document.getElementById('edit-old-class');
    if(!oldClassInput) {
        oldClassInput = document.createElement('input'); oldClassInput.type = 'hidden';
        oldClassInput.id = 'edit-old-class'; document.getElementById('edit-student-form').appendChild(oldClassInput);
    }
    oldClassInput.value = s.class_name;
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() { document.getElementById('edit-modal').classList.add('hidden'); }

async function submitEditStudent(e) {
    e.preventDefault();
    const oldId = document.getElementById('edit-old-id').value;
    const oldClass = document.getElementById('edit-old-class').value;
    const s = AppState.db.find(x => x.id === oldId && x.class_name === oldClass);
    
    let photoUrl = await processAndUploadImage('edit-photo');
    if(!photoUrl && s) photoUrl = s.photo;

    const payload = {
        action: "edit_student", old_id: oldId, old_class: oldClass, id: document.getElementById('edit-id').value, class_name: document.getElementById('edit-class').value.trim(),
        name: document.getElementById('edit-name').value.trim(), gender: document.getElementById('edit-gender').value,
        dob: document.getElementById('edit-dob').value.trim(), pob: document.getElementById('edit-pob').value.trim(),
        father: document.getElementById('edit-father').value.trim(), mother: document.getElementById('edit-mother').value.trim(), photo: photoUrl
    };

    showToast("កំពុងកែប្រែទិន្នន័យ...");
    try {
        const result = await fetchAPI(payload);
        if(result.status === "success") {
            const masterIdx = AppState.db.findIndex(s => s.id === oldId && s.class_name === oldClass);
            if(masterIdx !== -1) AppState.db[masterIdx] = { ...AppState.db[masterIdx], ...payload };
            closeEditModal();
            refreshClassData();
            showToast("បានកែប្រែព័ត៌មានសិស្សជោគជ័យ!");
        } else { showToast(result.message); }
    } catch (err) { showToast("បញ្ហាការតភ្ជាប់!"); }
}

async function deleteStudent(id, name) {
    if(!confirm(`តើអ្នកពិតជាចង់លុបសិស្សឈ្មោះ "${name}" (អត្តលេខ: ${id}) មែនទេ?`)) return;
    showToast("កំពុងលុបទិន្នន័យ...");
    try {
        const result = await fetchAPI({ action: "delete_student", id: id, class_name: AppState.currentClassName });
        if(result.status === "success") {
            AppState.db = AppState.db.filter(s => !(s.id === id && s.class_name === AppState.currentClassName));
            refreshClassData();
            showToast("បានលុបសិស្សចេញពីបញ្ជី!");
        } else { showToast(result.message); }
    } catch (err) { showToast("បញ្ហាការតភ្ជាប់!"); }
}

function renderManageStudentsTable() {
    const tbody = document.getElementById('manage-students-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    document.getElementById('student-list-count').innerText = `សរុប ${AppState.currentClassDb.length} នាក់`;
    if (document.getElementById('female-count')) document.getElementById('female-count').innerText = `ស្រី: ${AppState.currentClassDb.filter(s => s.gender === 'ស').length} នាក់`;

    sortedDb.forEach((s, idx) => {
        let photoHtml = s.photo ? `<img src="${s.photo}" class="w-8 h-8 rounded-full object-cover border inline-block">` : `<div class="w-8 h-8 rounded-full bg-gray-200 inline-flex items-center justify-center text-xs"><i class="fa-solid fa-user text-gray-400"></i></div>`;
        
        tbody.innerHTML += `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-4 py-3 border-r text-center">${idx + 1}</td>
                <td class="px-4 py-3 border-r text-center">${photoHtml}</td>
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

function downloadExcelTemplate() {
    const headers = [["អត្តលេខ", "ឈ្មោះ", "ភេទ(ប/ស)", "ថ្ងៃកំណើត", "ទីកន្លែងកំណើត", "ឈ្មោះឪពុក", "ឈ្មោះម្តាយ"]];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    ws['!cols'] = [{wch: 10}, {wch: 25}, {wch: 10}, {wch: 15}, {wch: 20}, {wch: 20}, {wch: 20}];
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "ទម្រង់បញ្ចូលឈ្មោះសិស្ស.xlsx");
}

async function handleExcelImport(e) {
    const file = e.target.files[0];
    if(!file) return;

    showToast("កំពុងអានឯកសារ Excel...");
    const reader = new FileReader();

    reader.onload = async function(evt) {
        try {
            const data = evt.target.result;
            const workbook = XLSX.read(data, {type: 'binary'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

            if(rawData.length <= 1) {
                alert("ឯកសារទទេ ឬគ្មានទិន្នន័យសិស្សទេ!");
                e.target.value = ""; return;
            }

            let newStudents = [];
            for(let i=1; i<rawData.length; i++) {
                let row = rawData[i];
                if(!row[0] || !row[1]) continue; 

                newStudents.push({
                    id: row[0].toString().trim(),
                    name: row[1].toString().trim(),
                    gender: row[2] ? row[2].toString().trim() : "ប",
                    dob: row[3] ? row[3].toString() : "",
                    pob: row[4] ? row[4].toString() : "",
                    father: row[5] ? row[5].toString() : "",
                    mother: row[6] ? row[6].toString() : ""
                });
            }

            if(newStudents.length === 0) {
                alert("រកមិនឃើញទិន្នន័យត្រឹមត្រូវ។ សូមប្រាកដថាបានបំពេញ 'អត្តលេខ' និង 'ឈ្មោះ'។");
                e.target.value = ""; return;
            }

            if(!confirm(`ប្រព័ន្ធរកឃើញសិស្សចំនួន ${newStudents.length} នាក់ ក្នុងឯកសារនេះ។\nតើលោកគ្រូពិតជាចង់បញ្ចូលទៅក្នុងថ្នាក់ទី ${AppState.currentClassName} មែនទេ?`)) {
                e.target.value = ""; return;
            }

            showToast("កំពុងបញ្ចូលទិន្នន័យទៅក្នុងប្រព័ន្ធ...");
            const payload = {
                action: "import_students_bulk",
                class_name: AppState.currentClassName,
                students: newStudents
            };

            const result = await fetchAPI(payload);
            if(result.status === "success") {
                showToast(result.message);
                fetchStudents(); 
                closeAddStudentModal(); // បិទ Pop-up ប្រសិនបើកំពុងបើក
            } else {
                alert("បរាជ័យ: " + result.message);
            }
        } catch(error) {
            alert("មានបញ្ហាក្នុងការអានឯកសារ! សូមប្រាកដថាវាជាឯកសារ Excel ត្រឹមត្រូវ។");
            console.error(error);
        } finally {
            e.target.value = ""; 
        }
    };
    
}

function applySettingsToUI() {
    document.querySelectorAll('.sys-school').forEach(el => el.innerText = AppState.sysSettings.school_name || 'សាលាបឋមសិក្សា ខ្សុំ');
    document.querySelectorAll('.sys-year').forEach(el => el.innerText = AppState.sysSettings.academic_year || '២០២៦-២០២៧');
    document.querySelectorAll('.sys-principal').forEach(el => el.innerText = AppState.sysSettings.principal_title || 'នាយកសាលា');
    if(document.getElementById('set-school')) document.getElementById('set-school').value = AppState.sysSettings.school_name || '';
    if(document.getElementById('set-year')) document.getElementById('set-year').value = AppState.sysSettings.academic_year || '';
    if(document.getElementById('set-principal')) document.getElementById('set-principal').value = AppState.sysSettings.principal_title || '';
    document.querySelectorAll('set-dist').forEach(el => el.innerText = AppState.sysSettings.school_dist || 'កៀនស្វាយ');
    if(document.getElementById('set-dist')) document.getElementById('set-dist').value = AppState.sysSettings.school_dist || '';
    document.querySelectorAll('set-teacher-name').forEach(el =>el.innerText = AppState.sysSettings.teacher_name || '');
    if(document.getElementById('set-teacher-name')) document.getElementById('set-teacher-name').value = AppState.sysSettings.teacher_name || '';
}

async function saveGeneralInfo(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-general');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
    btn.disabled = true;

    const payload = {
        action: 'save_settings',
        settings: {
            school_name: document.getElementById('set-school').value.trim(),
            school_name_en: document.getElementById('set-school-en').value.trim(),
            school_abbr: document.getElementById('set-school-abbr').value.trim(),
            school_code: document.getElementById('set-school-code').value.trim(),
            school_type: document.getElementById('set-school-type').value,
            principal_title: document.getElementById('set-principal').value.trim(),
            academic_year: document.getElementById('set-year').value.trim(),
            school_prov: document.getElementById('set-prov').value.trim(),
            school_dist: document.getElementById('set-dist').value.trim(),
            school_comm: document.getElementById('set-comm').value.trim(),
            school_vill: document.getElementById('set-vill').value.trim(),
            teacher_name: document.getElementById('set-teacher-name').value.trim(),
            teacher_gender: document.getElementById('set-teacher-gender').value,
            teacher_dob: document.getElementById('set-teacher-dob').value.trim(),
            teacher_phone: document.getElementById('set-teacher-phone').value.trim(),
            teacher_class: document.getElementById('set-teacher-class').value.trim(),
        }
    };

    try {
        const result = await fetchAPI(payload);
        if (result.status === "success") {
            AppState.sysSettings = { ...AppState.sysSettings, ...payload.settings };
            updateSystemUI();
            showToast("បានរក្សាទុកព័ត៌មានទូទៅជោគជ័យ!");
        } else {
            showToast("បញ្ហា: " + result.message);
        }
    } catch (err) {
        showToast("បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Server!");
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> រក្សាទុកព័ត៌មានទូទៅ';
        btn.disabled = false;
    }
}

function updateSystemUI() {
    const s = AppState.sysSettings;
    const fields = [
        { id: 'set-school', key: 'school_name' }, { id: 'set-school-en', key: 'school_name_en' },
        { id: 'set-school-abbr', key: 'school_abbr' }, { id: 'set-school-code', key: 'school_code' },
        { id: 'set-school-type', key: 'school_type' }, { id: 'set-principal', key: 'principal_title' },
        { id: 'set-year', key: 'academic_year' }, { id: 'set-prov', key: 'school_prov' },
        { id: 'set-dist', key: 'school_dist' }, { id: 'set-comm', key: 'school_comm' },
        { id: 'set-vill', key: 'school_vill' }, { id: 'set-teacher-name', key: 'teacher_name' },
        { id: 'set-teacher-gender', key: 'teacher_gender' }, { id: 'set-teacher-dob', key: 'teacher_dob' },
        { id: 'set-teacher-phone', key: 'teacher_phone' }, { id: 'set-teacher-class', key: 'teacher_class' }
    ];
    
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (el && s[f.key]) el.value = s[f.key];
    });

    document.querySelectorAll('.sys-school').forEach(el => el.innerText = s.school_name || 'សាលាបឋមសិក្សា');
    document.querySelectorAll('.sys-year').forEach(el => el.innerText = s.academic_year || '');
    document.querySelectorAll('.sys-principal').forEach(el => el.innerText = s.principal_title || 'នាយក/នាយិកាសាលា');
    document.querySelectorAll('.sys-teacher').forEach(el => el.innerText = s.teacher_name || AppState.loggedInName || '');
}

// ==========================================
// វត្តមានសិស្ស (ATTENDANCE)
// ==========================================
let currentDaysInMonth = 31, currentYear = new Date().getFullYear(), currentMonthNum = new Date().getMonth() + 1;
function getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

function handleDateChange() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(yyyyMm) {
        const parts = yyyyMm.split('-');
        currentYear = parseInt(parts[0]); currentMonthNum = parseInt(parts[1]);
        currentDaysInMonth = getDaysInMonth(currentYear, currentMonthNum);
    }
    fetchAttendanceReport();
}

async function fetchAttendanceReport() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(!yyyyMm) return;
    try {
        const result = await fetchAPI(null, 'GET', `?action=get_attendance&month=${yyyyMm}&class_name=${encodeURIComponent(AppState.currentClassName)}`);
        if(result.status === "success" && result.data) AppState.dbAttendance = result.data;
        else AppState.dbAttendance = {};
    } catch (err) { AppState.dbAttendance = {}; }
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
        let khDayName = constants.khmerDays[dayOfWeek];
        let bgClass = isWeekend ? 'bg-gray-200 text-red-500 font-bold' : 'bg-green-50 text-green-900';
        khmerDaysRow.innerHTML += `<th class="${bgClass} px-0.5 py-1 text-[11px]">${khDayName}</th>`;
        daysRow.innerHTML += `<th class="${bgClass} px-0.5 py-1 text-[10px]">${i}</th>`;
    }
    daysRow.innerHTML += `<th class="bg-blue-50 w-8">វ</th><th class="bg-blue-50 w-8 text-red-600">អ</th><th class="bg-blue-50 w-8 text-yellow-600">ច</th>`;
    khmerDaysRow.innerHTML += `<th colspan="3" class="bg-blue-50">សរុប</th>`;

    tbody.innerHTML = '';
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    if(sortedDb.length === 0) return tbody.innerHTML = `<tr><td colspan="${currentDaysInMonth + 6}" class="py-8 text-center text-gray-400">គ្មានបញ្ជីសិស្សទេក្នុងថ្នាក់នេះ</td></tr>`;

    sortedDb.forEach((s, idx) => {
        let rowHtml = `<tr class="bg-white border-b hover:bg-gray-50" data-studentid="${s.id}"><td class="text-center">${idx + 1}</td><td class="text-left px-2 font-bold text-gray-800">${s.name}</td><td class="text-center ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'} font-medium">${s.gender}</td>`;
        let studentAtt = AppState.dbAttendance[s.id] || {};
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
                let val = input.value.toUpperCase(); input.value = val;
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
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរកទុក...';
    try {
        await fetchAPI({ action: 'save_monthly_attendance', month: yyyyMm, class_name: AppState.currentClassName, data: attData });
        showToast("រក្សាទុកវត្តមានជោគជ័យ!");
    } catch(e) { showToast("បរាជ័យក្នុងការភ្ជាប់ Server!"); }
    finally { btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> រក្សាទុកវត្តមាន'; }
}

function loadDetailedSheet() {
    const m = document.getElementById('month-selector').value;
    const tbody = document.getElementById('detailed-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));

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
        await fetchAPI({ action: "save_scores", month: m, class_name: AppState.currentClassName, scores: monthScoresData });
        await fetchStudents();
        loadDetailedSheet();
        showToast("រក្សាទុក និងគណនាពិន្ទុជោគជ័យ!");
    } catch (error) { showToast("បរាជ័យក្នុងការរក្សាទុកពិន្ទុ"); }
    finally { document.body.style.cursor = 'default'; }
}

function renderMonthlyResults() {
    const m = document.getElementById('result-month-selector').value;
    const container = document.getElementById('monthly-results-container');
    if(!container) return;
    container.innerHTML = '';

    const sorted = [...AppState.currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a, b) => b.scores[m].avg - a.scores[m].avg);
    if(sorted.length === 0) return container.innerHTML = `<p class="p-4 text-center text-gray-400">មិនទាន់មានទិន្នន័យលទ្ធផលសម្រាប់ចន្លោះពេលនេះទេ</p>`;

    let passCount = 0, passFemale = 0;
    
    const tableHeader = `
        <thead class="bg-blue-800 text-white font-bold">
            <tr>
                <th class="border border-blue-900 p-2 w-10 text-[10px] md:text-xs text-center">ល.រ</th>
                <th class="border border-blue-900 p-2 w-16 text-[10px] md:text-xs text-center hidden md:table-cell print:table-cell">អត្តលេខ</th>
                <th class="border border-blue-900 p-2 text-left text-[10px] md:text-xs">គោត្តនាម និងនាម</th>
                <th class="border border-blue-900 p-2 w-10 text-[10px] md:text-xs text-center">ភេទ</th>
                <th class="border border-blue-900 p-2 w-14 text-[10px] md:text-xs text-center">មធ្យមភាគ</th>
                <th class="border border-blue-900 p-2 w-16 text-[10px] md:text-xs text-center">ចំណាត់ថ្នាក់</th>
                <th class="border border-blue-900 p-2 w-14 text-[10px] md:text-xs text-center">និទ្ទេស</th>
                <th class="border border-blue-900 p-2 w-16 text-[10px] md:text-xs text-center print:table-cell hidden">ផ្សេងៗ</th>
            </tr>
        </thead>
    `;

    let leftHtml = '', rightHtml = '';

    sorted.forEach((s, idx) => {
        const sc = s.scores[m];
        if(sc.avg >= 5) { passCount++; if(s.gender === 'ស') passFemale++; }
        
        let zebraClass = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
        
        let rowItem = `
            <tr class="${zebraClass} hover:bg-blue-100 transition-colors">
                <td class="p-1.5 border border-slate-300 text-center text-[10px] md:text-xs font-medium text-gray-700">${idx + 1}</td>
                <td class="p-1.5 border border-slate-300 text-center text-gray-500 text-[10px] md:text-xs hidden md:table-cell print:table-cell">${s.id}</td>
                <td class="p-1.5 border border-slate-300 text-left font-bold text-gray-800 text-[11px] md:text-xs">${s.name}</td>
                <td class="p-1.5 border border-slate-300 text-center text-[10px] md:text-xs font-bold ${s.gender === 'ស' ? 'text-pink-600 print-text-red' : 'text-blue-600 print-text-blue'}">${s.gender}</td>
                <td class="p-1.5 border border-slate-300 text-center font-bold text-blue-700 print-text-blue text-[10px] md:text-xs">${sc.avg || 0}</td>
                <td class="p-1.5 border border-slate-300 text-center font-bold text-red-600 print-text-red text-[10px] md:text-xs">${sc.rank}</td>
                <td class="p-1.5 border border-slate-300 text-center font-bold text-green-600 print-text-green text-[10px] md:text-xs">${sc.grade || '-'}</td>
                <td class="p-1.5 border border-slate-300 text-center text-[10px] print:table-cell hidden"></td>
            </tr>
        `;
        
        if (idx < 20) { leftHtml += rowItem; } 
        else { rightHtml += rowItem; }
    });

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-6">
            <table class="w-full border-collapse moeys-table shadow-sm rounded-lg overflow-hidden">${tableHeader}<tbody class="text-gray-700">${leftHtml}</tbody></table>
            ${rightHtml ? `<table class="w-full border-collapse moeys-table shadow-sm rounded-lg overflow-hidden">${tableHeader}<tbody class="text-gray-700">${rightHtml}</tbody></table>` : ''}
        </div>
    `;

    document.getElementById('sum-total').innerText = AppState.currentClassDb.length;
    document.getElementById('sum-female').innerText = AppState.currentClassDb.filter(s => s.gender === 'ស').length;
    document.getElementById('sum-pass').innerText = passCount;
    document.getElementById('sum-pass-f').innerText = passFemale;

    let failCount = AppState.currentClassDb.filter(s => s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    let failFemale = AppState.currentClassDb.filter(s => s.gender === 'ស' && s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    if(document.getElementById('sum-fail')) document.getElementById('sum-fail').innerText = failCount;
    if(document.getElementById('sum-fail-f')) document.getElementById('sum-fail-f').innerText = failFemale;
    
    let titleText = constants.monthNamesKh[m] || '';
    if(!m.includes('sem') && m !== 'annual') titleText = titleText.replace('ខែ ', 'ប្រចាំខែ ');
    if(document.getElementById('result-month-title')) document.getElementById('result-month-title').innerText = titleText;
}

function renderDashboardStats() {
    document.getElementById('stat-total').innerHTML = `${AppState.currentClassDb.length}`;
    document.getElementById('stat-female').innerHTML = `${AppState.currentClassDb.filter(s => s.gender === 'ស').length}`;
    document.getElementById('stat-male').innerHTML = `${AppState.currentClassDb.filter(s => s.gender === 'ប').length}`;
}
// ==========================================
// មុខងារ Modal បង្ហាញបញ្ជីឈ្មោះសិស្ស
// ==========================================
function openStudentListModal() {
    renderModalStudentList(); // ទាញទិន្នន័យមកដាក់ក្នុងតារាងមុននឹងបង្ហាញ
    document.getElementById('student-list-modal').classList.remove('hidden');
}

function closeStudentListModal() {
    document.getElementById('student-list-modal').classList.add('hidden');
}
// ==========================================
// មុខងារ Modal បង្ហាញព័ត៌មានទូទៅ (General Info)
// ==========================================
function openGeneralInfoModal() {
    document.getElementById('general-info-modal').classList.remove('hidden');
}

function closeGeneralInfoModal() {
    document.getElementById('general-info-modal').classList.add('hidden');
}
function renderModalStudentList() {
    // ប្រើ ID ថ្មីរបស់ Modal
    const tbody = document.getElementById('modal-student-list-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    // តម្រៀបតាមអក្ខរក្រម
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    
    if(sortedDb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400 font-bold">មិនទាន់មានសិស្សក្នុងថ្នាក់នេះទេ</td></tr>`;
        return;
    }

    sortedDb.forEach((s, idx) => {
        let photoHtml = s.photo 
            ? `<img src="${s.photo}" class="w-8 h-8 rounded-full object-cover border inline-block shadow-sm">` 
            : `<div class="w-8 h-8 rounded-full bg-gray-200 inline-flex items-center justify-center text-xs shadow-sm"><i class="fa-solid fa-user text-gray-400"></i></div>`;
        
        tbody.innerHTML += `
            <tr class="bg-white border-b hover:bg-cyan-50 transition-colors cursor-pointer" onclick="closeStudentListModal(); switchTab('manage-students');">
                <td class="px-4 py-2.5 border-r text-center text-gray-500 font-medium">${idx + 1}</td>
                <td class="px-4 py-2.5 border-r text-center">${photoHtml}</td>
                <td class="px-4 py-2.5 border-r font-mono text-gray-500 text-center text-xs md:text-sm">${s.id}</td>
                <td class="px-4 py-2.5 border-r font-bold text-gray-800">${s.name}</td>
                <td class="px-4 py-2.5 border-r text-center font-bold ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'}">${s.gender}</td>
                <td class="px-4 py-2.5 text-center text-gray-600">${s.dob || '-'}</td>
            </tr>
        `;
    });
}
function renderDashboardAdvanced() {
    let latestMonth = null;
    for(let i=constants.monthsList.length-1; i>=0; i--) {
        let m = constants.monthsList[i];
        if(AppState.currentClassDb.some(s => s.scores[m] && s.scores[m].avg > 0)) { latestMonth = m; break; }
    }

    const chartDiv = document.getElementById('passFailChart');
    const noDataDiv = document.getElementById('chart-no-data');
    const top3Container = document.getElementById('dash-top3-container');
    
    // ក្រាហ្វិកវត្តមាន
    const attChartDiv = document.getElementById('attendanceChart');
    const attNoDataDiv = document.getElementById('att-chart-no-data');

    // ១. គណនាលទ្ធផល (សិស្សជាប់ និង ធ្លាក់)
    if(!latestMonth) {
        document.querySelectorAll('.dash-chart-month').forEach(el => el.innerText = "មិនមានទិន្នន័យ");
        noDataDiv.classList.remove('hidden'); chartDiv.classList.add('hidden');
        top3Container.innerHTML = '<p class="text-sm text-gray-400 text-center mt-6">មិនទាន់មានសិស្សឆ្នើមទេ</p>';
    } else {
        document.querySelectorAll('.dash-chart-month').forEach(el => el.innerText = constants.monthNamesKh[latestMonth]);
        noDataDiv.classList.add('hidden'); chartDiv.classList.remove('hidden');

        let pass = 0, fail = 0;
        AppState.currentClassDb.forEach(s => {
            if(s.scores[latestMonth] && s.scores[latestMonth].avg > 0) {
                if(s.scores[latestMonth].avg >= 5) pass++; else fail++;
            }
        });

        const ctx = document.getElementById('passFailChart').getContext('2d');
        if(charts.dash) charts.dash.destroy();
        charts.dash = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['សិស្សជាប់', 'សិស្សធ្លាក់'],
                datasets: [{ data: [pass, fail], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' }
        });

        top3Container.innerHTML = '';
        const top3 = [...AppState.currentClassDb].filter(s => s.scores[latestMonth] && s.scores[latestMonth].avg > 0)
                                    .sort((a,b) => b.scores[latestMonth].avg - a.scores[latestMonth].avg).slice(0, 3);

        const medals = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
        top3.forEach((s, idx) => {
            top3Container.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div class="flex items-center gap-3"><i class="fa-solid fa-medal ${medals[idx]} text-2xl"></i>
                    <div><h4 class="font-bold text-gray-800 text-sm">${s.name}</h4></div></div>
                    <div class="text-right"><p class="font-bold text-blue-700">${s.scores[latestMonth].avg}</p></div>
                </div>
            `;
        });
    }

    // ២. គណនាស្ថិតិវត្តមានសម្រាប់ក្រាហ្វិកទី២
    let v = 0, a = 0, l = 0;
    Object.keys(AppState.dbAttendance).forEach(studentId => {
        // បូកសរុបតែសិស្សក្នុងថ្នាក់បច្ចុប្បន្នប៉ុណ្ណោះ
        if(AppState.currentClassDb.find(s => s.id === studentId)) {
            const studentDays = AppState.dbAttendance[studentId];
            Object.values(studentDays).forEach(status => {
                if(status === 'V') v++;
                else if(status === 'A') a++;
                else if(status === 'L') l++;
            });
        }
    });

    if(v === 0 && a === 0 && l === 0) {
        attNoDataDiv.classList.remove('hidden'); attChartDiv.classList.add('hidden');
    } else {
        attNoDataDiv.classList.add('hidden'); attChartDiv.classList.remove('hidden');
        const ctxAtt = document.getElementById('attendanceChart').getContext('2d');
        if(charts.att) charts.att.destroy();
        charts.att = new Chart(ctxAtt, {
            type: 'pie',
            data: {
                labels: ['វត្តមាន', 'ច្បាប់', 'អវត្តមាន'],
                datasets: [{ data: [v, l, a], backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }
}

function renderLeaderboard() {
    const m = document.getElementById('leaderboard-filter').value;
    const container = document.getElementById('leaderboard-container'); 
    if(!container) return;
    container.innerHTML = '';
    
    const sorted = [...AppState.currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a, b) => b.scores[m].avg - a.scores[m].avg);
    
    if(sorted.length === 0) return container.innerHTML = `<p class="py-8 text-gray-400 text-center font-bold">មិនទាន់មានទិន្នន័យ។</p>`;

    let tableHtml = `
        <table class="w-full border-collapse moeys-table">
            <thead>
                <tr>
                    <th class="w-16 md:w-24">ចំណាត់ថ្នាក់</th>
                    <th class="w-24 md:w-32 hidden md:table-cell print:table-cell">អត្តលេខ</th>
                    <th class="text-left px-4">ឈ្មោះសិស្ស</th>
                    <th class="w-16 md:w-20">ភេទ</th>
                    <th class="w-24 md:w-32">មធ្យមភាគ</th>
                    <th class="w-20 md:w-24">និទ្ទេស</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach((s) => {
        const sc = s.scores[m];
        let rankStyle = sc.rank <= 3 ? "bg-yellow-100 text-yellow-700 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mx-auto font-bold print:bg-transparent print:text-red-600 print:w-auto print:h-auto" : "text-gray-600 font-bold print-text-red text-center mx-auto";
        
        tableHtml += `
            <tr class="transition-colors">
                <td class="text-center"><div class="${rankStyle}">${sc.rank}</div></td>
                <td class="text-center font-mono text-gray-500 hidden md:table-cell print:table-cell">${s.id}</td>
                <td class="text-left px-4 font-bold text-gray-800">${s.name}</td>
                <td class="text-center font-bold ${s.gender === 'ស' ? 'text-pink-600 print-text-red' : 'text-blue-600 print-text-blue'}">${s.gender}</td>
                <td class="text-center font-bold text-blue-700 print-text-blue text-sm md:text-lg">${sc.avg}</td>
                <td class="text-center font-bold text-green-600 print-text-green">${sc.grade}</td>
            </tr>
        `;
    });
    
    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
    
    let titleText = constants.monthNamesKh[m] || '';
    if(!m.includes('sem') && m !== 'annual') titleText = titleText.replace('ខែ ', 'ប្រចាំខែ ');
    if(document.getElementById('leaderboard-month-title')) document.getElementById('leaderboard-month-title').innerText = titleText;
}

function renderHonorRoll() {
    const m = document.getElementById('honor-month-selector').value;
    const container = document.getElementById('honor-roll-container');
    if(!container) return;
    container.innerHTML = '';

    const top5 = [...AppState.currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a,b) => b.scores[m].avg - a.scores[m].avg).slice(0, 5);
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
    const currentVal3 = document.getElementById('id-student-select') ? document.getElementById('id-student-select').value : '';
    
    let optionsHtml = '<option value="">-- សូមជ្រើសរើសឈ្មោះសិស្ស --</option>';
    let idOptionsHtml = '<option value="">ទាំងអស់ (All Students)</option>'; 
    
    const sorted = [...AppState.currentClassDb].sort((a,b) => a.name.localeCompare(b.name, 'km'));
    
    sorted.forEach(s => { 
        let opt = `<option value="${s.id}">${s.name} (${s.gender})</option>`;
        optionsHtml += opt; 
        idOptionsHtml += opt;
    });

    if(document.getElementById('profile-student-select')) { document.getElementById('profile-student-select').innerHTML = optionsHtml; if(currentVal1) document.getElementById('profile-student-select').value = currentVal1; }
    if(document.getElementById('tracking-student-select')) { document.getElementById('tracking-student-select').innerHTML = optionsHtml; if(currentVal2) document.getElementById('tracking-student-select').value = currentVal2; }
    if(document.getElementById('id-student-select')) { document.getElementById('id-student-select').innerHTML = idOptionsHtml; if(currentVal3) document.getElementById('id-student-select').value = currentVal3; }
}

function renderStudentProfile() {
    const id = document.getElementById('profile-student-select').value;
    const area = document.getElementById('student-profile-area');
    const empty = document.getElementById('student-empty-state');
    if(!id) { area.classList.add('hidden'); empty.classList.remove('hidden'); return; }

    area.classList.remove('hidden'); empty.classList.add('hidden');
    const s = AppState.currentClassDb.find(x => x.id === id);

    const avatar = document.getElementById('student-avatar');
    if(s.photo) {
        avatar.innerHTML = `<img src="${s.photo}" class="w-full h-full object-cover">`;
        avatar.className = `w-24 h-24 rounded-2xl mb-4 flex items-center justify-center shadow-lg transform rotate-3 overflow-hidden border-2 border-white`;
    } else {
        avatar.textContent = s.name.charAt(0);
        avatar.className = `w-24 h-24 rounded-2xl text-white text-4xl font-bold mb-4 flex items-center justify-center shadow-lg transform rotate-3 ${s.gender==='ស'?'bg-pink-500':'bg-blue-500'}`;
    }
    
    document.getElementById('profile-name').textContent = s.name;
    document.getElementById('profile-id-gender').textContent = `អត្តលេខ៖ ${s.id} | ភេទ៖ ${s.gender}`;

    const sc = s.scores['result_sem1'] || {total:0, avg:0, rank:0, grade:""};
    document.getElementById('prof-total').textContent = sc.total || '-';
    document.getElementById('prof-avg').textContent = sc.avg || '-';
    document.getElementById('prof-rank').textContent = sc.rank ? `#${sc.rank}` : '-';

    const ctx = document.getElementById('progressChart').getContext('2d');
    if (charts.progress) charts.progress.destroy();

    charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'ឆ.១', 'ល.ឆ១', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'ឆ.២', 'ល.ឆ២'],
            datasets: [{
                label: 'មធ្យមភាគការសិក្សា',
                data: [
                    s.scores.dec?.avg||0, s.scores.jan?.avg||0, s.scores.feb?.avg||0, s.scores.mar?.avg||0,
                    s.scores.sem1?.avg||0, s.scores.result_sem1?.avg||0,
                    s.scores.may?.avg||0, s.scores.jun?.avg||0, s.scores.jul?.avg||0, s.scores.aug?.avg||0,
                    s.scores.sem2?.avg||0, s.scores.result_sem2?.avg||0
                ],
                borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 } } }
    });
}

function generateTrackingBook() {
    const id = document.getElementById('tracking-student-select').value;
    if(!id) return alert("សូមជ្រើសរើសសិស្សជាមុនសិន!");
    const s = AppState.currentClassDb.find(x => x.id === id);
    document.getElementById('printable-report').classList.remove('hidden');
    document.getElementById('tb-id').innerText = s.id;
    document.getElementById('tb-name').innerText = s.name;
    document.getElementById('tb-gender').innerText = s.gender;
    const tbody = document.getElementById('tb-scores-body');
    tbody.innerHTML = '';
    constants.monthsList.forEach(m => {
        const sc = s.scores[m];
        if(sc && sc.avg > 0) {
            let rowClass = (m === 'result_sem1' || m === 'result_sem2') ? 'bg-blue-50 font-bold' : '';
            let label = constants.monthNamesKh[m] || m;
            tbody.innerHTML += `<tr class="${rowClass}"><td class="border border-gray-800 p-2 font-bold">${label}</td><td class="border border-gray-800 p-2">${sc.total}</td><td class="border border-gray-800 p-2 font-bold text-blue-800">${sc.avg}</td><td class="border border-gray-800 p-2 text-red-600">${sc.rank}</td><td class="border border-gray-800 p-2 text-green-600">${sc.grade}</td><td class="border border-gray-800 p-2"></td></tr>`;
        }
    });
    if(tbody.innerHTML === '') tbody.innerHTML = `<tr><td colspan="6" class="border border-gray-800 p-4 text-gray-400">មិនទាន់មានទិន្នន័យពិន្ទុឡើយ</td></tr>`;
}

function renderIDCard() {
    const id = document.getElementById('id-student-select').value; 
    const container = document.getElementById('all-id-cards-container');
    if(!container) return;
    container.innerHTML = '';
    
    let studentsToRender = [];
    if(id) {
        const s = AppState.currentClassDb.find(x => x.id === id);
        if(s) studentsToRender.push(s);
    } else {
        studentsToRender = [...AppState.currentClassDb].sort((a,b) => a.name.localeCompare(b.name, 'km'));
    }

    if(studentsToRender.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center w-full py-10 font-bold">មិនទាន់មានសិស្សក្នុងថ្នាក់នេះទេ</p>';
        return;
    }

    let t = new Date(); 
    let dateStr = `${String(t.getDate()).padStart(2,'0')}/${String(t.getMonth()+1).padStart(2,'0')}/${t.getFullYear()}`;
    let cardsHtml = '';

    studentsToRender.forEach(s => {
        let photoHtml = s.photo 
            ? `<img src="${s.photo}" class="w-full h-full object-cover">` 
            : `<span class="text-gray-400 text-[10px] font-sans absolute inset-0 flex items-center justify-center">4x6</span>`;

        cardsHtml += `
            <div class="id-card-box relative bg-white overflow-hidden shrink-0 shadow-sm print:shadow-none" style="width: 85.6mm; height: 53.98mm; box-sizing: border-box;">
                <div class="absolute top-0 left-0 w-full h-[11mm] bg-blue-500" style="border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;"></div>
                <div class="relative z-10 flex items-center justify-between px-[3mm] pt-[1.5mm]">
                    <div class="w-[9mm] h-[9mm] bg-white rounded-full flex items-center justify-center shadow-sm"><i class="fa-solid fa-school text-blue-800 text-[10px]"></i></div>
                    <div class="text-center text-white flex-1 leading-tight">
                        <p class="font-moul text-[7px] sys-school">${AppState.sysSettings.school_name || 'សាលាបឋមសិក្សា'}</p>
                        <p class="text-[5px] font-bold tracking-widest mt-[0.5mm] uppercase font-sans">Primary School</p>
                    </div>
                    <div class="w-[9mm]"></div>
                </div>
                
                <div class="text-center mt-[1.5mm] mb-[1mm]">
                    <p class="font-moul text-[9px] text-blue-900 tracking-wide">កាតសម្គាល់ខ្លួនសិស្ស</p>
                </div>
                
                <div class="flex px-[3.5mm] gap-[3mm]">
                    <div class="w-[20mm] h-[26.6mm] bg-gray-100 border border-gray-300 rounded flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                        ${photoHtml}
                    </div>
                    <div class="flex-1 text-[7px] font-bold text-gray-800 leading-tight space-y-[1.2mm] font-siemreap mt-[0.5mm]">
                        <p><span class="text-blue-800 w-[11.5mm] inline-block">អត្តលេខ</span> <span class="text-red-600">: <span class="font-sans">${s.id}</span></span></p>
                        <p><span class="text-blue-800 w-[11.5mm] inline-block">ឈ្មោះ</span> <span class="font-moul text-[7.5px]">: ${s.name}</span></p>
                        <p><span class="text-blue-800 w-[11.5mm] inline-block">ភេទ</span> : ${s.gender} <span class="text-blue-800 ml-[1.5mm]">ថ្នាក់ទី</span> : <span class="text-red-600 font-sans">${s.class_name}</span></p>
                        <p><span class="text-blue-800 w-[11.5mm] inline-block">ថ្ងៃកំណើត</span> : <span class="font-sans">${s.dob || '-'}</span></p>
                        <p class="truncate"><span class="text-blue-800 w-[11.5mm] inline-block">ទីលំនៅ</span> : ${s.pob || '-'}</p>
                        <p class="truncate"><span class="text-blue-800 w-[11.5mm] inline-block">មាតាបិតា</span> : ${s.father || ''} / ${s.mother || ''}</p>
                    </div>
                </div>
                
                <div class="absolute bottom-[2mm] w-full px-[3.5mm] flex justify-between items-end">
                    <div class="text-[5.5px] font-bold text-gray-600 leading-tight font-siemreap pb-[1mm]">
                        <p>បញ្ជាក់៖ ជាសិស្សនៅសាលាខាងលើពិតប្រាកដមែន។</p>
                        <p class="mt-[0.5mm] text-blue-800">ឆ្នាំសិក្សា៖ <span class="font-sans">${AppState.sysSettings.academic_year || ''}</span></p>
                    </div>
                    <div class="text-center font-bold text-gray-800 text-[5.5px] leading-tight font-siemreap">
                        <p class="font-sans">កាលបរិច្ឆេទ ${dateStr}</p>
                        <p class="font-moul mt-[1.5mm] text-[6px] sys-principal">${AppState.sysSettings.principal_title || 'នាយកសាលា'}</p>
                        <p class="mt-[4mm] border-t border-dotted border-gray-600 w-[18mm] mx-auto"></p>
                    </div>
                </div>
                
                <div class="absolute bottom-0 w-full opacity-10 z-0 pointer-events-none"> 
                    <img src="7.png" class="w-full object-contain" onerror="this.style.display='none'">
                </div>
            </div>
        `;
    });

    container.innerHTML = cardsHtml;
}

function switchTab(tabId) {
    const tabs = ['dashboard', 'manage-students', 'attendance-report', 'detailed-sheet', 'monthly-results', 'leaderboard', 'honor-roll', 'student', 'tracking-book', 'id-card', 'settings', 'manage-users', 'general-info', 'schedule', 'discipline'];
    
    tabs.forEach(id => {
        const view = document.getElementById(`view-${id}`);
        const nav = document.getElementById(`nav-${id}`);
        if(view) view.classList.toggle('hidden', id !== tabId);
        if(nav) nav.classList.toggle('nav-active', id === tabId);
    });

    const titles = {
        'dashboard': 'ផ្ទាំងសង្ខេបរួម', 'manage-students': 'បញ្ជីឈ្មោះសិស្ស', 'attendance-report': 'របាយការណ៍វត្តមាន',
        'detailed-sheet': 'បញ្ចូលពិន្ទុ', 'monthly-results': 'លទ្ធផលប្រឡងផ្លូវការ', 'leaderboard': 'តារាងចំណាត់ថ្នាក់',
        'honor-roll': 'តារាងកិត្តិយស', 'student': 'ការវិវត្តសិស្ស', 'tracking-book': 'សៀវភៅតាមដាន',
        'id-card': 'កាតសម្គាល់ខ្លួនសិស្ស', 'settings': 'ការកំណត់ប្រព័ន្ធ', 'manage-users': 'គ្រប់គ្រងគណនីគ្រូ',
        'general-info': 'ព័ត៌មានទូទៅ', 'schedule': 'កាលវិភាគសិក្សា', 'discipline': 'កំណត់ត្រាវិន័យ'
    };
    document.getElementById('page-title').textContent = titles[tabId] || 'ប្រព័ន្ធគ្រប់គ្រង';

    if(tabId === 'detailed-sheet') loadDetailedSheet();
    if(tabId === 'monthly-results') renderMonthlyResults();
    if(tabId === 'dashboard') renderDashboardAdvanced();
    if(tabId === 'manage-users') fetchUsers();
    if(tabId === 'id-card') renderIDCard();
    if(tabId === 'leaderboard') renderLeaderboard();
    if(tabId === 'attendance-report') {
        const attMonthSel = document.getElementById('att-month-selector');
        if(attMonthSel && !attMonthSel.value) {
            let now = new Date();
            attMonthSel.value = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2, '0');
        }
        handleDateChange();
    }
    if(tabId === 'discipline') populateDisciplineDropdown();

    const aside = document.getElementById('main-sidebar');
    if(aside && aside.classList.contains('mobile-open')) {
        toggleMobileSidebar();
    }
    setTimeout(enableDragToScroll, 100);
    setTimeout(enablePrintSpacing, 200);
}

function populateDisciplineDropdown() {
    const select = document.getElementById('disc-student-select');
    if(!select) return;
    let options = '<option value="">-- ជ្រើសរើសសិស្ស --</option>';
    const sorted = [...AppState.currentClassDb].sort((a,b) => a.name.localeCompare(b.name, 'km'));
    sorted.forEach(s => {
        options += `<option value="${s.name}">${s.name} (${s.id})</option>`;
    });
    select.innerHTML = options;
    renderDisciplineTable();
}

function addDisciplineRecord(e) {
    e.preventDefault();
    const studentName = document.getElementById('disc-student-select').value;
    const type = document.querySelector('input[name="disc-type"]:checked').value;
    const date = document.getElementById('disc-date').value;
    const desc = document.getElementById('disc-desc').value;

    if(!studentName) return alert("សូមជ្រើសរើសសិស្ស!");

    const record = { studentName, type, date, desc, class_name: AppState.currentClassName };
    disciplineRecords.push(record);
    
    document.getElementById('discipline-form').reset();
    closeDisciplineModal(); // បិទ Pop-up ពេល Save រួចរាល់
    showToast("បានរក្សាទុកកំណត់ត្រាវិន័យជោគជ័យ!");
    renderDisciplineTable();
}

function renderDisciplineTable() {
    const tbody = document.getElementById('discipline-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const classRecords = disciplineRecords.filter(r => r.class_name === AppState.currentClassName).reverse();

    if(classRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-400">មិនទាន់មានកំណត់ត្រាទេ</td></tr>';
        return;
    }

    classRecords.forEach(r => {
        let badge = r.type === 'ល្អ' 
            ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">ចំណុចល្អ</span>' 
            : '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold">កំហុសឆ្គង</span>';
        
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 border-r text-center">${r.date}</td>
                <td class="p-3 border-r font-bold text-blue-800">${r.studentName}</td>
                <td class="p-3 border-r text-center">${badge}</td>
                <td class="p-3 text-gray-600">${r.desc}</td>
            </tr>
        `;
    });
}

function toggleSidebar() {
    const aside = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (window.innerWidth < 768) {
        aside.classList.toggle('-translate-x-full');
        if(overlay) overlay.classList.toggle('hidden');
    } else {
        aside.classList.toggle('md:-ml-64');
    }
}

function exportTableToExcel(tableID, filename = ''){
    let downloadLink;
    let dataType = 'application/vnd.ms-excel';
    let tableSelect = document.getElementById(tableID);
    let tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    filename = filename ?filename+'.xls' : 'excel_data.xls';
    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    if(navigator.msSaveOrOpenBlob){
        let blob = new Blob(['\ufeff', tableHTML], { type: dataType });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else{
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
}

function enableDragToScroll() {
    const sliders = document.querySelectorAll('.table-scroll-wrapper');
    let isDown = false;
    let startX, startY, scrollLeft, scrollTop;

    sliders.forEach(slider => {
        slider.style.cursor = 'grab';

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            const walkX = (x - startX) * 1.5; 
            const walkY = (y - startY) * 1.5;
            
            slider.scrollLeft = scrollLeft - walkX;
            slider.scrollTop = scrollTop - walkY;
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(enableDragToScroll, 500); 
});

function enablePrintSpacing() {
    const wrappers = document.querySelectorAll('.table-scroll-wrapper');
    
    wrappers.forEach(wrapper => {
        if (wrapper.previousElementSibling && wrapper.previousElementSibling.classList.contains('print-spacer')) return;

        const topSpacer = document.createElement('div');
        topSpacer.className = 'print-spacer';
        topSpacer.innerHTML = '<div class="resize-handle no-print"><i class="fa-solid fa-arrows-up-down"></i> អូសសារ៉េគម្លាតក្បាល</div>';
        wrapper.parentNode.insertBefore(topSpacer, wrapper);

        const bottomSpacer = document.createElement('div');
        bottomSpacer.className = 'print-spacer';
        bottomSpacer.innerHTML = '<div class="resize-handle no-print"><i class="fa-solid fa-arrows-up-down"></i> អូសសារ៉េគម្លាតបាត</div>';
        wrapper.parentNode.insertBefore(bottomSpacer, wrapper.nextSibling);

        makeDraggableSpacer(topSpacer);
        makeDraggableSpacer(bottomSpacer);
    });
}

function makeDraggableSpacer(element) {
    let isResizing = false;
    let startY;
    let startHeight;

    element.addEventListener('mousedown', function(e) {
        isResizing = true;
        startY = e.pageY;
        startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        document.body.style.cursor = 'ns-resize'; 
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'; 
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        let newHeight = startHeight + (e.pageY - startY);
        if (newHeight >= 0 && newHeight <= 400) { 
            element.style.height = newHeight + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        if(isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            element.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(enablePrintSpacing, 1500); 
});

function startApp() {
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('auth-screen').classList.remove('hidden');
}