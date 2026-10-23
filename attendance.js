// =====================================================================
// ឯកសារ js/attendance.js - ប្រព័ន្ធគ្រប់គ្រងបញ្ជីវត្តមាន សម្រាប់គ្រូបន្ទុកថ្នាក់ (Auto-Grade Detection)
// =====================================================================

let attendanceStudents = []; 
let monthlyAttendanceData = {}; 
window.monthlyAttendanceData = monthlyAttendanceData; 
const KHMER_DAYS = ["អា", "ច", "អ", "ពុ", "ព្រ", "សុ", "ស"];
const KHMER_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

window.monthlyHolidays = {};

// =====================================================================
// Utilities & Helper Functions
// =====================================================================
window.toKhmerNum = window.toKhmerNum || function(str) {
    if (str === null || str === undefined || str === "") return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

function normalizeGrade(str) {
    let s = String(str || "ថ្នាក់ទី ១").trim();
    const khmerToArabic = {'០':'0', '១':'1', '២':'2', '៣':'3', '៤':'4', '៥':'5', '៦':'6', '៧':'7', '៨':'8', '៩':'9'};
    let arabicStr = s.replace(/[០-៩]/g, match => khmerToArabic[match]);
    let match = arabicStr.match(/[0-9]+/);
    if (match) return "ថ្នាក់ទី " + window.toKhmerNum(match[0]);
    return "ថ្នាក់ទី ១";
}

function parseDayNumber(dateVal) {
    if (!dateVal) return null;
    const s = String(dateVal).trim();
    const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m1) return parseInt(m1[3], 10);
    const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m2) return parseInt(m2, 10);
    const m3 = s.match(/^(\d{1,2})$/);
    if (m3) return parseInt(m3, 10);
    return null;
}

function isRecordInMonth(r, currentMonthName, currentMonthNum, currentYear) {
    if (r.month && String(r.month).trim() !== "") {
        const mStr = String(r.month).trim();
        if (mStr === currentMonthName || parseInt(mStr, 10) === currentMonthNum) return true;
    }
    if (r.date) {
        const s = String(r.date).trim();
        const m1 = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (m1) {
            const y = parseInt(m1[1], 10);
            const m = parseInt(m1[2], 10);
            if (m === currentMonthNum && (!currentYear || y === currentYear)) return true;
        }
        const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (m2) {
            const m = parseInt(m2[2], 10);
            const y = parseInt(m2[3], 10);
            if (m === currentMonthNum && (!currentYear || y === currentYear)) return true;
        }
    }
    return false;
}

function findMatchingStudent(r, studentList) {
    const rawId = String(r.student_id || r.studentId || r.id || "").trim();
    if (rawId) {
        let found = studentList.find(s => String(s.id).trim().toLowerCase() === rawId.toLowerCase());
        if (found) return found;
    }
    return null;
}

function normalizeStatus(statusRaw) {
    if (!statusRaw) return "";
    const v = String(statusRaw).trim();
    if (v === "ច្បាប់" || v === "មានច្បាប់" || v === "ច" || v === "ច្ប" || v.toUpperCase() === "C") return "ច្ប";
    if (v === "ឥតច្បាប់" || v === "អត់ច្បាប់" || v === "អ" || v === "អច្ប" || v.toUpperCase() === "A") return "អច្ប";
    if (v === "ឈឺ" || v === "ឈឺមានច្បាប់" || v === "ឈ" || v.toUpperCase() === "S") return "ឈ";
    if (v === "ឈប់សម្រាក" || v === "សម្រាក" || v === "៖" || v === ":") return "៖";
    if (v === "វត្តមាន" || v.toUpperCase() === "P" || v === "វ") return "";
    return v;
}

// 🟢 អនុគមន៍ថ្មី: ទាញយកថ្នាក់/បន្ទប់ ដោយស្វ័យប្រវត្តិពីបញ្ជីសិស្ស 🟢
window.getTeacherGradeInfo = function() {
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const currentYearStr = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";
    
    try {
        const rawStudents = JSON.parse(localStorage.getItem('academic_students')) || [];
        const myStudents = rawStudents.filter(s => String(s.teacher_id) === String(currentTeacherId) && String(s.academic_year) === String(currentYearStr) && s.status !== "Dropped");
        
        if (myStudents.length > 0) {
            return {
                level: normalizeGrade(myStudents[0].grade),
                room: myStudents[0].room || "«ក»"
            };
        }
    } catch(e) {}

    // Fallback ប្រសិនបើអត់ទាន់មានសិស្ស
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    return {
        level: sInfo.teacher_level || "ថ្នាក់ទី ១",
        room: sInfo.teacher_room || "«ក»"
    };
};

// =====================================================================
// ១. Layout មេ (Main Layout) - លុបបំបាត់ setTimeout ផ្តាច់មុខ
// =====================================================================
window.loadAttendanceView = async function() {
    try {
        const container = document.getElementById("attendanceContainer") || document.getElementById("attendanceView") || document.getElementById("mainContentArea");
        if (!container) return;

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : (JSON.parse(localStorage.getItem('school_settings') || '{}'));
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
        
        const defaultGrade = sInfo.teacher_level && sInfo.teacher_room ? `${sInfo.teacher_level} ${sInfo.teacher_room}` : "ថ្នាក់រៀនរបស់ខ្ញុំ";
        const currentYear = new Date().getFullYear();
        
        const localKhmerMonths = typeof KHMER_MONTHS !== 'undefined' ? KHMER_MONTHS : ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const currentMonthName = localKhmerMonths[new Date().getMonth()];

        container.className = "p-2 md:p-6 transition duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50";
        container.innerHTML = `
          <style>
            .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
            .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            .att-input:focus { background-color: #fff !important; box-shadow: 0 0 0 2px #f43f5e inset; z-index: 10; position: relative; border-radius: 4px; }
          </style>

          <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative">
            <div class="animate-fade-in flex flex-col font-siemreap max-w-[1680px] mx-auto space-y-5 pb-16 pt-1">
              
              <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 shrink-0 relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-6 transition-all no-print">
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
                
                <div class="flex items-center gap-5 relative z-10 w-full xl:w-auto">
                    <div class="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-rose-200 shrink-0 transform -rotate-3">
                      <i class="fa-solid fa-clipboard-user"></i>
                    </div>
                    <div>
                        <h2 class="text-xl md:text-3xl font-black text-slate-800 font-moul mb-1">បញ្ជីវត្តមានសិស្ស</h2>
                        <div class="flex flex-wrap gap-2 mt-2">
                            <span class="text-[10px] md:text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5"><i class="fa-solid fa-circle text-[6px]"></i> ច្បាប់ (ច្ប)</span>
                            <span class="text-[10px] md:text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-100 flex items-center gap-1.5"><i class="fa-solid fa-circle text-[6px]"></i> អត់ច្បាប់ (អច្ប)</span>
                            <span class="text-[10px] md:text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100 flex items-center gap-1.5"><i class="fa-solid fa-circle text-[6px]"></i> ឈឺ (ឈ)</span>
                            <span class="text-[10px] md:text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5"><i class="fa-solid fa-circle text-[6px]"></i> សម្រាក (៖)</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-3 w-full xl:w-auto relative z-10">
                    <div class="relative w-full sm:w-auto group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"><i class="fa-solid fa-magnifying-glass text-[13px]"></i></span>
                      <input type="text" id="attSearch" oninput="if(typeof window.filterAttendanceTable === 'function') window.filterAttendanceTable();" placeholder="ស្វែងរកឈ្មោះសិស្ស..." 
                             class="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 focus:bg-white outline-none w-full sm:w-56 bg-slate-50 transition shadow-inner font-siemreap">
                    </div>
                    
                    <div class="flex flex-1 sm:flex-none items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-inner">
                      <i class="fa-solid fa-calendar-days text-slate-400 text-[13px]"></i>
                      <select id="attMonthSelect" onchange="if(typeof window.fetchMonthlyAttendance === 'function') window.fetchMonthlyAttendance();" class="border-none bg-transparent text-[13px] font-bold text-rose-600 outline-none cursor-pointer font-siemreap w-full focus:ring-0">
                        ${localKhmerMonths.map(m => `<option value="${m}" ${m === currentMonthName ? 'selected' : ''}>${m}</option>`).join('')}
                      </select>
                      <span class="text-slate-300">|</span>
                      <select id="attYearSelect" onchange="if(typeof window.fetchMonthlyAttendance === 'function') window.fetchMonthlyAttendance();" class="border-none bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer font-mono focus:ring-0">
                        <option value="${currentYear - 1}">${currentYear - 1}</option>
                        <option value="${currentYear}" selected>${currentYear}</option>
                        <option value="${currentYear + 1}">${currentYear + 1}</option>
                      </select>
                    </div>
                </div>
              </div>

              <!-- កាតស្ថិតិសង្ខេប -->
              <div id="attendanceKpiSummaryContainer" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 no-print"></div>

              <!-- របារឧបករណ៍បញ្ជា -->
              <div class="flex flex-wrap items-center justify-between gap-3 shrink-0 no-print bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button onclick="if(typeof window.openDailyAttendanceModal === 'function') window.openDailyAttendanceModal();" class="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-xl text-[13px] font-bold shadow-md shadow-rose-200 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                    <i class="fa-solid fa-calendar-day"></i> កត់វត្តមាន (Pop-Up)
                  </button>
                  <button onclick="if(typeof window.openHolidayManagerModal === 'function') window.openHolidayManagerModal();" class="flex-1 md:flex-none px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[13px] font-bold transition flex items-center justify-center gap-2 hover:shadow-sm">
                    <i class="fa-solid fa-calendar-xmark"></i> កំណត់ថ្ងៃឈប់
                  </button>
                </div>

                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button onclick="if(typeof window.toggleSharedDatePanel === 'function') window.toggleSharedDatePanel('datePanel-attendance');" class="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[13px] font-bold transition flex items-center gap-2 hover:shadow-sm">
                    <i class="fa-solid fa-calendar-week text-indigo-500"></i> កាលបរិច្ឆេទ
                  </button>
                  <button onclick="if(typeof window.openAnnualReportModal === 'function') window.openAnnualReportModal();" class="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[13px] font-bold transition flex items-center gap-2 hover:shadow-sm">
                    <i class="fa-solid fa-file-contract text-emerald-500"></i> របាយការណ៍ឆ្នាំ
                  </button>
                  <button onclick="if(typeof window.printOfficialAttendance === 'function') window.printOfficialAttendance();" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5">
                    <i class="fa-solid fa-print"></i> បោះពុម្ពបញ្ជី
                  </button>
                  <button type="button" id="btnSaveAttendance" onclick="if(typeof window.saveMonthlyAttendance === 'function') window.saveMonthlyAttendance();"
                          class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-emerald-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
                    <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក
                  </button>
                </div>
              </div>

              ${typeof window.getDateSettingsPanelHTML === 'function' ? window.getDateSettingsPanelHTML('attendance') : ''}

              <!-- ផ្ទៃតារាងវត្តមាន -->
              <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative flex flex-col w-full print:border-none print:shadow-none min-h-[400px]" id="attendanceWebArea">
                
                <div class="flex justify-between items-center py-4 px-6 no-print shrink-0 border-b border-slate-100 bg-slate-50/90 rounded-t-[2rem]">
                    <h3 class="text-sm font-bold text-slate-700 flex items-center gap-2 font-moul">
                       <i class="fa-solid fa-list-check text-rose-500 text-lg"></i> បញ្ជីវត្តមានប្រចាំខែ <span id="lblMonthTitle" class="text-rose-600">${currentMonthName}</span>
                    </h3>
                    <p class="text-[13px] font-bold text-slate-500">
                      ថ្នាក់ទី <span id="attHeaderGrade" class="text-indigo-700 mx-1 font-moul bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">${defaultGrade.replace('ថ្នាក់ទី', '').trim()}</span> 
                      | ឆ្នាំសិក្សា <span id="lblAcademicYearTitle" class="ml-1 font-siemreap">${academicYear}</span>
                    </p>
                </div>

                <div class="w-full overflow-x-auto custom-scrollbar relative bg-white pb-6 rounded-b-[2rem] print:overflow-visible shadow-inner">
                    <table class="w-max min-w-full border-collapse border-y border-slate-200 print:border-black text-[12px] text-center bg-white relative font-siemreap mx-auto" id="mainAttendanceTable" style="table-layout: fixed;">
                      <thead class="sticky top-0 z-30 shadow-sm text-[12px]">
                        <tr id="trKhmerDays" class="bg-slate-100 text-slate-700 border-b border-slate-300 print:border-black font-moul h-[42px]"></tr>
                        <tr id="trDayNumbers" class="bg-slate-50 text-slate-700 border-b-2 border-slate-300 print:border-black font-bold h-[36px]"></tr>
                      </thead>
                      <tbody id="attendanceTableRows" class="divide-y divide-slate-100 print:divide-black text-slate-800 print:text-black">
                        <tr><td colspan="42" class="p-20 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-rose-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>
                      </tbody>
                      <tfoot id="attendanceTableFoot" class="bg-slate-50 font-bold border-t-2 border-slate-300 print:border-black text-slate-800 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                      </tfoot>
                    </table>
                </div>
              </div>
            </div> 
          </div> 

          <div id="annualReportModalContainer"></div>
        `;

        if (typeof window.renderAnnualReportModal === 'function') {
            window.renderAnnualReportModal();
        }

        // 🔴 ហៅមុខងារទាញទិន្នន័យដោយផ្ទាល់ គ្មាន setTimeout 🔴
        if (typeof window.fetchMonthlyAttendance === 'function') {
            await window.fetchMonthlyAttendance();
        } else {
            console.warn("មិនទាន់ស្គាល់មុខងារ fetchMonthlyAttendance ទេ!");
        }
        
        if (typeof window.setupAttExcelLikeNavigation === 'function') {
            window.setupAttExcelLikeNavigation();
        }

    } catch (error) {
        console.error("មានកំហុសក្នុងការ Load ផ្ទាំងវត្តមាន:", error);
    }
};

// =====================================================================
// ២. ទាញយកទិន្នន័យវត្តមាន (Safe Mode + Fast Load)
// =====================================================================
window.fetchMonthlyAttendance = async function(forceRefresh = false) {
    const tbody = document.getElementById("attendanceTableRows");
    const btn = document.getElementById("btnSaveAttendance");
    
    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងទាញយក...`;
        }
        
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="42" class="p-20 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-rose-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>`;
        }

        const monthSelect = document.getElementById("attMonthSelect");
        const yearSelect = document.getElementById("attYearSelect");
        
        if (!monthSelect || !yearSelect) {
            throw new Error("មិនអាចស្វែងរកប្រអប់ជ្រើសរើសខែ ឬឆ្នាំបានទេ។");
        }

        const month = monthSelect.value;
        const year = parseInt(yearSelect.value);

        // ទាញសិស្សពី Memory ផ្ទាល់
        let allStus = [];
        if (window.allStudents && window.allStudents.length > 0) {
            allStus = window.allStudents;
        } else {
            const ls = localStorage.getItem('academic_students');
            if (ls && ls !== "undefined") allStus = JSON.parse(ls);
        }

        attendanceStudents = allStus.filter(s => s && s.status !== "Dropped");
        attendanceStudents.sort((a, b) => String(a.name || "").trim().localeCompare(String(b.name || "").trim(), "km"));

        let levelVal = "ថ្នាក់ទី 1", roomVal = "«ក»";
        if (attendanceStudents.length > 0) {
            levelVal = String(attendanceStudents[0].grade || "ថ្នាក់ទី 1").trim();
            if (!levelVal.includes("ថ្នាក់ទី")) levelVal = "ថ្នាក់ទី " + levelVal;
            roomVal = String(attendanceStudents[0].room || "«ក»").trim();
        }
        const fullGradeName = `${levelVal} ${roomVal}`;

        // Update UI
        const titleEl = document.getElementById("lblMonthTitle");
        if (titleEl) titleEl.textContent = month;
        const attHeaderGrade = document.getElementById("attHeaderGrade");
        if (attHeaderGrade) attHeaderGrade.textContent = `${levelVal.replace('ថ្នាក់ទី', '').trim()} ${roomVal}`;

        const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
        const monthNum = monthMap[month] || 1;
        const daysInMonth = new Date(year, monthNum, 0).getDate();

        // 🟢 ហៅមុខងារគូរក្បាលតារាង (ត្រូវប្រាកដថាវាដើរ)
        if (typeof window.renderCalendarHeaders === 'function') {
            window.renderCalendarHeaders(year, monthNum, daysInMonth);
        } else {
            throw new Error("ប្រព័ន្ធបាត់មុខងារ renderCalendarHeaders (គូរក្បាលតារាង)");
        }

        try {
            const savedHolidays = JSON.parse(localStorage.getItem(`att_holidays_${fullGradeName}_${month}_${year}`) || '{}');
            window.monthlyHolidays = savedHolidays;
        } catch(e) { window.monthlyHolidays = {}; }

        let attRes = [];
        try { 
            const rawAtt = localStorage.getItem('academic_attendance');
            if (rawAtt) attRes = JSON.parse(rawAtt) || []; 
        } catch(e) {}

        monthlyAttendanceData = {};
        try {
            const cached = JSON.parse(localStorage.getItem(`att_${fullGradeName}_${month}_${year}`) || '{}');
            monthlyAttendanceData = { ...cached };
        } catch(e) {}

        if (attRes && attRes.length > 0) {
            attRes.forEach(r => {
                if (!r || typeof r !== 'object') return;
                
                const rMonth = String(r.month || "").trim();
                if (rMonth !== month) return;

                const day = typeof parseDayNumber === 'function' ? parseDayNumber(r.date || r.day) : parseInt(r.date || r.day, 10);
                if (!day || day < 1 || day > daysInMonth) return;
                
                const stuId = String(r.student_id || r.studentId || r.id || "").trim();

                if (stuId) {
                    if (!monthlyAttendanceData[stuId]) monthlyAttendanceData[stuId] = {};
                    monthlyAttendanceData[stuId][day] = typeof normalizeStatus === 'function' ? normalizeStatus(r.status || r.attendance || r['ស្ថានភាព']) : (r.status || r.attendance || r['ស្ថានភាព']);
                }
            });
        }

        // បញ្ចូលថ្ងៃឈប់សម្រាក
        Object.keys(window.monthlyHolidays).forEach(dayKey => {
            const d = parseInt(dayKey, 10);
            if (d >= 1 && d <= daysInMonth) {
                attendanceStudents.forEach(s => {
                    if (!monthlyAttendanceData[s.id]) monthlyAttendanceData[s.id] = {};
                    if (!monthlyAttendanceData[s.id][d]) {
                        monthlyAttendanceData[s.id][d] = "៖";
                    }
                });
            }
        });

        window.monthlyAttendanceData = monthlyAttendanceData;
        
        // 🟢 ហៅមុខងារគូរជួរដេកសិស្ស
        if (typeof window.renderAttendanceRows === 'function') {
            window.renderAttendanceRows(daysInMonth);
        } else {
            throw new Error("ប្រព័ន្ធបាត់មុខងារ renderAttendanceRows (គូរតារាងសិស្ស)");
        }

    } catch (err) {
        console.error("កំហុសក្នុងការទាញយកទិន្នន័យវត្តមាន:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="42" class="p-10 text-center text-rose-600 font-bold bg-rose-50 border border-rose-200">
                <i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i><br>
                បរាជ័យក្នុងការរៀបចំតារាងវត្តមាន៖ ${err.message}
            </td></tr>`;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`;
        }
    }
};

// =====================================================================
// ២. ទាញយកទិន្នន័យសិស្ស និងវត្តមានប្រចាំខែ (លឿនបំផុត - Fast Load)
// =====================================================================
window.fetchMonthlyAttendance = async function(forceRefresh = false) {
    const btn = document.getElementById("btnSaveAttendance");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងទាញយក...`;
    }
    
    const monthSelect = document.getElementById("attMonthSelect");
    const yearSelect = document.getElementById("attYearSelect");
    
    if(!monthSelect || !yearSelect) {
        if(btn) { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`; }
        return;
    }

    const month = monthSelect.value;
    const year = parseInt(yearSelect.value);

    // 🔴 ទាញយកសិស្សពី Memory ផ្ទាល់ (លឿនបំផុត) ជំនួសការទាញពី LocalStorage 🔴
    let allStus = [];
    if (window.allStudents && window.allStudents.length > 0) {
        allStus = window.allStudents;
    } else {
        try { allStus = JSON.parse(localStorage.getItem('academic_students')) || []; } catch(e) {}
    }

    // ចម្រោះយកតែសិស្សដែលកំពុងរៀន
    attendanceStudents = allStus.filter(s => s && typeof s === 'object' && s.status !== "Dropped");
    
    // តម្រៀបអក្ខរក្រម
    attendanceStudents.sort((a, b) => String(a.name || "").trim().localeCompare(String(b.name || "").trim(), "km"));

    // 🔴 ចាប់យកឈ្មោះថ្នាក់ពីសិស្សទី១ ផ្ទាល់តែម្តង (លឿន និងច្បាស់លាស់) 🔴
    let levelVal = "ថ្នាក់ទី 1";
    let roomVal = "«ក»";
    if (attendanceStudents.length > 0) {
        const firstStu = attendanceStudents[0];
        levelVal = String(firstStu.grade || "ថ្នាក់ទី 1").trim();
        if (!levelVal.includes("ថ្នាក់ទី")) levelVal = "ថ្នាក់ទី " + levelVal;
        roomVal = String(firstStu.room || "«ក»").trim();
    }
    const fullGradeName = `${levelVal} ${roomVal}`;

    // Update UI ឈ្មោះខែ និងថ្នាក់
    const titleEl = document.getElementById("lblMonthTitle");
    if(titleEl) titleEl.textContent = month;

    const attHeaderGrade = document.getElementById("attHeaderGrade");
    if (attHeaderGrade) attHeaderGrade.textContent = `${levelVal.replace('ថ្នាក់ទី', '').trim()} ${roomVal}`;

    // រៀបចំប្រតិទិន
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    try {
        const savedHolidays = JSON.parse(localStorage.getItem(`att_holidays_${fullGradeName}_${month}_${year}`) || '{}');
        window.monthlyHolidays = savedHolidays;
    } catch(e) { window.monthlyHolidays = {}; }

    window.renderCalendarHeaders(year, monthNum, daysInMonth);

    const tbody = document.getElementById("attendanceTableRows");
    if(tbody) tbody.innerHTML = `<tr><td colspan="42" class="p-20 text-center text-slate-400 font-bold"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-rose-400"></i><br>កំពុងរៀបចំទិន្នន័យ...</td></tr>`;

    try {
        let attRes = [];
        try { 
            const rawAtt = localStorage.getItem('academic_attendance');
            if (rawAtt) attRes = JSON.parse(rawAtt) || []; 
        } catch(e) {}

        monthlyAttendanceData = {};
        try {
            const cached = JSON.parse(localStorage.getItem(`att_${fullGradeName}_${month}_${year}`) || '{}');
            monthlyAttendanceData = { ...cached };
        } catch(e) {}

        if (attRes && attRes.length > 0) {
            attRes.forEach(r => {
                if (!r || typeof r !== 'object') return;
                
                // បើមានមុខងារ isRecordInMonth លោកគ្រូអាចបើកវិញបាន តែបើអត់ទេ ប្រើលក្ខខណ្ឌផ្ទាល់ខាងក្រោម
                // if (typeof isRecordInMonth === 'function' && !isRecordInMonth(r, month, monthNum, year)) return;
                
                const rMonth = String(r.month || "").trim();
                if (rMonth !== month) return;

                const day = typeof parseDayNumber === 'function' ? parseDayNumber(r.date || r.day) : parseInt(r.date || r.day, 10);
                if (!day || day < 1 || day > daysInMonth) return;
                
                const stuId = String(r.student_id || r.studentId || r.id || "").trim();

                if (stuId) {
                    if (!monthlyAttendanceData[stuId]) monthlyAttendanceData[stuId] = {};
                    monthlyAttendanceData[stuId][day] = typeof normalizeStatus === 'function' ? normalizeStatus(r.status || r.attendance || r['ស្ថានភាព']) : (r.status || r.attendance || r['ស្ថានភាព']);
                }
            });
        }

        // បញ្ចូលថ្ងៃឈប់សម្រាក
        Object.keys(window.monthlyHolidays).forEach(dayKey => {
            const d = parseInt(dayKey, 10);
            if (d >= 1 && d <= daysInMonth) {
                attendanceStudents.forEach(s => {
                    if (!monthlyAttendanceData[s.id]) monthlyAttendanceData[s.id] = {};
                    if (!monthlyAttendanceData[s.id][d]) {
                        monthlyAttendanceData[s.id][d] = "៖";
                    }
                });
            }
        });

        try { localStorage.setItem(`att_${fullGradeName}_${month}_${year}`, JSON.stringify(monthlyAttendanceData)); } catch(e) {}

        window.monthlyAttendanceData = monthlyAttendanceData;
        window.renderAttendanceRows(daysInMonth);

    } catch (err) {
        console.error("កំហុសក្នុងការទាញយកទិន្នន័យវត្តមាន:", err);
        if(tbody) tbody.innerHTML = `<tr><td colspan="42" class="p-20 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i><br>បរាជ័យក្នុងការទាញយកទិន្នន័យ: ${err.message}</td></tr>`;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`;
        }
    }
};

window.renderCalendarHeaders = function(year, monthNum, daysInMonth) {
    const trKhmer = document.getElementById("trKhmerDays");
    const trNums = document.getElementById("trDayNumbers");
    if (!trKhmer || !trNums) return;

    let khmerDaysHtml = `
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 sticky left-0 z-20 bg-slate-100" style="width: 40px; min-width: 40px; max-width: 40px;">ល.រ</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 sticky left-[40px] z-20 bg-slate-100 hidden md:table-cell" style="width: 75px; min-width: 75px; max-width: 75px;">អត្តលេខ</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black text-left px-4 sticky md:left-[115px] left-[40px] z-20 bg-slate-100" style="width: 195px; min-width: 195px; max-width: 195px;">គោត្តនាម និងនាម</th>
      <th rowspan="2" class="border-r border-slate-300 print:border-black p-2 bg-slate-50" style="width: 42px; min-width: 42px; max-width: 42px;">ភេទ</th>
    `;
    let numDaysHtml = "";

    for (let d = 1; d <= 31; d++) {
        let dayName = "-";
        let isSunday = false;

        if (d <= daysInMonth) {
            const dateObj = new Date(year, monthNum - 1, d);
            dayName = KHMER_DAYS[dateObj.getDay()];
            isSunday = dateObj.getDay() === 0;
        }

        const isHoliday = !!window.monthlyHolidays[d];
        const hInfo = window.monthlyHolidays[d] || {};
        
        let headerClass = 'bg-slate-100 text-slate-600';
        let numClass = 'bg-white text-slate-700';

        if (isSunday) {
            headerClass = 'text-rose-600 bg-rose-100/80';
            numClass = 'text-rose-600 bg-rose-50 border-b-2 border-rose-200';
        } else if (isHoliday) {
            headerClass = 'text-amber-800 bg-amber-200';
            numClass = 'text-amber-900 bg-amber-50 font-black border-b-2 border-amber-300';
        }

        const tooltipTitle = isHoliday 
            ? `ថ្ងៃឈប់សម្រាក ៖ ${hInfo.title || 'បុណ្យ/ប្រជុំ'}` 
            : (isSunday ? 'ថ្ងៃអាទិត្យ' : `ថ្ងៃទី ${d} - ចុចដើម្បីកត់វត្តមាន`);
        
        khmerDaysHtml += `<th class="border-r border-slate-300 print:border-black font-bold cursor-pointer hover:opacity-80 transition ${headerClass}" onclick="window.openDailyAttendanceModal(${d})" title="${tooltipTitle}" style="width: 36px; min-width: 36px; max-width: 36px;">${dayName}</th>`;
        numDaysHtml += `<th class="border-r border-slate-300 print:border-black font-mono text-xs cursor-pointer hover:opacity-80 transition ${numClass}" onclick="window.openDailyAttendanceModal(${d})" title="${tooltipTitle}" style="width: 36px; min-width: 36px; max-width: 36px;">
          ${d <= daysInMonth ? d : '-'}
          ${isHoliday ? '<div class="w-1.5 h-1.5 bg-amber-500 rounded-full mx-auto mt-0.5 no-print shadow-sm"></div>' : ''}
        </th>`;
    }

    khmerDaysHtml += `
      <th colspan="4" class="border-r border-slate-300 print:border-black bg-blue-100 text-blue-900" style="width: 150px; min-width: 150px; max-width: 150px;">ចំនួនអវត្តមាន</th>
      <th rowspan="2" class="p-2 bg-slate-50" style="width: 90px; min-width: 90px; max-width: 90px;">ផ្សេងៗ</th>
    `;
    numDaysHtml += `
      <th class="border-r border-slate-300 print:border-black bg-blue-50 text-blue-800" title="មានច្បាប់ (ច្ប)" style="width: 36px; min-width: 36px; max-width: 36px;">ច្ប</th>
      <th class="border-r border-slate-300 print:border-black bg-rose-50 text-rose-800" title="អត់ច្បាប់ (អច្ប)" style="width: 36px; min-width: 36px; max-width: 36px;">អច្ប</th>
      <th class="border-r border-slate-300 print:border-black bg-purple-50 text-purple-800" title="ឈឺមានច្បាប់ (ឈ)" style="width: 36px; min-width: 36px; max-width: 36px;">ឈ</th>
      <th class="border-r border-slate-300 print:border-black bg-amber-100 text-amber-900 border-b-2 border-amber-300" style="width: 42px; min-width: 42px; max-width: 42px;">សរុប</th>
    `;

    trKhmer.innerHTML = khmerDaysHtml;
    trNums.innerHTML = numDaysHtml;
};

window.renderAttendanceRows = function(daysInMonth) {
    const tbody = document.getElementById("attendanceTableRows");
    if (!tbody) return;
    
    if (!attendanceStudents || attendanceStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="42" class="p-24 text-center">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full text-slate-300 text-4xl mb-4"><i class="fa-solid fa-folder-open"></i></div>
                    <h3 class="text-slate-500 font-bold text-lg">មិនទាន់មានសិស្សក្នុងថ្នាក់នេះនៅឡើយទេ</h3>
                    <p class="text-slate-400 text-sm mt-1">សូមបញ្ជូលបញ្ជីសិស្សតាមរយៈផ្ទាំង <b class="text-indigo-500">"គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស"</b> ជាមុនសិន</p>
                </td>
            </tr>`;
        
        // ធានាថាកាតគណនាមិនគាំងទោះគ្មានសិស្ស
        if(typeof window.calculateAllAttendance === 'function') {
             window.calculateAllAttendance();
        }
        return;
    }

    try {
        const yearSelect = document.getElementById("attYearSelect");
        const monthSelect = document.getElementById("attMonthSelect");
        const year = parseInt(yearSelect ? yearSelect.value : new Date().getFullYear());
        const monthIdx = monthSelect ? monthSelect.selectedIndex : 0;

        let rowsHTML = "";

        attendanceStudents.forEach((s, idx) => {
            if (!s || typeof s !== 'object') return;

            const genderShort = s.gender === "ស្រី" ? "ស" : "ប";
            const genderColor = s.gender === "ស្រី" ? "text-rose-600 bg-rose-50/60" : "text-blue-700 bg-blue-50/60";
            const studentData = monthlyAttendanceData[s.id] || {};

            let dayInputs = "";
            for (let d = 1; d <= 31; d++) {
                if (d <= daysInMonth) {
                    let val = studentData[d] || "";
                    if (val === "ច្បាប់" || val === "ច") val = "ច្ប";
                    else if (val === "ឥតច្បាប់" || val === "អ") val = "អច្ប";
                    else if (val === "ឈឺ") val = "ឈ";
                    else if (val === "ឈប់សម្រាក") val = "៖";

                    const dateObj = new Date(year, monthIdx, d);
                    const isSunday = dateObj.getDay() === 0;
                    const isHoliday = !!window.monthlyHolidays[d];

                    let bgCellClass = "bg-white";
                    if (isSunday) bgCellClass = "bg-rose-50/40";
                    if (isHoliday) bgCellClass = "bg-amber-50";

                    dayInputs += `
                      <td class="border-r border-slate-200 print:border-black p-0 relative ${bgCellClass} hover:bg-slate-100 transition-colors" style="width: 36px; min-width: 36px; max-width: 36px;">
                        <input type="text" maxlength="4" id="att_${s.id}_${d}" value="${val}" data-row="${idx}" data-col="${d}"
                               oninput="window.handleAttInput(this, '${s.id}', ${daysInMonth})" 
                               class="att-input w-full h-[36px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase ${window.getColorClass(val)} cursor-text transition-all focus:bg-white">
                      </td>
                    `;
                } else {
                    dayInputs += `<td class="border-r border-slate-200 print:border-black bg-slate-50/80" style="width: 36px; min-width: 36px; max-width: 36px;"></td>`;
                }
            }

            rowsHTML += `
              <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-200 print:border-black h-[36px] bg-white group">
                <td class="border-r border-slate-200 print:border-black text-center font-bold sticky left-0 z-10 bg-white group-hover:bg-slate-50 font-mono text-[11px] text-slate-400" style="width: 40px; min-width: 40px; max-width: 40px;">${idx + 1}</td>
                <td class="border-r border-slate-200 print:border-black text-center font-mono text-[11px] font-bold text-indigo-400/70 hidden md:table-cell sticky left-[40px] z-10 bg-white group-hover:bg-slate-50" style="width: 75px; min-width: 75px; max-width: 75px;">${s.id || '-'}</td>
                <td class="border-r border-slate-200 print:border-black px-4 text-left font-bold text-slate-800 sticky md:left-[115px] left-[40px] z-10 bg-white group-hover:bg-slate-50 font-Siemreap text-[13px] truncate" style="width: 195px; min-width: 195px; max-width: 195px;" title="${s.name || ''}">${s.name || '-'}</td>
                <td class="border-r border-slate-200 print:border-black text-center font-bold ${genderColor} font-Siemreap text-[12px]" style="width: 42px; min-width: 42px; max-width: 42px;">${genderShort}</td>
                
                ${dayInputs}

                <td class="border-r border-slate-200 print:border-black text-center font-mono font-bold text-blue-700 bg-blue-50/50 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="perm_${s.id}">0</td>
                <td class="border-r border-slate-200 print:border-black text-center font-mono font-bold text-rose-700 bg-rose-50/50 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="unex_${s.id}">0</td>
                <td class="border-r border-slate-200 print:border-black text-center font-mono font-bold text-purple-700 bg-purple-50/50 text-xs" style="width: 36px; min-width: 36px; max-width: 36px;" id="sick_${s.id}">0</td>
                <td class="border-r border-slate-200 print:border-black text-center font-mono font-black text-amber-800 bg-amber-100/50 text-xs shadow-[inset_1px_0_0_rgba(0,0,0,0.05)]" style="width: 42px; min-width: 42px; max-width: 42px;" id="tot_${s.id}">0</td>
                <td class="p-0 bg-white group-hover:bg-slate-50" style="width: 90px; min-width: 90px; max-width: 90px;">
                  <input type="text" id="note_${s.id}" class="w-full h-[36px] text-[11px] border-0 bg-transparent px-2 outline-none text-slate-500 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-slate-200 font-Siemreap placeholder:text-slate-300 placeholder:font-normal" placeholder="ចំណាំ...">
                </td>
              </tr>
            `;
        });

        tbody.innerHTML = rowsHTML;

        if (typeof window.calculateAllAttendance === 'function') {
             window.calculateAllAttendance(); 
        }

    } catch (err) {
        console.error("Render Table Rows Error:", err);
        tbody.innerHTML = `<tr><td colspan="42" class="p-20 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-4xl mb-4"></i><br>បរាជ័យក្នុងការគូរតារាង: ${err.message}</td></tr>`;
    }
};

window.getColorClass = function(val) {
    const v = String(val || "").trim().toUpperCase();
    if (v === "ច" || v === "ច្ប" || v === "C") return "text-blue-600 font-black bg-blue-100/80";
    if (v === "អ" || v === "អច្ប" || v === "A") return "text-rose-600 font-black bg-rose-100/80";
    if (v === "ឈ" || v === "S") return "text-purple-600 font-black bg-purple-100/80";
    if (v === "៖" || v === ":") return "text-amber-600 font-black bg-amber-100/80";
    return "text-slate-800 font-bold";
};

window.handleAttInput = function(inputEl, studentId, daysInMonth) {
    let cleanVal = inputEl.value.trim();
    if (cleanVal === "ច") cleanVal = "ច្ប";
    else if (cleanVal === "អ") cleanVal = "អច្ប";

    inputEl.className = `att-input w-full h-[36px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase ${window.getColorClass(cleanVal)} transition-all cursor-text focus:bg-white`;
    
    const col = parseInt(inputEl.getAttribute('data-col'));
    if (!monthlyAttendanceData[studentId]) monthlyAttendanceData[studentId] = {};
    monthlyAttendanceData[studentId][col] = cleanVal;
    window.monthlyAttendanceData = monthlyAttendanceData;

    if(typeof window.calculateStudentAbsence === 'function') window.calculateStudentAbsence(studentId, daysInMonth);
    if(typeof window.calculateDailyTotals === 'function') window.calculateDailyTotals(daysInMonth);
    if(typeof window.calculateMoEYSSummary === 'function') window.calculateMoEYSSummary();
};

window.calculateStudentAbsence = function(studentId, daysInMonth) {
    let permission = 0, unexcused = 0, sick = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const val = (document.getElementById(`att_${studentId}_${d}`)?.value || monthlyAttendanceData[studentId]?.[d] || "").trim().toUpperCase();
        if (val === "ច" || val === "ច្ប" || val === "C") permission++;
        else if (val === "អ" || val === "អច្ប" || val === "A") unexcused++;
        else if (val === "ឈ" || val === "S") sick++;
    }

    const permEl = document.getElementById(`perm_${studentId}`);
    const unexEl = document.getElementById(`unex_${studentId}`);
    const sickEl = document.getElementById(`sick_${studentId}`);
    const totEl = document.getElementById(`tot_${studentId}`);

    if (permEl) permEl.textContent = permission;
    if (unexEl) unexEl.textContent = unexcused;
    if (sickEl) sickEl.textContent = sick;
    if (totEl) totEl.textContent = (permission + unexcused + sick);
};

window.calculateDailyTotals = function(daysInMonth) {
    let dailyTotalsHtml = `
      <tr class="h-[40px] text-center bg-slate-100 font-siemreap shadow-inner">
        <td colspan="4" class="border-r border-slate-300 print:border-black px-4 text-right font-bold text-slate-700 sticky left-0 z-10 bg-slate-100 text-[11px] uppercase tracking-widest">សរុបអវត្តមានប្រចាំថ្ងៃ</td>`;
    
    let grandTotalPerm = 0, grandTotalUnex = 0, grandTotalSick = 0;

    for (let d = 1; d <= 31; d++) {
        if (d <= daysInMonth) {
            let dayAbsentCount = 0;
            attendanceStudents.forEach(s => {
                const val = (document.getElementById(`att_${s.id}_${d}`)?.value || monthlyAttendanceData[s.id]?.[d] || "").trim().toUpperCase();
                if (val === "ច" || val === "ច្ប" || val === "អ" || val === "អច្ប" || val === "ឈ" || val === "C" || val === "A" || val === "S") {
                    dayAbsentCount++;
                }
            });
            dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black font-mono text-[11px] ${dayAbsentCount > 0 ? 'text-rose-600 font-black bg-rose-100/80 shadow-inner' : 'text-slate-400 font-bold bg-slate-50/50'}">${dayAbsentCount || '-'}</td>`;
        } else {
            dailyTotalsHtml += `<td class="border-r border-slate-300 print:border-black bg-slate-200/50"></td>`;
        }
    }

    attendanceStudents.forEach(s => {
        grandTotalPerm += parseInt(document.getElementById(`perm_${s.id}`)?.textContent) || 0;
        grandTotalUnex += parseInt(document.getElementById(`unex_${s.id}`)?.textContent) || 0;
        grandTotalSick += parseInt(document.getElementById(`sick_${s.id}`)?.textContent) || 0;
    });

    const grandTotalAbsence = grandTotalPerm + grandTotalUnex + grandTotalSick;

    dailyTotalsHtml += `
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-blue-800 bg-blue-100 text-[11px]">${grandTotalPerm}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-rose-800 bg-rose-100 text-[11px]">${grandTotalUnex}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-bold text-purple-800 bg-purple-100 text-[11px]">${grandTotalSick}</td>
        <td class="border-r border-slate-300 print:border-black font-mono font-black text-amber-900 bg-amber-200 text-[11px] shadow-[inset_1px_0_0_rgba(0,0,0,0.05)]">${grandTotalAbsence}</td>
        <td class="bg-slate-100"></td>
      </tr>`;

    const foot = document.getElementById("attendanceTableFoot");
    if (foot) foot.innerHTML = dailyTotalsHtml;
};

window.calculateMoEYSSummary = function() {
    const studentRows = document.querySelectorAll("#mainAttendanceTable tbody tr");
    
    if(!attendanceStudents || attendanceStudents.length === 0 || (studentRows.length === 1 && studentRows[0].cells.length < 10)) {
        if(typeof window.renderKpiSummaryCards === 'function') {
             window.renderKpiSummaryCards({
                totalStudents: 0, femaleStudents: 0, grandPerm: 0, grandUnex: 0, grandSick: 0,
                totalAbsentSessions: 0, actualSchoolDays: 0, offDaysCount: 0, totalSessionsRequired: 0,
                actualAttendedSessions: 0, absencePercentage: "0.00", attendancePercentage: "0.00"
             });
        }
        return;
    }

    const totalStudents = attendanceStudents.length;
    let femaleStudents = 0;
    
    let grandPerm = 0;
    let grandUnex = 0; 
    let grandSick = 0; 
    
    studentRows.forEach(row => {
        if(row.cells.length > 3) {
            const gender = row.cells[3]?.innerText.trim() || "";
            if (gender === "ស" || gender === "ស្រី" || gender === "F") femaleStudents++;
            
            const inputs = row.querySelectorAll("input.att-input");
            inputs.forEach(input => {
                const val = input.value.trim().toUpperCase();
                if (val === "ច្ប" || val === "ច" || val === "C") grandPerm++;
                if (val === "អច្ប" || val === "អ" || val === "A") grandUnex++;
                if (val === "ឈ" || val === "S") grandSick++;
            });
        }
    });

    const totalAbsentSessions = grandPerm + grandUnex + grandSick;

    const yearSelect = document.getElementById("attYearSelect");
    const monthSelect = document.getElementById("attMonthSelect");
    
    const year = parseInt(yearSelect ? yearSelect.value : new Date().getFullYear());
    const monthName = monthSelect ? monthSelect.value : "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[monthName] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    let offDaysCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        if (window.monthlyHolidays[d]) offDaysCount++;
        else {
             if (new Date(year, monthNum - 1, d).getDay() === 0) offDaysCount++;
        }
    }
    
    const actualSchoolDays = daysInMonth - offDaysCount; 
    const totalSessionsRequired = actualSchoolDays * totalStudents;
    const actualAttendedSessions = totalSessionsRequired - totalAbsentSessions;

    let absencePercentage = 0;
    if (totalSessionsRequired > 0) {
        absencePercentage = (totalAbsentSessions * 100) / totalSessionsRequired;
    }

    let attendancePercentage = totalSessionsRequired > 0 ? (100 - absencePercentage) : 0;

    const summaryData = {
        totalStudents,
        femaleStudents,
        grandPerm,
        grandUnex,
        grandSick,
        totalAbsentSessions,
        actualSchoolDays,
        offDaysCount,
        totalSessionsRequired,
        actualAttendedSessions,
        absencePercentage: absencePercentage.toFixed(2),
        attendancePercentage: attendancePercentage.toFixed(2)
    };
    
    if(typeof window.renderKpiSummaryCards === 'function') {
        window.renderKpiSummaryCards(summaryData);
    }
    return summaryData;
};

window.calculateAllAttendance = function() {
    try {
        const monthSelect = document.getElementById("attMonthSelect");
        const yearSelect = document.getElementById("attYearSelect");
        
        const month = monthSelect ? monthSelect.value : "មករា";
        const year = parseInt(yearSelect ? yearSelect.value : new Date().getFullYear());
        const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
        const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

        if (attendanceStudents && attendanceStudents.length > 0) {
            attendanceStudents.forEach(s => {
                if(typeof window.calculateStudentAbsence === 'function') {
                    window.calculateStudentAbsence(s.id, daysInMonth);
                }
            });
        }
        if(typeof window.calculateDailyTotals === 'function') window.calculateDailyTotals(daysInMonth);
        if(typeof window.calculateMoEYSSummary === 'function') window.calculateMoEYSSummary();
    } catch(e) {
        console.error("calculateAllAttendance error:", e);
    }
};

window.renderKpiSummaryCards = function(d) {
    const el = document.getElementById("attendanceKpiSummaryContainer");
    if (!el) return;

    el.innerHTML = `
      <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:shadow-md transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold shadow-sm">
           <i class="fa-solid fa-users"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">សិស្សសរុប</div>
            <div class="text-lg font-black text-slate-800 font-mono leading-none">
              ${window.toKhmerNum(d.totalStudents.toString())} <span class="text-[10px] font-bold text-slate-400 font-siemreap">(ស្រី ${window.toKhmerNum(d.femaleStudents.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:shadow-md transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm">
           <i class="fa-solid fa-calendar-days"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">ថ្ងៃរៀនជាក់ស្តែង</div>
            <div class="text-lg font-black text-indigo-700 font-mono leading-none">
              ${window.toKhmerNum(d.actualSchoolDays.toString())} <span class="text-[10px] font-bold text-slate-400 font-siemreap">ថ្ងៃ (ឈប់ ${window.toKhmerNum(d.offDaysCount.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:shadow-md transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold shadow-sm">
           <i class="fa-solid fa-clock"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">ពេលត្រូវមករៀន</div>
            <div class="text-lg font-black text-amber-800 font-mono leading-none">
              ${window.toKhmerNum(d.totalSessionsRequired.toString())} <span class="text-[10px] font-bold text-slate-400 font-siemreap">ពេល</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:shadow-md transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold shadow-sm">
           <i class="fa-solid fa-user-xmark"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">អវត្តមានសរុប</div>
            <div class="text-lg font-black text-rose-600 font-mono leading-none">
              ${window.toKhmerNum(d.totalAbsentSessions.toString())} <span class="text-[10px] font-bold text-rose-400 font-siemreap">(ឈឺ ${window.toKhmerNum(d.grandSick.toString())})</span>
            </div>
         </div>
      </div>

      <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:shadow-md transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shadow-sm">
           <i class="fa-solid fa-user-check"></i>
         </div>
         <div>
            <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">វត្តមានជាក់ស្តែង</div>
            <div class="text-lg font-black text-emerald-600 font-mono leading-none">
              ${window.toKhmerNum(d.actualAttendedSessions.toString())} <span class="text-[10px] font-bold text-slate-400 font-siemreap">ពេល</span>
            </div>
         </div>
      </div>

      <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-[1.5rem] border border-emerald-400 shadow-[0_4px_15px_-3px_rgba(16,185,129,0.4)] flex items-center gap-4 hover:shadow-lg transition transform hover:-translate-y-0.5">
         <div class="w-12 h-12 rounded-[1.2rem] bg-white/20 text-white flex items-center justify-center text-xl font-bold shadow-sm border border-white/30 backdrop-blur-sm">
           <i class="fa-solid fa-percent"></i>
         </div>
         <div>
            <div class="text-[11px] text-emerald-50 font-bold uppercase tracking-wider mb-0.5">អត្រាវត្តមាន</div>
            <div class="text-xl font-black text-white font-mono leading-none drop-shadow-sm">
              ${window.toKhmerNum(d.attendancePercentage)}% 
            </div>
         </div>
      </div>
    `;
};

// =====================================================================
// ៤. ផ្ទាំង Pop-Up កំណត់ថ្ងៃឈប់សម្រាក (Holiday Manager)
// =====================================================================
window.openHolidayManagerModal = function() {
    let modal = document.getElementById("holidayManagerModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "holidayManagerModal";
        modal.className = "fixed inset-0 z-[130] bg-slate-900/70 backdrop-blur-md flex justify-center items-center p-2 sm:p-4 no-print";
        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    window.renderHolidayModalContent();
};

window.renderHolidayModalContent = function() {
    const modal = document.getElementById("holidayManagerModal");
    if (!modal) return;

    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    
    const gradeInfo = window.getTeacherGradeInfo();
    const levelVal = gradeInfo.level;
    const roomVal = gradeInfo.room;

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    let thursdayCount = 0;
    let fourthThursdayDay = null;
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        if (dObj.getDay() === 4) { 
            thursdayCount++;
            if (thursdayCount === 4) fourthThursdayDay = d;
        }
    }

    let dayItemsHtml = "";
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        const dayOfWeek = KHMER_DAYS[dObj.getDay()];
        const isSunday = dObj.getDay() === 0;
        const is4thThu = (d === fourthThursdayDay);
        
        const isOff = !!window.monthlyHolidays[d];
        const hInfo = window.monthlyHolidays[d] || {};

        let badgeType = isSunday ? 'ថ្ងៃអាទិត្យ' : (is4thThu ? 'ព្រហស្បតិ៍ទី៤' : '');
        let bgStyle = isOff ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-200';

        dayItemsHtml += `
          <div class="p-4 rounded-[1.5rem] border ${bgStyle} transition-all flex flex-col justify-between hover:shadow-md">
             <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-3">
                   <span class="w-10 h-10 rounded-[0.8rem] ${isSunday?'bg-rose-100 text-rose-700':(isOff?'bg-amber-500 text-white shadow-sm':'bg-slate-100 text-slate-600')} font-mono font-bold flex items-center justify-center text-sm transition-colors">
                     ${d}
                   </span>
                   <div>
                     <span class="font-bold text-[13px] ${isSunday?'text-rose-600':'text-slate-800'}">${dayOfWeek}</span>
                     ${badgeType ? `<span class="block text-[10px] ${isSunday?'text-rose-500':'text-amber-600'} font-bold mt-0.5">${badgeType}</span>` : ''}
                   </div>
                </div>

                <label class="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" ${isOff ? 'checked' : ''} onchange="window.toggleHolidayDay(${d}, this.checked)" class="sr-only peer">
                   <div class="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </label>
             </div>

             <div class="${isOff ? 'block animate-fade-in' : 'hidden'} space-y-2 pt-3 border-t border-amber-200/60">
                <select onchange="window.setHolidayType(${d}, this.value)" class="w-full bg-white border border-amber-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
                  <option value="holiday" ${hInfo.type==='holiday'?'selected':''}>🎉 ថ្ងៃបុណ្យ (Holiday)</option>
                  <option value="meeting" ${hInfo.type==='meeting'?'selected':''}>🏛️ ថ្ងៃប្រជុំ (Meeting)</option>
                  <option value="thursday4" ${hInfo.type==='thursday4'?'selected':''}>📅 ព្រហស្បតិ៍សប្តាហ៍ទី៤</option>
                  <option value="teacher_absent" ${hInfo.type==='teacher_absent'?'selected':''}>👨‍🏫 គ្រូអវត្តមាន</option>
                  <option value="sunday" ${hInfo.type==='sunday'?'selected':''}>☀️ ថ្ងៃអាទិត្យ</option>
                  <option value="other" ${hInfo.type==='other'?'selected':''}>📌 ផ្សេងៗ</option>
                </select>

                <input type="text" placeholder="មូលហេតុឈប់..." value="${hInfo.title || ''}" 
                       oninput="window.setHolidayTitle(${d}, this.value)"
                       class="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30 placeholder:text-slate-400">
             </div>
          </div>
        `;
    }

    const totalSetHolidays = Object.keys(window.monthlyHolidays).length;

    modal.innerHTML = `
      <div class="w-full max-w-5xl bg-slate-50 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden animate-scale-up font-siemreap">
        
        <div class="px-6 md:px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-100">
               <i class="fa-solid fa-calendar-xmark"></i>
             </div>
             <div>
                <h3 class="text-base md:text-lg font-moul text-slate-800">កំណត់ថ្ងៃឈប់សម្រាក ថ្ងៃបុណ្យ និងថ្ងៃប្រជុំ</h3>
                <p class="text-[13px] text-slate-500 font-bold mt-1">
                  ${levelVal} ${roomVal} | ខែ${month} ឆ្នាំ${year} <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg ml-2 border border-amber-200">កំណត់បាន ៖ ${window.toKhmerNum(totalSetHolidays.toString())} ថ្ងៃ</span>
                </p>
             </div>
          </div>

          <button onclick="document.getElementById('holidayManagerModal').classList.add('hidden')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition hover:scale-105">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="bg-amber-50/50 px-6 md:px-8 py-4 border-b border-amber-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3">
             <span class="font-bold text-[13px] text-amber-900 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
               <i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i> បំពេញស្វ័យប្រវត្តិ
             </span>
             <button onclick="window.autoSetAllSundays()" class="px-4 py-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow">
               ☀️ ថ្ងៃអាទិត្យទាំងអស់
             </button>
             ${fourthThursdayDay ? `
               <button onclick="window.autoSet4thThursday(${fourthThursdayDay})" class="px-4 py-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow">
                 📅 ព្រហស្បតិ៍ទី៤ (ទី ${fourthThursdayDay})
               </button>
             ` : ''}
          </div>

          <button onclick="window.clearAllHolidays()" class="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[13px] font-bold transition shadow-sm hover:shadow">
            <i class="fa-solid fa-trash-can"></i> សម្អាតថ្ងៃឈប់ទាំងអស់
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
           ${dayItemsHtml}
        </div>

        <div class="px-6 md:px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div class="text-[13px] text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
             ថ្ងៃឈប់សម្រាកសរុប ៖ <b class="text-amber-600 font-mono text-base ml-1">${window.toKhmerNum(totalSetHolidays.toString())}</b> ថ្ងៃ
          </div>

          <button onclick="window.applyAndSaveHolidays()" class="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-[14px] font-black shadow-lg shadow-amber-200 transition transform hover:-translate-y-1 flex items-center gap-2">
            <i class="fa-solid fa-floppy-disk"></i> រក្សាទុក និងអនុវត្ត
          </button>
        </div>

      </div>
    `;
};

window.toggleHolidayDay = function(day, isChecked) {
    if (isChecked) {
        const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
        const month = document.getElementById("attMonthSelect")?.value || "មករា";
        const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
        const dObj = new Date(year, (monthMap[month] || 1) - 1, day);
        const isSunday = dObj.getDay() === 0;

        window.monthlyHolidays[day] = {
            type: isSunday ? 'sunday' : 'holiday',
            title: isSunday ? 'ថ្ងៃអាទិត្យ' : 'ថ្ងៃឈប់សម្រាក'
        };
    } else {
        delete window.monthlyHolidays[day];
    }
    window.renderHolidayModalContent();
};

window.setHolidayType = function(day, typeVal) {
    if (!window.monthlyHolidays[day]) window.monthlyHolidays[day] = {};
    window.monthlyHolidays[day].type = typeVal;
    if (typeVal === 'sunday' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ថ្ងៃអាទិត្យ';
    if (typeVal === 'thursday4' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ប្រជុំបច្ចេកទេសព្រហស្បតិ៍សប្តាហ៍ទី៤';
    if (typeVal === 'meeting' && !window.monthlyHolidays[day].title) window.monthlyHolidays[day].title = 'ថ្ងៃប្រជុំ';
};

window.setHolidayTitle = function(day, titleVal) {
    if (!window.monthlyHolidays[day]) window.monthlyHolidays[day] = { type: 'holiday' };
    window.monthlyHolidays[day].title = titleVal;
};

window.autoSetAllSundays = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        if (dObj.getDay() === 0) {
            window.monthlyHolidays[d] = {
                type: 'sunday',
                title: 'ថ្ងៃអាទិត្យ'
            };
        }
    }
    window.renderHolidayModalContent();
    if (typeof showToast === 'function') showToast("☀️ បានកំណត់ថ្ងៃអាទិត្យទាំងអស់!");
};

window.autoSet4thThursday = function(dayNumber) {
    window.monthlyHolidays[dayNumber] = {
        type: 'thursday4',
        title: 'ប្រជុំបច្ចេកទេសព្រហស្បតិ៍សប្តាហ៍ទី៤'
    };
    window.renderHolidayModalContent();
    if (typeof showToast === 'function') showToast(`📅 បានកំណត់ថ្ងៃព្រហស្បតិ៍សប្តាហ៍ទី៤ (ថ្ងៃទី ${dayNumber})!`);
};

window.clearAllHolidays = function() {
    if (!confirm("តើអ្នកពិតជាចង់សម្អាតថ្ងៃឈប់សម្រាកទាំងអស់មែនទេ?")) return;
    window.monthlyHolidays = {};
    window.renderHolidayModalContent();
};

window.applyAndSaveHolidays = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    
    const gradeInfo = window.getTeacherGradeInfo();
    const levelVal = gradeInfo.level;
    const roomVal = gradeInfo.room;
    const fullGradeName = `${levelVal} ${roomVal}`;

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    try {
        localStorage.setItem(`att_holidays_${fullGradeName}_${month}_${year}`, JSON.stringify(window.monthlyHolidays));
    } catch(e) {}

    Object.keys(window.monthlyHolidays).forEach(dayKey => {
        const d = parseInt(dayKey, 10);
        if (d >= 1 && d <= daysInMonth) {
            attendanceStudents.forEach(s => {
                if (!monthlyAttendanceData[s.id]) monthlyAttendanceData[s.id] = {};
                if (!monthlyAttendanceData[s.id][d]) {
                    monthlyAttendanceData[s.id][d] = "៖";
                    const cellInput = document.getElementById(`att_${s.id}_${d}`);
                    if (cellInput) {
                        cellInput.value = "៖";
                        cellInput.className = `att-input w-full h-[36px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase ${window.getColorClass("៖")} transition-all cursor-text focus:bg-white`;
                    }
                }
            });
        }
    });

    window.monthlyAttendanceData = monthlyAttendanceData;
    window.renderCalendarHeaders(year, monthMap[month] || 1, daysInMonth);
    window.calculateAllAttendance();

    document.getElementById("holidayManagerModal")?.classList.add("hidden");
    if (typeof showToast === 'function') showToast("✅ បានរក្សាទុក និងអនុវត្តថ្ងៃឈប់សម្រាកបានជោគជ័យ!");
};

// =====================================================================
// ៥. ផ្ទាំង Pop-Up កត់វត្តមានប្រចាំថ្ងៃ (Daily Attendance Modal)
// =====================================================================
window.currentDailyAttendanceDay = new Date().getDate();
window.dailyModalSearchQuery = "";
window.dailyModalStatusFilter = "all";

window.openDailyAttendanceModal = function(selectedDay = null) {
    if (!attendanceStudents || attendanceStudents.length === 0) {
        alert("សូមទាញយកបញ្ជីវត្តមានជាមុនសិន!");
        return;
    }

    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (selectedDay !== null && selectedDay >= 1 && selectedDay <= daysInMonth) {
        window.currentDailyAttendanceDay = selectedDay;
    } else {
        const today = new Date().getDate();
        window.currentDailyAttendanceDay = today <= daysInMonth ? today : 1;
    }

    let modal = document.getElementById("dailyAttendanceModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "dailyAttendanceModal";
        modal.className = "fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-md flex justify-center items-center p-2 sm:p-4 no-print";
        document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    window.renderDailyModalContent();
};

window.renderDailyModalContent = function() {
    const modal = document.getElementById("dailyAttendanceModal");
    if (!modal) return;

    const targetDay = window.currentDailyAttendanceDay;
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    
    const gradeInfo = window.getTeacherGradeInfo();
    const levelVal = gradeInfo.level;
    const roomVal = gradeInfo.room;

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const dateObj = new Date(year, monthNum - 1, targetDay);
    const dayOfWeek = KHMER_DAYS[dateObj.getDay()];
    const isSunday = dateObj.getDay() === 0;

    const isHoliday = !!window.monthlyHolidays[targetDay];
    const hInfo = window.monthlyHolidays[targetDay] || {};

    let countPresent = 0, countPerm = 0, countUnex = 0, countSick = 0, countHoliday = 0;
    attendanceStudents.forEach(s => {
        const val = (document.getElementById(`att_${s.id}_${targetDay}`)?.value || monthlyAttendanceData[s.id]?.[targetDay] || "").trim().toUpperCase();
        if (val === "ច" || val === "ច្ប" || val === "C") countPerm++;
        else if (val === "អ" || val === "អច្ប" || val === "A") countUnex++;
        else if (val === "ឈ" || val === "S") countSick++;
        else if (val === "៖" || val === ":") countHoliday++;
        else countPresent++;
    });

    let dayOptions = "";
    for (let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, monthNum - 1, d);
        const dKh = KHMER_DAYS[dObj.getDay()];
        const hLabel = window.monthlyHolidays[d] ? ` - ឈប់` : '';
        dayOptions += `<option value="${d}" ${d === targetDay ? 'selected' : ''}>ថ្ងៃទី ${window.toKhmerNum(d.toString())} (${dKh}${hLabel})</option>`;
    }

    let filteredStudents = attendanceStudents.filter(s => {
        const matchName = !window.dailyModalSearchQuery || s.name.toLowerCase().includes(window.dailyModalSearchQuery) || String(s.id).includes(window.dailyModalSearchQuery);
        const val = (document.getElementById(`att_${s.id}_${targetDay}`)?.value || monthlyAttendanceData[s.id]?.[targetDay] || "").trim().toUpperCase();
        
        let matchStatus = true;
        if (window.dailyModalStatusFilter === "present") matchStatus = (!val || val === "វ");
        else if (window.dailyModalStatusFilter === "perm") matchStatus = (val === "ច" || val === "ច្ប" || val === "C");
        else if (window.dailyModalStatusFilter === "unex") matchStatus = (val === "អ" || val === "អច្ប" || val === "A");
        else if (window.dailyModalStatusFilter === "sick") matchStatus = (val === "ឈ" || val === "S");
        else if (window.dailyModalStatusFilter === "holiday") matchStatus = (val === "៖" || val === ":");

        return matchName && matchStatus;
    });

    const studentCardsHtml = filteredStudents.map((stu, i) => {
        const val = (document.getElementById(`att_${stu.id}_${targetDay}`)?.value || monthlyAttendanceData[stu.id]?.[targetDay] || "").trim().toUpperCase();

        const isPresent = !val || val === "វ";
        const isPerm = val === "ច" || val === "ច្ប" || val === "C";
        const isUnex = val === "អ" || val === "អច្ប" || val === "A";
        const isSick = val === "ឈ" || val === "S";
        const isHolidayStatus = val === "៖" || val === ":";

        return `
          <div class="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition shadow-sm hover:shadow-md hover:border-indigo-100">
             <div class="flex items-center gap-4">
               <div class="w-10 h-10 rounded-[0.8rem] bg-slate-100 flex items-center justify-center font-mono font-bold text-sm text-slate-500 shadow-inner">
                 ${i + 1}
               </div>
               <div>
                  <div class="font-moul text-[13px] text-slate-800 leading-tight">${stu.name}</div>
                  <div class="text-[11px] text-slate-400 font-siemreap mt-1">
                    ភេទ ៖ <span class="${stu.gender==='ស្រី'?'text-rose-600 bg-rose-50':'text-blue-600 bg-blue-50'} px-2 py-0.5 rounded font-bold">${stu.gender||'ប្រុស'}</span> | ID: <span class="font-mono text-slate-500">${stu.id}</span>
                  </div>
               </div>
             </div>

             <div class="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-bold font-siemreap shadow-inner">
                <button onclick="window.setDailyStatus('${stu.id}', '')" 
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${isPresent ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}">
                  <i class="fa-solid fa-check text-[11px]"></i> វត្តមាន
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'ច្ប')" 
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${isPerm ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}">
                  ច្បាប់
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'អច្ប')" 
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${isUnex ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'}">
                  អត់ច្បាប់
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', 'ឈ')" 
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${isSick ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'}">
                  ឈឺ
                </button>
                <button onclick="window.setDailyStatus('${stu.id}', '៖')" 
                        class="px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${isHolidayStatus ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'}">
                  សម្រាក
                </button>
             </div>
          </div>
        `;
    }).join("");

    modal.innerHTML = `
      <div class="w-full max-w-3xl bg-slate-50 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden animate-scale-up font-siemreap">
        
        <div class="p-5 px-6 md:px-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-[1.2rem] bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-sm border border-rose-100">
               <i class="fa-solid fa-calendar-day"></i>
             </div>
             <div>
                <h3 class="text-base md:text-lg font-moul text-slate-800">កត់វត្តមានប្រចាំថ្ងៃ</h3>
                <p class="text-[12px] text-slate-500 font-bold mt-1">
                  ${levelVal} ${roomVal} | ខែ${month} ឆ្នាំ${year}
                </p>
             </div>
          </div>

          <div class="flex items-center gap-3">
            <select onchange="window.switchDailyModalDay(this.value)" class="bg-slate-50 border border-slate-200 text-[13px] font-bold text-slate-700 px-4 py-2 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-rose-500/30">
              ${dayOptions}
            </select>
            <button onclick="document.getElementById('dailyAttendanceModal').classList.add('hidden')" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition hover:scale-105">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 md:px-8 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 flex-wrap">
             <span class="px-3 py-1.5 rounded-xl font-bold shadow-sm ${isSunday?'bg-rose-100 text-rose-700 border border-rose-200':(isHoliday?'bg-amber-100 text-amber-900 border border-amber-300':'bg-white text-indigo-700 border border-indigo-200')}">
               <i class="fa-regular fa-calendar text-[11px] mr-1"></i> ${dayOfWeek} ទី ${window.toKhmerNum(targetDay.toString())}
               ${isHoliday ? `<span class="ml-1 opacity-80 font-normal">(${hInfo.title || 'ថ្ងៃឈប់សម្រាក'})</span>` : ''}
             </span>
             <div class="h-6 w-px bg-slate-300 hidden md:block mx-1"></div>
             <div class="flex items-center gap-2 text-[11px] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                 <span class="text-emerald-600 font-bold">វត្តមាន៖ ${window.toKhmerNum(countPresent.toString())}</span>
                 <span class="text-slate-300">|</span>
                 <span class="text-blue-600 font-bold">ច្បាប់៖ ${window.toKhmerNum(countPerm.toString())}</span>
                 <span class="text-slate-300">|</span>
                 <span class="text-rose-600 font-bold">អត់ច្បាប់៖ ${window.toKhmerNum(countUnex.toString())}</span>
                 <span class="text-slate-300">|</span>
                 <span class="text-purple-600 font-bold">ឈឺ៖ ${window.toKhmerNum(countSick.toString())}</span>
             </div>
          </div>

          <div class="flex items-center gap-2">
             <button onclick="window.markAllDailyPresent()" class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition flex items-center gap-1.5 text-[12px] shadow-sm">
               <i class="fa-solid fa-check-double"></i> វត្តមានទាំងអស់
             </button>
             <button onclick="window.markAllDailyHoliday()" class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold transition flex items-center gap-1.5 text-[12px] shadow-sm">
               <i class="fa-solid fa-mug-hot"></i> សម្រាកទាំងអស់
             </button>
          </div>
        </div>

        <div class="p-4 px-6 md:px-8 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="relative flex-1 min-w-[200px] group">
             <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] group-focus-within:text-rose-500 transition-colors"></i>
             <input type="text" placeholder="ស្វែងរកឈ្មោះក្នុងបញ្ជី..." value="${window.dailyModalSearchQuery}"
                    oninput="window.filterDailyModalStudents(this.value, window.dailyModalStatusFilter)"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 focus:bg-white transition-all shadow-inner">
          </div>

          <div class="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-[11px] font-bold shadow-inner">
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'all')" 
                     class="px-3 py-1.5 rounded-lg transition ${window.dailyModalStatusFilter==='all'?'bg-slate-800 text-white shadow-sm':'text-slate-600 hover:text-slate-800'}">ទាំងអស់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'present')" 
                     class="px-3 py-1.5 rounded-lg transition ${window.dailyModalStatusFilter==='present'?'bg-emerald-600 text-white shadow-sm':'text-slate-600 hover:text-emerald-700'}">វត្តមាន</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'perm')" 
                     class="px-3 py-1.5 rounded-lg transition ${window.dailyModalStatusFilter==='perm'?'bg-blue-600 text-white shadow-sm':'text-slate-600 hover:text-blue-700'}">ច្បាប់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'unex')" 
                     class="px-3 py-1.5 rounded-lg transition ${window.dailyModalStatusFilter==='unex'?'bg-rose-600 text-white shadow-sm':'text-slate-600 hover:text-rose-700'}">អត់ច្បាប់</button>
             <button onclick="window.filterDailyModalStudents(window.dailyModalSearchQuery, 'sick')" 
                     class="px-3 py-1.5 rounded-lg transition ${window.dailyModalStatusFilter==='sick'?'bg-purple-600 text-white shadow-sm':'text-slate-600 hover:text-purple-700'}">ឈឺ</button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-slate-50/50">
           ${filteredStudents.length > 0 ? studentCardsHtml : '<div class="p-10 text-center"><div class="text-slate-300 text-4xl mb-3"><i class="fa-solid fa-box-open"></i></div><div class="text-slate-500 font-bold">រកមិនឃើញសិស្សតាមលក្ខខណ្ឌនេះទេ!</div></div>'}
        </div>

        <div class="p-5 px-6 md:px-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
             <button onclick="window.prevDailyModalDay()" ${targetDay <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
                     class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-xl flex items-center gap-2 transition hover:shadow-sm">
               <i class="fa-solid fa-arrow-left"></i> ថ្ងៃមុន
             </button>
             <button onclick="window.nextDailyModalDay()" ${targetDay >= daysInMonth ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} 
                     class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-xl flex items-center gap-2 transition hover:shadow-sm">
               ថ្ងៃបន្ទាប់ <i class="fa-solid fa-arrow-right"></i>
             </button>
          </div>

          <button onclick="window.closeDailyModalAndSave()" class="px-8 py-3 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white rounded-2xl text-[14px] font-black shadow-lg shadow-rose-200 transition transform hover:-translate-y-1 flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-lg"></i> រួចរាល់ & រក្សាទុក
          </button>
        </div>

      </div>
    `;
};

window.switchDailyModalDay = function(dayStr) {
    window.currentDailyAttendanceDay = parseInt(dayStr);
    window.renderDailyModalContent();
};

window.prevDailyModalDay = function() {
    if (window.currentDailyAttendanceDay > 1) {
        window.currentDailyAttendanceDay--;
        window.renderDailyModalContent();
    }
};

window.nextDailyModalDay = function() {
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (window.currentDailyAttendanceDay < daysInMonth) {
        window.currentDailyAttendanceDay++;
        window.renderDailyModalContent();
    }
};

window.setDailyStatus = function(studentId, statusVal) {
    const targetDay = window.currentDailyAttendanceDay;
    const year = parseInt(document.getElementById("attYearSelect")?.value || new Date().getFullYear());
    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const daysInMonth = new Date(year, monthMap[month] || 1, 0).getDate();

    if (!monthlyAttendanceData[studentId]) monthlyAttendanceData[studentId] = {};
    monthlyAttendanceData[studentId][targetDay] = statusVal;
    window.monthlyAttendanceData = monthlyAttendanceData;

    const cellInput = document.getElementById(`att_${studentId}_${targetDay}`);
    if (cellInput) {
        cellInput.value = statusVal;
        cellInput.className = `att-input w-full h-[36px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase ${window.getColorClass(statusVal)} transition-all cursor-text focus:bg-white`;
    }

    window.calculateStudentAbsence(studentId, daysInMonth);
    window.calculateDailyTotals(daysInMonth);
    window.calculateMoEYSSummary();
    window.renderDailyModalContent();
};

window.markAllDailyPresent = function() {
    attendanceStudents.forEach(s => window.setDailyStatus(s.id, ''));
    if (typeof showToast === 'function') showToast("✅ បានកំណត់វត្តមានពេញលេញសម្រាប់ថ្ងៃនេះ!");
};

window.markAllDailyHoliday = function() {
    attendanceStudents.forEach(s => window.setDailyStatus(s.id, '៖'));
    if (typeof showToast === 'function') showToast("☕ បានកំណត់ជាថ្ងៃឈប់សម្រាក!");
};

window.filterDailyModalStudents = function(query, statusFilter) {
    window.dailyModalSearchQuery = query.toLowerCase();
    window.dailyModalStatusFilter = statusFilter;
    window.renderDailyModalContent();
};

window.closeDailyModalAndSave = function() {
    document.getElementById("dailyAttendanceModal")?.classList.add("hidden");
    window.saveMonthlyAttendance();
};

// =====================================================================
// ៦. រក្សាទុកទិន្នន័យ (Save Batch to API & LocalStorage)
// =====================================================================
window.saveMonthlyAttendance = async function() {
    const btn = document.getElementById("btnSaveAttendance");
    const month = document.getElementById("attMonthSelect").value;
    const year = document.getElementById("attYearSelect").value;
    
    const gradeInfo = window.getTeacherGradeInfo();
    const grade = `${gradeInfo.level} ${gradeInfo.room}`;
    
    const currentTeacherId = window.AuthState ? window.AuthState.teacherId : localStorage.getItem('auth_teacher_id');
    const academicYearStr = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> កំពុងរក្សាទុក...`;
    }

    const monthMap = { "មករា": 1, "កុម្ភៈ": 2, "មីនា": 3, "មេសា": 4, "ឧសភា": 5, "មិថុនា": 6, "កក្កដា": 7, "សីហា": 8, "កញ្ញា": 9, "តុលា": 10, "វិច្ឆិកា": 11, "ធ្នូ": 12 };
    const monthNum = monthMap[month] || 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const batchPayload = [];

    attendanceStudents.forEach(s => {
        for (let d = 1; d <= daysInMonth; d++) {
            const val = (document.getElementById(`att_${s.id}_${d}`)?.value || monthlyAttendanceData[s.id]?.[d] || "").trim().toUpperCase();
            if (val) {
                let statusText = "វត្តមាន";
                if (val === "ច" || val === "ច្ប" || val === "C") statusText = "ច្បាប់";
                else if (val === "អ" || val === "អច្ប" || val === "A") statusText = "ឥតច្បាប់";
                else if (val === "ឈ" || val === "S") statusText = "ឈឺ";
                else if (val === "៖" || val === ":") statusText = "ឈប់សម្រាក";

                batchPayload.push({
                    student_id: s.id,
                    teacher_id: currentTeacherId,
                    academic_year: academicYearStr,
                    student_name: s.name,
                    date: `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    month: month,
                    grade: grade,
                    status: statusText
                });
            }
        }
    });

    try {
        localStorage.setItem(`att_${grade}_${month}_${year}`, JSON.stringify(monthlyAttendanceData));
        localStorage.setItem('academic_monthly_attendance', JSON.stringify(monthlyAttendanceData));
        localStorage.setItem(`att_holidays_${grade}_${month}_${year}`, JSON.stringify(window.monthlyHolidays));
    } catch(e) {}

    try {
        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof window.apiPost === 'function') {
            const res = await window.apiPost("saveAttendanceBatch", { data: batchPayload });
            if (res && res.status === "success") {
                if (typeof showToast === 'function') showToast("✅ រក្សាទុកវត្តមានទៅ Cloud បានជោគជ័យ!");
            } else {
                if (typeof showToast === 'function') showToast("✅ រក្សាទុកទិន្នន័យបានជោគជ័យ!");
            }
        } else {
            if (typeof showToast === 'function') showToast("✅ រក្សាទុកវត្តមានក្នុងម៉ាស៊ីន (Offline)!");
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast("✅ រក្សាទុកទិន្នន័យបណ្តោះអាសន្ន (Offline)!");
    } finally {
        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក`;
            }
        }, 600);
    }
};

window.clearAttendance = function() {
    if (!confirm("តើអ្នកពិតជាចង់សម្អាតវត្តមានទាំងអស់នៅលើតារាងនេះមែនទេ?")) return;
    const inputs = document.querySelectorAll("#attendanceTableRows input.att-input");
    inputs.forEach(el => {
        el.value = '';
        el.className = `att-input w-full h-[36px] text-center text-xs font-bold border-0 outline-none bg-transparent uppercase text-slate-700 cursor-text transition-all focus:bg-white`;
    });
    monthlyAttendanceData = {};
    window.monthlyAttendanceData = {};
    window.calculateAllAttendance();
};

window.setupAttExcelLikeNavigation = function() {
    const area = document.getElementById("attendanceWebArea");
    if (!area) return;
    area.addEventListener('keydown', function(e) {
        if (!e.target.classList.contains('att-input')) return;
        let r = parseInt(e.target.getAttribute('data-row'));
        let c = parseInt(e.target.getAttribute('data-col'));
        if (isNaN(r) || isNaN(c)) return;

        let nextInput = null;
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault(); nextInput = document.querySelector(`.att-input[data-row='${r+1}'][data-col='${c}']`);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); nextInput = document.querySelector(`.att-input[data-row='${r-1}'][data-col='${c}']`);
        } else if (e.key === 'ArrowRight') {
            nextInput = document.querySelector(`.att-input[data-row='${r}'][data-col='${c+1}']`);
        } else if (e.key === 'ArrowLeft') {
            nextInput = document.querySelector(`.att-input[data-row='${r}'][data-col='${c-1}']`);
        }
        if (nextInput) { nextInput.focus(); nextInput.select(); }
    });
};

window.filterAttendanceTable = function() {
    const search = document.getElementById("attSearch")?.value.toLowerCase() || "";
    const rows = document.querySelectorAll("#attendanceTableRows tr");
    rows.forEach(row => {
        if (row.children.length > 2) {
            const name = (row.children[2]?.textContent || "").toLowerCase();
            const id = (row.children[1]?.textContent || "").toLowerCase();
            row.style.display = (name.includes(search) || id.includes(search)) ? "" : "none";
        }
    });
};

// ==========================================
// Date Control Handlers (មុខងារកាលបរិច្ឆេទរួម)
// ==========================================
window.getKhmerLunarDate = function(dateObj) {
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKhNum = (num) => String(num).split('').map(n => khmerNumbers[n] || n).join('');
    const weekDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; 
    const y = dateObj.getFullYear();
    const dayName = weekDays[dateObj.getDay()];

    if (y === 2026 && m === 9) {
        let lunarDay = "";
        let lunarMonth = "ស្រាពណ៍";
        
        if (d <= 11) {
            lunarDay = `${toKhNum(d + 3)} រោច`;
        } else if (d >= 12 && d <= 26) {
            lunarMonth = "ភទ្របទ";
            lunarDay = `${toKhNum(d - 11)} កើត`;
        } else if (d >= 27) {
            lunarMonth = "ភទ្របទ";
            lunarDay = `${toKhNum(d - 26)} រោច`;
        }
        
        return `ថ្ងៃ${dayName} ${lunarDay} ខែ${lunarMonth} ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០`;
    }

    return `ថ្ងៃ${dayName} .............. ...កើត/រោច... ខែ............ ឆ្នាំ............ ព.ស. ២៥៧...`;
};

window.reportCardDateSettings = window.reportCardDateSettings || {
    location: "ធ្វើនៅ.....................",
    solarDate: `ថ្ងៃទី ........ ខែ ........ ឆ្នាំ ២០២...`,
    lunarDate: "ថ្ងៃ.............. ...កើត/រោច... ខែ............ ឆ្នាំ............ ព.ស.២៥៦...",
    showLunar: false
};

window.getDateSettingsPanelHTML = function(moduleName) {
  return `
    <div id="datePanel-${moduleName}" class="bg-indigo-50 p-4 rounded-[1.5rem] border border-indigo-100 flex flex-col xl:flex-row flex-wrap items-start xl:items-center justify-between gap-4 mt-4 mb-2 hidden no-print w-full shadow-inner animate-fade-in">
      <div class="flex flex-wrap items-center gap-4 w-full xl:w-auto">
        <div class="flex items-center gap-2">
          <span class="font-bold text-indigo-800 text-[11px] uppercase tracking-wider">ធ្វើនៅ៖</span>
          <input type="text" value="${window.reportCardDateSettings.location || ''}" 
                 oninput="window.updateSharedDateSetting('location', this.value)" 
                 class="shared-location-input border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 w-32 bg-white outline-none focus:ring-2 focus:ring-indigo-400/50">
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold text-indigo-800 text-[11px] uppercase tracking-wider">សូរិយគតិ៖</span>
          <input type="text" value="${window.reportCardDateSettings.solarDate || ''}" 
                 oninput="window.updateSharedDateSetting('solarDate', this.value)" 
                 class="shared-solar-input border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 w-64 bg-white outline-none focus:ring-2 focus:ring-indigo-400/50">
          <div class="flex bg-white rounded-xl border border-indigo-200 p-0.5 shadow-sm">
            <button onclick="window.setSharedTodaySolarDate()" class="px-3 py-1.5 hover:bg-indigo-50 rounded-lg text-[11px] font-bold text-indigo-600 transition">ថ្ងៃនេះ</button>
            <button onclick="window.setSharedDotsSolarDate()" class="px-3 py-1.5 hover:bg-indigo-50 rounded-lg text-[11px] font-bold text-slate-500 transition">ចុចៗ</button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-indigo-800 text-[11px] uppercase tracking-wider">
          <input type="checkbox" ${window.reportCardDateSettings.showLunar ? 'checked' : ''} 
                 onchange="window.updateSharedDateSetting('showLunar', this.checked)" class="shared-lunar-check rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4">
          <span>ចន្ទគតិ៖</span>
        </label>
        <input type="text" value="${window.reportCardDateSettings.lunarDate || ''}" 
               oninput="window.updateSharedDateSetting('lunarDate', this.value)" 
               placeholder="ថ្ងៃ.............. ...កើត/រោច..."
               class="shared-lunar-input border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 w-full sm:w-80 bg-white outline-none focus:ring-2 focus:ring-indigo-400/50 ${!window.reportCardDateSettings.showLunar ? 'opacity-50 pointer-events-none bg-slate-100' : ''}">
      </div>
    </div>
  `;
};

window.toggleSharedDatePanel = function(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
      panel.classList.toggle('hidden');
      panel.classList.toggle('flex');
  }
};

window.updateSharedDateSetting = function(k, v) {
  window.reportCardDateSettings[k] = v;
  try { localStorage.setItem(`rc_${k}`, v); } catch(e) {}
  
  if (k === 'location') document.querySelectorAll('.shared-location-input').forEach(el => el.value = v);
  if (k === 'solarDate') document.querySelectorAll('.shared-solar-input').forEach(el => el.value = v);
  if (k === 'lunarDate') document.querySelectorAll('.shared-lunar-input').forEach(el => el.value = v);
  if (k === 'showLunar') {
    document.querySelectorAll('.shared-lunar-check').forEach(el => el.checked = v);
    document.querySelectorAll('.shared-lunar-input').forEach(el => {
      if (v) el.classList.remove('opacity-50', 'pointer-events-none', 'bg-slate-100');
      else el.classList.add('opacity-50', 'pointer-events-none', 'bg-slate-100');
    });
  }
};

window.getFormattedSolarDate = function() {
  const loc = window.reportCardDateSettings.location ? `${window.reportCardDateSettings.location}, ` : "ធ្វើនៅ.....................";
  const dateStr = window.reportCardDateSettings.solarDate ? window.reportCardDateSettings.solarDate : `ថ្ងៃទី ........ ខែ ........ ឆ្នាំ ២០២...`;
  return `${loc}${dateStr}`;
};

window.setSharedTodaySolarDate = function() {
  const now = new Date();
  const d = window.toKhmerNum(now.getDate().toString());
  const m = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"][now.getMonth()];
  const y = window.toKhmerNum(now.getFullYear().toString());
  const formattedSolar = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
  const formattedLunar = window.getKhmerLunarDate(now);

  window.updateSharedDateSetting('solarDate', formattedSolar);
  window.updateSharedDateSetting('lunarDate', formattedLunar);
  
  if(!window.reportCardDateSettings.showLunar) {
      window.updateSharedDateSetting('showLunar', true);
  }
};

window.setSharedDotsSolarDate = function() {
  window.updateSharedDateSetting('solarDate', "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
  window.updateSharedDateSetting('lunarDate', "ថ្ងៃ.................កើត/រោច... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...");
};

// =====================================================================
// ៧. បោះពុម្ពបញ្ជីវត្តមាន និងតារាងសង្ខេបស្ថិតិផ្លូវការ A4 Landscape
// =====================================================================
window.printOfficialAttendance = function() {
    const tableContent = document.getElementById("mainAttendanceTable");
    if (!tableContent) { 
        alert("⚠️ រកមិនឃើញតារាងវត្តមានដើម្បីបោះពុម្ពទេ!"); 
        return; 
    }

    const summary = window.calculateMoEYSSummary();
    const clonedTable = tableContent.cloneNode(true);
    
    const origInputs = tableContent.querySelectorAll("input.att-input");
    const cloneInputs = clonedTable.querySelectorAll("input.att-input");
    
    cloneInputs.forEach((cloneInput, idx) => {
        const orig = origInputs[idx];
        const val = orig ? orig.value.trim() : "";
        const td = cloneInput.parentElement;
        if (val !== "") {
            let color = "#000";
            if (val === "ច" || val === "ច្ប" || val === "C") color = "#2563eb"; 
            else if (val === "អ" || val === "អច្ប" || val === "A") color = "#e11d48"; 
            else if (val === "ឈ" || val === "S") color = "#9333ea"; 
            else if (val === "៖" || val === ":") color = "#d97706"; 
            td.innerHTML = `<span style="color: ${color}; font-weight: bold; font-size: 11px;">${val}</span>`;
        } else {
            td.innerHTML = "";
        }
    });

    const origNotes = tableContent.querySelectorAll("input[id^='note_']");
    const cloneNotes = clonedTable.querySelectorAll("input[id^='note_']");
    cloneNotes.forEach((cloneNote, idx) => {
        const orig = origNotes[idx];
        const val = orig ? orig.value.trim() : "";
        const td = cloneNote.parentElement;
        td.innerHTML = `<span style="font-size: 10px; color: #334155;">${val}</span>`;
    });

    const allEls = clonedTable.querySelectorAll('*');
    allEls.forEach(el => {
        el.className = (el.className || "")
            .replace(/sticky/g, "")
            .replace(/left-\[?[^\]\s]+\]?/g, "")
            .replace(/z-\d+/g, "")
            .replace(/shadow-[^"'\s]*/g, "");
        el.style.position = "static";
        el.style.left = "auto";
        el.style.minWidth = "";
        el.style.width = "";
        el.style.maxWidth = "";
    });

    const existingColgroup = clonedTable.querySelector("colgroup");
    if (existingColgroup) existingColgroup.remove();

    let colGroupHtml = `
      <colgroup>
        <col style="width: 3.5%;">
        <col style="width: 6.5%;">
        <col style="width: 17.5%;">
        <col style="width: 3.5%;">
    `;
    for (let i = 0; i < 31; i++) {
        colGroupHtml += `<col style="width: 1.9%;">`;
    }
    colGroupHtml += `
        <col style="width: 2.7%;">
        <col style="width: 2.7%;">
        <col style="width: 2.7%;">
        <col style="width: 3.2%;">
        <col style="width: 4.8%;">
      </colgroup>
    `;
    clonedTable.insertAdjacentHTML('afterbegin', colGroupHtml);

    const month = document.getElementById("attMonthSelect")?.value || "មករា";
    const gradeInfo = window.getTeacherGradeInfo();
    const grade = `${gradeInfo.level} ${gradeInfo.room}`;
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ធំ";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : ".......................";
    const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
    
    const totalStudents = summary?.totalStudents || 0;
    const femaleStudents = summary?.femaleStudents || 0;
    const maleStudents = totalStudents - femaleStudents;
    
    const rDates = window.reportCardDateSettings || {};
    const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
    const solarDateStr = window.getFormattedSolarDate();

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បញ្ជីវត្តមានប្រចាំខែ${month} - ${grade}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          @page { size: A4 landscape; margin: 8mm 9mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #0f172a; background: #fff; line-height: 1.3; }
          .font-moul { font-family: 'Moul', serif; font-weight: normal; }
          
          /* ផ្នែកក្បាល (Header) */
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
          .header-left p { margin: 0 0 3px 0; font-size: 11px; font-family: 'Moul', serif; color: #334155; }
          .header-left .school-name { color: #1e3a8a; font-size: 13px; text-shadow: 0.5px 0.5px 0px #cbd5e1; }
          .header-left .class-name { color: #be123c; font-size: 11.5px; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 12px; font-family: 'Moul', serif; color: #1e3a8a; }
          .header-right .motto { color: #b91c1c; font-size: 11px; }
          
          .title-box { text-align: center; margin: 5px 0 10px 0; }
          .title-box h2 { margin: 0 0 5px 0; font-size: 16px; color: #be123c; letter-spacing: 1px; }
          
          /* របារព័ត៌មានពីលើតារាង */
          .sub-header-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 6px; padding: 5px 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; color: #0f172a; }
          .sub-header-bar .highlight { color: #be123c; font-family: 'Moul', serif; }
          .sub-header-bar .count { color: #047857; }
          
          /* តារាង (Table) */
          table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 10px; table-layout: fixed; border: 1.5px solid #0f172a; }
          th, td { border: 1px solid #475569; padding: 2px 0px; height: 26px; font-family: 'Khmer OS Bokor', 'Bokor', sans-serif; font-size: 10px; overflow: hidden; white-space: nowrap; }
          th { background-color: #dbeafe; color: #1e3a8a; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
          td:nth-child(3) { text-align: left; padding-left: 5px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 12px; font-weight: bold; color: #0f172a; }
          
          /* ផ្នែកសង្ខេបខាងក្រោម (Footer Summary) */
          .summary-container { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 5px; padding: 6px 10px; margin-bottom: 8px; }
          .summary-row-inline { display: flex; justify-content: space-between; font-size: 11px; line-height: 1.8; }
          .summary-row-inline span { margin-right: 15px; color: #334155; }
          .summary-row-inline b { font-size: 12px; }
          .text-green { color: #15803d; }
          .text-red { color: #be123c; }
          .text-blue { color: #1d4ed8; }
          
          .end-list-note { font-size: 11px; color: #64748b; font-style: italic; margin-left: 5px; }

          /* ផ្នែកហត្ថលេខា (Signatures) */
          .footer-box { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; margin-top: 15px; padding: 0 40px; page-break-inside: avoid; }
          .footer-col-left { text-align: center; font-family: 'Moul', serif; line-height: 1.6; color: #1e3a8a; }
          .footer-col-right { text-align: center; line-height: 1.6; color: #334155; }
          .footer-col-right .role { font-family: 'Moul', serif; margin-top: 5px; color: #1e3a8a; }
          .signature-name { font-family: 'Moul', serif; font-size: 12px; color: #be123c; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-left"><br><br>
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល ស្រុក${districtName}</p>
            <p class="school-name">${schoolName}</p>
            <p class="class-name">${grade}</p>
          </div>
          <div class="header-right">
           <div class="header-right">
                <p class="font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p class="font-moul">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                
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
        </div>

        <div class="title-box">
          <h2 class="font-moul">បញ្ជីហៅឈ្មោះសិស្ស</h2>
        </div>

        <div class="sub-header-bar">
          <div>ផ្នែកអវត្តមានសិស្ស</div>
          <div>ខែ <span class="highlight">${month}</span></div>
          <div>ឆ្នាំសិក្សា ${window.toKhmerNum(academicYear)}</div>
          <div>ប្រុស <span class="count">${window.toKhmerNum(maleStudents.toString())}</span> នាក់</div>
          <div>ស្រី <span class="count">${window.toKhmerNum(femaleStudents.toString())}</span> នាក់</div>
          <div>សរុប <span class="count">${window.toKhmerNum(totalStudents.toString())}</span> នាក់</div>
        </div>

        ${clonedTable.outerHTML}

        <div class="summary-container">
          <div class="summary-row-inline">
            <span>ចំនួនសិស្សក្នុងបញ្ជី: <b class="text-blue">${window.toKhmerNum(totalStudents.toString())}</b> នាក់</span>
            <span>ស្រី: <b class="text-blue">${window.toKhmerNum(femaleStudents.toString())}</b> នាក់</span>
            <span>ពេលសិស្សត្រូវមករៀន: <b>${window.toKhmerNum(summary?.totalSessionsRequired?.toString() || '0')}</b></span>
            <span>ពេលអវត្តមាន: <b class="text-red">${window.toKhmerNum(summary?.totalAbsentSessions?.toString() || '0')}</b></span>
            <span>ពេលដែលសិស្សមករៀនពិតប្រាកដ: <b class="text-green">${window.toKhmerNum(summary?.actualAttendedSessions?.toString() || '0')}</b></span>
            <span>ភាគរយអវត្តមាន: <b class="text-red">${window.toKhmerNum(summary?.absencePercentage?.toString() || '0')}%</b></span>
          </div>
        </div>
        
        <div class="end-list-note" style="margin-top: 6px;">
            បញ្ឈប់បញ្ជីក្នុងខែនេះត្រឹម <b class="text-blue" style="font-size: 13px; text-decoration: underline;">${window.toKhmerNum(summary?.actualSchoolDays?.toString() || '0')}</b> ពេល
        </div>

        <div class="footer-box">
          <div class="footer-col-left">
            <div>បានឃើញ និងឯកភាព</div>
            <div>នាយកសាលា</div>
            <div style="height: 45px;"></div>
            <div class="signature-name">${principalName}</div>
          </div>
          <div class="footer-col-right">
            ${lunarDateStr ? `<div style="font-size: 10.5px; margin-bottom: 2px;">${lunarDateStr}</div>` : ''}
            <div>${solarDateStr}</div>
            <div class="role">គ្រូទទួលបន្ទុកថ្នាក់</div>
            <div style="height: 40px;"></div>
            <div class="signature-name">${teacherName}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1150,height=850');
    if (!printWindow) {
        alert("⚠️ ប្រព័ន្ធបានទប់ស្កាត់ផ្ទាំង Pop-up! សូមអនុញ្ញាត Pop-up លើ Browser របស់អ្នកដើម្បីបោះពុម្ព។");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch(err) {
            console.error("Print Error:", err);
        }
    }, 600);
};

// =====================================================================
// ៩. បោះពុម្ពរបាយការណ៍អវត្តមានប្រចាំឆ្នាំ (Annual Attendance Report - Dynamic Modal)
// =====================================================================
window.openAnnualReportModal = function() {
    let modal = document.getElementById('annualReportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'annualReportModal';
        modal.className = 'fixed inset-0 z-[3000] bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-center font-siemreap';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 animate-scale-up">
                <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center text-white">
                    <h3 class="font-moul text-sm sm:text-base flex items-center gap-2 drop-shadow-sm">
                        <i class="fa-solid fa-calendar-days"></i> បោះពុម្ពរបាយការណ៍អវត្តមានប្រចាំឆ្នាំ
                    </h3>
                    <button onclick="window.closeAnnualReportModal()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition shadow-sm">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div class="p-6 bg-slate-50 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">សូមបញ្ចូល ឬជ្រើសរើសឆ្នាំសិក្សា៖</label>
                        <input type="text" id="annualYearSelect" value="២០២៦-២០២៧" class="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner">
                    </div>
                </div>
                <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <button onclick="window.closeAnnualReportModal()" class="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 text-sm transition-colors">បោះបង់</button>
                    <button onclick="window.handlePrintAnnualAction()" class="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 text-sm shadow-md transition-all transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-print"></i> បញ្ជាក់ & បោះពុម្ព
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeAnnualReportModal = function() {
    const modal = document.getElementById('annualReportModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.handlePrintAnnualAction = function() {
    const selectedYear = document.getElementById('annualYearSelect')?.value || "២០២៦-២០២៧";
    window.closeAnnualReportModal();
    
    // ទាញយកបញ្ជីសិស្សពិតប្រាកដពីប្រព័ន្ធ
    let currentStudents = window.scoresStudentList || [];
    if (currentStudents.length === 0) {
        try {
            currentStudents = JSON.parse(localStorage.getItem('academic_students')) || [];
        } catch(e) {}
    }

    if (currentStudents.length === 0) {
        alert("⚠️ រកមិនឃើញទិន្នន័យសិស្សសម្រាប់ធ្វើរបាយការណ៍អវត្តមានទេ!");
        return;
    }

    const mockStudentsDataForAnnual = currentStudents.map(s => {
        let savedMonthly = {};
        const months = ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"];
        
        months.forEach(m => {
            if (typeof window.getStudentAttendance === "function") {
                const att = window.getStudentAttendance(s.id, m);
                if (att && att.hasData) {
                    savedMonthly[m] = { perm: att.permission || 0, unex: att.unexcused || 0 };
                    return;
                }
            }
            try {
                const monthAtt = JSON.parse(localStorage.getItem(`attendance_${s.id}_${m}`)) || { perm: 0, unex: 0 };
                savedMonthly[m] = monthAtt;
            } catch(err) {
                savedMonthly[m] = { perm: 0, unex: 0 };
            }
        });

        return {
            id: s.id,
            name: s.name,
            gender: s.gender,
            monthlyData: savedMonthly,
            remark: s.remark || ""
        };
    });

    window.printAnnualAttendanceReport(mockStudentsDataForAnnual, selectedYear);
};

window.printAnnualAttendanceReport = function(studentsData, academicYear) {
    const months = ["តុលា", "វិច្ឆិកា", "ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា"];
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    const grade = `${levelStr} ${roomStr}`;
    
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (sInfo.teacher_name || ".......................");
    const acYear = academicYear || "២០២៦-២០២៧"; 
    
    const rDates = window.reportCardDateSettings || {};
    const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
    const solarDateStr = typeof window.getFormattedSolarDate === 'function' ? window.getFormattedSolarDate() : "ធ្វើនៅ...................., ថ្ងៃទី........ ខែ........ ឆ្នាំ ២០២...";
    
    let tbodyHtml = "";
    const rowsCount = studentsData && studentsData.length > 0 ? studentsData.length : 15;
    
    for (let i = 0; i < rowsCount; i++) {
        const stu = studentsData && studentsData[i] ? studentsData[i] : {};
        
        let rowHtml = `
            <tr>
                <td class="font-mono text-slate-500">${window.toKhmerNum((i + 1).toString())}</td>
                <td class="font-mono text-indigo-600">${stu.id || ""}</td>
                <td style="text-align: left; padding-left: 5px; font-family: 'Moul', serif; font-size: 10px;" class="text-slate-800">${stu.name || ""}</td>
                <td class="${stu.gender === 'ស្រី' ? 'text-rose-600 font-bold' : 'text-blue-600 font-bold'}">${stu.gender || ""}</td>
        `;
        
        let totalPerm = 0; 
        let totalUnex = 0; 
        
        months.forEach((m) => {
            const perm = stu.monthlyData && stu.monthlyData[m] ? stu.monthlyData[m].perm : 0;
            const unex = stu.monthlyData && stu.monthlyData[m] ? stu.monthlyData[m].unex : 0;
            
            if(Number(perm) > 0) totalPerm += Number(perm);
            if(Number(unex) > 0) totalUnex += Number(unex);
            
            rowHtml += `
                <td class="text-blue font-bold ${Number(perm) > 0 ? 'bg-blue-50/50' : ''}">${Number(perm) > 0 ? window.toKhmerNum(perm.toString()) : ""}</td>
                <td class="text-red font-bold ${Number(unex) > 0 ? 'bg-rose-50/50' : ''}">${Number(unex) > 0 ? window.toKhmerNum(unex.toString()) : ""}</td>
            `;
        });
        
        rowHtml += `
                <td class="text-blue" style="font-weight: bold; background-color: #dbeafe; font-size: 11px;">${totalPerm > 0 ? window.toKhmerNum(totalPerm.toString()) : ""}</td>
                <td class="text-red" style="font-weight: bold; background-color: #ffe4e6; font-size: 11px;">${totalUnex > 0 ? window.toKhmerNum(totalUnex.toString()) : ""}</td>
                <td class="text-slate-500 text-[9px]">${stu.remark || ""}</td>
            </tr>
        `;
        tbodyHtml += rowHtml;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បញ្ជីអវត្តមានប្រចាំឆ្នាំ ${acYear}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          @page { size: A4 landscape; margin: 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Siemreap', sans-serif; color: #0f172a; background: #fff; line-height: 1.3; }
          .font-moul { font-family: 'Moul', serif; font-weight: normal; }
          
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
          .header-left p { margin: 0 0 3px 0; font-size: 11px; font-family: 'Moul', serif; color: #334155; }
          .header-left .school-name { color: #1e3a8a; font-size: 13px; text-shadow: 0.5px 0.5px 0px #cbd5e1; }
          .header-left .class-name { color: #be123c; font-size: 11.5px; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 12px; font-family: 'Moul', serif; color: #1e3a8a; }
          
          .title-box { text-align: center; margin-bottom: 15px; }
          .title-box h2 { margin: 0 0 5px 0; font-size: 16px; font-family: 'Moul', serif; color: #be123c; letter-spacing: 1px; }
          
          table { width: 100%; border-collapse: collapse; text-align: center; border: 1.5px solid #0f172a; }
          th, td { border: 1px solid #475569; padding: 2px; font-size: 10px; overflow: hidden; }
          th { font-family: 'Siemreap', sans-serif; font-weight: bold; background-color: #f1f5f9; color: #1e3a8a; }
          tr:nth-child(even) { background-color: #f8fafc; } 
          
          .th-main { background-color: #dbeafe; color: #1e3a8a; }
          .th-months { background-color: #e0e7ff; color: #3730a3; }
          .th-totals { background-color: #fef3c7; color: #92400e; }
          .th-perm { background-color: #eff6ff; color: #1d4ed8; font-size: 9px; }
          .th-unex { background-color: #fff1f2; color: #be123c; font-size: 9px; }
          
          .col-no { width: 3%; }
          .col-id { width: 5%; }
          .col-name { width: 14%; }
          .col-gender { width: 3%; }
          .col-month { width: 2.8%; font-size: 9px; }
          .col-total { width: 3.5%; }
          .col-remark { width: 6%; }
          
          .text-blue { color: #1d4ed8; }
          .text-red { color: #be123c; }
          
          .summary-footer { font-size: 11px; font-weight: bold; border: 1.5px solid #0f172a; border-top: none; padding: 5px; background-color: #f0fdf4; }
          .summary-row { display: flex; align-items: center; }
          .summary-label { width: 25%; padding-left: 10px; border-right: 1px dashed #cbd5e1; color: #15803d; }
          
          .footer-box { display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; margin-top: 20px; padding: 0 40px; page-break-inside: avoid; }
          .footer-col-left { text-align: center; font-family: 'Moul', serif; line-height: 1.6; color: #1e3a8a; }
          .footer-col-right { text-align: center; line-height: 1.6; color: #334155; }
          .footer-col-right .role { font-family: 'Moul', serif; margin-top: 5px; color: #1e3a8a; }
          .signature-name { font-family: 'Moul', serif; font-size: 12px; color: #be123c; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-left"><br><br>
            <p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាល ស្រុក${districtName}</p>
            <p class="school-name">${schoolName}</p>
            <p class="class-name">${grade}</p>
          </div>
          <div class="header-right">
            <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p class="motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;">
                 <div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div>
                 <span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span>
                 <div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div>
            </div>
          </div>
        </div>

        <div class="title-box">
          <h2>ចំនួនអវត្តមានសិស្សក្នុងឆ្នាំសិក្សា ${window.toKhmerNum(acYear)}</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="3" class="col-no th-main">ល.រ<br>លេខរៀង</th>
              <th rowspan="3" class="col-id th-main">អត្តលេខ</th>
              <th rowspan="3" class="col-name th-main">គោត្តនាម និង នាម</th>
              <th rowspan="3" class="col-gender th-main">ភេទ</th>
              <th colspan="20" class="th-months">ចំនួនអវត្តមានប្រចាំខែ</th>
              <th colspan="2" class="th-totals">ចំនួនអវត្តមាន<br>ប្រចាំឆ្នាំ</th>
              <th rowspan="3" class="col-remark">សេចក្តីផ្សេងៗ</th>
            </tr>
            <tr>
              ${months.map(m => `<th colspan="2" class="bg-slate-100">${m}</th>`).join('')}
              <th rowspan="2" class="th-perm font-moul">ច្ប</th>
              <th rowspan="2" class="th-unex font-moul">អច្ប</th>
            </tr>
            <tr>
              ${months.map(() => `<th class="th-perm">ច្ប</th><th class="th-unex">អច្ប</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>
        
        <div class="summary-footer">
           <div class="summary-row" style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
              <div class="summary-label">សរុបអវត្តមានប្រចាំខែ</div>
              <div style="flex-grow: 1; text-align: center; color: #64748b; font-size: 10px;">(កន្លែងសម្រាប់បូកសរុបអវត្តមានតាមខែនីមួយៗ)</div>
           </div>
           <div class="summary-row" style="padding-top: 4px;">
              <div class="summary-label">ភាគរយអវត្តមានប្រចាំខែ</div>
              <div style="flex-grow: 1; text-align: center; color: #64748b; font-size: 10px;">(កន្លែងសម្រាប់បូកភាគរយតាមខែនីមួយៗ)</div>
           </div>
        </div>

        <div class="footer-box">
          <div class="footer-col-left">
            <div>បានឃើញ និងឯកភាព</div>
            <div>នាយកសាលា</div>
            <div style="height: 60px;"></div>
            <div class="signature-name">${principalName}</div>
          </div>
          <div class="footer-col-right">
            ${lunarDateStr ? `<div style="font-size: 10.5px; margin-bottom: 2px;">${lunarDateStr}</div>` : ''}
            <div>${solarDateStr}</div>
            <div class="role">គ្រូទទួលបន្ទុកថ្នាក់</div>
            <div style="height: 60px;"></div>
            <div class="signature-name">${teacherName}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1150,height=850');
    if (!printWindow) {
        alert("⚠️ ប្រព័ន្ធបានទប់ស្កាត់ផ្ទាំង Pop-up! សូមអនុញ្ញាត Pop-up។");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch(err) {
            console.error("Print Error:", err);
        }
    }, 600);
};