// =====================================================================
// ឯកសារ js/app.js - គ្រប់គ្រងដំណើរការទូទៅរបស់ប្រព័ន្ធ
// =====================================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Started! Checking Login State...");
    
    // ១. ពិនិត្យមើលថាតើគ្រូបាន Login ឬនៅ?
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    
    if (currentTeacherId) {
        // ២. បើ Login រួចហើយ រៀបចំទិន្នន័យបឋម
        console.log("Teacher is logged in. Preparing workspace...");
        
        // ធានាថាកាលបរិច្ឆេទសូរិយគតិ/ចន្ទគតិ ត្រូវបាន Set Default ជាថ្ងៃនេះ
        if (typeof window.setSharedTodaySolarDate === 'function') {
            window.setSharedTodaySolarDate();
        }

        // ៣. ទាញយកការកំណត់ (Settings) ពី LocalStorage បើមាន
        if (typeof window.loadGlobalSettings === 'function') {
             window.loadGlobalSettings();
        }

        // ៤. 🟢 កំណត់ឱ្យរត់ចូលផ្ទាំង Dashboard ជាជម្រើសដំបូងគេជានិច្ច 🟢
        // បើមានប៊ូតុង Menu ត្រូវប្រាកដថា Menu "Dashboard" ត្រូវបាន Active
        document.querySelectorAll('.sidebar-menu-btn').forEach(btn => btn.classList.remove('active', 'bg-blue-800'));
        const dashBtn = document.getElementById("menuDashboardBtn"); 
        if(dashBtn) dashBtn.classList.add('active', 'bg-blue-800');

        // បង្ហាញតែផ្ទាំង Dashboard មួយប៉ុណ្ណោះ
        document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
        const targetView = document.getElementById('dashboardView');
        if(targetView) targetView.classList.remove('hidden');

        // ៥. 🟢 ហៅមុខងារគូរ Dashboard ភ្លាមៗ 🟢
        if (typeof window.loadDashboard === 'function') {
            window.loadDashboard();
        }
        
        // ហៅមុខងារអាប់ដេត Sidebar
        if (typeof window.updateSidebarSystemInfo === 'function') {
            window.updateSidebarSystemInfo();
        }

    } else {
        console.log("No teacher logged in. Showing login screen.");
        // បង្ហាញផ្ទាំង Login 
        if (typeof window.showLoginScreen === 'function') {
            window.showLoginScreen();
        } else {
             document.getElementById("mainAppContainer")?.classList.add("hidden");
             document.getElementById("loginScreen")?.classList.remove("hidden");
        }
    }
});

// =====================================================================
// មុខងារសម្រាប់ពេលចុចលើ Menu នីមួយៗ (Sidebar Click Handlers)
// =====================================================================
window.navigateTo = async function(menuName) {
    // រក្សាទុកទីតាំងចុងក្រោយ ដើម្បីពេល Refresh នៅដដែល
    localStorage.setItem('activeMenu', menuName);
    
    // បិទ/បើក UI តាម Menu (សន្មតថាអ្នកមានកូដលាក់/បង្ហាញ div រួចហើយ)
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById(menuName + 'View');
    if(targetView) targetView.classList.remove('hidden');

    // 🟢 ហៅមុខងារ Load ទិន្នន័យភ្លាមៗពេលចុច Menu 🟢
    if (menuName === 'attendance' && typeof window.loadAttendanceView === 'function') {
        await window.loadAttendanceView();
    } else if (menuName === 'scores' && typeof window.loadScoresView === 'function') {
        await window.loadScoresView();
    } else if (menuName === 'students' && typeof window.loadStudentView === 'function') {
        await window.loadStudentView();
    }
};

// =====================================================================
// មុខងារទាញទិន្នន័យសាលា និងឆ្នាំសិក្សាមកបង្ហាញលើ Sidebar (Header/Logo Area)
// =====================================================================
window.updateSidebarSystemInfo = function() {
    // ១. ទាញយកទិន្នន័យការកំណត់សាលាពី Memory (LocalStorage ឬ appSettings)
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings')) || {});
    
    // ២. ទាញយកឆ្នាំសិក្សាបច្ចុប្បន្ន
    let academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
    
    // បំប្លែងឆ្នាំសិក្សាទៅជាលេខខ្មែរ (បើមានមុខងារ toKhmerNum)
    const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear;

    // ៣. បញ្ចូលឈ្មោះសាលា
    const schoolNameEl = document.getElementById('sidebarSchoolName');
    if (schoolNameEl) {
        schoolNameEl.textContent = sInfo.school_name || "សាលាបឋមសិក្សា";
        schoolNameEl.title = sInfo.school_name || "សាលាបឋមសិក្សា"; // បង្ហាញឈ្មោះពេញពេលយក Mouse ទៅដាក់លើ
    }

    // ៤. បញ្ចូលឆ្នាំសិក្សា
    const academicYearEl = document.getElementById('sidebarAcademicYear');
    if (academicYearEl) {
        academicYearEl.textContent = "ឆ្នាំសិក្សា " + khmerYear;
    }

    // ៥. បញ្ចូលឡូហ្គោសាលា (បើមាន)
    const logoEl = document.getElementById('sidebarLogo');
    if (logoEl) {
        const defaultIcon = logoEl.nextElementSibling; // <span>🏫</span>
        
        if (sInfo.logo_url && sInfo.logo_url.trim() !== "") {
            logoEl.src = sInfo.logo_url;
            logoEl.classList.remove('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');
        } else {
            logoEl.classList.add('hidden');
            if (defaultIcon) defaultIcon.classList.remove('hidden');
        }
    }
};
