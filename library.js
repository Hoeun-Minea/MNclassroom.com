// =========================================================================
// ឯកសារ js/library.js - ប្រព័ន្ធគ្រប់គ្រងការខ្ចី និងប្រមូលសៀវភៅសិក្សាគោល (Ultimate Edition)
// =========================================================================

window.libStudents = [];
window.libData = {}; 
window.currentLibTab = 'borrow'; // 'borrow' (ខ្ចី) ឬ 'return' (ប្រមូល)
window.libSubjects = [];
window.currentGradeFull = "";

const BORROW_STATES = ["គ្មាន", "ថ្មី", "ចាស់", "អន់"];
const RETURN_STATES = ["គ្មាន", "✔", "✘"];

// អនុគមន៍ជំនួយ
function toKhmerNum(str) {
    if (!str) return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
}

function formatKhmerDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${toKhmerNum(parts[2])}/${toKhmerNum(parts[1])}/${toKhmerNum(parts[0])}`;
    }
    return dateStr;
}

// គ្រប់គ្រងមុខវិជ្ជាសៀវភៅ
window.loadLibSubjects = function() {
    const savedSettings = JSON.parse(localStorage.getItem(`lib_subjects_${window.currentGradeFull}`));
    if (savedSettings && savedSettings.length > 0) {
        window.libSubjects = savedSettings;
    } else {
        window.libSubjects = [
            { key: "khmer", name: "ភាសាខ្មែរ" },
            { key: "math", name: "គណិតវិទ្យា" },
            { key: "science", name: "វិទ្យាសាស្ត្រ" },
            { key: "social", name: "សិក្សាសង្គម" }
        ];
    }
};

window.addCustomBookColumn = function() {
    const bookName = prompt("សូមបញ្ចូលឈ្មោះមុខវិជ្ជា/សៀវភៅថ្មី ៖");
    if (bookName && bookName.trim() !== "") {
        const key = "book_" + Date.now();
        window.libSubjects.push({ key: key, name: bookName.trim() });
        localStorage.setItem(`lib_subjects_${window.currentGradeFull}`, JSON.stringify(window.libSubjects));
        window.renderLibTable();
        window.saveLibData(true);
    }
};

window.removeCustomBookColumn = function() {
    if (window.libSubjects.length <= 1) return alert("មិនអាចលុបសៀវភៅចុងក្រោយបានទេ!");
    const bookName = prompt("សូមបញ្ចូលឈ្មោះសៀវភៅដែលអ្នកចង់លុបចេញពីតារាង ៖");
    if (bookName && bookName.trim() !== "") {
        const initialLength = window.libSubjects.length;
        window.libSubjects = window.libSubjects.filter(sub => sub.name.trim().toLowerCase() !== bookName.trim().toLowerCase());
        
        if (window.libSubjects.length < initialLength) {
            localStorage.setItem(`lib_subjects_${window.currentGradeFull}`, JSON.stringify(window.libSubjects));
            window.renderLibTable();
            window.saveLibData(true);
            if (typeof showToast === 'function') showToast("✅ បានលុបជួរឈរសៀវភៅដោយជោគជ័យ!");
        } else {
            alert("រកមិនឃើញឈ្មោះសៀវភៅនេះក្នុងតារាងទេ!");
        }
    }
};

// ==========================================
// ១. Layout មេនៃកម្មវិធី (Main UI)
// ==========================================
window.loadLibraryView = async function() {
    const container = document.getElementById("libraryView") || document.getElementById("mainContentArea");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    window.currentGradeFull = `${levelStr} ${roomStr}`;
    const academicYear = sInfo.academic_year || "២០២៦-២០២៧";
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";

    window.loadLibSubjects();

    container.className = "p-1 md:p-4 transition duration-300 h-full w-full flex flex-col min-h-0 bg-slate-50";
    container.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        /* Interactive Cells */
        .lib-cell { cursor: pointer; user-select: none; transition: all 0.2s; }
        .lib-cell:hover { background-color: #f1f5f9; }
        
        /* Badges */
        .badge-new { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-old { background-color: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-poor { background-color: #fef2f2; color: #e11d48; border: 1px solid #fecdd3; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; }
        .badge-none { color: #94a3b8; font-size: 11px; font-weight: bold; white-space: nowrap; }
        
        .badge-check { color: #059669; font-size: 14px; font-weight: bold; }
        .badge-cross { color: #e11d48; font-size: 14px; font-weight: bold; background-color: #fef2f2; padding: 2px 8px; border-radius: 6px; border: 1px solid #fecdd3;}
      </style>

      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative rounded-3xl">
        <div class="animate-fade-in flex flex-col font-siemreap max-w-[1680px] mx-auto pb-32 px-1 md:px-4 pt-2 md:pt-4 min-h-full">
          
          <!-- 🟢 Header App Style 🟢 -->
          <div class="bg-indigo-900 text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shrink-0 shadow-md z-20 mb-4 relative overflow-hidden">
             <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             
             <div class="flex items-center gap-3 relative z-10 w-full xl:w-auto">
                <div class="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-2xl flex justify-center items-center text-xl md:text-2xl border border-white/20 shadow-inner shrink-0">
                   <i class="fa-solid fa-book-open-reader"></i>
                </div>
                <div>
                   <h1 id="libMainTitle" class="text-base md:text-xl font-moul tracking-wide drop-shadow-sm">បញ្ជីខ្ចីសៀវភៅសិក្សាគោល</h1>
                   <p id="libSubTitle" class="text-[11px] md:text-xs text-indigo-200 mt-1 font-bold">ថ្នាក់ទី៖ <span class="text-white bg-white/20 px-2 py-0.5 rounded">${window.currentGradeFull}</span> | ឆ្នាំសិក្សា៖ ${toKhmerNum(academicYear)}</p>
                </div>
             </div>

             <!-- Tools & Tabs Selector -->
             <div class="flex flex-wrap items-center justify-start xl:justify-end gap-3 relative z-10 w-full xl:w-auto">
                
                <div class="flex bg-white/10 p-1 rounded-xl w-full sm:w-auto border border-white/20 shadow-inner">
                   <button onclick="window.switchLibTab('borrow')" id="ltab-borrow" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <i class="fa-solid fa-hand-holding-hand"></i> កត់ត្រាខ្ចី
                   </button>
                   <button onclick="window.switchLibTab('return')" id="ltab-return" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <i class="fa-solid fa-box-archive"></i> កត់ត្រាសង
                   </button>
                </div>

                <div class="w-px h-8 bg-indigo-700 mx-1 hidden sm:block"></div>

                <div class="flex items-center gap-2">
                   <button onclick="window.addCustomBookColumn()" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                     <i class="fa-solid fa-plus"></i> សៀវភៅ
                   </button>
                   <button onclick="window.removeCustomBookColumn()" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                     <i class="fa-solid fa-minus"></i> សៀវភៅ
                   </button>
                </div>

             </div>
          </div>

          <!-- 🟢 Main Document Area (Printable) 🟢 -->
          <div id="libPrintArea" class="bg-white w-full rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 print:shadow-none print:border-none print:rounded-none p-4 md:p-8 font-siemreap flex-1 flex flex-col relative overflow-hidden">
             
             <!-- Document Header (Print Only or Web Top) -->
             <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div class="text-left"><br><br>
                   <p class="text-[12px] font-moul text-slate-800">${schoolName}</p>
                   <p class="text-[12px] font-bold text-slate-700 mt-1"><span class="text-rose-600 font-moul">${window.currentGradeFull}</span></p>
                </div>
                <div class="text-center">
                   <p class="font-moul text-indigo-900 text-[12px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
                   <p class="font-moul text-indigo-900 text-[12px] mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                   <!-- ក្បាច់រចនាប័ទ្ម Tacteing គូរដោយ HTML សុទ្ធ (ធានា ១០០% ដើរលើគ្រប់ទូរស័ព្ទ) -->
                    <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 12px auto; gap: 3px;">
                        <!-- បន្ទាត់ឆ្វេង -->
                        <div style="width: 35px; height: 1.5px; background-color: #9c6705; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 12px; height: 1.5px; background-color: #9c6705; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        
                        <!-- ក្បាច់កណ្តាល -->
                        <div style="font-size: 11pt; color: #755000; margin: 0 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">❖</div>
                        
                        <!-- បន្ទាត់ស្តាំ -->
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 12px; height: 1.5px; background-color: #9c6705; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                        <div style="width: 35px; height: 1.5px; background-color: #9c6705; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                    </div>
                </div>
             </div>

             <!-- Title -->
             <div class="text-center mb-6 shrink-0">
                <h2 id="libDocTitle" class="font-moul text-amber-600 text-base md:text-lg tracking-wide" style="text-shadow: 1px 1px 0px rgba(0,0,0,0.05);">បញ្ជីខ្ចីសៀវភៅសិក្សាគោល</h2>
                <p id="libDocSub" class="text-[10px] md:text-[11px] text-slate-500 font-bold mt-2 bg-slate-50 inline-block px-4 py-1.5 rounded-full border border-slate-100 no-print">ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-new mx-1'>ថ្មី</span> - <span class='badge-old mx-1'>ចាស់</span> - <span class='badge-poor mx-1'>អន់</span> - <span class='badge-none mx-1'>គ្មាន</span></p>
             </div>

             <!-- Table អាច Scroll ផ្តេកបាន (Horizontal Scroll) -->
             <div class="w-full overflow-x-auto custom-scrollbar flex-1 pb-4 print:overflow-visible">
                <table class="w-max min-w-full border-collapse border border-slate-400 print:border-black text-center text-[11px] md:text-xs mx-auto table-fixed">
                   <thead class="bg-indigo-900 text-white font-moul sticky top-0 z-30 shadow-sm print:static print:shadow-none">
                      <tr id="libTableHead">
                         <!-- Rendered by JS -->
                      </tr>
                   </thead>
                   <tbody id="libTableBody" class="divide-y divide-slate-300 print:divide-black text-slate-800 font-bold">
                      <tr><td colspan="100" class="p-16 text-center"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-400 mb-3"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>
                   </tbody>
                </table>
             </div>

             <!-- 🟢 ស្ថិតិសង្ខេបខាងក្រោមតារាង 🟢 -->
             <div id="libSummarySection" class="mt-6 border-t border-slate-300 pt-4 font-bold text-sm text-slate-700 print:mt-4 print:pt-2"></div>

             <!-- Footer Signatures (៣ ផ្នែក) -->
             <div class="flex justify-between items-start mt-10 md:mt-12 text-[11px] md:text-xs font-bold px-2 md:px-10 print:mt-8">
                <div class="text-center">
                   <p class="mb-20">ប្រធានបណ្ណាល័យ</p>
                   <p class="font-moul text-slate-800">........................</p>
                </div>
                <div class="text-center">
                   <p class="mb-20">គ្រូទទួលបន្ទុកថ្នាក់</p>
                   <p class="font-moul text-slate-800">${sInfo.teacher_name || '.......................'}</p>
                </div>
                <div class="text-center">
                   <p class="mb-2 text-slate-600">ធ្វើនៅ...................., ថ្ងៃទី........ខែ........ឆ្នាំ២០២...</p>
                   <p class="mb-14">បានឃើញ និងឯកភាព<br>នាយកសាលា</p>
                   <p class="font-moul text-slate-800">${sInfo.principal_name || '.......................'}</p>
                </div>
             </div>

          </div>
        </div>
      </div>

      <!-- 🟢 Bottom Floating Action Bar (Responsive Grid) 🟢 -->
      <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[600px] bg-white/90 backdrop-blur-md border border-slate-200 p-2.5 rounded-2xl grid grid-cols-3 gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-40 no-print transition-all">
         
         <button onclick="window.saveLibData()" id="btnSaveLib" class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-[11px] md:text-[13px] font-bold shadow-md transition flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-cloud-arrow-up"></i> <span class="hidden sm:inline">រក្សាទុកទិន្នន័យ</span><span class="sm:hidden">រក្សាទុក</span>
         </button>
         
         <button onclick="window.printLibraryReport()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] md:text-[13px] font-bold shadow-md transition flex items-center justify-center gap-1.5 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-print"></i> <span class="hidden sm:inline">បោះពុម្ពបញ្ជី</span><span class="sm:hidden">បោះពុម្ព</span>
         </button>

         <button onclick="window.clearLibData()" class="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-[11px] md:text-[13px] font-bold transition flex items-center justify-center gap-1.5 border border-slate-200 transform hover:-translate-y-0.5">
            <i class="fa-solid fa-eraser"></i> <span class="hidden sm:inline">សម្អាតទិន្នន័យ</span><span class="sm:hidden">សម្អាត</span>
         </button>

      </div>
    `;

    await window.fetchLibraryData();
};

// ==========================================
// ២. មុខងារទាញទិន្នន័យ និងរៀបចំ UI
// ==========================================
window.fetchLibraryData = async function() {
    try {
        let allStus = JSON.parse(localStorage.getItem('academic_students')) || [];
        let cleanLevel = window.currentGradeFull.replace(/ថ្នាក់ទី|«|»|\s+/g, '');

        window.libStudents = allStus.filter(s => {
            if (s.status === "Dropped") return false;
            let sGradeStr = String(s.grade || "") + String(s.room || "");
            let cleanSGrade = sGradeStr.replace(/ថ្នាក់ទី|«|»|\s+/g, '');
            return cleanSGrade === cleanLevel || cleanSGrade.includes(cleanLevel);
        });

        if (window.libStudents.length === 0) {
            window.libStudents = Array.from({length: 15}, (_, i) => ({ 
                id: "STU-" + String(i + 1).padStart(3, '0'), 
                name: "សិស្សសាកល្បង " + (i + 1), 
                gender: i % 2 === 0 ? "ប្រុស" : "ស្រី" 
            }));
        }

        window.libStudents.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

        // ទាញទិន្នន័យពី Cloud (Sheet Library) បើសិនអាច
        let cloudData = null;
        if (typeof apiGet === 'function') {
            try {
                const res = await apiGet("getLibrary");
                const resArray = res.data || res;
                if (Array.isArray(resArray) && resArray.length > 0) {
                    cloudData = {};
                    resArray.forEach(row => {
                        if (row.id) {
                            let cleanRow = { ...row };
                            delete cleanRow.id;
                            cloudData[row.id] = cleanRow;
                        }
                    });
                }
            } catch(e) {}
        }

        const savedData = cloudData || JSON.parse(localStorage.getItem(`lib_data_${window.currentGradeFull}`)) || {};
        window.libData = savedData;

        window.renderLibTable();

    } catch (err) {
        console.error("Library Error:", err);
    }
};

window.switchLibTab = function(tab) {
    window.currentLibTab = tab;
    
    const btnB = document.getElementById('ltab-borrow');
    const btnR = document.getElementById('ltab-return');
    
    if (tab === 'borrow') {
        btnB.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap";
        btnR.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border border-transparent";
        
        document.getElementById('libMainTitle').innerText = "បញ្ជីខ្ចីសៀវភៅ";
        document.getElementById('libDocTitle').innerText = "បញ្ជីខ្ចីសៀវភៅសិក្សាគោល";
        document.getElementById('libDocSub').innerHTML = "ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-new mx-1'>ថ្មី</span> - <span class='badge-old mx-1'>ចាស់</span> - <span class='badge-poor mx-1'>អន់</span> - <span class='badge-none mx-1'>គ្មាន</span>";
    } else {
        btnR.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all bg-white text-indigo-900 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap border border-slate-200";
        btnB.className = "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold text-indigo-100 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border border-transparent";
        
        document.getElementById('libMainTitle').innerText = "បញ្ជីប្រមូលសៀវភៅ";
        document.getElementById('libDocTitle').innerText = "បញ្ជីប្រមូលសៀវភៅសិក្សាគោលមកវិញ";
        document.getElementById('libDocSub').innerHTML = "ចុចលើប្រអប់មុខវិជ្ជា ដើម្បីជ្រើសរើសស្ថានភាព ៖ <span class='badge-check mx-1'>✔</span> (បានប្រមូល) - <span class='badge-cross mx-1'>✘</span> (មិនបានប្រមូល/បាត់) - <span class='badge-none mx-1'>គ្មាន</span>";
    }

    window.renderLibTable();
};

window.renderLibTable = function() {
    const thead = document.getElementById("libTableHead");
    const tbody = document.getElementById("libTableBody");
    if (!thead || !tbody) return;

    // 🟢 រៀបចំក្បាលតារាង (Headers) 🟢
    let ths = `
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 w-10 md:w-12 sticky left-0 z-20 bg-indigo-900 print:static print:border-black font-moul">ល.រ</th>
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 text-center px-3 min-w-[140px] z-20 bg-indigo-900 print:static print:border-black font-moul">គោត្តនាម និងនាម</th>
        <th class="p-2 md:p-3 border-r border-b border-indigo-700 w-12 hidden sm:table-cell print:table-cell print:border-black font-moul">ភេទ</th>
    `;
    
    // បង្ហាញជួរឈរសៀវភៅ (Dynamic Books)
    window.libSubjects.forEach(sub => {
        ths += `<th class="p-2 border-r border-b border-indigo-700 font-siemreap w-[70px] md:w-20 text-[10px] md:text-[11px] leading-tight print:border-black font-moul">${sub.name}</th>`;
    });
    
    // បន្ថែមជួរឈរថ្ងៃខ្ចី និងថ្ងៃសង
    ths += `
        <th class="p-2 border-r border-b border-indigo-700 font-moul w-[110px] min-w-[110px] text-[10px] md:text-xs leading-tight print:border-black bg-blue-800">ថ្ងៃខ្ចី</th>
        <th class="p-2 border-r border-b border-indigo-700 font-moul w-[110px] min-w-[110px] text-[10px] md:text-xs leading-tight print:border-black bg-emerald-800">ថ្ងៃសង</th>
        <th class="p-2 border-b border-indigo-700 font-moul w-[120px] min-w-[120px] text-[10px] md:text-xs print:border-black">ផ្សេងៗ/ហត្ថលេខា</th>
    `;
    thead.innerHTML = ths;

    // 🟢 រៀបចំតួអត្ថបទ និងគណនាទិន្នន័យសង្ខេប (Rows & Summaries) 🟢
    let trs = "";
    
    // អថេរសម្រាប់គណនាស្ថិតិរួម
    let totalBorrowed = 0, totalReturned = 0, totalLost = 0;
    let totalNew = 0, totalOld = 0, totalPoor = 0;

    window.libStudents.forEach((stu, idx) => {
        const sData = window.libData[stu.id] || {};
        const isF = stu.gender === 'ស្រី';

        let subCells = "";
        window.libSubjects.forEach(sub => {
            const currentSubData = sData[sub.key] || {};
            const bVal = currentSubData.borrow || "គ្មាន";
            const rVal = currentSubData.return || "គ្មាន";
            
            // គណនា Summary
            if (bVal === "ថ្មី" || bVal === "ចាស់" || bVal === "អន់") totalBorrowed++;
            
            // គណនាប្រភេទសៀវភៅលម្អិត
            if (bVal === "ថ្មី") totalNew++;
            if (bVal === "ចាស់") totalOld++;
            if (bVal === "អន់") totalPoor++;

            if (rVal === "✔") totalReturned++;
            if (rVal === "✘") totalLost++;

            let displayHtml = "";
            if (window.currentLibTab === 'borrow') {
                if (bVal === "ថ្មី") displayHtml = `<span class="badge-new">ថ្មី</span>`;
                else if (bVal === "ចាស់") displayHtml = `<span class="badge-old">ចាស់</span>`;
                else if (bVal === "អន់") displayHtml = `<span class="badge-poor">អន់</span>`;
                else displayHtml = `<span class="badge-none">គ្មាន</span>`;
            } else {
                if (rVal === "✔") displayHtml = `<span class="badge-check">✔</span>`;
                else if (rVal === "✘") displayHtml = `<span class="badge-cross">✘</span>`;
                else displayHtml = `<span class="badge-none">គ្មាន</span>`;
            }

            subCells += `
                <td class="p-1 border-r border-slate-300 print:border-black lib-cell bg-white print:bg-transparent" onclick="window.toggleLibCell('${stu.id}', '${sub.key}', '${stu.name}', '${stu.gender}')">
                    ${displayHtml}
                </td>
            `;
        });

        trs += `
            <tr class="hover:bg-indigo-50/30 transition-colors border-b border-slate-300 print:border-black group">
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-center font-mono text-slate-500 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 print:static print:bg-transparent font-siemreap">${toKhmerNum((idx + 1).toString())}</td>
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-left px-3 md:text-xs text-slate-800 whitespace-nowrap sticky left-[40px] md:left-[48px] z-10 bg-white group-hover:bg-indigo-50 print:static print:bg-transparent font-siemreap text-[12px] font-bold" title="${stu.id}">${stu.name}</td>
                <td class="p-1 md:p-2 border-r border-slate-300 print:border-black text-center font-bold ${isF ? 'text-rose-600' : 'text-blue-600'} hidden sm:table-cell print:table-cell bg-white print:bg-transparent font-siemreap">${isF ? 'ស' : 'ប'}</td>
                ${subCells}
                <td class="p-1 border-r border-slate-300 print:border-black bg-blue-50/40 print:bg-transparent" style="width: 110px; min-width: 110px;">
                    <input type="date" id="bDate_${stu.id}" value="${sData.borrowDate || ''}" onchange="window.updateLibDate('${stu.id}', 'borrowDate', this.value, '${stu.name}', '${stu.gender}')" class="w-full text-[10px] md:text-[11px] bg-transparent outline-none font-mono text-center text-blue-700 border-0 focus:bg-white px-1 font-bold">
                </td>
                <td class="p-1 border-r border-slate-300 print:border-black bg-emerald-50/40 print:bg-transparent" style="width: 110px; min-width: 110px;">
                    <input type="date" id="rDate_${stu.id}" value="${sData.returnDate || ''}" onchange="window.updateLibDate('${stu.id}', 'returnDate', this.value, '${stu.name}', '${stu.gender}')" class="w-full text-[10px] md:text-[11px] bg-transparent outline-none font-mono text-center text-emerald-700 border-0 focus:bg-white px-1 font-bold">
                </td>
                <td class="p-1 border-slate-300 print:border-black bg-white print:bg-transparent" style="width: 120px; min-width: 120px;">
                    <input type="text" id="note_${stu.id}" value="${sData.note || ''}" oninput="window.updateLibNote('${stu.id}', this.value, '${stu.name}', '${stu.gender}')" class="w-full h-full min-h-[30px] bg-transparent border-0 outline-none text-center text-[10px] md:text-[11px] text-slate-500 focus:bg-amber-50 px-2 font-siemreap transition-colors" placeholder="...">
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = trs;

    // 🟢 បង្ហាញស្ថិតិសង្ខេបខាងក្រោម 🟢
    const summarySection = document.getElementById("libSummarySection");
    if (summarySection) {
        summarySection.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
               <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-inner"><i class="fa-solid fa-chart-pie"></i></div>
               <h3 class="font-moul text-indigo-900 text-base drop-shadow-sm">សរុបស្ថិតិសៀវភៅក្នុងថ្នាក់</h3>
            </div>
            
            <!-- កាតស្ថិតិរួម -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
               <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-slate-200 text-5xl opacity-40"><i class="fa-solid fa-users"></i></div>
                  <div class="text-[11px] md:text-xs text-slate-600 font-bold uppercase mb-1 font-siemreap z-10">ចំនួនសិស្សសរុប</div>
                  <div class="text-slate-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(window.libStudents.length.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-slate-400">នាក់</span></div>
               </div>
               
               <div class="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-blue-200 text-5xl opacity-40"><i class="fa-solid fa-hand-holding-hand"></i></div>
                  <div class="text-[11px] md:text-xs text-blue-600 font-bold uppercase mb-1 font-siemreap z-10">បានខ្ចីសរុប</div>
                  <div class="text-blue-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalBorrowed.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-blue-500">ក្បាល</span></div>
               </div>
               
               <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-emerald-200 text-5xl opacity-40"><i class="fa-solid fa-box-archive"></i></div>
                  <div class="text-[11px] md:text-xs text-emerald-600 font-bold uppercase mb-1 font-siemreap z-10">បានសងសរុប</div>
                  <div class="text-emerald-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalReturned.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-emerald-500">ក្បាល</span></div>
               </div>
               
               <div class="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div class="absolute -right-3 -top-3 text-rose-200 text-5xl opacity-40"><i class="fa-solid fa-triangle-exclamation"></i></div>
                  <div class="text-[11px] md:text-xs text-rose-600 font-bold uppercase mb-1 font-siemreap z-10">បាត់បង់/ខូច</div>
                  <div class="text-rose-800 text-2xl md:text-3xl font-black font-mono z-10">${window.toKhmerNum(totalLost.toString())} <span class="text-[10px] md:text-xs font-siemreap font-bold text-rose-400">ក្បាល</span></div>
               </div>
            </div>

            <!-- ស្ថិតិប្រភេទសៀវភៅលម្អិត -->
            <div class="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm no-print">
               <h4 class="font-bold text-slate-700 text-xs md:text-sm mb-4 font-siemreap flex items-center gap-2">
                 <i class="fa-solid fa-layer-group text-slate-400"></i> លម្អិតប្រភេទសៀវភៅដែលបានខ្ចី ៖
               </h4>
               <div class="grid grid-cols-3 gap-3 md:gap-6">
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅថ្មី</div>
                        <div class="font-mono font-black text-emerald-700 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalNew.toString())}</div>
                     </div>
                  </div>
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book-open"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅចាស់</div>
                        <div class="font-mono font-black text-amber-600 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalOld.toString())}</div>
                     </div>
                  </div>
                  <div class="flex items-center gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                     <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm md:text-lg shrink-0"><i class="fa-solid fa-book-journal-whills"></i></div>
                     <div>
                        <div class="text-[10px] md:text-[11px] text-slate-500 font-bold font-siemreap">សៀវភៅអន់</div>
                        <div class="font-mono font-black text-rose-600 text-lg md:text-2xl leading-none mt-1">${window.toKhmerNum(totalPoor.toString())}</div>
                     </div>
                  </div>
               </div>
            </div>
        `;
    }
};

// ==========================================
// ៣. មុខងារបញ្ជា Cell (Toggle & Update Logic) + រក្សាទុក ឈ្មោះ និងភេទ
// ==========================================
window.toggleLibCell = function(stuId, subKey, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;

    if (!window.libData[stuId][subKey]) window.libData[stuId][subKey] = { borrow: "គ្មាន", return: "គ្មាន" };

    let current = window.libData[stuId][subKey];

    if (window.currentLibTab === 'borrow') {
        let idx = BORROW_STATES.indexOf(current.borrow);
        if (idx === -1) idx = 0;
        current.borrow = BORROW_STATES[(idx + 1) % BORROW_STATES.length];
    } else {
        let idx = RETURN_STATES.indexOf(current.return);
        if (idx === -1) idx = 0;
        current.return = RETURN_STATES[(idx + 1) % RETURN_STATES.length];
    }

    window.renderLibTable();
};

window.updateLibDate = function(stuId, field, value, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;
    window.libData[stuId][field] = value;
};

window.updateLibNote = function(stuId, value, stuName, stuGender) {
    if (!window.libData[stuId]) window.libData[stuId] = {};
    window.libData[stuId].name = stuName;
    window.libData[stuId].gender = stuGender;
    window.libData[stuId].note = value;
};

window.saveLibData = async function(silent = false) {
    const btn = document.getElementById("btnSaveLib");
    const origText = btn ? btn.innerHTML : '';
    if(btn) {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> រក្សាទុក...`;
        btn.disabled = true;
    }

    try {
        localStorage.setItem(`lib_data_${window.currentGradeFull}`, JSON.stringify(window.libData));
        
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
            await apiPost("saveLibrary", { data: window.libData });
            if (!silent && typeof showToast === 'function') showToast("✅ ទិន្នន័យបានរក្សាទុកទៅសៀវភៅ Library ជោគជ័យ!");
        } else {
            if (!silent && typeof showToast === 'function') showToast("✅ ទិន្នន័យបានរក្សាទុកក្នុងប្រព័ន្ធ (Offline)!");
        }
    } catch (e) {
        if (!silent) alert("⚠️ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        setTimeout(() => {
            if(btn) {
                btn.innerHTML = origText || `<i class="fa-solid fa-cloud-arrow-up"></i> <span class="hidden sm:inline">រក្សាទុកទិន្នន័យ</span><span class="sm:hidden">រក្សាទុក</span>`;
                btn.disabled = false;
            }
        }, 500);
    }
};

window.clearLibData = function() {
    if (confirm("⚠️ តើលោកគ្រូអ្នកគ្រូពិតជាចង់លុបសម្អាតទិន្នន័យសៀវភៅទាំងអស់របស់ថ្នាក់នេះមែនទេ? (ទិន្នន័យនឹងមិនអាចទាញមកវិញបានទេ)")) {
        window.libData = {};
        window.renderLibTable();
        window.saveLibData();
    }
};

// ==========================================
// ៤. មុខងារបោះពុម្ព (Print) - បញ្ជីឈ្មោះខ្ចីសៀវភៅ (កែសម្រួលគម្លាតហត្ថលេខា)
// ==========================================
window.printLibraryReport = function() {
    if (!window.libStudents || window.libStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const districtName = sInfo.district || "ស្រុកកៀនស្វាយ";
    const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (sInfo.teacher_name || ".......................");
    const principalName = sInfo.principal_name || ".......................";
    
    const lunarStr = typeof window.getKhmerLunarDate === 'function' ? window.getKhmerLunarDate() : "ថ្ងៃ.......................";
    const solarStr = typeof window.getFormattedSolarDate === 'function' ? window.getFormattedSolarDate() : "ធ្វើនៅ..............., ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...";

    const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
    
    // កំណត់ចំណងជើងផ្អែកលើប្រភេទបញ្ជី (ខ្ចី ឬ សង)
    let isBorrowList = window.currentLibTab === 'borrow';
    let docTitle = isBorrowList ? "បញ្ជីខ្ចីសៀវភៅសិក្សាគោល" : "បញ្ជីប្រមូលសៀវភៅសិក្សាគោលមកវិញ";

    // រៀបចំក្បាលតារាង (Headers)
    let thsHtml = `
        <th style="width: 4%;">ល.រ</th>
        <th style="width: 20%; text-align: left; padding-left: 8px;">គោត្តនាម និងនាម</th>
        <th style="width: 5%;">ភេទ</th>
    `;
    
    let subWidth = Math.floor(45 / Math.max(1, window.libSubjects.length)); // ចែកទំហំក្រឡាស្មើៗគ្នា
    window.libSubjects.forEach(sub => {
        thsHtml += `<th style="width: ${subWidth}%; font-family: 'Siemreap', sans-serif;">${sub.name}</th>`;
    });
    
    thsHtml += `
        <th style="width: 9%;">ថ្ងៃខ្ចី</th>
        <th style="width: 9%;">ថ្ងៃសង</th>
        <th style="width: 8%;">ផ្សេងៗ/ហត្ថលេខា</th>
    `;

    // គណនាស្ថិតិ និងរៀបចំជួរដេក (Rows)
    let totalBorrowed = 0, totalReturned = 0, totalLost = 0;
    let totalNew = 0, totalOld = 0, totalPoor = 0;
    let rowsHtml = "";

    window.libStudents.forEach((stu, idx) => {
        const sData = window.libData[stu.id] || {};
        const isF = stu.gender === 'ស្រី';
        let subCellsHtml = "";

        window.libSubjects.forEach(sub => {
            const currentSubData = sData[sub.key] || {};
            const bVal = currentSubData.borrow || "គ្មាន";
            const rVal = currentSubData.return || "គ្មាន";
            
            // រាប់ស្ថិតិ
            if (bVal === "ថ្មី" || bVal === "ចាស់" || bVal === "អន់") totalBorrowed++;
            if (bVal === "ថ្មី") totalNew++;
            if (bVal === "ចាស់") totalOld++;
            if (bVal === "អន់") totalPoor++;
            if (rVal === "✔") totalReturned++;
            if (rVal === "✘") totalLost++;

            let displayHtml = "";
            if (isBorrowList) {
                if (bVal === "ថ្មី") displayHtml = `<span style="color: #059669; font-weight: bold;">ថ្មី</span>`;
                else if (bVal === "ចាស់") displayHtml = `<span style="color: #d97706; font-weight: bold;">ចាស់</span>`;
                else if (bVal === "អន់") displayHtml = `<span style="color: #e11d48; font-weight: bold;">អន់</span>`;
                else displayHtml = `<span style="color: #cbd5e1;">គ្មាន</span>`;
            } else {
                if (rVal === "✔") displayHtml = `<span style="color: #059669; font-weight: bold;">✔</span>`;
                else if (rVal === "✘") displayHtml = `<span style="color: #e11d48; font-weight: bold;">✘</span>`;
                else displayHtml = `<span style="color: #cbd5e1;">គ្មាន</span>`;
            }

            subCellsHtml += `<td style="text-align: center;">${displayHtml}</td>`;
        });

        const formatDateToPrint = (dateStr) => {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length === 3) return `${toKhNum(parts[2])}/${toKhNum(parts[1])}/${toKhNum(parts[0])}`;
            return dateStr;
        };

        const bDate = formatDateToPrint(sData.borrowDate);
        const rDate = formatDateToPrint(sData.returnDate);
        const noteStr = sData.note || '';

        let bgRow = idx % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
        let genColor = isF ? '#e11d48' : '#1e3a8a';

        rowsHtml += `
            <tr style="height: 30px; ${bgRow}">
                <td style="text-align: center; color: #475569;">${toKhNum(idx + 1)}</td>
                <td style="text-align: left; padding-left: 8px; font-weight: bold;">${stu.name}</td>
                <td style="text-align: center; font-weight: bold; color: ${genColor};">${isF ? 'ស' : 'ប'}</td>
                ${subCellsHtml}
                <td style="text-align: center; color: #020079; font-size: 10.5pt;">${bDate}</td>
                <td style="text-align: center; color: #059669; font-size: 10.5pt;">${rDate}</td>
                <td style="text-align: center; color: #475569; font-size: 10pt;">${noteStr}</td>
            </tr>
        `;
    });

    // រៀបចំស្ថិតិខាងក្រោមតារាង
    let statsHtml = `
        <table style="width: 100%; border: none; margin-top: 15px; font-size: 11pt; color: #0f172a; border-collapse: collapse;">
            <tr>
                <td style="width: 50%; vertical-align: top; border: none; padding-right: 15px;">
                    <h4 style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11.5pt; color: #1e3a8a; margin: 0 0 10px 0; text-decoration: underline;">សរុបស្ថិតិសៀវភៅក្នុងថ្នាក់៖</h4>
                    <p style="margin: 0 0 5px 0;">• ចំនួនសិស្សសរុប៖ <strong style="color: #be123c;">${toKhNum(window.libStudents.length)}</strong> នាក់</p>
                    <p style="margin: 0 0 5px 0;">• ចំនួនសៀវភៅដែលបានខ្ចីសរុប៖ <strong style="color: #be123c;">${toKhNum(totalBorrowed)}</strong> ក្បាល</p>
                    <p style="margin: 0 0 5px 0;">• ចំនួនសៀវភៅដែលបានសងសរុប៖ <strong style="color: #be123c;">${toKhNum(totalReturned)}</strong> ក្បាល</p>
                    <p style="margin: 0 0 5px 0;">• ចំនួនសៀវភៅបាត់បង់/ខូច៖ <strong style="color: #be123c;">${toKhNum(totalLost)}</strong> ក្បាល</p>
                </td>
                <td style="width: 50%; vertical-align: top; border: none; padding-left: 15px;">
                    <h4 style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11.5pt; color: #1e3a8a; margin: 0 0 10px 0; text-decoration: underline;">លម្អិតស្ថានភាពសៀវភៅដែលបានខ្ចី៖</h4>
                    <p style="margin: 0 0 5px 0;">• សៀវភៅថ្មី៖ <strong style="color: #059669;">${toKhNum(totalNew)}</strong> ក្បាល</p>
                    <p style="margin: 0 0 5px 0;">• សៀវភៅចាស់៖ <strong style="color: #d97706;">${toKhNum(totalOld)}</strong> ក្បាល</p>
                    <p style="margin: 0 0 5px 0;">• សៀវភៅអន់៖ <strong style="color: #e11d48;">${toKhNum(totalPoor)}</strong> ក្បាល</p>
                </td>
            </tr>
        </table>
    `;

    // លុបចោលកុងតឺន័រចាស់បើមាន
    let oldContainer = document.getElementById('mobile-print-container-lib');
    if (oldContainer) oldContainer.remove();

    // បង្កើតកុងតឺន័រថ្មីសម្រាប់ផ្ទុកទិន្នន័យ Print
    const printContainer = document.createElement('div');
    printContainer.id = 'mobile-print-container-lib';
    
    printContainer.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Siemreap:wght@400;700&display=swap');
            
            @media print {
                body > *:not(#mobile-print-container-lib) { display: none !important; }
                body { background: white !important; margin: 0; padding: 0; }
                @page { size: A4 landscape; margin: 10mm; }
            }
            
            @media screen {
                #mobile-print-container-lib { display: none; }
            }

            #mobile-print-container-lib {
                background: white; color: black; width: 100%; max-width: 277mm; margin: 0 auto;
                font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;
                -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
                line-height: 1.3;
            }
            
            .p-header { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .p-header td { vertical-align: top; border: none; padding: 0; }
            .ph-left { text-align: left; width: 40%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11pt; color: #020079; line-height: 1.4; white-space: nowrap; }
            .ph-right { text-align: center; width: 30%; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #020079; line-height: 1.4; }
            
            .p-title { text-align: center; margin: 10px 0 20px 0; }
            .p-title h2 { font-family: 'Khmer OS Muol Light', 'Moul', serif; margin: 0 0 6px 0; font-size: 16pt; color: #e11d48; letter-spacing: 0.5px; }
            .p-title p { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; margin: 0; font-size: 11pt; color: #060053; font-weight: bold; }
            
            .p-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11pt; border: 1.5pt solid #0f172a; table-layout: fixed; }
            .p-table th { background-color: #dbeafe !important; color: #000269 !important; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; text-align: center; padding: 6px 2px; border: 1px solid #0f172a; font-weight: normal; }
            .p-table td { border: 1px solid #94a3b8; padding: 4px; vertical-align: middle; }
            
            /* 🔴 កែសម្រួលទំហំជួរឈរ (Columns) នៃហត្ថលេខាទីនេះ 🔴 */
            .p-sign { width: 100%; text-align: center; font-size: 11pt; page-break-inside: avoid; border-collapse: collapse; margin-top: 15px; }
            .p-sign td { vertical-align: top; border: none; padding: 0; }
            .p-sign td:nth-child(1) { width: 30%; } /* នាយកសាលា */
            .p-sign td:nth-child(2) { width: 25%; } /* ប្រធានបណ្ណាល័យ */
            .p-sign td:nth-child(3) { width: 45%; } /* កាលបរិច្ឆេទ & គ្រូប្រចាំថ្នាក់ (ធំជាងគេ) */
            
            .ps-date { margin: 0 0 4px 0; color: #334155; }
            .ps-role { font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11pt; color: #000269; margin: 5px 0 50px 0; font-weight: normal; }
            .ps-name { font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #be123c; margin: 0; font-weight: normal; }
        </style>
        
        <table class="p-header">
            <tr>
                <td class="ph-left"><br>
                    ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName.replace('ស្រុក', '').trim()}<br>
                    <span style="font-size: 12pt; display: block; margin-top: 8px;">${schoolName}</span>
                </td>
                <td class="ph-right">
                    ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ
                    <div style="display: flex; align-items: center; justify-content: center; margin: 4px auto 12px auto; gap: 3px;">
                        <div style="width: 35px; height: 1.5px; background-color: #9c6705;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%;"></div>
                        <div style="width: 12px; height: 1.5px; background-color: #9c6705;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%;"></div>
                        <div style="font-size: 11pt; color: #755000; margin: 0 2px; line-height: 1;">❖</div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%;"></div>
                        <div style="width: 12px; height: 1.5px; background-color: #9c6705;"></div>
                        <div style="width: 3.5px; height: 3.5px; background-color: #1e3a8a; border-radius: 50%;"></div>
                        <div style="width: 35px; height: 1.5px; background-color: #9c6705;"></div>
                    </div>
                </td>
            </tr>
        </table>
        
        <div class="p-title">
            <h2>${docTitle}</h2>
            <p>ថ្នាក់ទី ${window.currentGradeFull.replace('ថ្នាក់ទី ', '')} | ឆ្នាំសិក្សា <span style="font-family: 'Khmer OS Siemreap', sans-serif;">${toKhNum(academicYear)}</span></p>
        </div>
        
        <table class="p-table">
            <thead>
                <tr>${thsHtml}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        ${statsHtml}
        
        <table class="p-sign">
            <tr>
                <td>
                    <p class="ps-date" style="color: transparent;">.</p>
                    <p class="ps-date">បានឃើញ និងឯកភាព</p>
                    <p class="ps-role">នាយកសាលា</p>
                    <p class="ps-name">${principalName}</p>
                </td>
                <td>
                    <p class="ps-date" style="color: transparent;">.</p>
                    <p class="ps-date" style="color: transparent;">.</p>
                    <p class="ps-role">ប្រធានបណ្ណាល័យ</p>
                    <p class="ps-name">.......................</p>
                </td>
                <td>
                    <p class="ps-date">${lunarStr}</p>
                    <p class="ps-date">${solarStr}</p>
                    <p class="ps-role">គ្រូប្រចាំថ្នាក់</p>
                    <p class="ps-name">${teacherName}</p>
                </td>
            </tr>
        </table>
    `;
    
    // បញ្ចូលទៅ Document ដើម
    document.body.appendChild(printContainer);
    
    // បញ្ជាឱ្យ Print
    setTimeout(() => {
        window.print();
        // សម្អាតចោលក្រោយ Print
        setTimeout(() => {
            const cleanup = document.getElementById('mobile-print-container-lib');
            if (cleanup) cleanup.remove();
        }, 1000);
    }, 500);
};