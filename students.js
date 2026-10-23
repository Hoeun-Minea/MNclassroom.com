// ==========================================
// ឯកសារ js/students.js - ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស (Ultra-Safe Dynamic Edition)
// ==========================================

window.allStudents = [];
window.filteredStudents = [];
// ==========================================
// មុខងារជំនួយ៖ បំប្លែងថ្ងៃខែឆ្នាំកំណើត ទៅជាទម្រង់ខ្មែរពេញលេញ (Super Clean & Khmer Format)
// ==========================================
window.formatKhmerDateFull = function(dateStr) {
    if (!dateStr) return ".........................";
    
    // ១. សម្អាតទិន្នន័យ (លុបសញ្ញា " និង ម៉ោងអន្តរជាតិ T17:00:00.000Z)
    let cleanStr = String(dateStr).replace(/["'\s]/g, ""); 
    cleanStr = cleanStr.replace(/T[0-9:\.Z]+/gi, "");
    cleanStr = cleanStr.replace(/-/g, '/');
    
    // ២. កាត់យក ថ្ងៃ ខែ ឆ្នាំ
    let parts = cleanStr.split('/').filter(p => p.trim() !== "");
    if (parts.length >= 3) {
        let day, month, year;
        let p1 = parts[0].padStart(2, '0');
        let p2 = parts[1].padStart(2, '0');
        let p3 = parts[2];
        
        // កំណត់ទីតាំង ថ្ងៃ ខែ ឆ្នាំ
        if (p1.length === 4) {
            year = p1; month = p2; day = p3; // YYYY/MM/DD
        } else {
            day = p1; month = p2; year = p3; // DD/MM/YYYY
        }
        
        // ៣. បំប្លែងលេខខែ ទៅជាឈ្មោះខែខ្មែរ
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        let mIndex = parseInt(month, 10) - 1;
        let monthName = (mIndex >= 0 && mIndex < 12) ? khmerMonths[mIndex] : month;
        
        // ៤. បំប្លែងលេខ ទៅជាលេខខ្មែរ
        let toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        
        return `ថ្ងៃទី ${toKhNum(day)} ខែ ${monthName} ឆ្នាំ ${toKhNum(year)}`;
    }
    
    // បើខុសទម្រង់ បង្ហាញលេខខ្មែរធម្មតា
    return typeof window.toKhmerNum === 'function' ? window.toKhmerNum(cleanStr) : cleanStr; 
};

// ==========================================
// មុខងារជំនួយ៖ គណនាអាយុ
// ==========================================
window.calculateAge = function(dobStr) {
    if (!dobStr) return "";
    
    let cleanStr = String(dobStr).replace(/["'\s]/g, "");
    if (cleanStr.includes('T')) {
        cleanStr = cleanStr.split('T')[0];
    }
    
    let birthYear = 0;
    if (cleanStr.includes('-')) {
        let p = cleanStr.split('-');
        birthYear = p[0].length === 4 ? parseInt(p[0]) : parseInt(p[2]);
    } else if (cleanStr.includes('/')) {
        let p = cleanStr.split('/');
        birthYear = p[0].length === 4 ? parseInt(p[0]) : parseInt(p[2]);
    } else {
        birthYear = new Date(cleanStr).getFullYear();
    }
    
    if (!birthYear || isNaN(birthYear)) return "";
    
    let currentYear = new Date().getFullYear();
    return currentYear - birthYear;
};

// ==========================================
// អនុគមន៍ជំនួយ (Helper Functions)
// ==========================================
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

function normalizeGrade(str) {
    let s = String(str || "ថ្នាក់ទី ១").trim();
    const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
    let arabicStr = s.replace(/[០-៩]/g, match => khmerToArabic[match]);
    let match = arabicStr.match(/[0-9]+/);
    if (match) return "ថ្នាក់ទី " + toKhmerNum(match[0]);
    return "ថ្នាក់ទី ១";
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    let str = String(dateStr);
    if (str.includes('T')) str = str.split('T')[0];
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return str;
}

function calculateAge(dobStr) {
    if (!dobStr) return "-";
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return "-";
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString();
}

function getAvatarInitial(name) {
    if (!name) return "ស";
    const cleanName = String(name).replace(/^(កុមារា|កុមារី|យុវជន|យុវតី)\s*/, '');
    const words = cleanName.split(' ');
    if (words.length > 1) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
}

function formatAddress(village, commune) {
    let addr = [];
    if(village) addr.push(`ភូមិ${village}`);
    if(commune) addr.push(`ឃុំ${commune}`);
    return addr.length > 0 ? addr.join(" ") : "-";
}

// ==========================================
// ១. មុខងារចម្បងក្នុងការគូរផ្ទាំងគ្រប់គ្រងសិស្ស (Fast Load)
// ==========================================
window.loadStudentsView = async function() {
    try {
        const container = document.getElementById("studentsView") || document.getElementById("mainContentArea") || document.getElementById("appView");
        if (!container) return;

        let gradesOptions = `<option value="all">គ្រប់ថ្នាក់</option>`;
        const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
        for(let i = 1; i <= 12; i++) {
            const khGrade = toKhNum(i);
            gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ថ្នាក់ទី ${khGrade}</option>`;
        }

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
        
        container.className = "p-2 md:p-6 transition duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50";
        container.innerHTML = `
            <style>
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .check-card-input:checked + .check-card-content { border-color: #6366f1; background-color: #eef2ff; }
                .check-card-input:checked + .check-card-content .check-icon { color: #6366f1; opacity: 1; transform: scale(1); }
            </style>
            
            <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative">
                <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 max-w-[1680px] mx-auto pb-16 pt-1 min-h-full">
                    
                    <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 shrink-0 mb-6 no-print relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6 transition-all">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                        <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                        
                        <div class="flex items-center gap-5 relative z-10 w-full xl:w-auto">
                            <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 shrink-0 transform -rotate-3"><i class="fa-solid fa-users"></i></div>
                            <div>
                                <h2 class="text-xl md:text-3xl font-black text-slate-800 font-moul mb-1">បញ្ជីឈ្មោះសិស្ស</h2>
                                <p class="text-[11px] md:text-sm text-slate-500 font-bold flex gap-3 items-center">
                                    <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">សរុប: <span id="hdrTotal" class="font-mono text-sm">0</span> នាក់</span>
                                    <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">បង្ហាញ: <span id="hdrActive" class="font-mono text-sm">0</span> នាក់</span>
                                </p>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end relative z-10">
                            <div class="h-8 w-px bg-slate-200 hidden lg:block mx-1"></div>
                            
                            <button onclick="if(typeof window.printStudentList === 'function') window.printStudentList();" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition border border-slate-200 shadow-sm hover:shadow" title="បោះពុម្ពបញ្ជីសង្ខេប">
                                <i class="fa-solid fa-print text-lg"></i>
                            </button>
                            <button onclick="if(typeof window.printFullStudentList === 'function') window.printFullStudentList();" class="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition border border-slate-200 shadow-sm hover:shadow" title="បោះពុម្ពបញ្ជីលម្អិត">
                                <i class="fa-solid fa-list-check text-lg"></i>
                            </button>

                            <div class="h-8 w-px bg-slate-200 hidden lg:block mx-1"></div>
                            
                            <input type="file" id="stuExcelInput" accept=".xlsx, .xls" class="hidden" onchange="if(typeof window.importStudentsExcel === 'function') window.importStudentsExcel(event)">
                            <div class="flex bg-slate-100 p-1 rounded-xl">
                                <button onclick="if(typeof window.downloadStudentTemplate === 'function') window.downloadStudentTemplate();" class="px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="ទាញយកគំរូ Excel"><i class="fa-solid fa-download"></i></button>
                                <button onclick="document.getElementById('stuExcelInput').click()" class="px-3 py-2 text-slate-600 hover:text-amber-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="នាំចូលពី Excel"><i class="fa-solid fa-file-import"></i></button>
                                <button onclick="if(typeof window.exportStudentsExcel === 'function') window.exportStudentsExcel();" class="px-3 py-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg text-[13px] font-bold transition" title="ទាញយកជា Excel"><i class="fa-solid fa-file-excel"></i></button>
                            </div>
                            
                            <button onclick="if(typeof window.openStudentModal === 'function') window.openStudentModal();" class="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 sm:ml-2">
                                <i class="fa-solid fa-user-plus"></i> ចុះឈ្មោះថ្មី
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm mb-6 shrink-0 no-print relative z-20">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div class="relative col-span-1 md:col-span-2 lg:col-span-2 group">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><i class="fa-solid fa-magnifying-glass text-[14px]"></i></span>
                                <input type="text" id="stuSearchInput" oninput="if(typeof window.filterStudents === 'function') window.filterStudents();" placeholder="ស្វែងរកឈ្មោះ ឬ អត្តលេខ..." class="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl text-[13px] font-bold outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-inner">
                            </div>
                           
                            <select id="stuFilterGender" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();" class="w-full border border-slate-200 rounded-2xl px-4 py-3 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-inner">
                                <option value="all">ប្រុស និង ស្រី</option><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option>
                            </select>
                            <select id="stuFilterStatus" onchange="if(typeof window.filterStudents === 'function') window.filterStudents();" class="w-full border border-slate-200 rounded-2xl px-4 py-3 text-[13px] font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-inner">
                                <option value="all">គ្រប់ស្ថានភាព</option><option value="Active" selected>កំពុងសិក្សា</option><option value="Dropped">បោះបង់</option>
                            </select>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative flex-1 flex flex-col w-full min-h-[400px] overflow-hidden print:border-none print:shadow-none z-10">
                        <div class="w-full h-full overflow-x-auto custom-scrollbar print:overflow-visible relative bg-white pb-6">
                            <table id="studentsTable" class="w-max min-w-full border-collapse text-left whitespace-nowrap bg-white relative">
                                <thead class="bg-slate-50/90 text-slate-500 sticky top-0 z-20 backdrop-blur-md text-[11px] uppercase tracking-wider font-bold shadow-sm">
                                    <tr>
                                        <th class="p-4 border-b border-slate-200 text-center w-12">ល.រ</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-16">រូបថត</th>
                                        <th class="p-4 border-b border-slate-200 w-24 text-indigo-600 font-moul">អត្តលេខ</th>
                                        <th class="p-4 border-b border-slate-200 font-moul text-slate-700">គោត្តនាម និងនាម</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-16">ភេទ</th>
                                        <th class="p-4 border-b border-slate-200 w-32 text-center">ថ្ងៃខែឆ្នាំកំណើត</th>
                                        <th class="p-4 border-b border-slate-200 w-32 text-center">ថ្នាក់រៀន</th>
                                        <th class="p-4 border-b border-slate-200 w-40">ទីលំនៅ (ភូមិ/ឃុំ)</th>
                                        <th class="p-4 border-b border-slate-200 text-center w-36 no-print">សកម្មភាព</th>
                                    </tr>
                                </thead>
                                <tbody id="studentsTableBody" class="divide-y divide-slate-100 text-[13px] text-slate-700">
                                    <tr>
                                        <td colspan="9" class="p-20 text-center text-slate-400 font-bold">
                                            <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-indigo-400"></i><br>កំពុងរៀបចំទិន្នន័យ...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div id="stuModalContainer"></div>
                </div> 
            </div>
        `;

        if (typeof window.renderStudentModalTemplate === 'function') window.renderStudentModalTemplate();
        
        // 🔴 ១. គូរតារាងភ្លាមៗដោយប្រើទិន្នន័យក្នុង Memory (ដើម្បីឱ្យលោតឈ្មោះសិស្សចេញមកភ្លាម)
        if (typeof window.filterStudents === 'function') {
            window.filterStudents();
        }

        // 🔴 ២. លួចទៅចាប់ទិន្នន័យថ្មីពី Firebase មក Update (Background Sync)
        if (typeof window.fetchStudentsData === 'function') {
            window.fetchStudentsData();
        }

    } catch (error) {
        console.error("មានកំហុសក្នុងការ Load ផ្ទាំងបញ្ជីឈ្មោះសិស្ស:", error);
    }
};

// ==========================================
// ២. មុខងារទាញយកទិន្នន័យសិស្ស (Background Sync)
// ==========================================
window.fetchStudentsData = function() {
    const tbody = document.getElementById("studentsTableBody");
    
    // បើគ្មានទិន្នន័យសោះក្នុង Memory ទើបបង្ហាញពាក្យថា "កំពុងភ្ជាប់ទិន្នន័យ..."
    if ((!window.allStudents || window.allStudents.length === 0) && tbody) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-20 text-center"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mb-2"></i><br>កំពុងភ្ជាប់ទិន្នន័យពី Cloud...</td></tr>`;
    }

    const currentYear = localStorage.getItem('selected_academic_year') || "2026-2027";
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');

    // 🔴 ធានាថា db (Firestore) ពិតជាត្រូវបានភ្ជាប់រួចរាល់ 🔴
    if (typeof db === 'undefined') {
        console.warn("បាត់ការភ្ជាប់ជាមួយ Firebase (db is undefined)។ សូមពិនិត្យឯកសារ firebase-config.js ឡើងវិញ។");
        if(tbody && (!window.allStudents || window.allStudents.length === 0)) {
            tbody.innerHTML = `<tr><td colspan="9" class="p-20 text-center text-rose-500"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>គ្មានការតភ្ជាប់ទៅកាន់មូលដ្ឋានទិន្នន័យទេ!</td></tr>`;
        }
        return;
    }

    try {
        db.collection("students")
          .where("academic_year", "==", currentYear)
          // .where("teacher_id", "==", currentTeacherId)
          .onSnapshot((snapshot) => {
              let stus = [];
              snapshot.forEach((doc) => {
                  stus.push({ fb_id: doc.id, ...doc.data() });
              });

              // ដាក់ចូល Memory របស់ប្រព័ន្ធ
              window.allStudents = stus;
              
              // រក្សាទុកបម្រុងក្នុង LocalStorage
              localStorage.setItem('academic_students', JSON.stringify(stus));

              // 🔴 ធ្វើបច្ចុប្បន្នភាពតារាងភ្លាមៗ ពេលមានការផ្លាស់ប្តូរទិន្នន័យ 🔴
              if (typeof window.filterStudents === 'function') {
                  window.filterStudents();
              }
          }, (error) => {
              console.error("កំហុសក្នុងការស្តាប់ទិន្នន័យ Firebase:", error);
          });
    } catch (e) {
        console.error("កំហុសក្នុងការហៅ Firebase:", e);
    }
};

// ==========================================
// មុខងាររក្សាទុកសិស្សទៅកាន់ Firebase
// ==========================================
window.saveStudentToFirebase = async function(studentData) {
    try {
        // ប្រើអត្តលេខសិស្ស (stu.id) ធ្វើជា Document ID ក្នុង Firebase ដើម្បីងាយស្រួល Update មិនឱ្យស្ទួន
        const docRef = db.collection("students").doc(String(studentData.id));
        
        // set() ជាមួួយ { merge: true } មានន័យថា បើគ្មានវាបង្កើតថ្មី បើមានវាកែប្រែតែចំណុចណាដែលប្តូរ
        await docRef.set({
            ...studentData,
            last_updated: firebase.firestore.FieldValue.serverTimestamp() // កត់ត្រាម៉ោងវិនាទី
        }, { merge: true });

        console.log("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកទៅ Cloud");
        if (typeof showToast === 'function') showToast("រក្សាទុកជោគជ័យ!", "success");

        // 🌟 ចំណាំ: លោកគ្រូមិនចាំបាច់ហៅ fetchStudentsData() ឡើងវិញទេ
        // ព្រោះ onSnapshot ក្នុងជំហានទី៤ វានឹងដឹងថាទិន្នន័យប្តូរ ហើយវាគូរតារាងថ្មីដោយខ្លួនឯងភ្លាមៗ!
        
    } catch (error) {
        console.error("❌ បរាជ័យក្នុងការរក្សាទុក:", error);
        alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យទៅ Cloud");
    }
};

// ==========================================
// ៣. ចម្រោះ និងបង្ហាញទិន្នន័យសិស្ស (Ultra-Safe Filter)
// ==========================================
window.filterStudents = function() {
    const search = (document.getElementById("stuSearchInput")?.value || "").toLowerCase();
    const grade = document.getElementById("stuFilterGrade")?.value || "all";
    const room = document.getElementById("stuFilterRoom")?.value || "all";
    const gender = document.getElementById("stuFilterGender")?.value || "all";
    const status = document.getElementById("stuFilterStatus")?.value || "Active";

    const currentTeacherId = String(window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id') || "").trim();
    const currentYear = String(document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "").trim();

    // បង្ការកំហុស Error ពេល allStudents ជា null
    const baseStudents = window.allStudents || [];

    window.filteredStudents = baseStudents.filter(s => {
        // ការពារកុំឱ្យ Error បើទិន្នន័យខូច
        if (!s || typeof s !== 'object') return false;

        // 🟢 បន្ធូរបន្ថយ៖ អនុញ្ញាតឱ្យសិស្សចាស់ដែលគ្មាន teacher_id និង academic_year លោតចូល 🟢
        const sTeacherId = String(s.teacher_id || "").trim();
        const sYear = String(s.academic_year || "").trim();
        
        const isMyStudent = (sTeacherId === "" || sTeacherId === "undefined" || sTeacherId === currentTeacherId) && 
                            (sYear === "" || sYear === "undefined" || sYear === currentYear);
        
        if (!isMyStudent) return false;

        // 🟢 ការពារ Error ពេលតម្លៃជា undefined ឬ null 🟢
        const safeName = String(s.name || "").toLowerCase();
        const safeId = String(s.id || "").toLowerCase();
        const normGrade = normalizeGrade(s.grade);
        const safeRoom = String(s.room || "").trim();
        const safeGender = String(s.gender || "").trim();
        const safeStatus = String(s.status || "Active").trim();

        // Check Filters
        const matchSearch = search === "" || safeName.includes(search) || safeId.includes(search);
        const matchGrade = grade === "all" || normGrade === grade;
        // អនុញ្ញាតឱ្យសិស្សដែលគ្មានបន្ទប់ លោតចូលទៅ "បន្ទប់ក" ជា Default 
        const matchRoom = room === "all" || safeRoom === room || (room === "«ក»" && safeRoom === ""); 
        const matchGender = gender === "all" || safeGender === gender || (gender === "ប្រុស" && safeGender === "");
        const matchStatus = status === "all" || (status === "Active" ? safeStatus !== "Dropped" : safeStatus === "Dropped");

        return matchSearch && matchGrade && matchRoom && matchGender && matchStatus;
    });

    if (document.getElementById("hdrTotal")) document.getElementById("hdrTotal").innerText = baseStudents.length;
    if (document.getElementById("hdrActive")) document.getElementById("hdrActive").innerText = window.filteredStudents.length;

    window.renderStudentsTable();
};

window.renderStudentsTable = function() {
    const tbody = document.getElementById("studentsTableBody");
    if(!tbody) return;

    if (window.filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="p-24 text-center">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full text-slate-300 text-4xl mb-4"><i class="fa-solid fa-folder-open"></i></div>
                    <h3 class="text-slate-500 font-bold text-lg">មិនមានទិន្នន័យសិស្សទេ!</h3>
                    <p class="text-slate-400 text-sm mt-1">សូមចុចប៊ូតុង "ចុះឈ្មោះថ្មី" ឬ "នាំចូលពី Excel" ឬចុច "ទាញទិន្នន័យថ្មី (Sync)"</p>
                </td>
            </tr>`;
        return;
    }

    const bgColors = ['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400', 'bg-purple-400'];

    let trs = "";
    window.filteredStudents.forEach((stu, index) => {
        let safeGender = String(stu.gender || "ប្រុស").trim();
        let isMale = safeGender !== 'ស្រី';
        let genBadge = isMale 
            ? `<span class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100 shadow-sm whitespace-nowrap"><i class="fa-solid fa-mars mr-1"></i> ប្រុស</span>` 
            : `<span class="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[11px] font-bold border border-pink-100 shadow-sm whitespace-nowrap"><i class="fa-solid fa-venus mr-1"></i> ស្រី</span>`;
        
        let avatarColor = bgColors[index % bgColors.length];
        let avatarContent = `<div class="w-10 h-10 rounded-[0.8rem] mx-auto flex items-center justify-center font-bold text-white text-sm ${avatarColor} shadow-sm border border-black/5 transform -rotate-3 transition duration-300 group-hover:rotate-0">${getAvatarInitial(stu.name)}</div>`;
        if (stu.photo_url && stu.photo_url.trim() !== "") {
            avatarContent = `<img src="${stu.photo_url}" class="w-10 h-10 rounded-[0.8rem] mx-auto object-cover shadow-sm border border-black/5 transform -rotate-3 transition duration-300 group-hover:rotate-0" alt="Photo">`;
        }

        let ageHtml = calculateAge(stu.dob) !== "-" ? `<span class="text-slate-400 text-[12px] ml-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shadow-sm">${calculateAge(stu.dob)}ឆ្នាំ</span>` : "";
        let addrText = formatAddress(stu.curr_village, stu.curr_commune);
        let displayGrade = normalizeGrade(stu.grade); 

        trs += `
            <tr class="hover:bg-slate-50/80 transition-colors group font-bold">
                <td class="p-3 text-center text-slate-400 font-mono text-[12px]">${index + 1}</td>
                <td class="p-3 text-center">${avatarContent}</td>
                <td class="p-3 text-indigo-600 font-mono"><span class="bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100/50">${stu.id || '-'}</span></td>
                <td class="p-3 text-slate-800 font-Siemreap text-[14px]">${stu.name || '-'}</td>
                <td class="p-3 text-center font-Siemreap text-[14px]">${genBadge}</td>
                <td class="p-3 text-center text-slate-600 font-Siemreap text-[14px] whitespace-nowrap">${formatDate(stu.dob)} ${ageHtml}</td>
                <td class="p-3 text-center text-slate-700">
                   <span class="border border-slate-200 px-3 py-1.5 rounded-xl text-[12px] bg-white shadow-sm text-slate-700 whitespace-nowrap">${displayGrade} <span class="text-rose-500 ml-1 font-moul">${stu.room || ''}</span></span> 
                </td>
                <td class="p-3 text-slate-500 text-[12px]"><i class="fa-solid fa-map-pin text-slate-300 mr-1.5"></i> ${addrText}</td>
                <td class="p-3 text-center no-print">
                    <div class="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onclick="window.viewStudentProfile('${stu.id}')" title="ប្រវត្តិរូប" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 transition"><i class="fa-regular fa-eye text-xs"></i></button>
                        <button onclick="window.openStudentModal('${stu.id}')" title="កែប្រែ" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 transition"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
                        <button onclick="window.deleteStudent('${stu.id}')" title="លុប" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition"><i class="fa-regular fa-trash-can text-xs"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = trs;
};

// =========================================
// ៤. មុខងារបន្ថែម, កែប្រែ, លុប (CRUD Operations)
// =========================================
window.handleStudentPhotoUpload = function(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    
    if(previewImg) {
        previewImg.classList.add("opacity-50", "animate-pulse");
        previewImg.classList.remove("hidden");
    }
    if(iconPlaceholder) iconPlaceholder.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 150; 
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); 

            if(previewImg) {
                previewImg.src = compressedBase64;
                previewImg.classList.remove("opacity-50", "animate-pulse");
            }
            document.getElementById("stu_photo_val").value = compressedBase64; 
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.clearStudentForm = function() {
    if (confirm("តើលោកគ្រូអ្នកគ្រូពិតជាចង់សម្អាតទិន្នន័យដែលកំពុងវាយបញ្ចូលនេះមែនទេ?")) {
        document.getElementById("studentForm").reset();
        document.getElementById("stu_photo_val").value = "";
        const previewImg = document.getElementById("stu_photo_preview");
        if(previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
        const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
        if (iconPlaceholder) iconPlaceholder.classList.remove("hidden");
        if (document.getElementById("stu_is_edit").value === "0") {
            document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000);
        }
    }
};

window.openStudentModal = function(id = null) {
    const modal = document.getElementById("studentModal");
    if(!modal) return;
    
    document.getElementById("studentForm").reset();
    document.getElementById("stu_photo_val").value = "";
    
    const previewImg = document.getElementById("stu_photo_preview");
    const iconPlaceholder = document.getElementById("stu_photo_icon_placeholder");
    if(previewImg) { previewImg.src = ""; previewImg.classList.add("hidden"); }
    if(iconPlaceholder) iconPlaceholder.classList.remove("hidden");

    // 🟢 ថាមវន្ត៖ ទាញយកថ្នាក់ និងបន្ទប់ ពី Settings 🟢
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const defaultGrade = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const defaultRoom = sInfo.teacher_room || "«ក»";

    if (id) {
        const stu = window.allStudents.find(s => String(s.id) === String(id));
        if(stu) {
            document.getElementById("stu_is_edit").value = "1";
            document.getElementById("stu_id").value = stu.id;
            document.getElementById("stu_id").readOnly = true;
            document.getElementById("stu_id").classList.add("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            
            document.getElementById("stu_name").value = stu.name || "";
            document.getElementById("stu_gender").value = stu.gender || "ប្រុស";
            document.getElementById("stu_dob").value = stu.dob || ""; 
            
            if (stu.photo_url && stu.photo_url.trim() !== "") {
                if(previewImg) { previewImg.src = stu.photo_url; previewImg.classList.remove("hidden"); }
                if(iconPlaceholder) iconPlaceholder.classList.add("hidden");
                document.getElementById("stu_photo_val").value = stu.photo_url;
            }

            document.getElementById("stu_pob_village").value = stu.pob_village || "";
            document.getElementById("stu_pob_commune").value = stu.pob_commune || "";
            document.getElementById("stu_pob_district").value = stu.pob_district || "";
            document.getElementById("stu_pob_province").value = stu.pob_province || "";

            document.getElementById("stu_curr_village").value = stu.curr_village || "";
            document.getElementById("stu_curr_commune").value = stu.curr_commune || "";
            document.getElementById("stu_curr_district").value = stu.curr_district || "";
            document.getElementById("stu_curr_province").value = stu.curr_province || "";

            document.getElementById("stu_father_name").value = stu.father_name || "";
            document.getElementById("stu_father_job").value = stu.father_job || "";
            document.getElementById("stu_mother_name").value = stu.mother_name || "";
            document.getElementById("stu_mother_job").value = stu.mother_job || "";
            
            document.getElementById("stu_grade").value = normalizeGrade(stu.grade);
            document.getElementById("stu_room").value = stu.room || "«ក»";
            document.getElementById("stu_contact").value = stu.parent_contact || "";
            document.getElementById("stu_status").value = stu.status || "Active";
            
            document.getElementById("stu_poor").checked = !!stu.poor_id;
            document.getElementById("stu_scholar").checked = !!stu.scholarship;
            document.getElementById("stu_disable").checked = !!stu.disability;

            document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex justify-center items-center text-lg shadow-sm border border-amber-100"><i class="fa-solid fa-user-pen"></i></div> កែប្រែព័ត៌មានសិស្ស`;
        }
    } else {
        document.getElementById("stu_is_edit").value = "0";
        document.getElementById("stu_id").value = "STU" + Math.floor(Math.random() * 900000 + 100000); 
        document.getElementById("stu_id").readOnly = false;
        document.getElementById("stu_id").classList.remove("bg-slate-100", "text-slate-500", "cursor-not-allowed");
        
        // 🟢 កំណត់តម្លៃលំនាំដើមពី Settings 🟢
        document.getElementById("stu_grade").value = defaultGrade;
        document.getElementById("stu_room").value = defaultRoom;

        document.getElementById("stuModalTitle").innerHTML = `<div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex justify-center items-center text-lg shadow-sm border border-indigo-100"><i class="fa-solid fa-user-plus"></i></div> ចុះឈ្មោះសិស្សថ្មី`;
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

window.saveStudentData = async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSaveStudent");
    const origText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងរក្សាទុក...`;
    btn.disabled = true;

    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    const isEdit = document.getElementById("stu_is_edit").value === "1";
    const payload = {
        id: document.getElementById("stu_id").value.trim(),
        teacher_id: currentTeacherId,       // 🟢 ចងភ្ជាប់ទិន្នន័យ
        academic_year: currentYear,         // 🟢 ចងភ្ជាប់ទិន្នន័យ
        name: document.getElementById("stu_name").value.trim(),
        gender: document.getElementById("stu_gender").value,
        dob: document.getElementById("stu_dob").value, 
        photo_url: document.getElementById("stu_photo_val").value,
        pob_village: document.getElementById("stu_pob_village").value.trim(),
        pob_commune: document.getElementById("stu_pob_commune").value.trim(),
        pob_district: document.getElementById("stu_pob_district").value.trim(),
        pob_province: document.getElementById("stu_pob_province").value.trim(),
        curr_village: document.getElementById("stu_curr_village").value.trim(),
        curr_commune: document.getElementById("stu_curr_commune").value.trim(),
        curr_district: document.getElementById("stu_curr_district").value.trim(),
        curr_province: document.getElementById("stu_curr_province").value.trim(),
        father_name: document.getElementById("stu_father_name").value.trim(),
        father_job: document.getElementById("stu_father_job").value.trim(),
        mother_name: document.getElementById("stu_mother_name").value.trim(),
        mother_job: document.getElementById("stu_mother_job").value.trim(),
        grade: normalizeGrade(document.getElementById("stu_grade").value),
        room: document.getElementById("stu_room").value,
        parent_contact: document.getElementById("stu_contact").value.trim(),
        status: document.getElementById("stu_status").value,
        poor_id: document.getElementById("stu_poor").checked,
        scholarship: document.getElementById("stu_scholar").checked,
        disability: document.getElementById("stu_disable").checked
    };

    setTimeout(() => {
        if (isEdit) {
            const idx = window.allStudents.findIndex(s => String(s.id) === payload.id);
            if(idx > -1) window.allStudents[idx] = payload;
            else window.allStudents.push(payload); 
        } else {
            const exists = window.allStudents.find(s => String(s.id) === payload.id);
            if (exists) { payload.id = payload.id + "_" + Math.floor(Math.random() * 1000); }
            window.allStudents.unshift(payload);
        }

        try { localStorage.setItem('academic_students', JSON.stringify(window.allStudents)); } 
        catch(ex) {
            alert("ទំហំផ្ទុកពេញ! សូមសម្អាតទិន្នន័យ (Clear Cache) ឬកាត់បន្ថយទំហំរូបថត។");
            btn.innerHTML = origText; btn.disabled = false; return;
        }

        window.filterStudents();
        document.getElementById("studentModal").classList.replace("flex", "hidden");
        if(typeof showToast === 'function') showToast("✅ រក្សាទុកព័ត៌មានសិស្សបានជោគជ័យ!");

        btn.innerHTML = origText; btn.disabled = false;
        
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof window.apiPost === 'function') { 
            window.apiPost("saveStudent", payload).catch(console.error); 
        }
    }, 500); 
};

window.deleteStudent = function(id) {
    if(confirm("⚠️ តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបសិស្សនេះចេញពីបញ្ជីមែនទេ?")) {
        window.allStudents = window.allStudents.filter(s => String(s.id) !== String(id));
        localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
        window.filterStudents();
        if(typeof showToast === 'function') showToast("🗑️ បានលុបសិស្សចេញពីបញ្ជីដោយជោគជ័យ!");
        
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof window.apiPost === 'function') {
             window.apiPost("deleteStudent", { id: id }).catch(e => console.error("Cloud Delete Failed:", e));
        }
    }
};

window.syncStudentsToCloud = async function(btnEl) {
    if (typeof window.apiPost !== 'function') return alert("❌ មុខងារតភ្ជាប់ API មិនទាន់ដំណើរការទេ!");
    if (window.allStudents.length === 0) return alert("⚠️ មិនមានទិន្នន័យសិស្សសម្រាប់រក្សាទុកទេ!");

    let origText = "";
    if (btnEl) { origText = btnEl.innerHTML; btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`; btnEl.disabled = true; }

    try {
        const res = await window.apiPost("saveStudentsBatch", window.allStudents);
        if (res && res.status === "success") {
            if (typeof showToast === 'function') showToast("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Cloud ជោគជ័យ!");
            else alert("✅ ទិន្នន័យសិស្សត្រូវបានរក្សាទុកចូល Cloud ជោគជ័យ!");
        } else { throw new Error(res.message || "Unknown error"); }
    } catch (error) {
        console.error("Cloud Sync Error:", error); alert("❌ បរាជ័យក្នុងការតភ្ជាប់ទៅ Cloud! សូមពិនិត្យមើលអ៊ីនធឺណិត។");
    } finally {
        if (btnEl) { btnEl.innerHTML = origText; btnEl.disabled = false; }
    }
};

// ==========================================
// ៥. មុខងារមើលប្រវត្តិរូបសិស្ស (View Profile - Fixed Alert & Modal)
// ==========================================
window.viewStudentProfile = function(id) {
    try {
        const modal = document.getElementById("studentProfileModal");
        const stu = window.allStudents.find(s => String(s.id) === String(id));
        
        if (!modal) {
            alert("⚠️ រកមិនឃើញផ្ទាំង Modal ប្រវត្តិរូបសិស្ស (studentProfileModal) ក្នុងប្រព័ន្ធទេ!");
            return;
        }
        
        if (!stu) {
            alert("សូមអភ័យទោស រកមិនឃើញទិន្នន័យសិស្សនេះទេ!");
            return;
        }

        if (stu.photo_url && stu.photo_url.trim() !== "") {
            document.getElementById("profAvatar").innerHTML = `<img src="${stu.photo_url}" class="w-full h-full object-cover">`;
        } else {
            document.getElementById("profAvatar").innerHTML = `<span class="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 font-bold">${getAvatarInitial(stu.name)}</span>`;
        }
        
        document.getElementById("profName").textContent = stu.name || "-";
        document.getElementById("profId").textContent = "ID: " + (stu.id || "-");
        document.getElementById("profGender").innerHTML = stu.gender === 'ស្រី' ? '<span class="text-pink-600">ស្រី</span>' : '<span class="text-blue-600">ប្រុស</span>';
        
        let dobStr = formatDate(stu.dob);
        let age = calculateAge(stu.dob);
        document.getElementById("profDob").textContent = `${dobStr} ${age !== "-" ? `(${age}ឆ្នាំ)` : ''}`;
        
        document.getElementById("profGrade").innerHTML = `${normalizeGrade(stu.grade)} <span class="text-rose-500 ml-1 font-moul">${stu.room || ''}</span>`;
        
        let fatherStr = stu.father_name ? `${stu.father_name} <span class="text-[10px] text-slate-500 font-normal">(${stu.father_job || 'មិនបញ្ជាក់'})</span>` : '-';
        let motherStr = stu.mother_name ? `${stu.mother_name} <span class="text-[10px] text-slate-500 font-normal">(${stu.mother_job || 'មិនបញ្ជាក់'})</span>` : '-';
        document.getElementById("profParents").innerHTML = `${fatherStr}<br>${motherStr}`;
        document.getElementById("profContact").textContent = stu.parent_contact || 'មិនមានទិន្នន័យ';
        
        let addressArr = [];
        if(stu.curr_village) addressArr.push(`ភូមិ${stu.curr_village}`);
        if(stu.curr_commune) addressArr.push(`ឃុំ${stu.curr_commune}`);
        if(stu.curr_district) addressArr.push(`ស្រុក${stu.curr_district}`);
        if(stu.curr_province) addressArr.push(`ខេត្ត${stu.curr_province}`);
        document.getElementById("profAddress").textContent = addressArr.length > 0 ? addressArr.join(" ") : 'មិនមានទិន្នន័យ';

        let badges = [];
        const statusEl = document.getElementById("profStatusText");
        
        if (stu.status === "Active") {
            statusEl.textContent = "កំពុងសិក្សា"; statusEl.className = "text-[13px] md:text-sm font-bold text-emerald-600";
        } else {
            statusEl.textContent = "បោះបង់ការសិក្សា"; statusEl.className = "text-[13px] md:text-sm font-bold text-rose-500";
            badges.push(`<span class="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-rose-100"><i class="fa-solid fa-ban mr-1"></i> បោះបង់ការសិក្សា</span>`);
        }
        
        if (stu.poor_id) badges.push(`<span class="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-amber-100"><i class="fa-solid fa-star mr-1"></i> ប័ណ្ណក្រីក្រ</span>`);
        if (stu.scholarship) badges.push(`<span class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-indigo-100"><i class="fa-solid fa-award mr-1"></i> អាហារូបករណ៍</span>`);
        if (stu.disability) badges.push(`<span class="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-orange-100"><i class="fa-solid fa-wheelchair mr-1"></i> ពិការភាព</span>`);
        
        document.getElementById("profBadges").innerHTML = badges.join("");
        modal.classList.remove("hidden"); 
        modal.classList.add("flex");
    } catch (error) { 
        console.error("View Profile Error:", error); 
        alert("មានបញ្ហាក្នុងការបង្ហាញប្រវត្តិរូបសិស្ស សូមព្យាយាមម្តងទៀត!"); 
    }
};

// ==========================================
// ៦. មុខងារបង្កើត UI ទម្រង់ Modal (Render HTML & Profile Modal)
// ==========================================
window.renderStudentModalTemplate = function() {
    const mContainer = document.getElementById("stuModalContainer");
    if(!mContainer) return;

    let gradesOptions = "";
    for(let i=1; i<=12; i++) {
        const khGrade = toKhmerNum(i.toString());
        gradesOptions += `<option value="ថ្នាក់ទី ${khGrade}">ថ្នាក់ទី ${khGrade}</option>`;
    }

    mContainer.innerHTML = `
        <!-- ទម្រង់ចុះឈ្មោះ និងកែប្រែ -->
        <div id="studentModal" class="fixed inset-0 z-[6000] bg-slate-900/70 backdrop-blur-md hidden items-center justify-center p-2 md:p-6 fade-in font-siemreap overflow-y-auto custom-scrollbar">
            <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col my-auto transform transition-all max-h-[95vh]">
                
                <div class="px-6 md:px-10 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex justify-between items-center shrink-0 sticky top-0 z-30">
                    <h3 id="stuModalTitle" class="font-moul text-lg md:text-xl text-slate-800 flex items-center gap-3"></h3>
                    <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="w-10 h-10 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full flex items-center justify-center transition hover:scale-105"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <div class="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    <form id="studentForm" onsubmit="window.saveStudentData(event)">
                        <input type="hidden" id="stu_is_edit" value="0">
                        <input type="hidden" id="stu_photo_val" value="">
                        
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                            <div class="col-span-1 lg:col-span-4 space-y-5 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition duration-300">
                                <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                                <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-regular fa-address-card text-indigo-500 text-lg"></i> ១. ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                                
                                <div class="flex flex-col items-center justify-center mb-6 pb-6 border-b border-slate-100">
                                    <div class="w-28 h-36 relative mb-3 cursor-pointer border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 transition-all shadow-inner hover:shadow-md transform hover:-translate-y-1" onclick="document.getElementById('stu_photo_file').click()">
                                        <img id="stu_photo_preview" src="" class="w-full h-full object-cover hidden" alt="Student Photo">
                                        <div id="stu_photo_icon_placeholder" class="text-slate-400 text-center flex flex-col items-center">
                                            <div class="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-2 text-indigo-400"><i class="fa-solid fa-camera"></i></div>
                                            <span class="text-[10px] font-bold tracking-wide">រូបថតសិស្ស</span>
                                        </div>
                                    </div>
                                    <input type="file" id="stu_photo_file" accept="image/png, image/jpeg" class="hidden" onchange="window.handleStudentPhotoUpload(this)">
                                </div>

                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">អត្តលេខសិស្ស (ID) *</label><input type="text" id="stu_id" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition text-indigo-700 shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">គោត្តនាម និងនាម *</label><input type="text" id="stu_name" required placeholder="ឧ. ហឿន មីនា" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-moul outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition shadow-inner"></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ភេទ *</label><select id="stu_gender" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition cursor-pointer shadow-inner"><option value="ប្រុស">ប្រុស</option><option value="ស្រី">ស្រី</option></select></div>
                                <div><label class="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត</label><input type="date" id="stu_dob" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition cursor-pointer shadow-inner"></div>
                            </div>

                            <div class="col-span-1 lg:col-span-8 space-y-6">
                                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition duration-300">
                                    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                    <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-solid fa-map-location-dot text-blue-500 text-lg"></i> ២. ទីកន្លែងកំណើត និងទីលំនៅ</h4>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ភូមិ (កំណើត)</label><input type="text" id="stu_pob_village" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ឃុំ (កំណើត)</label><input type="text" id="stu_pob_commune" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ស្រុក (កំណើត)</label><input type="text" id="stu_pob_district" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-slate-400 mb-1.5 block">ខេត្ត (កំណើត)</label><input type="text" id="stu_pob_province" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ភូមិ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_village" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ឃុំ (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_commune" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ស្រុក (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_district" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="text-[10px] font-bold text-blue-500 mb-1.5 block">ខេត្ត (បច្ចុប្បន្ន)</label><input type="text" id="stu_curr_province" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                </div>

                                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition duration-300">
                                    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                                    <h4 class="font-moul text-[13px] text-slate-800 border-b border-slate-100 pb-4 mb-5 flex items-center gap-3"><i class="fa-solid fa-people-roof text-emerald-500 text-lg"></i> ៣. អាណាព្យាបាល និងការសិក្សា</h4>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឈ្មោះឪពុក</label><input type="text" id="stu_father_name" placeholder="ឈ្មោះឪពុក" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">មុខរបរឪពុក</label><input type="text" id="stu_father_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ឈ្មោះម្ដាយ</label><input type="text" id="stu_mother_name" placeholder="ឈ្មោះម្ដាយ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div class="col-span-2 md:col-span-1"><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">មុខរបរម្ដាយ</label><input type="text" id="stu_mother_job" placeholder="មុខរបរ" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ថ្នាក់រៀន</label><select id="stu_grade" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition cursor-pointer text-indigo-700 shadow-inner">${gradesOptions}</select></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">បន្ទប់</label><select id="stu_room" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition cursor-pointer text-indigo-700 shadow-inner"><option value="«ក»">«ក»</option><option value="«ខ»">«ខ»</option><option value="«គ»">«គ»</option><option value="«ឃ»">«ឃ»</option></select></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">លេខទូរស័ព្ទ</label><input type="text" id="stu_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition shadow-inner"></div>
                                        <div><label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ស្ថានភាព</label><select id="stu_status" class="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition cursor-pointer shadow-inner text-emerald-700"><option value="Active">កំពុងសិក្សា</option><option value="Dropped">បោះបង់</option></select></div>
                                    </div>
                                </div>
                                
                                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-start gap-4 shadow-sm mt-6">
                                    <div class="text-[14px] font-moul text-amber-700 flex items-center gap-2 mb-2"><i class="fa-solid fa-star"></i> ស្ថានភាពពិសេស</div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        <!-- Card 1 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_poor" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-hand-holding-dollar text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">មានប័ណ្ណក្រីក្រ</span>
                                            </div>
                                        </label>
                                        <!-- Card 2 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_scholar" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-award text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">អាហារូបករណ៍</span>
                                            </div>
                                        </label>
                                        <!-- Card 3 -->
                                        <label class="relative cursor-pointer w-full">
                                            <input type="checkbox" id="stu_disable" class="peer sr-only check-card-input">
                                            <div class="check-card-content w-full p-4 bg-white border-2 border-slate-100 rounded-2xl transition duration-300 shadow-sm flex items-center gap-4 hover:border-indigo-200">
                                                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 peer-checked:bg-indigo-100 transition"><i class="fa-solid fa-wheelchair text-lg check-icon opacity-50 transform scale-90 transition"></i></div>
                                                <span class="font-bold text-sm text-slate-700">ពិការភាព</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col-reverse md:flex-row justify-between items-center pt-6 mt-6 border-t border-slate-200 gap-4 sticky bottom-0 bg-slate-50/90 pb-4 backdrop-blur-md z-30">
                            <button type="button" onclick="window.clearStudentForm()" class="w-full md:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600 rounded-2xl text-[14px] font-bold transition flex justify-center items-center gap-2 shadow-sm"><i class="fa-solid fa-eraser"></i> សម្អាត</button>
                            <div class="flex gap-3 w-full md:w-auto">
                                <button type="button" onclick="document.getElementById('studentModal').classList.replace('flex','hidden')" class="flex-1 md:flex-none px-6 py-3.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-2xl text-[14px] font-bold transition">បោះបង់</button>
                                <button type="submit" id="btnSaveStudent" class="flex-[2] md:flex-none px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-[14px] font-bold shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1 flex justify-center items-center gap-2"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុកព័ត៌មាន</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 🟢 ផ្ទាំង Modal ប្រវត្តិរូបសិស្ស (Student Profile Modal HTML) 🟢 -->
        <div id="studentProfileModal" class="fixed inset-0 z-[7000] bg-slate-900/80 backdrop-blur-md hidden items-center justify-center p-4 md:p-6 fade-in font-siemreap overflow-y-auto custom-scrollbar">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 relative transform transition-all my-auto">
                <button onclick="document.getElementById('studentProfileModal').classList.replace('flex','hidden')" class="absolute top-5 right-5 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition backdrop-blur-md z-30 shadow-sm hover:scale-105"><i class="fa-solid fa-xmark text-lg"></i></button>
                <div class="h-32 md:h-44 bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-10"></div>
                    <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="absolute -top-20 -left-20 w-48 h-48 bg-sky-300/20 rounded-full blur-3xl"></div>
                </div>
                <div class="px-6 md:px-10 pb-8 md:pb-10 relative">
                    <div class="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20 mb-8">
                        <div id="profAvatar" class="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] border-[6px] border-white shadow-xl flex items-center justify-center text-5xl font-bold text-indigo-500 overflow-hidden relative z-10 shrink-0 transform rotate-3 hover:rotate-0 transition duration-300"></div>
                        <div class="text-center md:text-left flex-1 mt-2 md:mt-0 mb-2">
                            <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                                <h3 id="profName" class="text-2xl md:text-3xl font-moul text-slate-800 drop-shadow-sm leading-tight"></h3>
                                <span id="profId" class="text-xs md:text-sm text-indigo-600 font-bold font-mono bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 inline-block w-max mx-auto md:mx-0 shadow-sm"></span>
                            </div>
                            <div id="profBadges" class="flex justify-center md:justify-start flex-wrap gap-2"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div class="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-100 hover:shadow-md transition duration-300 hover:border-indigo-200 group">
                            <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-graduation-cap text-indigo-400"></i> ព័ត៌មានសិក្សា</h4>
                            <div class="space-y-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-layer-group"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ថ្នាក់រៀនបច្ចុប្បន្ន</p><p id="profGrade" class="text-[13px] md:text-sm font-bold text-slate-800"></p></div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-calendar-check"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ស្ថានភាពសិក្សា</p><p id="profStatusText" class="text-[13px] md:text-sm font-bold text-emerald-600"></p></div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-100 hover:shadow-md transition duration-300 hover:border-pink-200 group">
                            <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-user text-pink-400"></i> ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                            <div class="space-y-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-pink-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-venus-mars"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ភេទ</p><p id="profGender" class="text-[13px] md:text-sm font-bold text-slate-800"></p></div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-orange-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-regular fa-calendar"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ថ្ងៃខែឆ្នាំកំណើត</p><p id="profDob" class="text-[13px] md:text-sm font-bold text-slate-800 font-mono"></p></div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-100 hover:shadow-md transition duration-300 hover:border-amber-200 group md:col-span-2">
                            <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-address-book text-amber-400"></i> ទំនាក់ទំនង និងគ្រួសារ</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-people-roof"></i></div>
                                    <div class="w-full">
                                        <p class="text-[10px] text-slate-400 font-bold mb-0.5">ឪពុក / ម្ដាយ</p>
                                        <p id="profParents" class="text-[13px] md:text-sm font-bold text-slate-800 leading-snug"></p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0"><i class="fa-solid fa-phone"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">លេខទូរស័ព្ទអាណាព្យាបាល</p><p id="profContact" class="text-[13px] md:text-sm font-bold text-slate-800 font-mono"></p></div>
                                </div>
                                <div class="flex items-start gap-4 md:col-span-2 mt-2 pt-4 border-t border-slate-200/60">
                                    <div class="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition"><i class="fa-solid fa-map-location-dot"></i></div>
                                    <div><p class="text-[10px] text-slate-400 font-bold mb-0.5">ទីលំនៅបច្ចុប្បន្ន</p><p id="profAddress" class="text-[12px] md:text-[13px] font-bold text-slate-700 leading-relaxed"></p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};


// ==========================================
// 🟢 មុខងារស្នូលសម្រាប់បញ្ជា Print លើទូរស័ព្ទដៃ (ការពារការលោតបាត់ពេលសារ៉េក្រដាស) 🟢
// ==========================================
window.executeMobilePrint = function(htmlContent, isLandscape = false) {
    let oldPrintArea = document.getElementById('global-mobile-print-area');
    if (oldPrintArea) oldPrintArea.remove();

    const printArea = document.createElement('div');
    printArea.id = 'global-mobile-print-area';
    
    const pageCSS = isLandscape 
        ? `@page { size: A4 landscape; margin: 10mm; }` 
        : `@page { size: A4 portrait; margin: 12mm; }`;

    printArea.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap:wght@400;700&display=swap');
            
            @media print {
                body > *:not(#global-mobile-print-area) { display: none !important; }
                body { background: white !important; margin: 0 !important; padding: 0 !important; }
                #global-mobile-print-area { display: block !important; width: 100%; background: white; z-index: 999999; }
                ${pageCSS}
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            
            @media screen { #global-mobile-print-area { display: none !important; } }
            
            .print-wrapper {
                background: white; color: #0f172a; width: 100%; margin: 0 auto;
                font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; line-height: 1.4;
                max-width: ${isLandscape ? '277mm' : '190mm'};
            }
        </style>
        <div class="print-wrapper">
            ${htmlContent}
        </div>
    `;

    document.body.appendChild(printArea);

    setTimeout(() => {
        window.print();
        // មិនមានការប្រើប្រាស់ setTimeout ដើម្បីលុបចោលទីនេះទេ ការពារកុំឱ្យលោតបាត់ពេលសារ៉េក្រដាស
    }, 800); 
};

// ==========================================
// មុខងារបោះពុម្ពបញ្ជីរាយនាមសិស្ស (សង្ខេប - បញ្ឈរ A4)
// ==========================================
window.printStudentList = function() {
    if (!window.filteredStudents || window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.......................";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim();
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    const teacherName = window.AuthState ? window.AuthState.teacherName : sInfo.teacher_name || ".......................";
    const principalName = sInfo.principal_name || ".......................";
    
    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    locationStr = locationStr.replace(/,+$/, '').trim();

    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") : "";

    // ទាញយកព័ត៌មានថ្នាក់ដែលគ្រូគ្រប់គ្រងពីការកំណត់ (appSettings)
    const defaultLevel = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const defaultRoom = sInfo.teacher_room || "«ក»";

    // ទាញយកតម្លៃដែលគ្រូជ្រើសរើស តែបើសិនអត់ជ្រើសរើស (ឬ Error) ទាញយកថ្នាក់ដែលគ្រូគ្រប់គ្រង
    const filterGrade = document.getElementById("stuFilterGrade")?.value || defaultLevel;
    const filterRoom = document.getElementById("stuFilterRoom")?.value || defaultRoom;
    
    // បង្ហាញចំណងជើងរង (SubTitle) តាមថ្នាក់ដែលគ្រូគ្រប់គ្រង
    let subTitle = (filterGrade === "all" && filterRoom === "all") 
        ? "សិស្សទាំងអស់សរុបក្នុងសាលា" 
        : `${filterGrade === "all" ? "គ្រប់ថ្នាក់" : filterGrade} ${filterRoom === "all" ? "" : filterRoom}`.trim();

    let total = window.filteredStudents.length;
    let female = 0;

    let rowsHtml = "";
    window.filteredStudents.forEach((stu, idx) => {
        let isF = stu.gender === 'ស្រី';
        if (isF) female++;

        let dobStr = typeof formatDate === 'function' ? formatDate(stu.dob) : stu.dob;
        let remark = stu.status === "Dropped" ? "បោះបង់" : "";
        if (stu.poor_id) remark += (remark?"/":"") + "ក្រីក្រ";
        if (stu.scholarship) remark += (remark?"/":"") + "អាហារូបករណ៍";
        
        let village = stu.curr_village ? stu.curr_village.replace('ភូមិ', '').trim() : '';
        let commune = stu.curr_commune ? stu.curr_commune.replace('ឃុំ', '').replace('សង្កាត់', '').trim() : '';
        let addrText = village && commune ? `${village}, ${commune}` : (village || commune || '-');
        
        let genColor = isF ? '#e11d48' : '#1e3a8a';
        let bgRow = idx % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

        rowsHtml += `
            <tr style="height: 30px; ${bgRow}">
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(idx + 1) : idx + 1}</td>
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${stu.id || ''}</td>
                <td style="text-align: left; padding-left: 8px; font-weight: bold; border: 1px solid #00204e; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${stu.name || ''}</td>
                <td style="text-align: center; font-weight: bold; color: ${genColor}; border: 1px solid #00204e;">${isF ? 'ស' : 'ប'}</td>
                <td style="text-align: center; border: 1px solid #00204e; padding: 4px;">${dobStr}</td>
                <td style="text-align: left; padding-left: 8px; border: 1px solid #00204e; font-size: 10pt;">${addrText}</td>
                <td style="text-align: center; border: 1px solid #00204e; font-family: 'Battambang', sans-serif;">${stu.parent_contact || '-'}</td>
                <td style="text-align: center; color: #dc2626; font-size: 9pt; border: 1px solid #00204e;">${remark}</td>
            </tr>
        `;
    });

    const contentHtml = `
        <table style="width: 105%; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
                <td style="text-align: left; width: 65%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; line-height: 1.6; vertical-align: top;">
                    <br><br>
                    ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}
                    <span style="font-size: 12pt; display: block; margin-top: 8px;">${schoolName}</span>
                </td>
                <td style="text-align: center; width: 40%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; line-height: 1.5; vertical-align: top;">
                    ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                        <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                        <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                        <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                    </div>
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin: 10px 0 20px 0;">
            <h2 style="font-family: 'Khmer OS Muol Light', 'Moul', serif; margin: 0 0 8px 0; font-size: 16pt;">បញ្ជីរាយនាមសិស្សានុសិស្ស</h2>
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">${subTitle} | ឆ្នាំសិក្សា ${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 11pt; border: 1.5px solid #0f172a; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="width: 5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569; padding: 8px 4px;">ល.រ</th>
                    <th style="width: 12%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">អត្តលេខ</th>
                    <th style="width: 23%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">គោត្តនាម និងនាម</th>
                    <th style="width: 6%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ភេទ</th>
                    <th style="width: 14%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th style="width: 18%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th style="width: 12%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">លេខទូរស័ព្ទ</th>
                    <th style="width: 10%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 10pt; font-weight: normal; border: 1px solid #475569;">ផ្សេងៗ</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #0f172a; margin-bottom: 30px; font-weight: bold;">
            <tr>
                <td style="width: 40%; padding: 6px 0;">បញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span style="color: #2563eb; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total}</span></td>
                <td style="width: 25%;">សិស្សសរុប៖ <span style="color: #0f172a; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total} នាក់</span></td>
                <td style="width: 20%; text-align: right;">ស្រី៖ <span style="color: #e11d48; margin-left:10px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(female) : female} នាក់</span></td>
            </tr>
        </table>
        
        <table style="width: 100%; text-align: center; page-break-inside: avoid;">
            <tr>
                <td style="width: 30%"><br>
                    <p style="margin: 0 0 5px 0; color: transparent;">.</p>
                    <p style="margin: 0 0 5px 0;">បានឃើញ និងឯកភាព</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 5px 0 70px 0;">នាយកសាលា</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 0;">${principalName}</p>
                </td>
                <td style="width: 70%">
                    <p style="margin: 0 0 5px 0;">${lunarDateStr}</p>
                    <p style="margin: 0 0 5px 0;">${solarDateStr}</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 5px 0 70px 0;">គ្រូប្រចាំថ្នាក់</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 0;">${teacherName}</p>
                </td>
            </tr>
        </table>
    `;

    window.executeMobilePrint(contentHtml, false);
};


// ==========================================
// មុខងារបោះពុម្ពបញ្ជីរាយនាមសិស្ស (លម្អិត - ផ្តេក A4 Landscape)
// ==========================================
window.printFullStudentList = function() {
    if (!window.filteredStudents || window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.......................";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim();
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    const teacherName = window.AuthState ? window.AuthState.teacherName : sInfo.teacher_name || ".......................";
    const principalName = sInfo.principal_name || ".......................";
    
    // 🟢 ទាញយកកាលបរិច្ឆេទពីប្រព័ន្ធកំណត់ថ្មី (Settings Panel) 🟢
    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim();
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    locationStr = locationStr.replace(/,+$/, '').trim();

    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") : "";

    // ទាញយកព័ត៌មានថ្នាក់ដែលគ្រូគ្រប់គ្រងពីការកំណត់ (appSettings)
    const defaultLevel = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const defaultRoom = sInfo.teacher_room || "«ក»";

    // ទាញយកតម្លៃដែលគ្រូជ្រើសរើស តែបើសិនអត់ជ្រើសរើស (ឬ Error) ទាញយកថ្នាក់ដែលគ្រូគ្រប់គ្រង
    const filterGrade = document.getElementById("stuFilterGrade")?.value || defaultLevel;
    const filterRoom = document.getElementById("stuFilterRoom")?.value || defaultRoom;
    
    // បង្ហាញចំណងជើងរង (SubTitle) តាមថ្នាក់ដែលគ្រូគ្រប់គ្រង
    let subTitle = (filterGrade === "all" && filterRoom === "all") 
        ? "សិស្សទាំងអស់សរុបក្នុងសាលា" 
        : `${filterGrade === "all" ? "គ្រប់ថ្នាក់" : filterGrade} ${filterRoom === "all" ? "" : filterRoom}`.trim();

    let total = window.filteredStudents.length;
    let female = 0;

    const formatFullAddress = (v, c, d, p) => {
        let arr = [];
        if(v) arr.push(`${v}`);
        if(c) arr.push(`${c}`);
        if(d) arr.push(`${d}`);
        if(p) arr.push(`${p}`);
        return arr.length > 0 ? arr.join(", ") : "-";
    };

    let rowsHtml = "";
    window.filteredStudents.forEach((stu, idx) => {
        let isF = stu.gender === 'ស្រី';
        if (isF) female++;

        let dobStr = typeof formatDate === 'function' ? formatDate(stu.dob) : stu.dob;
        let remark = stu.status === "Dropped" ? "បោះបង់" : "";
        if (stu.poor_id) remark += (remark?"\n":"") + "ក្រីក្រ";
        if (stu.scholarship) remark += (remark?"\n":"") + "អាហារូបករណ៍";

        let pobText = formatFullAddress(stu.pob_village, stu.pob_commune, stu.pob_district, stu.pob_province);
        let currText = formatFullAddress(stu.curr_village, stu.curr_commune, stu.curr_district, stu.curr_province);
        let fatherText = `${stu.father_name || '-'}${stu.father_job ? `<br><span style="color:#64748b; font-size:7pt; font-weight:normal;">(${stu.father_job})</span>` : ''}`;
        let motherText = `${stu.mother_name || '-'}${stu.mother_job ? `<br><span style="color:#64748b; font-size:7pt; font-weight:normal;">(${stu.mother_job})</span>` : ''}`;

        let genColor = isF ? '#e11d48' : '#1e3a8a';
        let bgRow = idx % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

        rowsHtml += `
            <tr style="height: 35px; ${bgRow}">
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(idx + 1) : idx + 1}</td>
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${stu.id || ''}</td>
                <td style="text-align: left; padding-left: 6px; font-weight: bold; border: 1px solid #475569; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">${stu.name || ''}</td>
                <td style="text-align: center; font-weight: bold; color: ${genColor}; border: 1px solid #475569; padding: 2px;">${isF ? 'ស' : 'ប'}</td>
                <td style="text-align: center; border: 1px solid #475569; padding: 2px;">${dobStr}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; border: 1px solid #475569;">${pobText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; font-weight: bold; border: 1px solid #475569;">${fatherText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; font-weight: bold; border: 1px solid #475569;">${motherText}</td>
                <td style="text-align: left; padding-left: 4px; font-size: 9pt; border: 1px solid #475569;">${currText}</td>
                <td style="text-align: center; font-size: 10pt; font-family: 'Battambang', sans-serif; border: 1px solid #475569; padding: 2px;">${stu.parent_contact || '-'}</td>
                <td style="text-align: center; color: #dc2626; font-size: 8pt; border: 1px solid #475569; white-space: pre-line;">${remark}</td>
            </tr>
        `;
    });

    const contentHtml = `
        <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
                <td style="text-align: left; width: 65%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; line-height: 1.6; vertical-align: top;">
                    <br><br>
                    ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}
                    <span style="font-size: 12pt; display: block; margin-top: 8px;">${schoolName}</span>
                </td>
                <td style="text-align: center; width: 35%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; line-height: 1.5; vertical-align: top;">
                    ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                        <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                        <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                        <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
                    </div>
                </td>
            </tr>
        </table>
        
        <div style="text-align: center; margin: 5px 0 15px 0;">
            <h2 style="font-family: 'Khmer OS Muol Light', 'Moul', serif; margin: 0 0 6px 0; font-size: 15pt;">បញ្ជីព័ត៌មានសិស្ស</h2>
            <p style="margin: 0; font-size: 12pt; font-weight: bold;">${subTitle} | ឆ្នាំសិក្សា ${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; border: 1.5px solid #0f172a; margin-bottom: 15px; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="width: 3.5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569; padding: 6px 2px;">ល.រ</th>
                    <th style="width: 8%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">អត្តលេខ</th>
                    <th style="width: 14%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">គោត្តនាម និងនាម</th>
                    <th style="width: 4%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ភេទ</th>
                    <th style="width: 9%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ទីកន្លែងកំណើត</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ឈ្មោះឪពុក</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ឈ្មោះម្ដាយ</th>
                    <th style="width: 13%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ទីលំនៅបច្ចុប្បន្ន</th>
                    <th style="width: 9.5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">លេខទូរស័ព្ទ</th>
                    <th style="width: 5%; background: #e2e8f0; font-family: 'Khmer OS Muol Light', 'Moul', sans-serif; font-size: 9.5pt; font-weight: normal; border: 1px solid #475569;">ផ្សេងៗ</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        <table style="width: 60%; border-collapse: collapse; border-top: 2px solid #0f172a; margin-bottom: 20px; font-weight: bold;">
            <tr>
                <td style="width: 40%; text-align: left; padding: 4px 0;">បញ្ឈប់បញ្ជីត្រឹមលេខរៀងទី <span style="color: #2563eb; margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total}</span></td>
                <td style="width: 30%; text-align: left;">សិស្សសរុប៖ <span style="margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(total) : total} នាក់</span></td>
                <td style="width: 30%; text-align: right;">ស្រី៖ <span style="color: #e11d48; margin-left: 5px;">${typeof window.toKhmerNum === 'function' ? window.toKhmerNum(female) : female} នាក់</span></td>
            </tr>
        </table>
        
        <table style="width: 100%; text-align: center; page-break-inside: avoid;">
            <tr>
                <td style="width: 40%; vertical-align: top;">
                    <p style="margin: 0 0 4px 0; color: transparent;">.</p>
                    <p style="margin: 0 0 4px 0;">បានឃើញ និងឯកភាព</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 5px 0 60px 0;">នាយកសាលា</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 0;">${principalName}</p>
                </td>
                <td style="width: 60%; vertical-align: top;">
                    <p style="margin: 0 0 4px 0;">${lunarDateStr}</p>
                    <p style="margin: 0 0 4px 0;">${solarDateStr}</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 5px 0 60px 0;">គ្រូប្រចាំថ្នាក់</p>
                    <p style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; margin: 0;">${teacherName}</p>
                </td>
            </tr>
        </table>
    `;

    window.executeMobilePrint(contentHtml, true);
};

window.downloadStudentTemplate = function() {
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");
    const headers = ["ល.រ", "អត្តលេខ", "គោត្តនាម និងនាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត", "ទីកន្លែងកំណើត(ភូមិ)", "ទីកន្លែងកំណើត(ឃុំ)", "ទីកន្លែងកំណើត(ស្រុក)", "ទីកន្លែងកំណើត(ខេត្ត)", "ទីលំនៅ(ភូមិ)", "ទីលំនៅ(ឃុំ)", "ទីលំនៅ(ស្រុក)", "ទីលំនៅ(ខេត្ត)", "ឈ្មោះឪពុក", "មុខរបរឪពុក", "ឈ្មោះម្ដាយ", "មុខរបរម្ដាយ", "ថ្នាក់រៀន", "បន្ទប់", "ទំនាក់ទំនង", "ប័ណ្ណក្រីក្រ", "អាហារូបករណ៍", "ពិការភាព"];
    const sampleData1 = ["1", "STU10200", "សុខ សាន្ត", "ប្រុស", "20/05/2010", "ព្រែកថ្មី", "ស្អាង", "ស្អាង", "កណ្តាល", "ព្រែកថ្មី", "ស្អាង", "ស្អាង", "កណ្តាល", "សាន សុខ", "កសិករ", "មាស ស្រី", "មេផ្ទះ", "ថ្នាក់ទី ១", "«ក»", "012 345 678", "គ្មាន", "គ្មាន", "គ្មាន"];
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData1]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Import_Template_Full.xlsx");
};

window.importStudentsExcel = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') return alert("សូមភ្ជាប់ Library SheetJS ជាមុនសិន!");
    
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const currentYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            let importedCount = 0;
            
            for (let r = 1; r < rows.length; r++) {
                const rowData = rows[r];
                const name = String(rowData[2]).trim();
                if (!name || name === "undefined") continue; 
                const id = String(rowData[1] || `STU${Math.floor(Math.random() * 900000 + 100000)}`).trim();
                const existingIdx = window.allStudents.findIndex(s => String(s.id) === id);
                let rawDob = String(rowData[4] || "").trim();
                if (rawDob && rawDob.includes('/')) {
                    const p = rawDob.split('/');
                    if (p.length === 3) rawDob = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                }
                const newStu = {
                    id: id, 
                    teacher_id: currentTeacherId,       // 🟢 ចងភ្ជាប់ទិន្នន័យ
                    academic_year: currentYear,         // 🟢 ចងភ្ជាប់ទិន្នន័យ
                    name: name, gender: String(rowData[3] || "ប្រុស").trim(), dob: rawDob, photo_url: "", 
                    pob_village: String(rowData[5] || "").trim(), pob_commune: String(rowData[6] || "").trim(), pob_district: String(rowData[7] || "").trim(), pob_province: String(rowData[8] || "").trim(),
                    curr_village: String(rowData[9] || "").trim(), curr_commune: String(rowData[10] || "").trim(), curr_district: String(rowData[11] || "").trim(), curr_province: String(rowData[12] || "").trim(),
                    father_name: String(rowData[13] || "").trim(), father_job: String(rowData[14] || "").trim(), mother_name: String(rowData[15] || "").trim(), mother_job: String(rowData[16] || "").trim(),
                    grade: normalizeGrade(String(rowData[17] || "ថ្នាក់ទី ១")), room: String(rowData[18] || "«ក»").trim(), parent_contact: String(rowData[19] || "").trim(),
                    poor_id: String(rowData[20]).includes("មាន"), scholarship: String(rowData[21]).includes("មាន"), disability: String(rowData[22]).includes("មាន"), status: "Active"
                };
                if (existingIdx > -1) window.allStudents[existingIdx] = newStu;
                else window.allStudents.push(newStu);
                importedCount++;
            }
            
            localStorage.setItem('academic_students', JSON.stringify(window.allStudents));
            
            const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
            if (sInfo.auto_sync && typeof window.apiPost === 'function') {
                window.apiPost("saveStudentsBatch", window.allStudents).catch(console.error);
            }

            event.target.value = ""; 
            window.filterStudents();
            if(typeof showToast === 'function') showToast(`📥 នាំចូលសិស្សបានសម្រេច ${importedCount} នាក់!`);
            else alert(`នាំចូលសិស្សបានសម្រេច ${importedCount} នាក់!`);
        } catch (error) {
            console.error(error); alert("❌ មានបញ្ហាក្នុងការអានឯកសារ Excel។ សូមប្រាកដថាទម្រង់ឯកសារត្រឹមត្រូវ។");
        }
    };
    reader.readAsArrayBuffer(file);
};

window.exportStudentsExcel = function() {
    if (window.filteredStudents.length === 0) return alert("គ្មានទិន្នន័យសម្រាប់ទាញយកទេ!");
    let tableHtml = `<table border="1"><tr><th>ល.រ</th><th>អត្តលេខ</th><th>គោត្តនាម និងនាម</th><th>ភេទ</th><th>ថ្ងៃខែឆ្នាំកំណើត</th><th>ទីកន្លែងកំណើត(ភូមិ)</th><th>ទីកន្លែងកំណើត(ឃុំ)</th><th>ទីកន្លែងកំណើត(ស្រុក)</th><th>ទីកន្លែងកំណើត(ខេត្ត)</th><th>ទីលំនៅ(ភូមិ)</th><th>ទីលំនៅ(ឃុំ)</th><th>ទីលំនៅ(ស្រុក)</th><th>ទីលំនៅ(ខេត្ត)</th><th>ឈ្មោះឪពុក</th><th>មុខរបរឪពុក</th><th>ឈ្មោះម្ដាយ</th><th>មុខរបរម្ដាយ</th><th>ថ្នាក់រៀន</th><th>បន្ទប់</th><th>ទំនាក់ទំនង</th><th>ប័ណ្ណក្រីក្រ</th><th>អាហារូបករណ៍</th><th>ពិការភាព</th><th>ស្ថានភាព</th></tr>`;
    window.filteredStudents.forEach((s, idx) => {
        let dobExport = formatDate(s.dob);
        tableHtml += `<tr><td>${idx+1}</td><td>${s.id}</td><td>${s.name}</td><td>${s.gender}</td><td>${dobExport}</td><td>${s.pob_village||''}</td><td>${s.pob_commune||''}</td><td>${s.pob_district||''}</td><td>${s.pob_province||''}</td><td>${s.curr_village||''}</td><td>${s.curr_commune||''}</td><td>${s.curr_district||''}</td><td>${s.curr_province||''}</td><td>${s.father_name||''}</td><td>${s.father_job||''}</td><td>${s.mother_name||''}</td><td>${s.mother_job||''}</td><td>${normalizeGrade(s.grade)}</td><td>${s.room}</td><td>${s.parent_contact||''}</td><td>${s.poor_id ? 'មាន' : 'គ្មាន'}</td><td>${s.scholarship ? 'មាន' : 'គ្មាន'}</td><td>${s.disability ? 'មាន' : 'គ្មាន'}</td><td>${s.status==='Active'?'កំពុងសិក្សា':'បោះបង់'}</td></tr>`;
    });
    tableHtml += `</table>`;
    const finalHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>${tableHtml}</body></html>`;
    const blob = new Blob(['\ufeff', finalHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Student_List_${new Date().toISOString().split('T')[0]}.xls`; link.click();
};

window.filterStudents = function() {
    const search = (document.getElementById("stuSearchInput")?.value || "").toLowerCase();
    const grade = document.getElementById("stuFilterGrade")?.value || "all";
    const room = document.getElementById("stuFilterRoom")?.value || "all";
    const gender = document.getElementById("stuFilterGender")?.value || "all";
    const status = document.getElementById("stuFilterStatus")?.value || "Active";

    const baseStudents = window.allStudents || [];

    // 🟢 បង្ហាញសិស្សទាំងអស់ដោយមិនបាច់បែងចែក Teacher ID ពេលនេះទេ ដើម្បីឱ្យទិន្នន័យលោតមកវិញ 🟢
    window.filteredStudents = baseStudents.filter(s => {
        if (!s || typeof s !== 'object') return false;

        const safeName = String(s.name || "").toLowerCase();
        const safeId = String(s.id || "").toLowerCase();
        const normGrade = normalizeGrade(s.grade);
        const safeRoom = String(s.room || "").trim();
        const safeGender = String(s.gender || "").trim();
        const safeStatus = String(s.status || "Active").trim();

        const matchSearch = search === "" || safeName.includes(search) || safeId.includes(search);
        const matchGrade = grade === "all" || normGrade === grade;
        const matchRoom = room === "all" || safeRoom === room || (room === "«ក»" && safeRoom === ""); 
        const matchGender = gender === "all" || safeGender === gender || (gender === "ប្រុស" && safeGender === "");
        const matchStatus = status === "all" || (status === "Active" ? safeStatus !== "Dropped" : safeStatus === "Dropped");

        return matchSearch && matchGrade && matchRoom && matchGender && matchStatus;
    });

    if (document.getElementById("hdrTotal")) document.getElementById("hdrTotal").innerText = baseStudents.length;
    if (document.getElementById("hdrActive")) document.getElementById("hdrActive").innerText = window.filteredStudents.length;

    window.renderStudentsTable();
};

// ==========================================
// មុខងារទាញយកទិន្នន័យទាំងអស់ពី Cloud មកកុំព្យូទ័រវិញ (Manual Fetch All Data)
// ==========================================
window.fetchAllData = async function(btnEl = null) {
    let origText = "";
    
    // បង្ហាញសញ្ញាវិល (Loading state) លើប៊ូតុង
    if (btnEl) {
        origText = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i> កំពុងទាញយក...`;
        btnEl.disabled = true;
    }

    try {
        if (typeof window.apiGet !== 'function') throw new Error("មុខងារ API មិនទាន់ដំណើរការ");

        // ទាញយកទិន្នន័យព្រមគ្នាពី Cloud (Students, Scores, Attendance, Settings)
        const [studentsRes, scoresRes, attRes] = await Promise.all([
            window.apiGet("getStudents", { status: "Active" }),
            window.apiGet("getScores"),
            window.apiGet("getAttendance")
        ]);

        // ១. ធ្វើបច្ចុប្បន្នភាពបញ្ជីសិស្ស
        if (studentsRes && studentsRes.status === "success") {
            const stuData = studentsRes.data || [];
            localStorage.setItem('academic_students', JSON.stringify(stuData));
            if (typeof window.allStudents !== 'undefined') window.allStudents = stuData;
        }

        // ២. ធ្វើបច្ចុប្បន្នភាពបញ្ជីពិន្ទុ
        if (scoresRes && scoresRes.status === "success") {
            localStorage.setItem('academic_scores', JSON.stringify(scoresRes.data || []));
        }

        // ៣. ធ្វើបច្ចុប្បន្នភាពបញ្ជីវត្តមាន
        if (attRes && attRes.status === "success") {
            localStorage.setItem('academic_attendance', JSON.stringify(attRes.data || []));
        }

        // បង្ហាញសារជោគជ័យ
        if (typeof showToast === 'function') showToast("🔄 បានទាញយកទិន្នន័យពី Cloud ជោគជ័យ!");

        // 🟢 ធ្វើបច្ចុប្បន្នភាព (Refresh) ផ្ទាំងដែលកំពុងបើកមើលជាក់ស្តែង 🟢
        setTimeout(() => {
            // បើកំពុងបើកផ្ទាំងបញ្ជីសិស្ស
            if (document.getElementById("studentsView") && !document.getElementById("studentsView").classList.contains("hidden")) {
                if (typeof window.filterStudents === 'function') window.filterStudents();
            } 
            // បើកំពុងបើកផ្ទាំង Dashboard
            else if (document.getElementById("dashboardView") && !document.getElementById("dashboardView").classList.contains("hidden")) {
                if (typeof window.fetchAndComputeClassDashboard === 'function') window.fetchAndComputeClassDashboard();
            }
            // បើកំពុងបើកផ្ទាំងពិន្ទុ
            else if (document.getElementById("scoresView") && !document.getElementById("scoresView").classList.contains("hidden")) {
                if (typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores();
            }
        }, 300);

    } catch (error) {
        console.error("Fetch Data Error:", error);
        if (typeof showToast === 'function') showToast("បរាជ័យក្នុងការទាញយកទិន្នន័យពី Cloud!", true);
        else alert("បរាជ័យក្នុងការទាញយកទិន្នន័យ! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        // ត្រឡប់ប៊ូតុងមកសភាពដើមវិញ
        if (btnEl) {
            btnEl.innerHTML = origText;
            btnEl.disabled = false;
        }
    }
};
