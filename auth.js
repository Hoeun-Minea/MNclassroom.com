// ==========================================
// ឯកសារ js/auth.js - ប្រព័ន្ធគ្រប់គ្រងសុវត្ថិភាព និងការចូលប្រើប្រាស់ (Standard Auth System)
// ==========================================

window.AppAuth = {
    // ១. កំណត់អថេរផ្ទុកទិន្នន័យគណនី
    state: {
        isLoggedIn: false,
        teacherId: null,
        name: null,
        username: null
    },

    // ២. មុខងារចាប់ផ្តើមដំបូង (Run on Load)
    init: function() {
        this.checkSession();
    },

    // ៣. ត្រួតពិនិត្យការចងចាំ (Session Check)
    checkSession: function() {
        const savedId = localStorage.getItem('auth_teacher_id');
        const savedName = localStorage.getItem('auth_teacher_name');
        const savedUser = localStorage.getItem('auth_username');

        if (savedId && savedUser) {
            // បើធ្លាប់ Login ហើយ => ទាញចូលប្រព័ន្ធតែម្ដង
            this.state = { isLoggedIn: true, teacherId: savedId, name: savedName, username: savedUser };
            this.showWorkspace();
        } else {
            // បើមិនទាន់ Login ទេ => បង្ហាញផ្ទាំង Login/Register
            this.showAuthScreen();
        }
    },

    // ៤. មុខងារចូលគណនី (Login)
    login: async function(e) {
        e.preventDefault();
        const user = document.getElementById('usernameOrPhone')?.value.trim();
        const pass = document.getElementById('password')?.value.trim();
        const btn = document.getElementById('btnLogin');
        const errDiv = document.getElementById("loginError");

        if (!user || !pass) {
            alert("សូមវាយបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់!"); return;
        }

        const origBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងផ្ទៀងផ្ទាត់...';
        btn.disabled = true;
        if(errDiv) errDiv.classList.add("hidden");

        try {
            // សម្អាត Cache ទិន្នន័យចាស់ជានិច្ច មុនពេល Login ចូលគណនីថ្មី
            this.clearLocalCache();

            const res = await window.apiPost("loginUser", { username: user, password: pass });

            if (res && res.status === "success" && res.data) {
                // រក្សាទុកទិន្នន័យទៅក្នុងកុំព្យូទ័រឱ្យចងចាំ (Persistent Storage)
                localStorage.setItem('auth_teacher_id', res.data.teacher_id);
                localStorage.setItem('auth_teacher_name', res.data.name);
                localStorage.setItem('auth_username', res.data.username);

                this.state = { isLoggedIn: true, teacherId: res.data.teacher_id, name: res.data.name, username: res.data.username };
                
                if(typeof showToast === 'function') showToast("ចូលប្រព័ន្ធជោគជ័យ! ✅");
                this.showWorkspace();
            } else {
                throw new Error(res?.message || "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវទេ");
            }
        } catch (error) {
            console.error("Login Error:", error);
            if(errDiv) {
                errDiv.textContent = error.message;
                errDiv.classList.remove("hidden");
            } else {
                alert("❌ បរាជ័យ: " + error.message);
            }
        } finally {
            btn.innerHTML = origBtnText;
            btn.disabled = false;
        }
    },

    // ៥. មុខងារចុះឈ្មោះគណនីថ្មី (Register)
    register: async function(e) {
        e.preventDefault();
        const name = document.getElementById('regFullName')?.value.trim();
        const user = document.getElementById('regUsername')?.value.trim();
        const pass = document.getElementById('regPassword')?.value;
        const confirmPass = document.getElementById('regConfirmPassword')?.value;
        const terms = document.getElementById('regTerms')?.checked;

        // ការវាយតម្លៃសុវត្ថិភាពជាមូលដ្ឋាន
        if (!terms) return alert("សូមយល់ព្រមលើលក្ខខណ្ឌប្រើប្រាស់ជាមុនសិន!");
        if (pass !== confirmPass) return alert("❌ លេខសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ!");
        if (pass.length < 8) return alert("❌ លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ!");

        const btn = document.getElementById('btnRegister');
        const origBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងចុះឈ្មោះ...';
        btn.disabled = true;

        try {
            const payload = { name: name, username: user, password: pass };
            const res = await window.apiPost("registerUser", payload);

            if (res && res.status === "success") {
                this.clearLocalCache();
                alert(`🎉 ចុះឈ្មោះជោគជ័យ!\n\nសូមរក្សាទុកលេខសម្គាល់គ្រូរបស់អ្នក: ${res.data.teacher_id}\n\nប្រព័ន្ធនឹងបញ្ជូនអ្នកទៅកាន់ផ្ទាំងចូលគណនី។`);
                
                // ប្តូរទៅផ្ទាំង Login វិញ ហើយចាក់បញ្ចូលទិន្នន័យស្រាប់
                window.toggleAuthBox('login');
                document.getElementById('usernameOrPhone').value = res.data.username;
                document.getElementById('password').value = pass;
            } else {
                throw new Error(res?.message || "បរាជ័យក្នុងការចុះឈ្មោះ!");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert("❌ បរាជ័យ: " + error.message);
        } finally {
            btn.innerHTML = origBtnText;
            btn.disabled = false;
        }
    },

    // ៦. មុខងារចាកចេញពីប្រព័ន្ធ (Logout)
    logout: function() {
        if(!confirm("តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ? (ទិន្នន័យដែលមិនទាន់ Sync នឹងត្រូវបាត់បង់)")) return;
        localStorage.clear(); // សម្អាតរាល់ការចងចាំទាំងអស់
        location.reload();    // Refresh Website ត្រឡប់ទៅផ្ទាំង Login
    },

    // ៧. គ្រប់គ្រងការបង្ហាញ UI (UI Controllers)
    showAuthScreen: function() {
        const appView = document.getElementById("appView");
        const landingScreen = document.getElementById("landing-screen"); // ID នៃផ្ទាំង Login/Register របស់លោកគ្រូ
        
        if (appView) appView.classList.add("hidden");
        if (landingScreen) {
            landingScreen.classList.remove("hidden");
            landingScreen.style.display = "flex";
        }
    },

    showWorkspace: function() {
        const landingScreen = document.getElementById("landing-screen");
        const appView = document.getElementById("appView");
        
        if (landingScreen) landingScreen.style.display = 'none';
        if (appView) appView.classList.remove("hidden");

        // ដាក់បញ្ចូលទិន្នន័យទៅក្នុង Sidebar
        const nameEl = document.getElementById("navUserName");
        const idEl = document.getElementById("navUserId");
        if (nameEl) nameEl.textContent = this.state.name;
        if (idEl) idEl.textContent = this.state.teacherId;

        // ទាញទិន្នន័យពី Server មកពេល Login ជោគជ័យ
        if (typeof window.fetchAllData === 'function') window.fetchAllData(); 

        // បើកផ្ទាំង Dashboard មុនគេ
        if (typeof window.switchView === 'function') window.switchView("dashboard");
    },

    clearLocalCache: function() {
        localStorage.removeItem('academic_students');
        localStorage.removeItem('academic_scores');
        localStorage.removeItem('academic_attendance');
        localStorage.removeItem('syncQueue');
    }
};

// ចាប់ផ្តើមដំណើរការប្រព័ន្ធ Auth ពេលបើកវេបសាយ
document.addEventListener("DOMContentLoaded", () => {
    window.AppAuth.init();
});

// រក្សាមុខងារប្តូរផ្ទាំងសងខាងចុះឈ្មោះ និងចូលប្រើ (UI Toggles)
window.toggleAuthBox = function(type) {
    const loginBox = document.getElementById('authLoginBox');
    const registerBox = document.getElementById('authRegisterBox');
    
    if (type === 'register') {
        if(loginBox) loginBox.classList.add('hidden');
        if(registerBox) registerBox.classList.remove('hidden');
    } else {
        if(loginBox) loginBox.classList.remove('hidden');
        if(registerBox) registerBox.classList.add('hidden');
    }
};

// ភ្ជាប់ Event Listeners ទៅនឹង HTML របស់លោកគ្រូដោយផ្ទាល់
window.handleLogin = (e) => window.AppAuth.login(e);
window.handleRegister = (e) => window.AppAuth.register(e);
window.handleLogout = () => window.AppAuth.logout();

// ៥. រៀបចំប្រព័ន្ធពេលចូលគណនីជោគជ័យ (Setup Workspace)
function setupWorkspace() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('landing-screen').style.display = 'none';
    const appView = document.getElementById('appView');
    if (appView) appView.classList.remove('hidden');
    
    const nameEl = document.getElementById("navUserName");
    const roleEl = document.getElementById("navUserRole");
    const idEl = document.getElementById("navUserId");
    if (nameEl) nameEl.textContent = window.AuthState.teacherName;
    if (roleEl) roleEl.textContent = "គ្រូបន្ទុកថ្នាក់";
    if (idEl) idEl.textContent = window.AuthState.teacherId;

    // 🟢 ធ្វើឱ្យកន្លែងឈ្មោះគ្រូនៅ Sidebar អាចចុចបាន ដើម្បីបើកផ្ទាំងគណនី 🟢
    const userProfileArea = document.querySelector('.p-4.bg-black\\/30 .flex.items-center.gap-3');
    if (userProfileArea) {
        userProfileArea.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
        userProfileArea.setAttribute('onclick', 'window.openAccountModal()');
        userProfileArea.setAttribute('title', 'ចុចទីនេះដើម្បីមើល/កែប្រែគណនី');
    }

    // បង្កើត Modal គណនីដោយស្វ័យប្រវត្តិ
    window.renderAccountModal();

    const savedYear = localStorage.getItem('selected_academic_year');
    if (savedYear) {
        const yearSelect = document.getElementById("globalAcademicYear");
        if (yearSelect) yearSelect.value = savedYear;
    }

    if (typeof window.fetchAllData === 'function') {
        window.fetchAllData(); 
    }

    window.switchView("dashboard");
}

// ៦. មុខងារប្តូរផ្ទាំងការងារ (Routing)
window.switchView = function(viewId, param = "") {
    const allViews = document.querySelectorAll("main[id$='View']");
    allViews.forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex', 'flex-col');
        el.style.display = 'none'; 
    });
    
    const targetView = document.getElementById(viewId + 'View');
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('flex', 'flex-col');
        targetView.style.display = 'flex';
    } else {
        return;
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-white', 'border-l-4', 'border-indigo-400');
    });
    const activeNav = document.getElementById(`nav-${viewId}`);
    if(activeNav) activeNav.classList.add('bg-white/10', 'text-white', 'border-l-4', 'border-indigo-400');

    const titles = {
        'dashboard': 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', 
        'students': 'គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស', 
        'attendance': 'កត់វត្តមានប្រចាំថ្ងៃ',
        'scores': 'បញ្ចូលពិន្ទុ និងនិទ្ទេស',  
        'settings': 'ការកំណត់ទូទៅ', 
        'library': 'បណ្ណាល័យ និងទ្រព្យសកម្ម',
        'schoolReports': 'របាយការណ៍រដ្ឋបាល',
        'tracking-book': 'សៀវភៅតាមដាន',
        'reports': 'របាយការណ៍'
    };
    
    const titleEl = document.getElementById('pageTitleHeader');
    if (titleEl) titleEl.textContent = titles[viewId] || 'ផ្ទាំងការងារ';

    if (viewId === "dashboard" && typeof loadDashboard === 'function') loadDashboard();
    else if (viewId === "students" && typeof loadStudentsView === 'function') loadStudentsView(param);
    else if (viewId === "attendance" && typeof loadAttendanceView === 'function') loadAttendanceView(param);
    else if (viewId === "scores" && typeof loadScoresView === 'function') loadScoresView(param);
    else if (viewId === "rankings" && typeof loadRankingsView === 'function') loadRankingsView(param);
    else if (viewId === "settings" && typeof loadSettingsView === 'function') loadSettingsView();
    else if (viewId === "library" && typeof loadLibraryView === 'function') loadLibraryView();
    else if (viewId === "schoolReports" && typeof loadSchoolReportsView === 'function') loadSchoolReportsView();
    else if (viewId === "tracking-book" && typeof loadTrackingBookView === 'function') loadTrackingBookView();
    else if (viewId === "reports" && typeof loadReportsView === 'function') loadReportsView();

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById("appSidebar");
        if(sidebar && !sidebar.classList.contains("hidden")) {
            sidebar.classList.add("hidden");
            sidebar.style.display = "none";
        }
    }
};

window.toggleAuthBox = function(type) {
    if (type === 'register') {
        document.getElementById('authLoginBox').classList.add('hidden');
        document.getElementById('authRegisterBox').classList.remove('hidden');
    } else {
        document.getElementById('authLoginBox').classList.remove('hidden');
        document.getElementById('authRegisterBox').classList.add('hidden');
    }
};


// ==========================================
// ៧. មុខងារគណនីផ្ទាល់ខ្លួន (Account Profile Settings)
// ==========================================

// បង្កើត HTML Modal សម្រាប់គណនី
window.renderAccountModal = function() {
    if (document.getElementById("accountProfileModal")) return;

    const modalHtml = `
        <div id="accountProfileModal" class="fixed inset-0 z-[7000] bg-slate-900/70 backdrop-blur-sm hidden items-center justify-center p-4 fade-in font-siemreap overflow-y-auto">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative transform transition-all my-auto">
                <button onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition z-20"><i class="fa-solid fa-xmark"></i></button>
                
                <div class="px-6 md:px-8 py-6 md:py-8 text-left">
                    <div class="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md"><i class="fa-solid fa-user-gear"></i></div>
                        <div>
                            <h3 class="text-xl font-moul text-slate-800">ព័ត៌មានគណនី</h3>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">កែប្រែប្រវត្តិរូបរបស់អ្នក</p>
                        </div>
                    </div>

                    <form id="accountUpdateForm" onsubmit="window.handleUpdateAccount(event)" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">លេខសម្គាល់គ្រូ (Teacher ID)</label>
                            <input type="text" id="acc_teacher_id" readonly class="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-500 cursor-not-allowed outline-none">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">ឈ្មោះ និងនាមត្រកូល</label>
                            <div class="relative group">
                                <i class="fa-regular fa-id-card absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="text" id="acc_name" required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800 font-moul">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">ឈ្មោះគណនី (Username)</label>
                            <div class="relative group">
                                <i class="fa-regular fa-user absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="text" id="acc_username" required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800 lowercase">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">លេខសម្ងាត់ថ្មី (Password)</label>
                            <div class="relative group">
                                <i class="fa-solid fa-lock absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="password" id="acc_password" placeholder="វាយបញ្ចូលបើចង់ប្តូរថ្មី (បើមិនប្តូរទុកចោល)" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800">
                            </div>
                        </div>
                        
                        <div class="pt-4 flex gap-3">
                            <button type="button" onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition">បោះបង់</button>
                            <button type="submit" id="btnUpdateAccount" class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// បើកផ្ទាំងគណនី
window.openAccountModal = function() {
    const modal = document.getElementById("accountProfileModal");
    if (!modal) return;

    document.getElementById("acc_teacher_id").value = window.AuthState.teacherId;
    document.getElementById("acc_name").value = window.AuthState.teacherName;
    document.getElementById("acc_username").value = window.AuthState.username || window.AuthState.teacherId;
    document.getElementById("acc_password").value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

// រក្សាទុកការកែប្រែគណនី
window.handleUpdateAccount = async function(e) {
    e.preventDefault();
    const newName = document.getElementById("acc_name").value.trim();
    const newUsername = document.getElementById("acc_username").value.trim();
    const newPassword = document.getElementById("acc_password").value.trim();
    const btn = document.getElementById("btnUpdateAccount");

    const origBtnHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...';
    btn.disabled = true;

    try {
        const payload = {
            teacher_id: window.AuthState.teacherId,
            name: newName,
            username: newUsername,
            password: newPassword || undefined // បើទុកទទេ មិនបញ្ជូនទៅទេ
        };

        if (typeof window.apiPost === 'function') {
            const res = await window.apiPost("updateAccount", payload);
            if (res && res.status === "success") {
                // Update Local States
                localStorage.setItem('auth_teacher_name', newName);
                localStorage.setItem('auth_username', newUsername);
                window.AuthState.teacherName = newName;
                window.AuthState.username = newUsername;

                // Update UI (Sidebar)
                const nameEl = document.getElementById("navUserName");
                if (nameEl) nameEl.textContent = newName;

                document.getElementById('accountProfileModal').classList.replace('flex','hidden');
                if (typeof showToast === 'function') showToast("✅ ព័ត៌មានគណនីត្រូវបានកែប្រែជោគជ័យ!");
            } else {
                throw new Error(res.message || "មានបញ្ហាក្នុងការរក្សាទុក!");
            }
        } else {
            alert("មុខងារភ្ជាប់ទៅកាន់ Cloud (apiPost) មិនទាន់មានដំណើរការ។");
        }
    } catch (err) {
        console.error("Account Update Error:", err);
        alert("❌ ការកែប្រែមិនជោគជ័យទេ! " + err.message);
    } finally {
        btn.innerHTML = origBtnHtml;
        btn.disabled = false;
    }
};

// ... [រក្សាមុខងារសុវត្ថិភាពលេខសម្ងាត់ចាស់] ...
window.togglePasswordVisibility = function(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
        icon.classList.add("text-emerald-600");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
        icon.classList.remove("text-emerald-600");
    }
};

window.checkPasswordStrength = function(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/) || password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1; 

    const bar1 = document.getElementById("strBar1");
    const bar2 = document.getElementById("strBar2");
    const bar3 = document.getElementById("strBar3");
    const strText = document.getElementById("strText");

    const defaultBg = "bg-slate-200 dark:bg-slate-600";
    
    if(bar1) bar1.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 1 ? "bg-rose-500" : defaultBg);
    if(bar2) bar2.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 2 ? "bg-amber-400" : defaultBg);
    if(bar3) bar3.className = "h-full w-1/3 transition-all duration-300 " + (strength >= 3 ? "bg-emerald-500" : defaultBg);

    if(strText) {
        if (password.length === 0) {
            strText.textContent = "កម្រិតសុវត្ថិភាព: មិនទាន់មាន";
            strText.className = "text-[10px] text-slate-400 mt-1.5 font-bold";
        } else if (strength === 1) { 
            strText.textContent = "កម្រិតសុវត្ថិភាព: ខ្សោយ (ត្រូវការលេខ/និមិត្តសញ្ញា)"; 
            strText.className = "text-[10px] text-rose-500 mt-1.5 font-bold animate-pulse"; 
        } else if (strength === 2) { 
            strText.textContent = "កម្រិតសុវត្ថិភាព: បង្គួរ"; 
            strText.className = "text-[10px] text-amber-500 mt-1.5 font-bold"; 
        } else { 
            strText.textContent = "កម្រិតសុវត្ថិភាព: ខ្លាំងល្អណាស់"; 
            strText.className = "text-[10px] text-emerald-500 mt-1.5 font-bold"; 
        }
    }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    const name = document.getElementById('regFullName')?.value.trim();
    const user = document.getElementById('regUsername')?.value.trim();
    const contact = document.getElementById('regContact')?.value.trim(); // 🟢 ចាប់យក Email ឬ Phone ថ្មី
    const pass = document.getElementById('regPassword')?.value;
    const confirmPass = document.getElementById('regConfirmPassword')?.value;
    const terms = document.getElementById('regTerms')?.checked;
    
    if (!terms) { alert("សូមយល់ព្រមលើលក្ខខណ្ឌប្រើប្រាស់ជាមុនសិន!"); return; }
    if (pass !== confirmPass) { alert("❌ លេខសម្ងាត់ និងការបញ្ជាក់លេខសម្ងាត់មិនត្រូវគ្នាទេ!"); return; }
    if (pass.length < 8) { alert("❌ លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ!"); return; }

    const btn = document.getElementById('btnRegister');
    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> កំពុងចុះឈ្មោះ...'; 
        btn.disabled = true;
    }

    try {
        // 🟢 បន្ថែម contact ចូលទៅក្នុង Payload
        const payload = { name: name, username: user, contact: contact, password: pass };
        const res = typeof window.apiPost === 'function' ? await window.apiPost("registerUser", payload) : null;
        
        if (res && res.status === "success" && res.data) {
            localStorage.removeItem('academic_students');
            localStorage.removeItem('academic_scores');
            localStorage.removeItem('academic_attendance');
            localStorage.removeItem('appSettings');

            alert(`🎉 អបអរសាទរ! ចុះឈ្មោះជោគជ័យ។\n\nលេខសម្គាល់គ្រូ (Teacher ID) របស់អ្នកគឺ: ${res.data.teacher_id}\n\nសូមប្រើលេខនេះដើម្បីចូលគណនី។`);
            
            if (typeof toggleAuthBox === 'function') {
                toggleAuthBox('login');
            }
            
            const usernameInput = document.getElementById('usernameOrPhone');
            if (usernameInput) usernameInput.value = res.data.teacher_id;
            
            const passwordInput = document.getElementById('password');
            if (passwordInput) passwordInput.value = pass;
        } else {
            throw new Error(res?.message || "បរាជ័យក្នុងការចុះឈ្មោះជាមួយ Server!");
        }
    } catch (error) {
        console.error("Registration Error:", error);
        alert("❌ បរាជ័យ: " + error.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalBtnHtml; 
            btn.disabled = false;
        }
    }
};

// ==========================================
// មុខងារពិនិត្យ និងកែប្រែគណនីអ្នកប្រើប្រាស់ (User Profile Modal)
// ==========================================

// ១. បង្កើត HTML Modal បញ្ចូលទៅក្នុងចុងទំព័រ
window.renderAccountModal = function() {
    if (document.getElementById("accountProfileModal")) return;

    const modalHtml = `
        <div id="accountProfileModal" class="fixed inset-0 z-[7000] bg-slate-900/70 backdrop-blur-sm hidden items-center justify-center p-4 fade-in font-siemreap overflow-y-auto">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative transform transition-all my-auto">
                <button onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition z-20">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                
                <div class="px-6 md:px-8 py-6 md:py-8 text-left">
                    <div class="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md">
                            <i class="fa-solid fa-user-gear"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-moul text-slate-800">ព័ត៌មានគណនី</h3>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">ពិនិត្យ និងកែប្រែប្រវត្តិរូប</p>
                        </div>
                    </div>

                    <form id="accountUpdateForm" onsubmit="window.handleUpdateAccount(event)" class="space-y-4">
                        <!-- លេខសម្គាល់គ្រូ (មិនអាចកែបាន) -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">លេខសម្គាល់គ្រូ (Teacher ID)</label>
                            <input type="text" id="acc_teacher_id" readonly class="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-500 cursor-not-allowed outline-none">
                        </div>
                        
                        <!-- ឈ្មោះពេញ -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">ឈ្មោះ និងនាមត្រកូល</label>
                            <div class="relative group">
                                <i class="fa-regular fa-id-card absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="text" id="acc_name" required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800 font-moul">
                            </div>
                        </div>

                        <!-- ឈ្មោះគណនី -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">ឈ្មោះចូលប្រើ (Username)</label>
                            <div class="relative group">
                                <i class="fa-regular fa-user absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="text" id="acc_username" required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800 lowercase">
                            </div>
                        </div>

                        <!-- លេខសម្ងាត់ថ្មី -->
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">ប្តូរលេខសម្ងាត់ថ្មី (Password)</label>
                            <div class="relative group">
                                <i class="fa-solid fa-lock absolute left-4 top-3 text-slate-400 text-sm group-focus-within:text-emerald-500"></i>
                                <input type="password" id="acc_password" placeholder="ទុកចោលប្រសិនបើមិនចង់ប្តូរថ្មី" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-slate-800">
                            </div>
                        </div>
                        
                        <div class="pt-4 flex gap-3">
                            <button type="button" onclick="document.getElementById('accountProfileModal').classList.replace('flex','hidden')" class="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition">បោះបង់</button>
                            <button type="submit" id="btnUpdateAccount" class="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ២. មុខងារសម្រាប់បើកផ្ទាំងគណនី
window.openAccountModal = function() {
    const modal = document.getElementById("accountProfileModal");
    if (!modal) {
        window.renderAccountModal();
    }
    
    // បំពេញទិន្នន័យចាស់ចូលក្នុងប្រអប់
    document.getElementById("acc_teacher_id").value = window.AppState ? window.AppState.teacherId : localStorage.getItem('auth_teacher_id') || "";
    document.getElementById("acc_name").value = window.AppState ? window.AppState.teacherName : localStorage.getItem('auth_teacher_name') || "";
    document.getElementById("acc_username").value = localStorage.getItem('auth_username') || localStorage.getItem('auth_teacher_id') || "";
    document.getElementById("acc_password").value = "";

    document.getElementById("accountProfileModal").classList.remove("hidden");
    document.getElementById("accountProfileModal").classList.add("flex");
};

// ៣. មុខងារសម្រាប់រក្សាទុកពេលចុច Update
window.handleUpdateAccount = async function(e) {
    e.preventDefault();
    const newName = document.getElementById("acc_name").value.trim();
    const newUsername = document.getElementById("acc_username").value.trim();
    const newPassword = document.getElementById("acc_password").value.trim();
    const btn = document.getElementById("btnUpdateAccount");

    const origBtnHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...';
    btn.disabled = true;

    try {
        // រក្សាទុកចូលក្នុង LocalStorage សិន
        localStorage.setItem('auth_teacher_name', newName);
        localStorage.setItem('auth_username', newUsername);
        
        if (window.AppState) {
            window.AppState.teacherName = newName;
            window.AppState.username = newUsername;
        }

        // Update ឈ្មោះនៅលើ Sidebar ឱ្យប្រែប្រួលភ្លាមៗ
        const nameEl = document.getElementById("navUserName");
        if (nameEl) nameEl.textContent = newName;

        // បើមានមុខងារភ្ជាប់ទៅ Server (Cloud)
        if (typeof window.apiPost === 'function') {
            const payload = {
                teacher_id: localStorage.getItem('auth_teacher_id'),
                name: newName,
                username: newUsername,
                password: newPassword || undefined
            };
            await window.apiPost("updateAccount", payload);
        }

        document.getElementById('accountProfileModal').classList.replace('flex','hidden');
        if (typeof showToast === 'function') showToast("គណនីរបស់អ្នកត្រូវបានកែប្រែដោយជោគជ័យ! ✅");

    } catch (err) {
        alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ!");
    } finally {
        btn.innerHTML = origBtnHtml;
        btn.disabled = false;
    }
};

// កុំភ្លេចហៅមុខងារ renderAccountModal ឱ្យដំណើរការនៅពេលវេបសាយដើរ (ក្នុង auth.js ស្រាប់)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if(typeof window.renderAccountModal === 'function') {
            window.renderAccountModal();
        }
    }, 1000);
});


// ឧបមាថានេះជាកូដនៅពេល Login ជោគជ័យ (នៅក្នុង js/auth.js របស់អ្នក)
window.handleLoginSuccess = async function(teacherInfo) {
    // ១. រក្សាទុកព័ត៌មានគ្រូ
    window.AuthState = {
        teacherId: teacherInfo.id,
        teacherName: teacherInfo.name
    };
    localStorage.setItem('auth_teacher_id', teacherInfo.id);
    localStorage.setItem('auth_teacher_name', teacherInfo.name);

    // ២. Update UI របស់ App (ឧ. បង្ហាញឈ្មោះគ្រូនៅកែងលើ)
    const lblTeacherName = document.getElementById("lblCurrentTeacherName");
    if(lblTeacherName) lblTeacherName.textContent = teacherInfo.name;

    // ៣. លាក់ផ្ទាំង Login និង បង្ហាញផ្ទាំង Main App
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("mainAppContainer").classList.remove("hidden");

    // ៤. 🟢 ហៅមុខងារ Load ទិន្នន័យ Menu ទី ១ ភ្លាមៗ (ឧ. ឱ្យលោតចូលកត់វត្តមានមុនគេ) 🟢
    localStorage.setItem('activeMenu', 'attendance'); // Set default menu
    if (typeof window.loadAttendanceView === 'function') {
        await window.loadAttendanceView();
    }
    
    if (typeof showToast === 'function') showToast(`ស្វាគមន៍លោកគ្រូ/អ្នកគ្រូ ${teacherInfo.name}!`);
};