/**
 * ========================================================================
 * ប្រព័ន្ធគ្រប់គ្រងសាលារៀន និងពិន្ទុ (Student Management System - Script.js)
 * ========================================================================
 */


const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYOlg1XJmQIkhtLerrn_WgrWZn10ZKkeIQsSU3XuQ62cJf5tUSHWlYPmOsd_ikTKX_Sg/exec"; // បន្ថែមចំណុចនេះដើម្បីឱ្យមុខងារ fetchAPI ដំណើរការ

// ២. ប្រកាសអថេរប្រព័ន្ធ (App State) ដើម្បីរក្សាទុកទិន្នន័យបណ្តោះអាសន្ន
let AppState = {
    loggedInUsername: localStorage.getItem('auth_username') || '',
    loggedInUser: localStorage.getItem('auth_name') || '',
    currentClassName: '២ខ', // លំនាំដើម
    sysSettings: {},
    db: [],
    currentClassDb: [],
    usersDb: [],
    dbAttendance: {}
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

let charts = { progress: null, dash: null, att: null }; // បន្ថែម att
let disciplineRecords = []; 

// ==========================================
// API SERVICE 
// ==========================================
async function fetchAPI(payload, method = 'POST', queryParams = '') {
    console.log("កំពុងបញ្ជូនទិន្នន័យ...", payload || queryParams);
    try {
        const options = {
            method: method,
            redirect: 'follow'
        };
        
        if (method === 'POST') {
            options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
            options.body = JSON.stringify(payload);
        }
        
        const response = await fetch(SCRIPT_URL + queryParams, options);
        const data = await response.json();
        console.log("ទទួលបានទិន្នន័យ:", data);
        return data;
    } catch (error) {
        console.error("Error fetching API: ", error);
        return { status: "error", message: "មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធបានទេ!" };
    }
}

// ==========================================
// LANDING PAGE & AUTHENTICATION
// ==========================================
function showLogin() {
    const landing = document.getElementById('landing-screen');
    const auth = document.getElementById('auth-screen');
    if(landing) landing.style.display = 'none';
    if(auth) {
        auth.classList.remove('hidden');
        const loginBox = document.getElementById('login-container');
        if(loginBox) {
            loginBox.style.opacity = '0';
            loginBox.style.transform = 'translateY(20px)';
            setTimeout(() => {
                loginBox.style.transition = 'all 0.4s ease-out';
                loginBox.style.opacity = '1';
                loginBox.style.transform = 'translateY(0)';
            }, 10);
        }
    }
}

function backToLanding() {
    const landing = document.getElementById('landing-screen');
    const auth = document.getElementById('auth-screen');
    if(auth) auth.classList.add('hidden');
    if(landing) landing.style.display = 'block';
}

function toggleAuth(type) {
    const isLogin = type !== 'register';
    const loginCon = document.getElementById('login-container');
    const regCon = document.getElementById('register-container');
    if(loginCon) loginCon.classList.toggle('hidden', !isLogin);
    if(regCon) regCon.classList.toggle('hidden', isLogin);
}

// ពេល Login រួច ហៅមុខងារនេះ
function startApp() {
    const landing = document.getElementById('landing-screen');
    const auth = document.getElementById('auth-screen');
    const app = document.getElementById('main-app');
    
    if(landing) landing.style.display = 'none';
    if(auth) auth.classList.add('hidden');
    if(app) app.classList.remove('hidden');

    const fnameLabel = document.getElementById('user-fullname');
    if(fnameLabel) fnameLabel.innerText = AppState.loggedInUser || AppState.loggedInUsername || "លោកគ្រូ";
    
    // Admin features
    if (AppState.loggedInUsername === 'admin') {
        ['nav-admin-label', 'nav-manage-users', 'nav-settings-label', 'nav-settings', 'class-selector-container'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('hidden');
        });
    }
    
    updateClassDisplayUI();
    if(typeof fetchStudents === 'function') fetchStudents();
    switchTab('manage-students');
}

// ប៊ូតុង Login
async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const btn = document.getElementById('btn-login');

    if(btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងពិនិត្យ...'; btn.disabled = true; }

    const payload = { action: 'login', username: user, password: pass };

    try {
        const result = await fetchAPI(payload);

        if (result.status === "success") {
            showToast("ចូលប្រព័ន្ធជោគជ័យ!");
            
            // រក្សាទុកទិន្នន័យ
            localStorage.setItem('auth_username', result.user?.username || user);
            localStorage.setItem('auth_name', result.user?.name || "លោកគ្រូ");
            
            AppState.loggedInUsername = result.user?.username || user;
            AppState.loggedInUser = result.user?.name || "លោកគ្រូ";
            
            // បើក App
            startApp();
        } else {
            alert("❌ បរាជ័យ: " + (result.message || "ខុសគណនី ឬលេខសម្ងាត់"));
        }
    } catch (error) {
        alert("❌ គាំងប្រព័ន្ធ: " + error.message);
    } finally {
        if(btn) { btn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> ចូលប្រព័ន្ធ'; btn.disabled = false; }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-register');
    if(btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងចុះឈ្មោះ...'; btn.disabled = true; }

    const payload = {
        action: 'register',
        name: document.getElementById('reg-name').value.trim(),
        username: document.getElementById('reg-user').value.trim(),
        password: document.getElementById('reg-pass').value.trim(),
        assigned_class: document.getElementById('reg-level').value + document.getElementById('reg-room').value
    };

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
        if(btn) { btn.innerHTML = '<i class="fa-solid fa-user-plus mr-2"></i> ចុះឈ្មោះ'; btn.disabled = false; }
    }
}

function handleLogout() {
    if(confirm("តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញមែនទេ?")) {
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_name');
        location.reload();
    }
}

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

// ១. ពេលចុចបើកផ្ទាំងគណនី
function openMyProfile() {
    // ព្យាយាមទាញយក Username ពី AppState ឬពី LocalStorage
    let currentUsername = "";
    
    if (typeof AppState !== 'undefined' && AppState.loggedInUsername) {
        currentUsername = AppState.loggedInUsername;
    } else {
        currentUsername = localStorage.getItem('auth_username') || "admin"; // បើរកមិនឃើញ ដាក់ admin ជំនួស (សម្រាប់ពេល Test)
    }

    // បញ្ចូល Username ទៅក្នុងប្រអប់
    document.getElementById('my-username').value = currentUsername;
    
    // សម្អាតប្រអប់ពាក្យសម្ងាត់ (ត្រូវតែទុកទទេដើម្បីសុវត្ថិភាព)
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    
    // បង្ហាញ Modal
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeMyProfile() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

// ៣. ពេលចុចប៊ូតុង "ប្តូរពាក្យសម្ងាត់"
async function submitChangePassword(e) {
    e.preventDefault(); // ទប់កុំឱ្យទំព័រ Refresh
    const btn = document.getElementById('btn-change-pwd');
    
    // បង្ហាញ Effect ថាវាកំពុងដើរ
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
    btn.disabled = true;

    // រៀបចំទិន្នន័យបញ្ជូនទៅ API (Google Apps Script ឬ PHP ចាស់)
    const payload = {
        action: 'change_password',
        username: AppState.loggedInUsername,
        old_password: document.getElementById('old-password').value.trim(),
        new_password: document.getElementById('new-password').value.trim()
    };

    try {
        // បញ្ជូនទិន្នន័យតាមរយៈមុខងារ fetchAPI ដែលលោកគ្រូមានស្រាប់
        const result = await fetchAPI(payload); 
        
        if (result.status === "success") {
            showToast("ប្តូរពាក្យសម្ងាត់បានជោគជ័យ!");
            closeMyProfile();
        } else {
            alert(result.message || "មិនអាចប្តូរពាក្យសម្ងាត់បានទេ! សូមពិនិត្យមើលពាក្យសម្ងាត់ចាស់។");
        }
    } catch(err) {
        console.error(err);
        showToast("បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Server");
    } finally {
        // ឱ្យប៊ូតុងត្រឡប់មកសភាពដើមវិញ
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
// TOAST NOTIFICATION & UI HELPERS
// ==========================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    if(!toast) {
        alert(msg);
        return;
    }
    document.getElementById('toast-msg').innerText = msg;
    toast.className = 'show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// មុខងារសម្រាប់សារ៉េគម្លាតពេលព្រីន
function enablePrintSpacing() {
    console.log("Print spacing initialized.");
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

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error: ${err.message}`);
        });
        const icon = document.getElementById('fullscreen-icon');
        if(icon) icon.classList.replace('fa-expand', 'fa-compress');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            const icon = document.getElementById('fullscreen-icon');
            if(icon) icon.classList.replace('fa-compress', 'fa-expand');
        }
    }
}

function toggleSidebar() {
    const aside = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (window.innerWidth < 768) {
        if(aside) aside.classList.toggle('-translate-x-full');
        if(overlay) overlay.classList.toggle('hidden');
    } else {
        if(aside) aside.classList.toggle('md:-ml-64');
    }
}

function updateClassDisplayUI() {
    document.querySelectorAll('.display-current-class').forEach(el => el.innerText = AppState.currentClassName);
    const badge = document.getElementById('header-class-badge');
    if(badge) badge.innerText = "ថ្នាក់ទី " + AppState.currentClassName;
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

// ==========================================
// មុខងារទាញយកទិន្នន័យសិស្ស និងការកំណត់ (Settings)
// ==========================================
async function fetchStudents() {
    console.log("-> កំពុងស្នើសុំទិន្នន័យសិស្សពី Google Apps Script...");
    
    try {
        const data = await fetchAPI({ action: 'get_students' }); 

        console.log("✅ ទិន្នន័យទទួលបានពី Google:", data);

        if (!data || !data.students) {
            console.error("ទិន្នន័យមិនមានទម្រង់ជាបញ្ជីសិស្សទេ:", data);
            showToast("មិនមានទិន្នន័យសិស្សនៅក្នុងប្រព័ន្ធទេ!");
            return;
        }

        AppState.sysSettings = data.settings || {};
        if(typeof applySettingsToUI === 'function') applySettingsToUI();

        AppState.db = data.students.map(s => {
            let studentData = {
                id: s.id ? s.id.toString() : '', 
                name: s.name || '', 
                gender: s.gender || '', 
                dob: s.dob || '',
                pob: s.pob || '', 
                father: s.father || '', 
                mother: s.mother || '',
                class_name: s.class_name || "២ខ", 
                photo: s.photo || "", 
                scores: s.scores || {}
            };
            
            constants.monthsList.forEach(m => {
                if(!studentData.scores[m]) {
                    studentData.scores[m] = { total:0, avg:0, rank:0, grade:"" };
                    for(let i=1; i<=19; i++) studentData.scores[m][`sub${i}`] = "";
                }
            });
            return studentData;
        });

        if(typeof refreshClassData === 'function') refreshClassData();
        if(typeof fetchAttendanceReport === 'function') fetchAttendanceReport();
        
    } catch (error) {
        console.error("❌ កំហុសពេលទាញទិន្នន័យសិស្ស:", error);
        alert("បរាជ័យក្នុងការទាញយកទិន្នន័យសិស្ស!\nកំហុសបច្ចេកទេស: " + error.message);
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
        toggleSidebar();
    }
}

function updateAllViews() {
    if(typeof renderManageStudentsTable === 'function') renderManageStudentsTable();
    if(typeof renderDashboardStats === 'function') renderDashboardStats();
    if(typeof renderDashboardAdvanced === 'function') renderDashboardAdvanced();
    if(typeof renderLeaderboard === 'function') renderLeaderboard();
    if(typeof renderHonorRoll === 'function') renderHonorRoll();
    if(typeof renderMonthlyResults === 'function') renderMonthlyResults();

    
    // បន្ថែម ២ ជួរនេះ ដើម្បីឱ្យតារាងពិន្ទុ និងវត្តមាន លោតឈ្មោះសិស្សចូល
    if(typeof loadDetailedSheet === 'function') loadDetailedSheet();
    if(typeof handleDateChange === 'function') {
        const attMonthSel = document.getElementById('att-month-selector');
        if(attMonthSel && attMonthSel.value) handleDateChange();
    }
}

async function fetchUsers() {
    if (AppState.loggedInUsername !== 'admin') return;
    const tbody = document.getElementById('manage-users-tbody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងទាញយកទិន្នន័យ...</td></tr>';

    try {
        const result = await fetchAPI({ action: 'get_users' });
        if(result.status === "success") {
            AppState.usersDb = result.data;
            if(typeof renderUsersTable === 'function') renderUsersTable();
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
    const modal = document.getElementById('edit-user-modal');
    if(modal) modal.classList.add('hidden');
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
            closeAddStudentModal(); 
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

function closeEditModal() { 
    const modal = document.getElementById('edit-modal');
    if(modal) modal.classList.add('hidden'); 
}

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
    
    const stuCount = document.getElementById('student-list-count');
    if(stuCount) stuCount.innerText = `សរុប ${AppState.currentClassDb.length} នាក់`;
    
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
                closeAddStudentModal();
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
    document.querySelectorAll('.sys-location').forEach(el => el.innerText = AppState.sysSettings.school_dist || 'កៀនស្វាយ');
    if(document.getElementById('set-dist')) document.getElementById('set-dist').value = AppState.sysSettings.school_dist || '';
    document.querySelectorAll('.sys-teacher').forEach(el =>el.innerText = AppState.sysSettings.teacher_name || '');
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
// វត្តមានសិស្ស (ATTENDANCE FUNCTIONS)
// ==========================================

// ១. រកចំនួនថ្ងៃក្នុងខែនីមួយៗ
function getDaysInMonth(year, month) { 
    return new Date(year, month, 0).getDate(); 
}

// ២. ពេលអ្នកប្រើប្រាស់ប្តូរខែឆ្នាំនៅលើ UI
function handleDateChange() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(yyyyMm) {
        const parts = yyyyMm.split('-');
        const currentYear = parseInt(parts[0]); 
        const currentMonthNum = parseInt(parts[1]);
        const currentDaysInMonth = getDaysInMonth(currentYear, currentMonthNum);
        
        fetchAttendanceReport(yyyyMm, currentYear, currentMonthNum, currentDaysInMonth);
    }
}

// ៣. ទាញយកទិន្នន័យវត្តមានពី Server (Google Apps Script)
async function fetchAttendanceReport(yyyyMm, currentYear, currentMonthNum, currentDaysInMonth) {
    if(!yyyyMm) return;
    
    try {
        const result = await fetchAPI({
            action: 'get_attendance', 
            month: yyyyMm, 
            class_name: AppState.currentClassName
        });
        
        if(result.status === "success" && result.data) {
            AppState.dbAttendance = result.data;
        } else {
            AppState.dbAttendance = {};
        }
    } catch (err) { 
        console.error(err);
        AppState.dbAttendance = {}; 
    }
    
    // គូរតារាងបន្ទាប់ពីបានទិន្នន័យ
    if(currentYear && currentMonthNum && currentDaysInMonth) {
        renderAttendanceReport(currentYear, currentMonthNum, currentDaysInMonth);
    }
}

// ៤. បង្កើតតារាងវត្តមានលើអេក្រង់
function renderAttendanceReport(currentYear, currentMonthNum, currentDaysInMonth) {
    const daysRow = document.getElementById('att-days-row');
    const khmerDaysRow = document.getElementById('att-khmer-days-row');
    const tbody = document.getElementById('att-report-tbody');
    const headerColspan = document.getElementById('att-days-header');

    if(!daysRow || !khmerDaysRow || !tbody) return;

    if(headerColspan) headerColspan.colSpan = currentDaysInMonth;
    
    daysRow.innerHTML = ''; 
    khmerDaysRow.innerHTML = '';

    // បង្កើតជួរថ្ងៃទី (1 ដល់ 31) និង ថ្ងៃច័ន្ទ-អាទិត្យ
    for(let i = 1; i <= currentDaysInMonth; i++) {
        let dateObj = new Date(currentYear, currentMonthNum - 1, i);
        let dayOfWeek = dateObj.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        let khDayName = constants.khmerDays[dayOfWeek];
        
        let bgClass = isWeekend ? 'bg-gray-200 text-red-500 font-bold' : 'bg-green-50 text-green-900';
        
        // បន្ថែម min-w ឱ្យវាស្មើគ្នារហូតមិនអាចរួមតូច ឬរីកធំបាន
        khmerDaysRow.innerHTML += `<th class="${bgClass} w-7 min-w-[28px] max-w-[28px] overflow-hidden px-0.5 py-1 text-[11px] border border-gray-200">${khDayName}</th>`;
        daysRow.innerHTML += `<th class="${bgClass} w-7 min-w-[28px] max-w-[28px] overflow-hidden px-0.5 py-1 text-[10px] border border-gray-200">${i}</th>`;
    }
    
    daysRow.innerHTML += `<th class="bg-blue-50 w-8 border border-gray-200">វ</th><th class="bg-blue-50 w-8 text-red-600 border border-gray-200">អ</th><th class="bg-blue-50 w-8 text-yellow-600 border border-gray-200">ច</th>`;
    khmerDaysRow.innerHTML += `<th colspan="3" class="bg-blue-50 border border-gray-200">សរុប</th>`;

    tbody.innerHTML = '';
    
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));
    
    if(sortedDb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${currentDaysInMonth + 6}" class="py-8 text-center text-gray-400">គ្មានបញ្ជីសិស្សទេក្នុងថ្នាក់នេះ</td></tr>`;
        return;
    }

    sortedDb.forEach((s, idx) => {
        let rowHtml = `
            <tr class="bg-white border-b hover:bg-gray-50" data-studentid="${s.id}">
                <td class="text-center border border-gray-200">${idx + 1}</td>
                <td class="text-left px-2 font-bold text-gray-800 border border-gray-200">${s.name}</td>
                <td class="text-center ${s.gender === 'ស' ? 'text-pink-600' : 'text-blue-600'} font-medium border border-gray-200">${s.gender}</td>`;
        
        let studentAtt = AppState.dbAttendance[s.id] || {};
        
        for(let i = 1; i <= currentDaysInMonth; i++) {
            let dateObj = new Date(currentYear, currentMonthNum - 1, i);
            let dayOfWeek = dateObj.getDay();
            let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            let val = studentAtt[i] || '';
            
            if(isWeekend && !val) val = '-';
            
            let disabledAttr = isWeekend ? 'disabled' : '';
            let weekendStyle = isWeekend ? 'bg-gray-100 text-gray-400' : '';
            
            rowHtml += `<td class="${weekendStyle} border border-gray-200 w-7 min-w-[28px] max-w-[28px] text-center"><input type="text" class="att-input d${i} w-full text-center border-none outline-none bg-transparent uppercase font-bold" maxlength="1" value="${val}" ${disabledAttr} onkeyup="calculateAttendance(${currentDaysInMonth})"></td>`;
        }
        
        rowHtml += `
            <td class="text-center font-bold text-green-600 bg-gray-50 border border-gray-200 tot-v">0</td>
            <td class="text-center font-bold text-red-500 bg-gray-50 border border-gray-200 tot-a">0</td>
            <td class="text-center font-bold text-yellow-500 bg-gray-50 border border-gray-200 tot-l">0</td>
        </tr>`;
        
        tbody.innerHTML += rowHtml;
    });
    
    calculateAttendance(currentDaysInMonth);
}

// ៥. មុខងារគណនាវត្តមាន (បូកសរុប វ, អ, ច)
function calculateAttendance(days) {
    const d = days || 31;
    const rows = document.querySelectorAll('#att-report-tbody tr[data-studentid]');
    
    rows.forEach(row => {
        let v = 0, a = 0, l = 0;
        for(let i = 1; i <= d; i++) {
            let input = row.querySelector(`.d${i}`);
            if(input && !input.disabled) {
                let val = input.value.toUpperCase(); 
                input.value = val; // auto-uppercase in UI
                
                if(val === 'V' || val === 'វ') v++; 
                else if(val === 'A' || val === 'អ') a++; 
                else if(val === 'L' || val === 'ច') l++;
            }
        }
        row.querySelector('.tot-v').innerText = v;
        row.querySelector('.tot-a').innerText = a;
        row.querySelector('.tot-l').innerText = l;
    });
}

// ៦. រក្សាទុកវត្តមានទៅកាន់ Server
async function saveMonthlyAttendance() {
    const yyyyMm = document.getElementById('att-month-selector').value;
    if(!yyyyMm) return alert("សូមជ្រើសរើសខែជាមុនសិន!");
    
    const parts = yyyyMm.split('-');
    let currentYear = parseInt(parts[0]); 
    let currentMonthNum = parseInt(parts[1]);
    let currentDaysInMonth = getDaysInMonth(currentYear, currentMonthNum);

    // អាប់ដេតលេខបូកសរុបមុននឹង Save
    calculateAttendance(currentDaysInMonth);
    
    const rows = document.querySelectorAll('#att-report-tbody tr[data-studentid]');
    let attData = {};
    
    rows.forEach(row => {
        let id = row.getAttribute('data-studentid');
        let days = {}; 
        let hasData = false;
        
        for(let i = 1; i <= currentDaysInMonth; i++) {
            let input = row.querySelector(`.d${i}`);
            if(input && !input.disabled) {
                let val = input.value.toUpperCase();
                // បញ្ជូនទៅតែថ្ងៃណាដែលមានទិន្នន័យ (V, A, L) ប៉ុណ្ណោះ
                if(val && val !== '-') { 
                    days[i] = val; 
                    hasData = true; 
                }
            }
        }
        if(hasData) attData[id] = days;
    });

    const btn = document.getElementById('btn-save-monthly-att');
    if(btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងរក្សាទុក...';
        btn.disabled = true;
    }
    
    try {
        const payload = { 
            action: 'save_monthly_attendance', 
            month: yyyyMm, 
            class_name: AppState.currentClassName, 
            data: attData 
        };
        
        const result = await fetchAPI(payload);
        
        if(result.status === "success") {
            showToast("រក្សាទុកវត្តមានជោគជ័យ!");
        } else {
            showToast("បរាជ័យ: " + result.message);
        }
    } catch(e) { 
        showToast("បរាជ័យក្នុងការភ្ជាប់ Server!"); 
    } finally { 
        if(btn) {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> រក្សាទុកវត្តមាន'; 
            btn.disabled = false;
        }
    }
}

function loadDetailedSheet() {
    const m = document.getElementById('month-selector').value;
    const tbody = document.getElementById('detailed-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const sortedDb = [...AppState.currentClassDb].sort((a, b) => a.name.localeCompare(b.name, 'km'));

    if(sortedDb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="25" class="py-8 text-center text-gray-400">មិនមានសិស្សក្នុងថ្នាក់នេះទេ</td></tr>`;
        return;
    }

    sortedDb.forEach((s, idx) => {
        const sc = s.scores[m] || {};
        let inputHtml = "";
        for(let i=1; i<=19; i++) {
            inputHtml += `<td><input type="number" min="0" max="10" step="0.5" class="grade-input s${i}" value="${sc[`sub${i}`] !== undefined ? sc[`sub${i}`] : ''}" style="width:100%; border:none; outline:none; text-align:center;"></td>`;
        }
        tbody.innerHTML += `
            <tr class="hover:bg-blue-50 transition-colors border-b" data-id="${s.id}">
                <td class="text-center">${idx + 1}</td>
                <td class="text-left px-4 font-bold text-gray-800">${s.name}</td>
                <td class="text-center font-bold">${s.gender}</td>
                ${inputHtml}
                <td class="text-center font-bold bg-gray-100">${sc.total || ''}</td>
                <td class="text-center font-bold bg-blue-50 text-blue-700">${sc.avg || ''}</td>
                <td class="text-center font-bold bg-red-50 text-red-700">${sc.rank || ''}</td>
                <td class="text-center font-bold bg-green-50 text-green-700">${sc.grade || ''}</td>
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
        for(let i=1; i<=19; i++) {
            let val = row.querySelector(`.s${i}`).value;
            currentStudentScore[`sub${i}`] = val !== "" ? parseFloat(val) : "";
        }
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
    if(sorted.length === 0) {
        container.innerHTML = `<p class="p-4 text-center text-gray-400">មិនទាន់មានទិន្នន័យលទ្ធផលសម្រាប់ចន្លោះពេលនេះទេ</p>`;
        return;
    }

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

    const sumTotalEl = document.getElementById('sum-total');
    if(sumTotalEl) sumTotalEl.innerText = AppState.currentClassDb.length;
    
    const sumFemaleEl = document.getElementById('sum-female');
    if(sumFemaleEl) sumFemaleEl.innerText = AppState.currentClassDb.filter(s => s.gender === 'ស').length;
    
    const sumPassEl = document.getElementById('sum-pass');
    if(sumPassEl) sumPassEl.innerText = passCount;
    
    const sumPassFEl = document.getElementById('sum-pass-f');
    if(sumPassFEl) sumPassFEl.innerText = passFemale;

    let failCount = AppState.currentClassDb.filter(s => s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    let failFemale = AppState.currentClassDb.filter(s => s.gender === 'ស' && s.scores[m] && s.scores[m].avg > 0 && s.scores[m].avg < 5).length;
    if(document.getElementById('sum-fail')) document.getElementById('sum-fail').innerText = failCount;
    if(document.getElementById('sum-fail-f')) document.getElementById('sum-fail-f').innerText = failFemale;
    
    let titleText = constants.monthNamesKh[m] || '';
    if(!m.includes('sem') && m !== 'annual') titleText = titleText.replace('ខែ ', 'ប្រចាំខែ ');
    if(document.getElementById('result-month-title')) document.getElementById('result-month-title').innerText = titleText;
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
    
    const attChartDiv = document.getElementById('attendanceChart');
    const attNoDataDiv = document.getElementById('att-chart-no-data');

    // ១. គណនាលទ្ធផល (សិស្សជាប់ និង ធ្លាក់)
    if(!latestMonth) {
        document.querySelectorAll('.dash-chart-month').forEach(el => el.innerText = "មិនមានទិន្នន័យ");
        if(noDataDiv) noDataDiv.classList.remove('hidden'); 
        if(chartDiv) chartDiv.classList.add('hidden');
        if(top3Container) top3Container.innerHTML = '<p class="text-sm text-gray-400 text-center mt-6">មិនទាន់មានសិស្សឆ្នើមទេ</p>';
    } else {
        document.querySelectorAll('.dash-chart-month').forEach(el => el.innerText = constants.monthNamesKh[latestMonth]);
        if(noDataDiv) noDataDiv.classList.add('hidden'); 
        if(chartDiv) chartDiv.classList.remove('hidden');

        let pass = 0, fail = 0;
        AppState.currentClassDb.forEach(s => {
            if(s.scores[latestMonth] && s.scores[latestMonth].avg > 0) {
                if(s.scores[latestMonth].avg >= 5) pass++; else fail++;
            }
        });

        if(chartDiv) {
            const ctx = chartDiv.getContext('2d');
            if(charts.dash) charts.dash.destroy();
            charts.dash = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['សិស្សជាប់', 'សិស្សធ្លាក់'],
                    datasets: [{ data: [pass, fail], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' }
            });
        }

        if(top3Container) {
            top3Container.innerHTML = '';
            const top3 = [...AppState.currentClassDb].filter(s => s.scores[latestMonth] && s.scores[latestMonth].avg > 0)
                                        .sort((a,b) => b.scores[latestMonth].avg - a.scores[latestMonth].avg).slice(0, 3);

            const medals = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
            top3.forEach((s, idx) => {
                top3Container.innerHTML += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
                        <div class="flex items-center gap-3"><i class="fa-solid fa-medal ${medals[idx]} text-2xl"></i>
                        <div><h4 class="font-bold text-gray-800 text-sm">${s.name}</h4></div></div>
                        <div class="text-right"><p class="font-bold text-blue-700">${s.scores[latestMonth].avg}</p></div>
                    </div>
                `;
            });
        }
    }

    // ២. គណនាស្ថិតិវត្តមានសម្រាប់ក្រាហ្វិកទី២
    let v = 0, a = 0, l = 0;
    Object.keys(AppState.dbAttendance).forEach(studentId => {
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
        if(attNoDataDiv) attNoDataDiv.classList.remove('hidden'); 
        if(attChartDiv) attChartDiv.classList.add('hidden');
    } else {
        if(attNoDataDiv) attNoDataDiv.classList.add('hidden'); 
        if(attChartDiv) attChartDiv.classList.remove('hidden');
        if(attChartDiv) {
            const ctxAtt = attChartDiv.getContext('2d');
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
}

function renderLeaderboard() {
    const filterEl = document.getElementById('leaderboard-filter');
    const m = filterEl ? filterEl.value : 'dec';
    const container = document.getElementById('leaderboard-container'); 
    if(!container) return;
    container.innerHTML = '';
    
    const sorted = [...AppState.currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a, b) => b.scores[m].avg - a.scores[m].avg);
    
    if(sorted.length === 0) {
        container.innerHTML = `<p class="py-8 text-gray-400 text-center font-bold">មិនទាន់មានទិន្នន័យ។</p>`;
        return;
    }

    let tableHtml = `
        <table class="w-full border-collapse moeys-table text-sm">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="p-3 text-center w-16 md:w-24 border-r">ចំណាត់ថ្នាក់</th>
                    <th class="p-3 text-center w-24 md:w-32 hidden md:table-cell print:table-cell border-r">អត្តលេខ</th>
                    <th class="p-3 text-left px-4 border-r">ឈ្មោះសិស្ស</th>
                    <th class="p-3 text-center w-16 md:w-20 border-r">ភេទ</th>
                    <th class="p-3 text-center w-24 md:w-32 border-r">មធ្យមភាគ</th>
                    <th class="p-3 text-center w-20 md:w-24">និទ្ទេស</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach((s) => {
        const sc = s.scores[m];
        let rankStyle = sc.rank <= 3 ? "bg-yellow-100 text-yellow-700 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mx-auto font-bold print:bg-transparent print:text-red-600 print:w-auto print:h-auto" : "text-gray-600 font-bold print-text-red text-center mx-auto";
        
        tableHtml += `
            <tr class="border-b transition-colors hover:bg-gray-50">
                <td class="p-2 text-center border-r"><div class="${rankStyle}">${sc.rank}</div></td>
                <td class="p-2 text-center font-mono text-gray-500 hidden md:table-cell print:table-cell border-r">${s.id}</td>
                <td class="p-2 text-left px-4 font-bold text-gray-800 border-r">${s.name}</td>
                <td class="p-2 text-center font-bold border-r ${s.gender === 'ស' ? 'text-pink-600 print-text-red' : 'text-blue-600 print-text-blue'}">${s.gender}</td>
                <td class="p-2 text-center font-bold text-blue-700 print-text-blue border-r text-sm md:text-base">${sc.avg}</td>
                <td class="p-2 text-center font-bold text-green-600 print-text-green">${sc.grade}</td>
            </tr>
        `;
    });
    
    tableHtml += `</tbody></table>`;
    container.innerHTML = tableHtml;
    
    let titleText = constants.monthNamesKh[m] || '';
    if(!m.includes('sem') && m !== 'annual') titleText = titleText.replace('ខែ ', 'ប្រចាំខែ ');
    const titleEl = document.getElementById('leaderboard-month-title');
    if(titleEl) titleEl.innerText = titleText;
}

function renderHonorRoll() {
    const filterEl = document.getElementById('honor-month-selector');
    const m = filterEl ? filterEl.value : 'dec';
    const container = document.getElementById('honor-roll-container');
    if(!container) return;
    container.innerHTML = '';

    const top5 = [...AppState.currentClassDb].filter(s => s.scores[m] && s.scores[m].avg > 0).sort((a,b) => b.scores[m].avg - a.scores[m].avg).slice(0, 5);
    if(top5.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center col-span-5 py-8">មិនទាន់មានទិន្នន័យសម្រាប់ចន្លោះពេលនេះទេ</p>';
        return;
    }

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

function renderModalStudentList() {
    const tbody = document.getElementById('modal-student-list-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
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

function renderDashboardStats() {
    const totalEl = document.getElementById('stat-total');
    if(totalEl) totalEl.innerHTML = `${AppState.currentClassDb.length}`;
    
    const femaleEl = document.getElementById('stat-female');
    if(femaleEl) femaleEl.innerHTML = `${AppState.currentClassDb.filter(s => s.gender === 'ស').length}`;
    
    const maleEl = document.getElementById('stat-male');
    if(maleEl) maleEl.innerHTML = `${AppState.currentClassDb.filter(s => s.gender === 'ប').length}`;
}