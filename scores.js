// ==========================================================================
// ឯកសារ js/scores.js - ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងព្រឹត្តិបត្រ (KrouDigital 4.0 - Clean Build)
// បញ្ជាក់៖ ឯកសារនេះបានជួសជុលបញ្ហាតារាងជាន់គ្នា និងប៊ូតុង Modal មិនដំណើរការរួចរាល់ ១០០%
// ==========================================================================

window.scoresStudentList = []; window.currentScores = []; window.s1Scores = []; window.s2Scores = []; 
window.hasUnsavedChanges = false; window.activeSchema = []; window.activeSubjectKeys = []; window.schemaMaxMap = {};
window.currentMobileStudentIndex = 0; window.rankingsDataList = []; window.rankingsSearchQuery = "";
window.rankingsGenderFilter = "all"; window.rankingsViewMode = "full"; window.currentHonorBg = "";
window.currentHonorLogo = ""; window.honorBoardScale = 0.85; window.honorBoardTheme = "gold"; window.honorBoardTopCount = 5;
window.reportCardPrintType = 'monthly_sheet'; window.selectedReportCardStudentId = 'all'; window.selectedEducationLevel = 'auto'; window.selectedExcelFile = null;

localStorage.removeItem('rc_solarDate'); localStorage.removeItem('rc_lunarDate');

window.reportCardDateSettings = {
    location: localStorage.getItem('rc_location') || "រាជធានីភ្នំពេញ",
    solarDate: localStorage.getItem('rc_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....",
    lunarDate: localStorage.getItem('rc_lunar_date') || "ថ្ងៃ................. ខែ............. ឆ្នាំ......... ........ស័ក ព.ស.២៥....",
    showLunar: localStorage.getItem('rc_show_lunar') !== 'false'
};

window.CONDUCT_TEMPLATES = [
    "ស្លូតបូត សុភាពរាបសារ ខិតខំរៀនសូត្រ និងគោរពវិន័យសាលាបានល្អ",
    "មានវិន័យល្អ ឧស្សាហ៍ព្យាយាម ស្តាប់ដំបូន្មានលោកគ្រូអ្នកគ្រូ",
    "ឆ្លាតវៃ រហ័សរហួន ចូលរួមសកម្មភាពក្នុងថ្នាក់បានយ៉ាងសកម្ម",
    "ស្លូតបូត រួសរាយរាក់ទាក់ តែត្រូវបង្កើនការយកចិត្តទុកដាក់បន្ថែម",
    "ខិតខំរៀនសូត្រ តែត្រូវបង្កើនភាពក្លាហានក្នុងការឆ្លើយសំណួរ",
    "ត្រូវកែលម្អលើការគោរពវិន័យ និងការយកចិត្តទុកដាក់ក្នុងម៉ោងរៀន"
];

// ==========================================
// ០២. មុខងារជំនួយ (Utilities)
// ==========================================
window.toKhmerNum = function(str) {
    if (str === null || str === undefined || str === "") return "";
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(str).split('').map(n => (n >= '0' && n <= '9') ? khmerNumbers[parseInt(n)] : n).join('');
};

window.getSchoolLevel = function(gradeStr) {
    if (!gradeStr) return "primary";
    const numStr = gradeStr.replace(/[^\d១២៣៤៥៦៧៨៩០]/g, '');
    const khNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const arabicNumStr = numStr.split('').map(n => khNums.indexOf(n) > -1 ? khNums.indexOf(n) : n).join('');
    const num = parseInt(arabicNumStr);
    if (num >= 7 && num <= 9) return "lower_sec";
    if (num >= 10 && num <= 12) return "upper_sec";
    return "primary"; 
};

window.getEducationLevel = function(gradeStr) {
    if (window.selectedEducationLevel && window.selectedEducationLevel !== 'auto') return window.selectedEducationLevel;
    const str = String(gradeStr || "").toLowerCase();
    const numMatch = str.match(/([០-៩\d]+)/);
    if (numMatch) {
        let num = parseInt(numMatch[1].replace(/[០-៩]/g, d => "០១២៣៤៥៦៧៨៩".indexOf(d)), 10);
        if (num >= 1 && num <= 6) return 'primary';
        return 'secondary';
    }
    return str.includes("បឋម") ? 'primary' : 'secondary';
};

window.splitKhmerName = function(fullName) {
    const clean = String(fullName || "").trim().replace(/\s+/g, ' ');
    if (!clean) return { lastName: "-", firstName: "-" };
    const parts = clean.split(' ');
    if (parts.length === 1) return { lastName: parts[0], firstName: "" };
    return { lastName: parts[0], firstName: parts.slice(1).join(' ') };
};

// ==========================================
// ០៣. ប្រព័ន្ធកាលបរិច្ឆេទ (Date System)
// ==========================================
window.getKhmerLunarDate = function(dateObj = new Date()) {
    try {
        let solarYear = dateObj.getFullYear(); let solarMonth = dateObj.getMonth() + 1; let solarDay = dateObj.getDate();
        const khmerDays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
        let dayName = khmerDays[dateObj.getDay()];

        if (solarYear === 2026 && solarMonth === 10) {
            let lunarDayNum = solarDay + 4; let phase = "រោច"; let monthName = "ភទ្របទ";
            if (solarDay >= 12) { lunarDayNum = solarDay - 11; phase = lunarDayNum > 15 ? "រោច" : "កើត"; if (lunarDayNum > 15) lunarDayNum -= 15; monthName = "អស្សុជ"; }
            return `ថ្ងៃ${dayName} ${window.toKhmerNum(lunarDayNum)}${phase} ខែ${monthName} ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០`;
        }

        let isNewYearPassed = (solarMonth > 4) || (solarMonth === 4 && solarDay >= 14);
        let beYear = solarYear + 543;
        if (solarMonth > 5 || (solarMonth === 5 && solarDay >= 15)) beYear += 1;

        const animals = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមី", "មមែ", "វក", "រកា", "ច", "កុរ"];
        let animalYear = solarYear + 8;
        if (!isNewYearPassed) animalYear -= 1;
        
        return `ថ្ងៃ${dayName} ........... ខែ........... ឆ្នាំ${animals[animalYear % 12]} ........... ព.ស.${window.toKhmerNum(beYear)}`;
    } catch(e) { return "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧..."; }
};

window.updateSharedDateSetting = function(k, v) {
    window.reportCardDateSettings[k] = v;
    try { localStorage.setItem(`rc_${k}`, v); } catch(e) {}
    
    if (k === 'location') document.querySelectorAll('.shared-location-input').forEach(el => el.value = v);
    if (k === 'solarDate') {
        document.querySelectorAll('.shared-solar-input').forEach(el => el.value = v);
        if(document.getElementById('dashSolarDateDisplay')) {
            let cleanSolar = v.replace(/ធ្វើនៅ.*?,?\s*/g, '').trim();
            if (cleanSolar.includes("ថ្ងៃទី")) cleanSolar = cleanSolar.substring(cleanSolar.indexOf("ថ្ងៃទី"));
            document.getElementById('dashSolarDateDisplay').textContent = cleanSolar;
        }
    }
    if (k === 'lunarDate') {
        document.querySelectorAll('.shared-lunar-input').forEach(el => el.value = v);
        if(document.getElementById('dashLunarDateDisplay')) document.getElementById('dashLunarDateDisplay').textContent = v;
    }
    if (k === 'showLunar') {
        document.querySelectorAll('.shared-lunar-check').forEach(el => el.checked = v);
        document.querySelectorAll('.shared-lunar-input').forEach(el => {
            if (v) el.classList.remove('opacity-40', 'pointer-events-none');
            else el.classList.add('opacity-40', 'pointer-events-none');
        });
    }
};

window.getFormattedSolarDate = function() {
    const loc = window.reportCardDateSettings.location ? `${window.reportCardDateSettings.location} ` : "";
    let sDate = window.reportCardDateSettings.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....";
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    let locClean = loc.replace(/,+$/, '').trim();
    if(locClean) return `${locClean}, ${sDate}`;
    return sDate;
};

window.forceSetToday = function() {
    try {
        const now = new Date();
        const d = window.toKhmerNum(now.getDate());
        const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
        const m = khmerMonths[now.getMonth()];
        const y = window.toKhmerNum(now.getFullYear());
        
        let districtName = "ស្រុកកៀនស្វាយ";
        if (typeof appSettings !== 'undefined' && appSettings.district) districtName = appSettings.district.replace('ស្រុក', '').trim();

        const formattedSolar = `ថ្ងៃទី ${d} ខែ ${m} ឆ្នាំ ${y}`;
        const formattedLunar = window.getKhmerLunarDate(now);

        window.updateSharedDateSetting('location', `ធ្វើនៅស្រុក${districtName}`);
        window.updateSharedDateSetting('solarDate', formattedSolar);
        window.updateSharedDateSetting('lunarDate', formattedLunar);
        window.updateSharedDateSetting('showLunar', true);
    } catch(e) {}
};

window.forceSetDots = function() {
    window.updateSharedDateSetting('location', "ធ្វើនៅ.........................");
    window.updateSharedDateSetting('solarDate', "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....");
    window.updateSharedDateSetting('lunarDate', "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...");
    window.updateSharedDateSetting('showLunar', true);
};

window.toggleSharedDatePanel = function() {
    let panel = document.getElementById('globalDateSettingsModal');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'globalDateSettingsModal';
        panel.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999999] hidden justify-center items-center p-4 font-siemreap transition-opacity duration-300 opacity-0';
        panel.innerHTML = `
          <div id="globalDateSettingsCard" class="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full max-w-md flex flex-col overflow-hidden border border-white/20 transform scale-95 transition-transform duration-300 relative mx-auto my-auto">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex justify-between items-center shadow-md relative overflow-hidden">
                <div class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 class="font-moul text-white text-[15px] flex items-center gap-3 drop-shadow-md relative z-10"><div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-inner"><i class="fa-solid fa-calendar-day text-lg"></i></div>កំណត់កាលបរិច្ឆេទប្រព័ន្ធ</h3>
                <button type="button" onclick="window.toggleSharedDatePanel()" class="w-9 h-9 rounded-full bg-white/10 text-white flex justify-center items-center hover:bg-rose-500 hover:text-white transition-colors border border-white/20 shadow-sm relative z-10 active:scale-90"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="p-6 bg-slate-50 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5"><label class="font-moul text-indigo-900 text-xs ml-1">ទីតាំងធ្វើលិខិត ៖</label><input type="text" id="global_loc_input" value="${window.reportCardDateSettings.location || ''}" oninput="window.updateSharedDateSetting('location', this.value)" placeholder="ធ្វើនៅ........................." class="shared-location-input w-full border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-700 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] shadow-sm"></div>
                <div class="flex flex-col gap-1.5"><label class="font-moul text-indigo-900 text-xs ml-1">កាលបរិច្ឆេទសូរិយគតិ ៖</label><input type="text" id="global_sol_input" value="${window.reportCardDateSettings.solarDate || ''}" oninput="window.updateSharedDateSetting('solarDate', this.value)" placeholder="ថ្ងៃទី....... ខែ....... ឆ្នាំ២០...." class="shared-solar-input w-full border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-700 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] shadow-sm"></div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-1">
                  <button type="button" onclick="window.forceSetToday(); window.syncGlobalDateModal();" class="flex justify-center items-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-[13px] group"><i class="fa-solid fa-bolt text-amber-500 group-hover:scale-110 transition-transform"></i> ថ្ងៃនេះអូតូ</button>
                  <button type="button" onclick="window.forceSetDots(); window.syncGlobalDateModal();" class="flex justify-center items-center gap-2 w-full py-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-[13px]">ចុចៗ (...)</button>
              </div>
              <div class="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                <div class="absolute left-0 top-0 w-1.5 h-full bg-indigo-500"></div>
                <label class="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" id="global_lun_chk" ${window.reportCardDateSettings.showLunar ? 'checked' : ''} onchange="window.updateSharedDateSetting('showLunar', this.checked); document.getElementById('global_lun_input').classList.toggle('opacity-40'); document.getElementById('global_lun_input').classList.toggle('pointer-events-none');" class="shared-lunar-check w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer border-slate-300 shadow-sm mt-0.5"><span class="font-moul text-indigo-900 text-[13px]">បង្ហាញថ្ងៃខែចន្ទគតិ</span></label>
                <input type="text" id="global_lun_input" value="${window.reportCardDateSettings.lunarDate || ''}" oninput="window.updateSharedDateSetting('lunarDate', this.value)" placeholder="ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧..." class="shared-lunar-input w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-indigo-900 bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-[13px] ${!window.reportCardDateSettings.showLunar ? 'opacity-40 pointer-events-none' : ''}">
              </div>
            </div>
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-[2rem]">
                <button type="button" onclick="window.toggleSharedDatePanel()" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-[14px] shadow-md shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"><i class="fa-solid fa-check-circle text-lg"></i> រក្សាទុក & បិទ</button>
            </div>
          </div>
        `;
        document.body.appendChild(panel);
    }

    const card = document.getElementById('globalDateSettingsCard');
    if (panel.classList.contains('hidden') || panel.style.display === 'none') {
        window.syncGlobalDateModal(); 
        panel.classList.remove('hidden');
        panel.style.display = 'flex'; 
        setTimeout(() => {
            panel.classList.remove('opacity-0'); panel.classList.add('opacity-100');
            if(card) { card.classList.remove('scale-95'); card.classList.add('scale-100'); }
        }, 10);
    } else {
        panel.classList.remove('opacity-100'); panel.classList.add('opacity-0');
        if(card) { card.classList.remove('scale-100'); card.classList.add('scale-95'); }
        setTimeout(() => { panel.classList.add('hidden'); panel.style.display = 'none'; }, 300);
    }
};

window.syncGlobalDateModal = function() {
    const loc = document.getElementById('global_loc_input');
    const sol = document.getElementById('global_sol_input');
    const lun = document.getElementById('global_lun_input');
    const chk = document.getElementById('global_lun_chk');
    if(loc) loc.value = window.reportCardDateSettings.location || '';
    if(sol) sol.value = window.reportCardDateSettings.solarDate || '';
    if(lun) lun.value = window.reportCardDateSettings.lunarDate || '';
    if(chk) {
        chk.checked = window.reportCardDateSettings.showLunar;
        if(!chk.checked) lun.classList.add('opacity-40', 'pointer-events-none');
        else lun.classList.remove('opacity-40', 'pointer-events-none');
    }
};

// ==========================================
// ០៤. ប្រព័ន្ធគ្រប់គ្រងមុខវិជ្ជា (Subject Config & Manager)
// ==========================================
window.SUBJECT_COLOR_THEMES = [
    { name: "ខៀវ (ភាសាខ្មែរ)", color: "#dbeafe", borderColor: "#93c5fd", textColor: "#1e3a8a" },
    { name: "ស្វាយ (គណិតវិទ្យា)", color: "#ede9fe", borderColor: "#c4b5fd", textColor: "#4c1d95" },
    { name: "បៃតង (វិទ្យាសាស្ត្រ)", color: "#dcfce7", borderColor: "#86efac", textColor: "#14532d" },
    { name: "លឿង (សិក្សាសង្គម)", color: "#fef9c3", borderColor: "#fde047", textColor: "#713f12" },
    { name: "ផ្កាឈូក (អប់រំកាយ/សិល្បៈ)", color: "#ffe4e6", borderColor: "#fda4af", textColor: "#881337" },
    { name: "ផ្ទៃមេឃ (ភាសាបរទេស)", color: "#e0f2fe", borderColor: "#7dd3fc", textColor: "#0c4a6e" },
    { name: "ប្រផេះ (ទូទៅ)", color: "#f1f5f9", borderColor: "#cbd5e1", textColor: "#1e293b" }
];

window.getScoreSchema = function(level, periodType, track = "sci") {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeKey = ((sInfo.teacher_level || "ថ្នាក់ទី ១") + "_" + (sInfo.teacher_room || "ក")).replace(/\s+/g, '');
    const savedSchema = localStorage.getItem(`custom_score_schema_${gradeKey}`);
    if (savedSchema) {
        try { const parsed = JSON.parse(savedSchema); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } catch(e) {}
    }

    if (level === "primary") {
        return [
            { group: "ភាសាខ្មែរ", color: "#dbeafe", textColor: "#1e3a8a", subs: [ { name: "ស្តាប់", key: "k_listen", max: 10 }, { name: "សរសេរ", key: "k_write", max: 10 }, { name: "អាន", key: "k_read", max: 10 }, { name: "តែងសេចក្តី", key: "k_compose", max: 10 } ] },
            { group: "គណិតវិទ្យា", color: "#fecaca", textColor: "#7f1d1d", subs: [ { name: "ចំនួន", key: "m_num", max: 10 }, { name: "រង្វាស់រង្វាល់", key: "m_measure", max: 10 }, { name: "ធរណីមាត្រ", key: "m_geo", max: 10 }, { name: "ពីជគណិត", key: "m_alg", max: 10 }, { name: "ស្ថិតិ", key: "m_stat", max: 10 } ] },
            { group: "វិទ្យាសាស្ត្រ", color: "#bbf7d0", textColor: "#14532d", subs: [ { name: "រូបវិទ្យា", key: "s_phy", max: 10 }, { name: "គីមីវិទ្យា", key: "s_chem", max: 10 }, { name: "ជីវវិទ្យា", key: "s_bio", max: 10 }, { name: "ផែនដី-បរិស្ថាន", key: "s_earth", max: 10 } ] },
            { group: "សិក្សាសង្គម", color: "#fef08a", textColor: "#713f12", subs: [ { name: "សីលធម៌-ពលរដ្ឋ", key: "ss_moral", max: 10 }, { name: "ភូមិវិទ្យា", key: "ss_geo", max: 10 }, { name: "ប្រវត្តិវិទ្យា", key: "ss_hist", max: 10 } ] },
            { group: "អប់រំកាយ", color: "#e9d5ff", textColor: "#581c87", subs: [ { name: "អប់រំកាយ-កីឡា", key: "pe_sport", max: 10 }, { name: "សុខភាព", key: "pe_health", max: 10 } ] },
            { group: "បំណិនជីវិត", color: "#f1f5f9", textColor: "#1e293b", key: "life_skill", max: 10 },
            { group: "ភាសាបរទេស", color: "#e0f2fe", textColor: "#0c4a6e", key: "foreign_lang", max: 10 }
        ];
    }
    
    return [
        { group: "ភាសាខ្មែរ", key: "khmer", color: "#dbeafe", textColor: "#1e3a8a", max: 100 },
        { group: "សីលធម៌-ពលរដ្ឋវិជ្ជា", key: "moral", color: "#fef08a", textColor: "#713f12", max: 50 },
        { group: "ប្រវត្តិវិទ្យា", key: "history", color: "#fef08a", textColor: "#713f12", max: 50 },
        { group: "ភូមិវិទ្យា", key: "geography", color: "#fef08a", textColor: "#713f12", max: 50 },
        { group: "គណិតវិទ្យា", key: "math", color: "#fecaca", textColor: "#7f1d1d", max: 100 },
        { group: "រូបវិទ្យា", key: "physics", color: "#bbf7d0", textColor: "#14532d", max: 50 },
        { group: "គីមីវិទ្យា", key: "chemistry", color: "#bbf7d0", textColor: "#14532d", max: 50 },
        { group: "ជីវវិទ្យា", key: "biology", color: "#bbf7d0", textColor: "#14532d", max: 50 },
        { group: "ផែនដីវិទ្យា", key: "earth", color: "#bbf7d0", textColor: "#14532d", max: 50 },
        { group: "ភាសាបរទេស", key: "foreign_lang", color: "#e0f2fe", textColor: "#0c4a6e", max: 50 }, 
        { group: "បច្ចេកវិទ្យា (ICT)", key: "tech", color: "#f1f5f9", textColor: "#1e293b", max: 50 },
        { group: "គេហវិទ្យា", key: "home_eco", color: "#e9d5ff", textColor: "#581c87", max: 50 },
        { group: "អប់រំសិល្បៈ", key: "art", color: "#e9d5ff", textColor: "#581c87", max: 50 },
        { group: "អប់រំកាយ", key: "sport", color: "#e9d5ff", textColor: "#581c87", max: 50 }
    ];
};

window.extractSubjectKeys = function(schema) {
  let keys = []; window.schemaMaxMap = {};
  if (schema) {
      schema.forEach(item => {
        if (item.subs) item.subs.forEach(s => { keys.push(s.key); window.schemaMaxMap[s.key] = s.max || 10; });
        else if (item.key) { keys.push(item.key); window.schemaMaxMap[item.key] = item.max || 10; }
      });
  }
  return keys;
};

window.openSubjectManagerModal = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = document.getElementById("globalLevelSelect")?.value || sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = document.getElementById("globalRoomSelect")?.value || sInfo.teacher_room || "«ក»";
    const gradeFull = `${levelStr} ${roomStr}`;
    const schoolLevel = window.getSchoolLevel(levelStr);
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const trackStr = document.getElementById("globalTrackSelect")?.value || "sci";

    window.tempEditingSchema = JSON.parse(JSON.stringify(window.getScoreSchema(schoolLevel, type, trackStr)));

    const oldModal = document.getElementById("subjectManagerModal");
    if (oldModal) oldModal.remove();

    const modalHtml = `
        <div id="subjectManagerModal" class="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 font-siemreap z-[999999] animate-fade-in">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-5 flex justify-between items-center text-white shrink-0">
                    <div class="flex items-center gap-3.5"><div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl border border-white/20 shadow-inner"><i class="fa-solid fa-layer-group"></i></div><div><h3 class="font-moul text-base sm:text-lg">គ្រប់គ្រង និងបន្ថែមមុខវិជ្ជាសិក្សា</h3><p class="text-xs text-blue-100 mt-0.5">កំណត់មុខវិជ្ជា ពិន្ទុអតិបរមា និងមេគុណសម្រាប់៖ <b class="font-moul text-[11px]">${gradeFull}</b></p></div></div>
                    <button onclick="document.getElementById('subjectManagerModal').remove()" class="w-9 h-9 rounded-full bg-white/15 hover:bg-rose-500 text-white flex items-center justify-center transition"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                <div class="p-4 sm:p-5 bg-indigo-50/70 border-b border-indigo-100 shrink-0">
                    <div class="text-xs font-moul text-indigo-900 mb-3 flex items-center gap-2"><i class="fa-solid fa-circle-plus text-indigo-600"></i> បន្ថែមមុខវិជ្ជាថ្មីចូលក្នុងតារាង</div>
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div class="sm:col-span-3"><label class="block text-[11px] font-bold text-slate-600 mb-1">ក្រុមមុខវិជ្ជាគោល</label><input type="text" id="newSubGroupInput" list="existingGroupsList" placeholder="ឧ. ភាសាបរទេស" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500"><datalist id="existingGroupsList"></datalist></div>
                        <div class="sm:col-span-3"><label class="block text-[11px] font-bold text-slate-600 mb-1">ឈ្មោះមុខវិជ្ជា (រង)</label><input type="text" id="newSubNameInput" placeholder="ឧ. អង់គ្លេស" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500"></div>
                        <div class="sm:col-span-2"><label class="block text-[11px] font-bold text-slate-600 mb-1">ពិន្ទុអតិបរមា</label><input type="number" id="newSubMaxInput" value="10" min="1" max="500" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center text-slate-800 bg-white outline-none focus:border-indigo-500"></div>
                        <div class="sm:col-span-2"><label class="block text-[11px] font-bold text-slate-600 mb-1">ពណ៌កូឡោន</label><select id="newSubColorSelect" class="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500 cursor-pointer">${window.SUBJECT_COLOR_THEMES.map((t, i) => `<option value="${i}">${t.name}</option>`).join('')}</select></div>
                        <div class="sm:col-span-2"><button type="button" onclick="window.addSubjectToTempSchema()" class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"><i class="fa-solid fa-plus"></i> បន្ថែម</button></div>
                    </div>
                </div>
                <div id="subjectManagerListArea" class="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 bg-slate-50"></div>
                <div class="p-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
                    <button type="button" onclick="window.resetSchemaToDefault()" class="px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold border border-rose-200 text-xs transition flex items-center gap-2"><i class="fa-solid fa-rotate-left"></i> កំណត់មុខវិជ្ជាដើមវិញ (Default)</button>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="document.getElementById('subjectManagerModal').remove()" class="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 text-xs transition">បោះបង់</button>
                        <button type="button" onclick="window.saveCustomSubjectSchema()" class="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md text-xs flex items-center gap-2 transition active:scale-95"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក & អនុវត្ត</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    window.renderSubjectManagerList();
};

window.renderSubjectManagerList = function() {
    const container = document.getElementById("subjectManagerListArea");
    const datalist = document.getElementById("existingGroupsList");
    if (!container) return;
    if (datalist) datalist.innerHTML = window.tempEditingSchema.map(g => `<option value="${g.group}">`).join("");

    if (window.tempEditingSchema.length === 0) {
        container.innerHTML = `<div class="p-10 text-center text-slate-400 font-bold">មិនទាន់មានមុខវិជ្ជាទេ!</div>`;
        return;
    }

    container.innerHTML = window.tempEditingSchema.map((group, gIdx) => {
        const subs = (group.subs && group.subs.length > 0) ? group.subs : [{ name: group.group, key: group.key, max: group.max || 10, coeff: group.coeff || 1 }];
        const subsHtml = subs.map((sub, sIdx) => `
            <div class="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 transition">
                <div class="flex items-center gap-2.5 flex-1 min-w-[180px]">
                    <span class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center shadow-sm">${sIdx + 1}</span>
                    <input type="text" value="${sub.name}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'name', this.value)" class="px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent focus:bg-white font-bold text-xs text-slate-800 outline-none flex-1 transition-all">
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"><span>ពិន្ទុពេញ:</span><input type="number" value="${sub.max || 10}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'max', parseFloat(this.value)||10)" class="w-12 border-none bg-transparent text-center font-mono font-bold text-xs text-indigo-700 outline-none"></div>
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"><span>មេគុណ:</span><input type="number" value="${sub.coeff || 1}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'coeff', parseFloat(this.value)||1)" class="w-10 border-none bg-transparent text-center font-mono font-bold text-xs text-slate-700 outline-none"></div>
                    <button type="button" onclick="window.removeTempSubItem(${gIdx}, ${sIdx})" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition shadow-sm"><i class="fa-solid fa-trash-can text-xs"></i></button>
                </div>
            </div>
        `).join("");

        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                <div class="px-4 py-2.5 border-b border-slate-200 flex justify-between items-center transition-colors" style="background-color: ${group.color || '#f1f5f9'};">
                    <div class="flex items-center gap-2"><span class="font-moul text-xs drop-shadow-sm" style="color: ${group.textColor || '#1e293b'};">${group.group}</span><span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-white/50 shadow-sm">${subs.length} មុខវិជ្ជា</span></div>
                    <button type="button" onclick="window.removeTempGroup(${gIdx})" class="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 px-2 py-1 rounded-lg transition flex items-center gap-1"><i class="fa-solid fa-xmark"></i> លុបក្រុមនេះ</button>
                </div>
                <div class="p-3 space-y-2">${subsHtml}</div>
            </div>
        `;
    }).join("");
};

window.updateTempSubItem = function(gIdx, sIdx, field, val) {
    const group = window.tempEditingSchema[gIdx];
    if (!group) return;
    if (!group.subs || group.subs.length === 0) group.subs = [{ name: group.group, key: group.key, max: group.max || 10, coeff: group.coeff || 1 }];
    if (group.subs[sIdx]) group.subs[sIdx][field] = val;
};
window.removeTempSubItem = function(gIdx, sIdx) {
    const group = window.tempEditingSchema[gIdx];
    if (!group) return;
    if (!group.subs || group.subs.length <= 1) window.tempEditingSchema.splice(gIdx, 1);
    else group.subs.splice(sIdx, 1);
    window.renderSubjectManagerList();
};
window.removeTempGroup = function(gIdx) {
    if (!confirm("តើអ្នកពិតជាចង់លុបក្រុមមុខវិជ្ជានេះទាំងមូលមែនទេ?")) return;
    window.tempEditingSchema.splice(gIdx, 1);
    window.renderSubjectManagerList();
};
window.addSubjectToTempSchema = function() {
    const groupName = (document.getElementById("newSubGroupInput")?.value || "").trim();
    const subName = (document.getElementById("newSubNameInput")?.value || "").trim();
    const maxVal = parseFloat(document.getElementById("newSubMaxInput")?.value) || 10;
    const colorIdx = parseInt(document.getElementById("newSubColorSelect")?.value || "0", 10);
    const theme = window.SUBJECT_COLOR_THEMES[colorIdx] || window.SUBJECT_COLOR_THEMES[0];

    if (!groupName || !subName) return alert("⚠️ សូមបញ្ចូលទាំង «ក្រុមមុខវិជ្ជាគោល» និង «ឈ្មោះមុខវិជ្ជា»!");
    const customKey = "sub_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 100);
    const newSubObj = { name: subName, key: customKey, max: maxVal, coeff: 1 };

    let existingGroup = window.tempEditingSchema.find(g => g.group === groupName);
    if (existingGroup) {
        if (!existingGroup.subs || existingGroup.subs.length === 0) existingGroup.subs = [{ name: existingGroup.group, key: existingGroup.key, max: existingGroup.max || 10, coeff: existingGroup.coeff || 1 }];
        existingGroup.subs.push(newSubObj);
    } else {
        window.tempEditingSchema.push({ group: groupName, color: theme.color, borderColor: theme.borderColor, textColor: theme.textColor, subs: [newSubObj] });
    }
    document.getElementById("newSubNameInput").value = "";
    window.renderSubjectManagerList();
};

window.saveCustomSubjectSchema = async function() {
    if (!window.tempEditingSchema || window.tempEditingSchema.length === 0) return alert("⚠️ ត្រូវមានមុខវិជ្ជាយ៉ាងហោចណាស់ ១ នៅក្នុងតារាង!");
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeKey = ((sInfo.teacher_level || "ថ្នាក់ទី ១") + "_" + (sInfo.teacher_room || "ក")).replace(/\s+/g, '');
    localStorage.setItem(`custom_score_schema_${gradeKey}`, JSON.stringify(window.tempEditingSchema));
    document.getElementById("subjectManagerModal")?.remove();
    if (typeof showToast === "function") showToast("✅ បានរក្សាទុក និងអាប់ដេតតារាងមុខវិជ្ជាដោយជោគជ័យ!");
    await window.fetchStudentsForScores(); window.calculateAllScores();
};

window.resetSchemaToDefault = async function() {
    if (!confirm("តើអ្នកពិតជាចង់ត្រឡប់ទៅប្រើទម្រង់មុខវិជ្ជាដើម (Default) វិញមែនទេ? រាល់មុខវិជ្ជាដែលអ្នកបានបន្ថែមថ្មីនឹងត្រូវបាត់បង់។")) return;
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeKey = ((sInfo.teacher_level || "ថ្នាក់ទី ១") + "_" + (sInfo.teacher_room || "ក")).replace(/\s+/g, '');
    localStorage.removeItem(`custom_score_schema_${gradeKey}`);
    document.getElementById("subjectManagerModal")?.remove();
    if (typeof showToast === "function") showToast("🔄 បានកំណត់មុខវិជ្ជាដើមឡើងវិញដោយជោគជ័យ!");
    await window.fetchStudentsForScores(); window.calculateAllScores();
};

// ==========================================
// ០៥. ម៉ាស៊ីនគណនាពិន្ទុ (Calculation Engine)
// ==========================================
window.calculateDynamicMonthlyAverage = function(studentId, semester) {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const gradeClean = grade.replace(/\s+/g, ''); 
    const config = JSON.parse(localStorage.getItem('semester_month_config_' + grade));
    if (!config) return 0;
    const targetMonths = semester === "s1" ? config.sem1 : config.sem2;
    if (!targetMonths || targetMonths.length === 0) return 0;

    let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
    let totalScoreSum = 0; let countedMonths = 0;

    allScores.forEach(s => {
        let sGradeClean = String(s.grade || "").replace(/\s+/g, '');
        if (String(s.student_id) === String(studentId) && s.period_type === "monthly" && targetMonths.includes(s.month) && sGradeClean === gradeClean) {
            if (parseFloat(s.average) > 0) { totalScoreSum += parseFloat(s.average); countedMonths++; }
        }
    });
    if (countedMonths === 0) return 0;
    return (totalScoreSum / countedMonths).toFixed(2);
};

window.getGradeLetter = function(avg, hasFail, schoolLevel) {
    if (schoolLevel === "upper_sec") {
        if (avg >= 90) return "A"; if (avg >= 80) return "B"; if (avg >= 70) return "C";
        if (avg >= 60) return "D"; if (avg >= 50) return "E"; return "F";
    }
    if (avg >= 9.5) return "ល្អណាស់"; if (avg >= 8.0) return "ល្អ"; if (avg >= 6.50) return "ល្អបង្គួរ";
    if (avg >= 5.0) return "មធ្យម"; return "ធ្លាក់";
};

window.calculateSectionScore = function(id, suffix, schoolLevel) {
    let totalScore = 0, overallMax = 0, divisorCount = 0; let hasFail = false;

    window.activeSchema.forEach(item => {
        let groupScore = 0, groupMax = 0, groupHasInput = false;
        const processInput = (key, maxVal) => {
            const inputId = suffix ? `${key}_${suffix}_${id}` : `${key}_${id}`;
            const inputEl = document.getElementById(inputId);
            if (inputEl) {
                const valStr = inputEl.value.trim();
                if (valStr !== "" && !isNaN(parseFloat(valStr))) {
                    const val = parseFloat(valStr);
                    if (val < maxVal / 2) { inputEl.classList.add("text-rose-600"); inputEl.classList.remove("text-slate-800"); hasFail = true; } 
                    else { inputEl.classList.remove("text-rose-600"); inputEl.classList.add("text-slate-800"); }
                    groupScore += val; groupMax += maxVal; groupHasInput = true;
                    if (schoolLevel === "primary") divisorCount++;
                } else { inputEl.classList.remove("text-rose-600", "text-slate-800"); }
            }
        };
        
        if (item.subs && item.subs.length > 0) item.subs.forEach(s => processInput(s.key, window.schemaMaxMap[s.key] || 10));
        else processInput(item.key, window.schemaMaxMap[item.key] || 10);

        if (groupHasInput) {
            totalScore += groupScore; overallMax += groupMax;
            if (schoolLevel !== "primary") divisorCount++;
        }
    });

    const examAvg = divisorCount > 0 ? (totalScore / divisorCount) : 0;
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    let finalAvgToGrade = examAvg;
    
    if (type === "semester") { 
        const autoMonthlyAvg = parseFloat(window.calculateDynamicMonthlyAverage(id, suffix));
        const monthlyAvgInput = document.getElementById(`monthly_avg_${id}`);
        if (monthlyAvgInput) {
            if (!monthlyAvgInput.value && autoMonthlyAvg > 0) monthlyAvgInput.value = autoMonthlyAvg.toFixed(2);
            const monthlyAvgStr = monthlyAvgInput.value.trim();
            if (monthlyAvgStr !== "" && !isNaN(parseFloat(monthlyAvgStr))) {
                finalAvgToGrade = (examAvg + parseFloat(monthlyAvgStr)) / 2;
            }
        }
        const totExEl = document.getElementById(`total_exam_${id}`);
        if (totExEl) totExEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        const avgExEl = document.getElementById(`avg_exam_${id}`);
        if (avgExEl) avgExEl.textContent = divisorCount > 0 ? examAvg.toFixed(2) : '';
        const avgDomEl = document.getElementById(`avg_${id}`);
        if (avgDomEl) {
            avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
            avgDomEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-black bg-emerald-50 font-mono text-[14px] ${finalAvgToGrade >= 5 ? 'text-emerald-700' : 'text-rose-600'}`;
        }
    } else if (type === "annual") {
        const totalEl = document.getElementById(`total_${suffix}_${id}`);
        if (totalEl) totalEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        const avgDomEl = document.getElementById(`avg_${suffix}_${id}`);
        if (avgDomEl) avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
    } else {
        const totalEl = document.getElementById(`total_${id}`);
        if (totalEl) totalEl.textContent = divisorCount > 0 ? totalScore.toFixed(2) : '';
        const avgDomEl = document.getElementById(`avg_${id}`);
        if (avgDomEl) {
            avgDomEl.textContent = divisorCount > 0 ? finalAvgToGrade.toFixed(2) : '';
            avgDomEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-bold bg-blue-50 font-mono text-[13px] ${finalAvgToGrade >= 5 ? 'text-blue-700' : 'text-rose-600'}`;
        }
    }

    let letter = "-", color = "text-slate-500";
    const pct = overallMax > 0 ? (totalScore / overallMax) * 100 : 0; 
    if (schoolLevel === "upper_sec") {
        if (pct >= 90) { letter = "A"; color = "text-blue-700"; }
        else if (pct >= 80) { letter = "B"; color = "text-emerald-700"; }
        else if (pct >= 70) { letter = "C"; color = "text-emerald-600"; }
        else if (pct >= 60) { letter = "D"; color = "text-amber-500"; }
        else if (pct >= 50) { letter = "E"; color = "text-amber-600"; }
        else if (totalScore > 0 || divisorCount > 0) { letter = "F"; color = "text-rose-600"; }
    } else {
        if (finalAvgToGrade >= 9.5) { letter = "ល្អណាស់"; color = "text-blue-800"; } 
        else if (finalAvgToGrade >= 8.0) { letter = "ល្អ"; color = "text-emerald-700"; }
        else if (finalAvgToGrade >= 6.50) { letter = "ល្អបង្គួរ"; color = "text-emerald-600"; }
        else if (finalAvgToGrade >= 5.0) { letter = "មធ្យម"; color = "text-amber-500"; }
        else if (finalAvgToGrade > 0) { letter = "ធ្លាក់"; color = "text-rose-600"; }
    }

    let gradeDomId = type === "annual" ? `grade_${suffix}_${id}` : `grade_${id}`;
    const gradeEl = document.getElementById(gradeDomId);
    if (gradeEl) { 
        gradeEl.textContent = divisorCount > 0 ? letter : ""; 
        gradeEl.className = `p-1 border-r border-slate-300 print:border-black text-center font-bold font-moul text-[11px] whitespace-nowrap ${color}`; 
    }
    return { total: totalScore, avg: finalAvgToGrade, rank: 0, gradeLetter: letter };
};

window.calculateStudentScore = function(id) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || "";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  const month = document.getElementById("globalPeriodValue")?.value || "";
  const schoolLevel = window.getSchoolLevel(levelStr);

  if (type === "annual") {
     const s1 = window.calculateSectionScore(id, "s1", schoolLevel);
     const s2 = window.calculateSectionScore(id, "s2", schoolLevel);
     let annualAvg = 0, divider = 0;
     if (s1.avg > 0) { annualAvg += s1.avg; divider++; }
     if (s2.avg > 0) { annualAvg += s2.avg; divider++; }
     annualAvg = divider > 0 ? (annualAvg / divider) : 0;
     
     let letter = "-", color = "text-slate-500";
     if (schoolLevel === "upper_sec") {
          letter = annualAvg >= 90 ? "A" : annualAvg >= 80 ? "B" : annualAvg >= 70 ? "C" : annualAvg >= 60 ? "D" : annualAvg >= 50 ? "E" : annualAvg > 0 ? "F" : "-"; 
          color = letter === "F" ? "text-rose-600" : "text-blue-700";
     } else {
         if (annualAvg >= 9.5) { letter = "ល្អណាស់"; color = "text-blue-800"; } 
         else if (annualAvg >= 8.0) { letter = "ល្អ"; color = "text-emerald-700"; }
         else if (annualAvg >= 6.50) { letter = "ល្អបង្គួរ"; color = "text-emerald-600"; }
         else if (annualAvg >= 5.0) { letter = "មធ្យម"; color = "text-amber-500"; }
         else if (annualAvg > 0) { letter = "ធ្លាក់"; color = "text-rose-600"; }
     }

     const annAvgEl = document.getElementById(`avg_annual_${id}`);
     if (annAvgEl) annAvgEl.textContent = divider > 0 ? annualAvg.toFixed(2) : '';
     const annGradeEl = document.getElementById(`grade_annual_${id}`);
     if (annGradeEl) { 
        annGradeEl.textContent = divider > 0 ? letter : ""; 
        annGradeEl.className = `p-1.5 border-r border-slate-300 print:border-black text-center font-black font-moul text-[13px] bg-amber-50 ${color}`; 
     }
  } else if (type === "semester") {
      const suffix = month.includes("២") ? "s2" : "s1";
      window.calculateSectionScore(id, suffix, schoolLevel);
  } else {
      window.calculateSectionScore(id, "", schoolLevel);
  }
};

window.calculateAllScores = function() { 
    if(!window.scoresStudentList || window.scoresStudentList.length === 0) return;
    window.scoresStudentList.forEach(s => window.calculateStudentScore(s.id)); 
    window.updateRanksInMemory(); 
};

window.updateRanksInMemory = function() {
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    let studentAvgs = [];

    window.scoresStudentList.forEach(s => {
        let avgId = type === "annual" ? `avg_annual_${s.id}` : `avg_${s.id}`;
        let avgEl = document.getElementById(avgId);
        let avg = avgEl ? parseFloat(avgEl.textContent) : 0;
        if (isNaN(avg)) avg = 0;
        
        let gradeId = type === "annual" ? `grade_annual_${s.id}` : `grade_${s.id}`;
        let gradeEl = document.getElementById(gradeId);
        let gradeLetter = gradeEl ? gradeEl.textContent : "-";

        let examAvg = 0, monthlyAvg = 0, s1Avg = 0, s2Avg = 0, tScore = 0, tExam = 0;
        if (type === "semester") {
            tExam = parseFloat(document.getElementById(`total_exam_${s.id}`)?.textContent) || 0;
            examAvg = parseFloat(document.getElementById(`avg_exam_${s.id}`)?.textContent) || 0;
            monthlyAvg = parseFloat(document.getElementById(`monthly_avg_${s.id}`)?.value) || 0;
        } else if (type === "annual") {
            s1Avg = parseFloat(document.getElementById(`avg_s1_${s.id}`)?.textContent) || 0;
            s2Avg = parseFloat(document.getElementById(`avg_s2_${s.id}`)?.textContent) || 0;
        } else {
            tScore = parseFloat(document.getElementById(`total_${s.id}`)?.textContent) || 0;
        }

        let fullStuObj = { ...s, avg: avg, gradeLetter: gradeLetter, exam_avg: examAvg, monthly_avg: monthlyAvg, sem1_avg: s1Avg, sem2_avg: s2Avg, total_score: tScore, total_exam: tExam };
        
        window.activeSubjectKeys.forEach(k => {
            let inId = `${k}_${s.id}`;
            if (type === "annual") inId = `${k}_s2_${s.id}`;
            else if (type === "semester") inId = `${k}_${month.includes("២") ? "s2" : "s1"}_${s.id}`;
            let inEl = document.getElementById(inId);
            if(inEl) fullStuObj[k] = inEl.value;
        });

        studentAvgs.push(fullStuObj);
    });

    studentAvgs.sort((a, b) => b.avg - a.avg);
    let currentRank = 1;
    for (let i = 0; i < studentAvgs.length; i++) {
        if (i > 0 && studentAvgs[i].avg === studentAvgs[i-1].avg) { studentAvgs[i].rank = studentAvgs[i-1].rank; } 
        else { studentAvgs[i].rank = currentRank; }
        currentRank++;
    }
    window.rankingsDataList = studentAvgs;
};

window.autoRankStudents = function() {
  window.calculateAllScores();
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  window.rankingsDataList.forEach(s => {
      let rankId = type === "annual" ? `rank_annual_${s.id}` : `rank_${s.id}`;
      const rankEl = document.getElementById(rankId);
      if (rankEl) rankEl.textContent = s.rank;
  });
  window.markUnsaved();
  if (typeof showToast === 'function') showToast("🏆 ការរៀបចំណាត់ថ្នាក់ស្វ័យប្រវត្តិទទួលបានជោគជ័យ!");
};

// ==========================================
// ០៦. រក្សាទុក & លុបទិន្នន័យ (Save Data)
// ==========================================
window.saveScoresData = async function() {
    const btn = document.getElementById("btnSaveScores");
    const originalText = btn ? btn.innerHTML : "រក្សាទុក";
    if (btn) { btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`; btn.disabled = true; }

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "";
    const levelStr = document.getElementById("globalLevelSelect")?.value || "";
    const roomStr = document.getElementById("globalRoomSelect")?.value || "";
    const grade = `${levelStr} ${roomStr}`;

    window.calculateAllScores();
    let scoresPayload = [];
    window.rankingsDataList.forEach(stu => {
        let stuRecord = {
            student_id: stu.id, grade: grade, period_type: type, month: type === "annual" ? "ប្រចាំឆ្នាំ" : month,
            eval_knowledge: document.getElementById(`eval_k_${stu.id}`)?.value || "",
            eval_skill: document.getElementById(`eval_s_${stu.id}`)?.value || "",
            eval_moral: document.getElementById(`eval_m_${stu.id}`)?.value || "",
            eval_solidarity: document.getElementById(`eval_so_${stu.id}`)?.value || ""
        };

        if (type === "annual") {
            stuRecord.total_score = ""; 
            stuRecord.average = document.getElementById(`avg_annual_${stu.id}`)?.textContent || "";
            stuRecord.rank = document.getElementById(`rank_annual_${stu.id}`)?.textContent || "";
            stuRecord.grade_letter = document.getElementById(`grade_annual_${stu.id}`)?.textContent || "";
        } else {
            stuRecord.total_score = document.getElementById(`total_${stu.id}`)?.textContent || "";
            stuRecord.average = document.getElementById(`avg_${stu.id}`)?.textContent || "";
            stuRecord.rank = document.getElementById(`rank_${stu.id}`)?.textContent || "";
            stuRecord.grade_letter = document.getElementById(`grade_${stu.id}`)?.textContent || "";
            if (type === "semester") {
                stuRecord.total_exam = document.getElementById(`total_exam_${stu.id}`)?.textContent || "";
                stuRecord.avg_exam = document.getElementById(`avg_exam_${stu.id}`)?.textContent || "";
                stuRecord.monthly_avg = document.getElementById(`monthly_avg_${stu.id}`)?.value || "";
            }
        }

        window.activeSubjectKeys.forEach(key => {
            let inputId = `${key}_${stu.id}`;
            if (type === "annual") inputId = `${key}_s2_${stu.id}`;
            else if (type === "semester") inputId = `${key}_${month.includes("២") ? "s2" : "s1"}_${stu.id}`;
            
            stuRecord[key] = document.getElementById(inputId)?.value || "";
            if (type === "annual") stuRecord[`${key}_s1`] = document.getElementById(`${key}_s1_${stu.id}`)?.value || "";
        });
        scoresPayload.push(stuRecord);
    });

    try {
        let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
        allScores = allScores.filter(s => !(s.period_type === type && s.month === (type === "annual" ? "ប្រចាំឆ្នាំ" : month) && s.grade === grade)); 
        allScores = [...allScores, ...scoresPayload]; 
        localStorage.setItem('academic_scores', JSON.stringify(allScores));

        const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
        if (sInfo.auto_sync && typeof apiPost === 'function') {
            await apiPost("saveScoresBatch", { data: scoresPayload });
            if (typeof showToast === 'function') showToast("✅ រក្សាទុកពិន្ទុទៅកាន់ Server បានជោគជ័យ!");
        } else {
            if (typeof showToast === 'function') showToast("⚠️ ទិន្នន័យរក្សាទុកបានត្រឹមក្នុងម៉ាស៊ីន (Offline)!");
        }
        window.hasUnsavedChanges = false;
        const badge = document.getElementById("unsavedBadge");
        if (badge) badge.classList.add("hidden");
    } catch (error) {
        alert("បរាជ័យក្នុងការរក្សាទុកទៅ Server! សូមពិនិត្យអ៊ីនធឺណិត។");
    } finally {
        if(btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
};

window.clearAllScores = function() {
    if (confirm("តើអ្នកពិតជាចង់សម្អាតពិន្ទុទាំងអស់លើតារាងនេះមែនទេ?")) {
        document.querySelectorAll('.score-input, .eval-input').forEach(input => {
            input.value = "";
            input.classList.remove('text-rose-600');
            input.classList.add('text-slate-800');
        });
        window.calculateAllScores();
        window.markUnsaved();
    }
};

window.markUnsaved = function() { 
    window.hasUnsavedChanges = true; 
    const badge = document.getElementById("unsavedBadge");
    if (badge) badge.classList.remove("hidden"); 
};

// ==========================================
// ០៧. Pop-up កំណត់ខែឆមាស (Semester Config)
// ==========================================
window.openSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    
    const defaultSettings = { sem1: ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា"], sem2: ["មេសា", "ឧសភា", "មិថុនា", "កក្កដា"] };
    const savedConfig = JSON.parse(localStorage.getItem('semester_month_config_' + grade)) || defaultSettings;
    const allMonths = ["ធ្នូ", "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា"];

    let modalHtml = `
      <div id="semesterConfigModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200">
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 sm:p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-sm sm:text-base drop-shadow-md flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid fa-sliders"></i></div>កំណត់ខែគណនាមធ្យមភាគប្រចាំឆមាស</h3>
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="w-8 h-8 rounded-full bg-white/20 text-white flex justify-center items-center hover:bg-white/40 transition-colors shadow-sm"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[75vh] bg-slate-50">
                <div class="mb-5 text-[12px] sm:text-[13px] text-blue-800 font-bold bg-blue-100/50 p-4 rounded-2xl border border-blue-200 flex items-start gap-3 shadow-sm leading-relaxed"><i class="fa-solid fa-circle-info text-blue-600 text-lg mt-0.5"></i> <p>សូមជ្រើសរើសខែដែលបានយកពិន្ទុជាក់ស្តែង ដើម្បីឱ្យប្រព័ន្ធទាញយកពិន្ទុទាំងនោះមកបូកបញ្ចូល និងចែកមធ្យមភាគប្រចាំខែ (សម្រាប់ប្រឡងឆមាស) ដោយស្វ័យប្រវត្តិ។</p></div>
                <div class="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div><h4 class="font-moul text-indigo-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100"><i class="fa-solid fa-book-open text-indigo-400"></i> សម្រាប់ឆមាសទី១</h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `<label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all ${savedConfig.sem1.includes(m) ? 'bg-indigo-50/50 border-indigo-200' : ''}"><input type="checkbox" value="${m}" class="sem1-month-cb w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-sm" ${savedConfig.sem1.includes(m) ? 'checked' : ''}><span class="text-xs sm:text-sm font-bold ${savedConfig.sem1.includes(m) ? 'text-indigo-700' : 'text-slate-700'}">ខែ ${m}</span></label>`).join('')}
                        </div>
                    </div>
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div><h4 class="font-moul text-emerald-700 text-[13px] sm:text-sm mb-4 flex items-center gap-2 pb-3 border-b border-slate-100"><i class="fa-solid fa-book-open text-emerald-400"></i> សម្រាប់ឆមាសទី២</h4>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3">
                            ${allMonths.map(m => `<label class="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all ${savedConfig.sem2.includes(m) ? 'bg-emerald-50/50 border-emerald-200' : ''}"><input type="checkbox" value="${m}" class="sem2-month-cb w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shadow-sm" ${savedConfig.sem2.includes(m) ? 'checked' : ''}><span class="text-xs sm:text-sm font-bold ${savedConfig.sem2.includes(m) ? 'text-emerald-700' : 'text-slate-700'}">ខែ ${m}</span></label>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('semesterConfigModal').remove()" class="px-5 sm:px-6 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-xs sm:text-sm">បោះបង់</button>
                <button onclick="window.saveSemesterConfig()" class="px-5 sm:px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 text-xs sm:text-sm"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុកការកំណត់</button>
            </div>
        </div>
      </div>
    `;

    const oldModal = document.getElementById('semesterConfigModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.querySelectorAll('.sem1-month-cb').forEach(cb => { cb.addEventListener('change', function() { const label = this.closest('label'); const span = label.querySelector('span'); if(this.checked) { label.classList.add('bg-indigo-50/50', 'border-indigo-200'); span.classList.replace('text-slate-700', 'text-indigo-700'); } else { label.classList.remove('bg-indigo-50/50', 'border-indigo-200'); span.classList.replace('text-indigo-700', 'text-slate-700'); } }); });
    document.querySelectorAll('.sem2-month-cb').forEach(cb => { cb.addEventListener('change', function() { const label = this.closest('label'); const span = label.querySelector('span'); if(this.checked) { label.classList.add('bg-emerald-50/50', 'border-emerald-200'); span.classList.replace('text-slate-700', 'text-emerald-700'); } else { label.classList.remove('bg-emerald-50/50', 'border-emerald-200'); span.classList.replace('text-emerald-700', 'text-slate-700'); } }); });
};

window.saveSemesterConfig = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const sem1Checked = Array.from(document.querySelectorAll('.sem1-month-cb:checked')).map(cb => cb.value);
    const sem2Checked = Array.from(document.querySelectorAll('.sem2-month-cb:checked')).map(cb => cb.value);
    const config = { sem1: sem1Checked, sem2: sem2Checked };
    localStorage.setItem('semester_month_config_' + grade, JSON.stringify(config));
    document.getElementById('semesterConfigModal').remove();
    if(typeof showToast === 'function') showToast("✅ ការកំណត់ខែត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    else alert("ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!");
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    if (type === "semester") { if(typeof window.fetchStudentsForScores === 'function') window.fetchStudentsForScores(); }
};

// ==========================================
// ០៨. រៀបចំ UI មេ (Main View & Navigation) 
// ==========================================
window.loadScoresView = async function() {
    const container = document.getElementById("scores") || document.getElementById("mainContentArea");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    const gradeFull = `${levelStr} ${roomStr}`;

    container.className = "flex flex-col flex-1 w-full h-full bg-slate-50/50 transition duration-300 min-h-0 relative";
    
    container.innerHTML = `
      <style>
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; font-weight: 500; }
          .font-Bokor { font-family: 'Khmer OS Bokor', sans-serif; }
          .header-vertical { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; padding: 12px 0; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
          
          input[type=number].modern-input::-webkit-inner-spin-button, 
          input[type=number].modern-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number].modern-input { -moz-appearance: textfield; }

          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .bg-ornament { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; pointer-events: none; }
          
          .cell-selected { background-color: #e0f2fe !important; box-shadow: inset 0 0 0 2px #3b82f6 !important; color: #1d4ed8 !important; transition: all 0.1s ease; }
          .table-container-no-select { user-select: none; -webkit-user-select: none; }

          .score-input { width: 100%; height: 32px; text-align: center; font-size: 13px; font-weight: 700; font-family: 'Courier New', Courier, monospace; border: 1px solid transparent; border-radius: 6px; background-color: transparent; outline: none; transition: all 0.2s ease; }
          .score-input:hover { background-color: rgba(255,255,255,0.8); border-color: #cbd5e1; }
          .score-input:focus { background-color: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); transform: scale(1.05); z-index: 10; position: relative; }
          
          #scoreTableMain { border-collapse: separate; border-spacing: 0; min-width: 100%; }
          #scoreTableMain th, #scoreTableMain td { border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
          #scoreTableMain th:last-child, #scoreTableMain td:last-child { border-right: none; }
          
          #scoresTableBody tr { transition: background-color 0.2s ease; }
          #scoresTableBody tr:hover td.sticky { background-color: #f8fafc !important; }
      </style>
      
      <div class="bg-ornament w-96 h-96 bg-blue-400/20 top-[-10%] left-[-5%]"></div>
      <div class="bg-ornament w-[500px] h-[500px] bg-amber-300/10 bottom-[-20%] right-[-10%]"></div>

      <div id="unsavedBadge" class="fixed top-20 right-6 bg-white/90 text-rose-600 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2.5 animate-pulse no-print z-[200] shadow-[0_8px_30px_rgb(225,29,72,0.15)] border border-rose-100 hidden backdrop-blur-md transform transition-all">
        <span class="relative flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>
        ទិន្នន័យមិនទាន់រក្សាទុក
      </div>

      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
          <div class="animate-fade-in custom-mixed-font flex flex-col font-siemreap max-w-[1600px] mx-auto pb-16 px-4 lg:px-8 pt-6 min-h-full">
            <div class="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-visible mb-8 shrink-0 transition-all">
              <div class="relative z-10 flex items-center gap-5">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white rounded-[1.2rem] flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30 animate-float"><i class="fa-solid fa-chart-pie"></i></div>
                <div>
                    <h2 class="text-xl md:text-2xl font-moul text-slate-800 tracking-wide drop-shadow-sm">ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ</h2>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold font-siemreap flex items-center gap-1.5"><i class="fa-solid fa-school"></i> ថ្នាក់ទី៖</span>
                        <strong class="text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 text-sm font-moul shadow-sm">${gradeFull}</strong>
                    </div>
                </div>
              </div>
              
              <div class="flex flex-wrap items-center gap-3 relative z-10 w-full 2xl:w-auto bg-slate-50/80 p-2 md:p-3 rounded-[1.5rem] border border-slate-200/80 backdrop-blur-md">
                <input type="hidden" id="globalLevelSelect" value="${levelStr}">
                <input type="hidden" id="globalRoomSelect" value="${roomStr}">
                
                <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-[1.2rem] px-3 py-2 shadow-sm flex-1 sm:flex-none transition-shadow hover:shadow-md">
                   <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner"><i class="fa-solid fa-calendar-check text-xs"></i></div>
                   <div class="flex flex-col">
                       <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5 ml-1">កាលវិភាគវាយតម្លៃ</span>
                       <div class="flex items-center">
                           <select id="globalPeriodType" onchange="window.updateGlobalPeriod(); window.updateGlobalSettings();" class="border-none bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer font-siemreap py-0 pl-1 pr-2">
                              <option value="monthly">ប្រចាំខែ</option>
                              <option value="semester">ប្រចាំឆមាស</option>
                              <option value="annual">ប្រចាំឆ្នាំ</option>
                           </select>
                           <div class="w-px h-4 bg-slate-300 mx-1"></div>
                           <select id="globalPeriodValue" onchange="window.updateGlobalSettings()" class="border-none bg-transparent text-sm font-black text-rose-600 outline-none cursor-pointer font-siemreap py-0 pl-1"></select>
                       </div>
                   </div>
                </div>

                <button id="btnGlobalSemesterConfig" onclick="window.openSemesterConfig()" class="flex px-4 py-3 bg-white hover:bg-purple-50 text-purple-600 border border-slate-200 hover:border-purple-300 rounded-[1.2rem] text-xs font-bold shadow-sm items-center justify-center gap-2 flex-1 sm:flex-none transition-all group"><i class="fa-solid fa-sliders group-hover:rotate-90 transition-transform"></i> កំណត់ខែឆមាស</button>
                <button type="button" onclick="window.toggleSharedDatePanel()" class="flex px-4 py-3 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-300 rounded-[1.2rem] text-xs font-bold items-center gap-2 shadow-sm flex-1 sm:flex-none transition-all"><i class="fa-solid fa-calendar-day"></i> កាលបរិច្ឆេទប្រព័ន្ធ</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 flex-1 no-print">
              <div onclick="window.openScoreModal('modal-entry', window.renderScoreEntryContent)" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[220px] relative overflow-hidden">
                  <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10"><i class="fa-solid fa-pen-to-square"></i></div>
                  <div class="relative z-10"><h3 class="font-moul text-[16px] text-slate-800 mb-1.5 group-hover:text-blue-700 transition-colors">បញ្ចូលពិន្ទុ</h3><p class="text-slate-500 text-xs font-siemreap leading-relaxed">ស្រង់ពិន្ទុមុខវិជ្ជា និងវាយតម្លៃលទ្ធផល។</p></div>
              </div>
              <div onclick="window.openScoreModal('modal-rankings', window.renderRankingsContent)" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(244,63,94,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[220px] relative overflow-hidden">
                  <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                  <div class="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md shadow-rose-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10"><i class="fa-solid fa-ranking-star"></i></div>
                  <div class="relative z-10"><h3 class="font-moul text-[16px] text-slate-800 mb-1.5 group-hover:text-rose-600 transition-colors">តារាងចំណាត់ថ្នាក់</h3><p class="text-slate-500 text-xs font-siemreap leading-relaxed">មើលចំណាត់ថ្នាក់ និងទាញយកជា Excel។</p></div>
              </div>
              <div onclick="window.openScoreModal('modal-reportcards', window.renderReportCardsTab)" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[220px] relative overflow-hidden">
                  <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                  <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300 relative z-10"><i class="fa-solid fa-file-invoice"></i></div>
                  <div class="relative z-10"><h3 class="font-moul text-[16px] text-slate-800 mb-1.5 group-hover:text-emerald-600 transition-colors">ព្រឹត្តិបត្រពិន្ទុ</h3><p class="text-slate-500 text-xs font-siemreap leading-relaxed">បោះពុម្ពសៀវភៅតាមដានការសិក្សាបុគ្គល។</p></div>
              </div>
              <div onclick="window.openScoreModal('modal-honorboard', window.renderHonorBoardContent)" class="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_rgb(245,158,11,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-slate-100 group flex flex-col justify-between h-[220px] relative overflow-hidden">
                  <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none"></div>
                  <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300 relative z-10"><i class="fa-solid fa-crown"></i></div>
                  <div class="relative z-10"><h3 class="font-moul text-[16px] text-slate-800 mb-1.5 group-hover:text-amber-600 transition-colors">តារាងកិត្តិយស</h3><p class="text-slate-500 text-xs font-siemreap leading-relaxed">ប័ណ្ណសរសើរសម្រាប់សិស្សឆ្នើម (Top 5)។</p></div>
              </div>
            </div>
          </div>
      </div>

      <!-- MODALS ទី១៖ បញ្ចូលពិន្ទុ -->
      <div id="modal-entry" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-2 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-entry-container" class="bg-slate-50 w-full h-full rounded-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              
              <div class="bg-white p-3 md:p-4 border-b border-slate-200/80 flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0 z-20">
                  <div class="flex items-center w-full xl:w-auto gap-4">
                      <button onclick="window.closeScoreModal('modal-entry')" class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-all shadow-inner active:scale-90 shrink-0"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="hidden md:flex items-center gap-3 border-r border-slate-200 pr-4">
                          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-pen-to-square"></i></div>
                          <div><h2 class="font-moul text-[15px] text-slate-800 leading-tight">បញ្ជីស្រង់ពិន្ទុ</h2><p class="text-[10px] text-slate-500 font-bold tracking-wide">សិស្សសរុប <span id="entryStudentCountLbl" class="text-blue-600 text-xs">...</span> នាក់</p></div>
                      </div>
                      <div class="relative flex-1 md:w-64 md:flex-none">
                          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                          <input type="text" id="scoreSearchInput" oninput="window.filterScoreTable()" placeholder="ស្វែងរកឈ្មោះសិស្ស..." class="pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm font-semibold w-full outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all">
                      </div>
                  </div>
                  
                  <div class="flex items-center justify-start xl:justify-end gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar pr-2">
                      <button onclick="window.openSubjectManagerModal()" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm"><i class="fa-solid fa-layer-group"></i> គ្រប់គ្រងមុខវិជ្ជា</button>
                      <div class="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
                      <button onclick="window.openMobileScoreModal(0)" class="px-4 py-2 bg-white text-slate-700 hover:text-amber-600 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm"><i class="fa-solid fa-bolt text-amber-500"></i> បញ្ចូលរហ័ស</button>
                      
                      <div class="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0 shadow-sm">
                          <button onclick="window.openImportExcelModal()" class="px-3 py-1.5 hover:bg-white text-slate-600 hover:text-cyan-600 rounded-lg text-xs font-bold transition flex items-center gap-1.5" title="ទាញចូលពី Excel"><i class="fa-solid fa-file-import"></i> Import</button>
                          <div class="w-px h-4 bg-slate-300 mx-0.5"></div>
                          <button onclick="window.exportScoreEntryToExcel()" class="px-3 py-1.5 hover:bg-white text-slate-600 hover:text-emerald-600 rounded-lg text-xs font-bold transition flex items-center gap-1.5" title="ទាញយកជា Excel"><i class="fa-solid fa-file-excel text-[13px]"></i> Export</button>
                      </div>
                      
                      <button onclick="window.printScoreList()" class="w-10 h-10 bg-white text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl text-sm font-bold transition flex items-center justify-center shrink-0 shadow-sm" title="បោះពុម្ពតារាង"><i class="fa-solid fa-print"></i></button>
                      <div class="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
                      
                      <button onclick="window.calculateAllScores()" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm active:scale-95"><i class="fa-solid fa-calculator"></i> គណនា</button>
                      <button onclick="window.autoRankStudents()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm active:scale-95"><i class="fa-solid fa-ranking-star"></i> រៀបចំណាត់ថ្នាក់</button>
                      <button onclick="window.saveScoresData()" id="btnSaveScores" class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-2 shrink-0 active:scale-95 border border-blue-500/50 transform hover:-translate-y-0.5 transition-all"><i class="fa-solid fa-floppy-disk text-[14px]"></i> រក្សាទុក</button>
                  </div>
              </div>
              <div id="modal-content-entry" class="flex-1 overflow-hidden flex flex-col relative bg-slate-100/50"></div>
          </div>
      </div>

      <!-- Modal ទី២៖ តារាងចំណាត់ថ្នាក់ -->
      <div id="modal-rankings" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-rankings-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex flex-col xl:flex-row justify-between items-center gap-4 shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4 w-full xl:w-auto">
                      <button onclick="window.closeScoreModal('modal-rankings')" class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-ranking-star text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">តារាងចំណាត់ថ្នាក់</h2>
                      </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                      <div class="relative shadow-sm shrink-0">
                          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                          <input type="text" placeholder="ស្វែងរកឈ្មោះ..." value="${window.rankingsSearchQuery}" oninput="window.filterRankingsTable(this.value, window.rankingsGenderFilter)" class="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none w-36 sm:w-44 focus:ring-2 focus:ring-indigo-500">
                      </div>
                      <select onchange="window.filterRankingsTable(window.rankingsSearchQuery, this.value)" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer shrink-0">
                          <option value="all" ${window.rankingsGenderFilter==='all'?'selected':''}>👥 ភេទទាំងអស់</option>
                          <option value="ស្រី" ${window.rankingsGenderFilter==='ស្រី'?'selected':''}>👩 សិស្សស្រី</option>
                          <option value="ប្រុស" ${window.rankingsGenderFilter==='ប្រុស'?'selected':''}>👨 សិស្សប្រុស</option>
                      </select>
                      <button onclick="window.exportRankingsToExcel()" class="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                      <button onclick="window.printRankingTable()" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 shrink-0"><i class="fa-solid fa-file-pdf"></i> PDF / Print</button>
                  </div>
              </div>
              <div id="modal-content-rankings" class="flex-1 overflow-auto bg-slate-100/30 p-2 md:p-6 custom-scrollbar"></div>
          </div>
      </div>

      <!-- Modal ទី៣៖ ព្រឹត្តិបត្រពិន្ទុ -->
      <div id="modal-reportcards" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-reportcards-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4">
                      <button onclick="window.closeScoreModal('modal-reportcards')" class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-file-invoice text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">សៀវភៅតាមដានការសិក្សា</h2>
                      </div>
                  </div>
              </div>
              <div id="scoreTabContent-reportcards" class="flex-1 overflow-auto bg-slate-200/40 p-0 relative shadow-inner custom-scrollbar"></div>
          </div>
      </div>

      <!-- Modal ទី៤៖ តារាងកិត្តិយស -->
      <div id="modal-honorboard" class="fixed inset-0 z-[2000] hidden bg-slate-900/60 backdrop-blur-md p-3 md:p-6 transition-all duration-300 font-siemreap">
          <div id="modal-honorboard-container" class="bg-slate-50 w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative border border-white/40 transform scale-95 opacity-0 transition-all duration-300 data-[open=true]:scale-100 data-[open=true]:opacity-100">
              <div class="bg-white/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-200/60 flex justify-between items-center shrink-0 shadow-sm z-20">
                  <div class="flex items-center gap-4">
                      <button onclick="window.closeScoreModal('modal-honorboard')" class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-90"><i class="fa-solid fa-arrow-left text-lg"></i></button>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-crown text-sm"></i></div>
                          <h2 class="font-moul text-lg text-slate-800">តារាងកិត្តិយស (Honor Board)</h2>
                      </div>
                  </div>
              </div>
              <div id="modal-content-honorboard" class="flex-1 overflow-auto bg-slate-100/50 p-4 md:p-6 custom-scrollbar"></div>
          </div>
      </div>
    `;

    window.updateGlobalPeriod();
    window.toggleTrackSelect();
    await window.renderScoreEntryContent(); 
};

window.updateGlobalPeriod = function() {
  const type = document.getElementById("globalPeriodType")?.value;
  const valSelect = document.getElementById("globalPeriodValue");
  const btnGlobalSemConfig = document.getElementById("btnGlobalSemesterConfig"); 
  
  if (!valSelect) return;
  if(btnGlobalSemConfig) { btnGlobalSemConfig.classList.remove("hidden"); btnGlobalSemConfig.classList.add("flex"); }
  
  if (type === "monthly") {
    valSelect.style.display = "inline-block";
    valSelect.innerHTML = `<option value="មករា">ខែមករា</option> <option value="កុម្ភៈ">ខែកុម្ភៈ</option> <option value="មីនា">ខែមីនា</option> <option value="មេសា">ខែមេសា</option> <option value="ឧសភា">ខែឧសភា</option> <option value="មិថុនា">ខែមិថុនា</option> <option value="កក្កដា">ខែកក្កដា</option> <option value="សីហា">ខែសីហា</option> <option value="កញ្ញា">ខែកញ្ញា</option> <option value="តុលា">ខែតុលា</option> <option value="វិច្ឆិកា">ខែវិច្ឆិកា</option> <option value="ធ្នូ">ខែធ្នូ</option>`;
  } else if (type === "semester") {
    valSelect.style.display = "inline-block";
    valSelect.innerHTML = `<option value="ឆមាសទី១">ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option>`;
  } else if (type === "annual") {
    valSelect.style.display = "none";
    valSelect.innerHTML = `<option value="ប្រចាំឆ្នាំ">លទ្ធផលប្រចាំឆ្នាំ</option>`;
  }
};

window.toggleTrackSelect = function() {
  const levelStr = document.getElementById("globalLevelSelect")?.value || "";
  const trackSelect = document.getElementById("globalTrackSelect");
  if (trackSelect) {
     if (window.getSchoolLevel(levelStr) === "upper_sec") trackSelect.classList.remove("hidden");
     else trackSelect.classList.add("hidden");
  }
};

window.updateGlobalSettings = async function() {
  if (window.hasUnsavedChanges) {
      if (!confirm("⚠️ អ្នកមានទិន្នន័យពិន្ទុមិនទាន់បានរក្សាទុក!\nតើអ្នកពិតជាចង់ប្តូរការកំណត់មែនទេ? (ទិន្នន័យដែលមិនទាន់រក្សាទុកនឹងបាត់បង់)")) return; 
  }
  window.toggleTrackSelect();
  await window.renderScoreEntryContent();
  if (!document.getElementById('modal-rankings').classList.contains('hidden')) window.renderRankingsContent();
  if (!document.getElementById('modal-reportcards').classList.contains('hidden')) window.renderReportCardsTab();
  if (!document.getElementById('modal-honorboard').classList.contains('hidden')) window.renderHonorBoardContent();
};

window.openScoreModal = function(id, callback) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    const modalContainer = document.getElementById(id + '-container');
    if(modalContainer) setTimeout(() => modalContainer.setAttribute('data-open', 'true'), 10);
    // ធានាថា Callback ដើរជានិច្ច ដើម្បី Render ទិន្នន័យពេលបើក Modal
    if(typeof callback === 'function') callback();
};

window.closeScoreModal = function(id) {
    if (window.hasUnsavedChanges && id === 'modal-entry') {
        if (!confirm("អ្នកមានទិន្នន័យមិនទាន់បានរក្សាទុក! តើអ្នកពិតជាចង់ចាកចេញមែនទេ?")) return;
    }
    const modal = document.getElementById(id);
    const modalContainer = document.getElementById(id + '-container');
    if(modalContainer) {
        modalContainer.removeAttribute('data-open');
        setTimeout(() => { modal.classList.add("hidden"); modal.classList.remove("flex"); }, 200); 
    } else if(modal) {
        modal.classList.add("hidden"); modal.classList.remove("flex");
    }
};

// ==========================================
// ០៩. តារាងបញ្ចូលពិន្ទុ (Score Entry Layout & Navigation)
// ==========================================
window.renderScoreEntryContent = async function() {
    const c = document.getElementById("modal-content-entry");
    if (!c) return;

    c.innerHTML = `
      <div id="tableScrollContainer" class="flex-1 overflow-auto w-full custom-scrollbar print:overflow-visible relative p-3 md:p-5 pb-20">
        <div class="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden mx-auto" style="width: max-content; min-width: 100%;">
            <table id="scoreTableMain" class="border-collapse text-[13px] text-center whitespace-nowrap bg-white relative font-siemreap w-full" style="border-collapse: separate; border-spacing: 0;">
              <thead id="scoreTableHead" class="text-slate-700 sticky top-0 z-[60] shadow-sm bg-slate-50 backdrop-blur-md"></thead>
              <tbody id="scoresTableBody" class="divide-y divide-slate-200 text-slate-700">
                <tr><td colspan="100" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-spinner fa-spin text-4xl mb-4 text-indigo-400"></i><br>កំពុងទាញយកទិន្នន័យពិន្ទុ...</td></tr>
              </tbody>
            </table>
        </div>
      </div>
    `;

    await window.fetchStudentsForScores();
    if(typeof window.initDragToSelectCells === 'function') window.initDragToSelectCells();
};

window.renderTableHeader = function(schema, type) {
    let topRowHtml = "", subRowHtml = "";
    const evalHeadersTop = `<th colspan="4" class="border-b border-r border-slate-200 print:border-black p-2 bg-purple-50 text-purple-800" style="font-family: 'Khmer OS Bokor', sans-serif; -webkit-print-color-adjust: exact;">ការវាយតម្លៃអាកប្បកិរិយា</th>`;
    const evalHeadersSub = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th class="border-b border-r border-slate-200 print:border-black p-0 bg-white" style="font-family: 'Khmer OS Bokor', sans-serif; width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-600">${t}</div></th>`).join("");
    const evalHeadersSub_Annual = ["ចំណេះដឹង", "បំណិន", "សីលធម៌", "សាមគ្គីភាព"].map(t => `<th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-0 bg-white" style="font-family: 'Khmer OS Bokor', sans-serif; width: 60px; min-width: 60px; max-width: 60px;"><div class="header-vertical text-[11px] mx-auto text-purple-600">${t}</div></th>`).join("");

    const W_NO = 45, W_NAME = 180, W_GENDER = 50, W_SCORE = 50, W_STAT = 65, W_EVAL = 60;
    const L_NAME = W_NO, L_GENDER = W_NO + W_NAME, W_TOTAL_FIXED = W_NO + W_NAME + W_GENDER; 

    let cgHtml = `<colgroup><col style="width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px;"><col style="width: ${W_NAME}px; min-width: ${W_NAME}px; max-width:${W_NAME}px;"><col style="width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width:${W_GENDER}px;">`;

    const renderSchemaHeaders = (prefix = "") => {
        schema.forEach(item => {
           if (item.subs && item.subs.length > 0) {
              topRowHtml += `<th colspan="${item.subs.length}" class="border-b border-r border-slate-200 print:border-black p-1.5 text-slate-800 font-bold" style="font-family: 'Khmer OS Bokor', sans-serif; background-color: ${item.color || '#f1f5f9'} !important; -webkit-print-color-adjust: exact;">${item.group}</th>`;
              item.subs.forEach(sub => {
                 subRowHtml += `<th class="border-b border-r border-slate-200 print:border-black p-0 font-normal bg-white" style="font-family: 'Khmer OS Bokor', sans-serif; -webkit-print-color-adjust: exact; width:${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;"><div class="header-vertical text-[11px] mx-auto text-slate-600" title="ពិន្ទុពេញ: ${sub.max||10} | មេគុណ: ${sub.coeff||1}">${sub.name}</div></th>`;
                 cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;">`;
              });
           } else {
              topRowHtml += `<th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-0 text-slate-800" style="font-family: 'Khmer OS Bokor', sans-serif; background-color: ${item.color || '#f1f5f9'} !important; -webkit-print-color-adjust: exact; width:${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;"><div class="header-vertical font-bold text-[12px] mx-auto" title="ពិន្ទុពេញ: ${item.max||10}">${item.group}</div></th>`;
              cgHtml += `<col style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width:${W_SCORE}px;">`;
           }
        });
    };

    const makeCol = (w, count = 1) => { for (let i = 0; i < count; i++) cgHtml += `<col style="width: ${w}px; min-width: ${w}px; max-width:${w}px;">`; };

    if (type === "annual") {
        let subjectCount = 0;
        schema.forEach(item => { subjectCount += (item.subs ? item.subs.length : 1); });
        let superTopRowHtml = `<tr><th colspan="3" class="border-b border-r border-slate-200 print:border-black bg-white sticky left-0 z-[70]" style="font-family: 'Khmer OS Bokor', sans-serif; min-width: ${W_TOTAL_FIXED}px; width: ${W_TOTAL_FIXED}px; max-width:${W_TOTAL_FIXED}px;"></th><th colspan="${subjectCount + 4}" class="border-b border-r border-slate-200 print:border-black p-2 bg-blue-100 text-blue-900 text-[13px] font-moul uppercase" style="-webkit-print-color-adjust: exact;">ឆមាសទី១</th><th colspan="${subjectCount + 4}" class="border-b border-r border-slate-200 print:border-black p-2 bg-emerald-100 text-emerald-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact;">ឆមាសទី២</th><th colspan="3" class="border-b border-r border-slate-200 print:border-black p-2 bg-amber-100 text-amber-900 text-[13px] font-moul uppercase border-l-[3px] border-l-slate-400 print:border-l-black" style="-webkit-print-color-adjust: exact;">លទ្ធផលប្រចាំឆ្នាំ</th>${evalHeadersTop}</tr>`;

        renderSchemaHeaders("_s1");
        topRowHtml += `<th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 bg-slate-100 text-slate-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">សរុប</span><br>ឆ.១</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-blue-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">មធ្យម</span><br>ឆ.១</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-rose-600 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">ចំណាត់</span><br>ថ្នាក់</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>`;
        makeCol(W_STAT, 4);
        renderSchemaHeaders("_s2");
        topRowHtml += `<th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 bg-slate-100 text-slate-700" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">សរុប</span><br>ឆ.២</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-blue-700 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">មធ្យម</span><br>ឆ.២</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-rose-600 bg-slate-100" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;"><span class="text-[10px]">ចំណាត់</span><br>ថ្នាក់</th><th rowspan="2" class="border-b border-r border-slate-200 print:border-black p-1 text-emerald-700 bg-slate-100 border-r-[3px] border-r-slate-400 print:border-r-black" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>`;
        makeCol(W_STAT, 4);
        makeCol(W_STAT + 10, 1); makeCol(W_STAT, 2); makeCol(W_EVAL, 4);
        cgHtml += `</colgroup>`;

        return `${cgHtml}${superTopRowHtml}
          <tr class="text-[12px] font-bold bg-slate-50">
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-500 sticky left-0 z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[12px]" style="width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black bg-amber-50 text-blue-800 text-[12px] font-moul" style="width: ${W_STAT+10}px; min-width: ${W_STAT+10}px; max-width:${W_STAT+10}px;"><span class="text-[10px] font-siemreap text-slate-500 font-normal">មធ្យមភាគ</span><br>ប្រចាំឆ្នាំ</th>
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black bg-amber-50 text-rose-700 text-[12px] font-moul" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black bg-amber-50 text-emerald-700 text-[12px] font-moul" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersSub_Annual}
          </tr><tr class="font-bold text-slate-800 bg-white">${subRowHtml}</tr>`;
    } else if (type === "semester") {
        renderSchemaHeaders("");
        makeCol(W_STAT, 2); makeCol(W_STAT + 5, 2); makeCol(W_STAT, 2); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
        return `${cgHtml}
          <tr class="text-[12px] font-bold bg-slate-50">
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-500 sticky left-0 z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[12px]" style="width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-700 bg-slate-100 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប<br>ប្រឡង</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-700 bg-slate-100 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យមភាគ<br>ប្រឡង</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-blue-50 text-blue-800 font-moul text-[11px]" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width:${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំខែ</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-emerald-50 text-emerald-800 font-moul text-[11px]" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width:${W_STAT+5}px;">មធ្យមភាគ<br>ប្រចាំឆមាស</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-orange-50 text-rose-700 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-orange-50 text-emerald-700 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersTop}
          </tr><tr class="font-bold text-slate-800 bg-white">${subRowHtml}${evalHeadersSub}</tr>`;
    } else {
        renderSchemaHeaders("");
        makeCol(W_STAT, 4); makeCol(W_EVAL, 4); cgHtml += `</colgroup>`;
        return `${cgHtml}
          <tr class="text-[12px] font-bold bg-slate-50">
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-500 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_NO}px; min-width: ${W_NO}px; max-width:${W_NO}px; left: 0px;">ល.រ</th>
            <th rowspan="2" class="p-2 border-b border-r border-slate-200 print:border-black text-left text-slate-800 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[12px]" style="width: ${W_NAME}px; min-width:${W_NAME}px; max-width: ${W_NAME}px; left:${L_NAME}px;">ឈ្មោះសិស្ស</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-600 sticky z-[70] print:static bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)] font-moul text-[11px]" style="width: ${W_GENDER}px; min-width:${W_GENDER}px; max-width: ${W_GENDER}px; left:${L_GENDER}px;">ភេទ</th>
            ${topRowHtml}
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black text-slate-700 bg-slate-100 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">សរុប</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-blue-50 text-blue-800 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">មធ្យមភាគ</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-rose-50 text-rose-700 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">ចំណាត់<br>ថ្នាក់</th>
            <th rowspan="2" class="p-1 border-b border-r border-slate-200 print:border-black bg-emerald-50 text-emerald-700 font-moul text-[11px]" style="width: ${W_STAT}px; min-width: ${W_STAT}px; max-width:${W_STAT}px;">និទ្ទេស</th>
            ${evalHeadersTop}
          </tr><tr class="font-bold text-slate-800 bg-white">${subRowHtml}${evalHeadersSub}</tr>`;
    }
};

window.initDragToSelectCells = function() {
    const tableContainer = document.getElementById('tableScrollContainer');
    const tableBody = document.getElementById('scoresTableBody');
    if (!tableContainer || !tableBody) return;

    let isDragging = false;
    let startCell = null;

    function getCellCoords(inputElem) {
        const td = inputElem.closest('td');
        const tr = inputElem.closest('tr');
        if (!td || !tr) return null;
        const allRows = Array.from(tableBody.querySelectorAll('tr'));
        const rowIdx = allRows.indexOf(tr);
        const allInputsInRow = Array.from(tr.querySelectorAll('input[type="number"], input[type="text"]'));
        const colIdx = allInputsInRow.indexOf(inputElem);
        return { row: rowIdx, col: colIdx };
    }

    function clearSelection() {
        tableBody.querySelectorAll('.cell-selected').forEach(el => el.classList.remove('cell-selected'));
    }

    function selectRange(start, end) {
        clearSelection();
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        const rows = tableBody.querySelectorAll('tr');
        for (let r = minRow; r <= maxRow; r++) {
            if (!rows[r]) continue;
            const inputs = rows[r].querySelectorAll('input[type="number"], input[type="text"]');
            for (let c = minCol; c <= maxCol; c++) {
                if (inputs[c]) inputs[c].classList.add('cell-selected');
            }
        }
    }

    tableBody.addEventListener('mousedown', function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            isDragging = true;
            tableContainer.classList.add('table-container-no-select'); 
            const coords = getCellCoords(e.target);
            if (coords) {
                startCell = coords;
                clearSelection();
                e.target.classList.add('cell-selected');
                setTimeout(() => e.target.focus(), 0);
            }
        }
    });

    tableBody.addEventListener('mouseover', function(e) {
        if (isDragging && e.target.tagName.toLowerCase() === 'input') {
            const currentCell = getCellCoords(e.target);
            if (currentCell && startCell) selectRange(startCell, currentCell);
        }
    });

    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            tableContainer.classList.remove('table-container-no-select');
        }
    });

    tableBody.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedCells = tableBody.querySelectorAll('.cell-selected');
            if (selectedCells.length > 1) { 
                e.preventDefault();
                selectedCells.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        }
        if (e.key === 'Escape') clearSelection();
        
        if(e.target.tagName.toLowerCase() === 'input') {
            const coords = getCellCoords(e.target);
            if(!coords) return;
            let nextRow = coords.row, nextCol = coords.col;
            const allRows = tableBody.querySelectorAll('tr');
            const totalRows = allRows.length;
            const inputsInRow = allRows[nextRow].querySelectorAll('input[type="number"], input[type="text"]');
            const totalCols = inputsInRow.length;
            
            if (e.key === 'ArrowDown' || e.key === 'Enter') { 
                e.preventDefault(); 
                nextRow++;
                if (nextRow >= totalRows) {
                    nextRow = 0;
                    nextCol++;
                }
            }
            else if (e.key === 'ArrowUp') { 
                e.preventDefault(); 
                nextRow--; 
                if (nextRow < 0) {
                    nextRow = totalRows - 1;
                    nextCol--;
                }
            }
            else if (e.key === 'ArrowRight') { 
                if (e.target.selectionStart === e.target.value.length || e.target.selectionStart === null) {
                    e.preventDefault(); 
                    nextCol++; 
                    if (nextCol >= totalCols) {
                        nextCol = 0;
                        nextRow++;
                    }
                }
            }
            else if (e.key === 'ArrowLeft') { 
                if (e.target.selectionStart === 0 || e.target.selectionStart === null) {
                    e.preventDefault(); 
                    nextCol--; 
                    if (nextCol < 0) {
                        nextCol = totalCols - 1;
                        nextRow--;
                    }
                }
            }
            
            if ((nextRow !== coords.row || nextCol !== coords.col) && nextRow >= 0 && nextRow < totalRows && nextCol >= 0 && nextCol < totalCols) {
                if(allRows[nextRow]) {
                    const inputs = allRows[nextRow].querySelectorAll('input[type="number"], input[type="text"]');
                    if(inputs[nextCol]) {
                        inputs[nextCol].focus();
                        setTimeout(() => inputs[nextCol].select(), 10);
                        clearSelection();
                        inputs[nextCol].classList.add('cell-selected');
                    }
                }
            }
        }
    });
};

window.renderEvalInputs = function(stuId, sc = {}) {
    const fields = [["eval_k", sc.eval_knowledge], ["eval_s", sc.eval_skill], ["eval_m", sc.eval_moral], ["eval_so", sc.eval_solidarity]];
    return fields.map(([k, val], colIndex) => `<td class="border-b border-r border-slate-200 print:border-black p-1" style="width: 60px; min-width: 60px; max-width: 60px;"><input type="text" id="${k}_${stuId}" data-row="${stuId}" data-col="${colIndex + 100}" value="${val || ''}" oninput="window.markUnsaved()" class="score-input bg-transparent text-purple-700 font-siemreap text-[12px] font-normal px-1"></td>`).join("");
};

window.fetchStudentsForScores = async function() {
    window.hasUnsavedChanges = false;
    document.getElementById("unsavedBadge")?.classList.add("hidden");
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = sInfo.teacher_room || "«ក»";
    const grade = `${levelStr} ${roomStr}`;
    const trackStr = document.getElementById("globalTrackSelect")?.value || "sci";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const schoolLevel = window.getSchoolLevel(levelStr);
    
    window.activeSchema = window.getScoreSchema(schoolLevel, type, trackStr);
    window.activeSubjectKeys = window.extractSubjectKeys(window.activeSchema);

    const th = document.getElementById("scoreTableHead");
    if (th) th.innerHTML = window.renderTableHeader(window.activeSchema, type);
    
    const tbody = document.getElementById("scoresTableBody");
    if (!tbody) return;

    try {
        tbody.innerHTML = `<tr><td colspan="100" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-blue-500"></i><br>កំពុងរៀបចំតារាងពិន្ទុ...</td></tr>`;
        
        let allStus = JSON.parse(localStorage.getItem('academic_students')) || [];
        if ((!allStus || allStus.length === 0) && typeof apiGet === "function") {
            try { 
                let stRes = await apiGet("getStudents", { status: "Active" }); 
                if (stRes && stRes.data && stRes.data.length > 0) allStus = stRes.data;
            } catch(e) {}
        }

        let cleanLevel = levelStr.replace(/\s+/g, ''); 
        let cleanRoom = roomStr.replace(/[«»\s]/g, '');

        window.scoresStudentList = allStus.filter(s => {
            if (!s || s.status === "Dropped" || s.status === "អសកម្ម") return false;
            let sGrade = String(s.grade || "").replace(/\s+/g, ''); 
            let sRoom = String(s.room || "").replace(/[«»\s]/g, '');
            let fullGradeDB = String(s.class_name || s.grade || "").replace(/\s+/g, ''); 
            let expectedFull = cleanLevel + cleanRoom;
            return (sGrade === cleanLevel && sRoom === cleanRoom) || (fullGradeDB === expectedFull) || (fullGradeDB.includes(cleanLevel) && fullGradeDB.includes(cleanRoom));
        });

        // Demo Data បើអត់សិស្ស
        if (window.scoresStudentList.length === 0 && allStus.length > 0) window.scoresStudentList = allStus.filter(s => s && s.status !== "Dropped");
        if (window.scoresStudentList.length === 0) {
            window.scoresStudentList = Array.from({length: 15}, (_, i) => ({ 
                id: "STU-" + String(i + 1).padStart(3, '0'), 
                name: i % 2 === 0 ? `សិស្សសាកល្បង ${i+1}` : `យុវតីតេស្ត ${i+1}`, 
                gender: i % 2 === 0 ? "ប្រុស" : "ស្រី", 
                grade: levelStr, room: roomStr 
            }));
        }
        
        window.scoresStudentList.sort((a,b) => String(a.name||"").localeCompare(String(b.name||""), 'km'));

        // Update Label
        const countLbl = document.getElementById("entryStudentCountLbl");
        if(countLbl) countLbl.textContent = window.scoresStudentList.length;

        let allScores = JSON.parse(localStorage.getItem('academic_scores')) || [];
        if ((!allScores || allScores.length === 0) && typeof apiGet === "function") { 
            try { 
                let scRes = await apiGet("getScores", { grade: grade }); 
                if (scRes && scRes.data) allScores = scRes.data;
            } catch(e) {} 
        }
        
        if (type === "annual") {
            window.s1Scores = allScores.filter(s => s.period_type === "semester" && s.month === "ឆមាសទី១" && s.grade === grade);
            window.s2Scores = allScores.filter(s => s.period_type === "semester" && s.month === "ឆមាសទី២" && s.grade === grade);
            window.currentScores = allScores.filter(s => s.period_type === "annual" && s.grade === grade);
        } else {
            window.currentScores = allScores.filter(s => s.period_type === type && s.month === month && s.grade === grade);
        }

        const W_NO = 45, W_NAME = 180, W_GENDER = 50, W_SCORE = 50, W_STAT = 65;
        const L_NAME = W_NO, L_GENDER = W_NO + W_NAME;

        let trs = "";
        window.scoresStudentList.forEach((stu, idx) => {
            let genColor = stu.gender === 'ស្រី' ? 'text-rose-600 bg-rose-50/50' : 'text-blue-700 bg-blue-50/50';
            
            let rowHtml = `<td class="p-1.5 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-500 sticky z-10 print:static text-[12px] font-mono bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)]" style="left: 0; width: ${W_NO}px; min-width: ${W_NO}px; max-width: ${W_NO}px;">${idx + 1}</td>
                           <td onclick="window.openMobileScoreModal(${idx})" class="cursor-pointer hover:text-indigo-600 p-1.5 px-3 border-b border-r border-slate-200 print:border-black text-left font-bold whitespace-nowrap sticky z-10 print:static text-slate-800 font-siemreap text-[13px] bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)] overflow-hidden text-ellipsis transition-colors" style="left: ${L_NAME}px; width: ${W_NAME}px; min-width: ${W_NAME}px; max-width: ${W_NAME}px;" title="ចុចដើម្បីបញ្ជូលពិន្ទុ">${stu.name}</td>
                           <td class="p-1.5 border-b border-r border-slate-200 print:border-black text-center font-bold font-siemreap ${genColor} sticky z-10 print:static text-[12px] bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)]" style="left: ${L_GENDER}px; width: ${W_GENDER}px; min-width: ${W_GENDER}px; max-width: ${W_GENDER}px;">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;

            if (type === "annual") {
                let sc1 = window.s1Scores.find(s => String(s.student_id) === String(stu.id)) || {};
                let sc2 = window.s2Scores.find(s => String(s.student_id) === String(stu.id)) || {};
                let scA = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                let colIndexTracker = 0;
                
                const makeInputs = (scObj, suffix, bg) => window.activeSubjectKeys.map(key => {
                    const maxVal = window.schemaMaxMap[key] || 10;
                    let val = scObj[key] !== undefined && scObj[key] !== "" ? scObj[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-b border-r border-slate-200 print:border-black p-1 relative ${bg}" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="number" inputmode="decimal" id="${key}_${suffix}_${stu.id}" data-row="${idx}" data-col="${colIndexTracker++}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input ${colorClass}"></td>`;
                }).join("");

                rowHtml += makeInputs(sc1, "s1", "bg-slate-50/50");
                rowHtml += `<td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-100" id="total_s1_${stu.id}">${sc1.total_score||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-100" id="avg_s1_${stu.id}">${sc1.average||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-rose-600 font-mono text-[13px] bg-slate-100" id="rank_s1_${stu.id}">${sc1.rank||''}</td><td class="p-1 border-b border-slate-200 print:border-black text-center font-bold text-emerald-700 font-moul text-[11px] bg-slate-100 border-r-[3px] border-r-slate-400" id="grade_s1_${stu.id}">${sc1.grade_letter||''}</td>`;

                rowHtml += makeInputs(sc2, "s2", "bg-white");
                rowHtml += `<td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" id="total_s2_${stu.id}">${sc2.total_score||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-slate-50" id="avg_s2_${stu.id}">${sc2.average||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-rose-600 font-mono text-[13px] bg-slate-50" id="rank_s2_${stu.id}">${sc2.rank||''}</td><td class="p-1 border-b border-slate-200 print:border-black text-center font-bold text-emerald-700 font-moul text-[11px] bg-slate-50 border-r-[3px] border-r-slate-400" id="grade_s2_${stu.id}">${sc2.grade_letter||''}</td><td class="p-1.5 border-b border-r border-slate-200 print:border-black text-center font-black text-blue-800 font-mono text-[14px] bg-amber-50" id="avg_annual_${stu.id}">${scA.average||''}</td><td class="p-1.5 border-b border-r border-slate-200 print:border-black text-center font-black text-rose-700 font-mono text-[14px] bg-amber-50" id="rank_annual_${stu.id}">${scA.rank||''}</td><td class="p-1.5 border-b border-slate-200 print:border-black text-center font-black text-emerald-700 font-moul text-[12px] bg-amber-50 border-r-[3px] border-r-slate-400" id="grade_annual_${stu.id}">${scA.grade_letter||''}</td>`;
                
                rowHtml += window.renderEvalInputs(stu.id, scA);
            } else if (type === "semester") {
                let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                const sem = month.includes("២") ? "s2" : "s1";
                rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                    const maxVal = window.schemaMaxMap[key] || 10; 
                    let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-b border-r border-slate-200 print:border-black p-0 relative" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="number" inputmode="decimal" id="${key}_${sem}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input ${colorClass}"></td>`;
                }).join("");
                
                const autoMonthlyAvg = parseFloat(window.calculateDynamicMonthlyAverage(stu.id, sem));
                let displayMonthlyAvg = sc.monthly_avg || (autoMonthlyAvg > 0 ? autoMonthlyAvg.toFixed(2) : '');

                rowHtml += `<td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" id="total_exam_${stu.id}">${sc.total_exam||''}</td>
                            <td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" id="avg_exam_${stu.id}">${sc.avg_exam||''}</td>
                            <td class="border-b border-r border-slate-200 print:border-black p-1 bg-blue-50/50" style="width: ${W_STAT+5}px; min-width: ${W_STAT+5}px; max-width: ${W_STAT+5}px;">
                                <input type="number" inputmode="decimal" placeholder="-" id="monthly_avg_${stu.id}" value="${displayMonthlyAvg}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input text-blue-700">
                            </td>
                            <td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-black text-emerald-700 bg-emerald-50 font-mono text-[13px]" id="avg_${stu.id}">${sc.average||''}</td>
                            <td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-black text-rose-600 bg-orange-50 font-mono text-[13px]" id="rank_${stu.id}">${sc.rank||''}</td>
                            <td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-emerald-700 bg-orange-50 font-moul text-[12px]" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
                
                rowHtml += window.renderEvalInputs(stu.id, sc);
            } else {
                let sc = window.currentScores.find(s => String(s.student_id) === String(stu.id)) || {};
                rowHtml += window.activeSubjectKeys.map((key, colIndex) => {
                    const maxVal = window.schemaMaxMap[key] || 10; 
                    let val = sc[key] !== undefined && sc[key] !== "" ? sc[key] : '';
                    const colorClass = (val !== '' && parseFloat(val) < maxVal/2) ? 'text-rose-600' : 'text-slate-800';
                    return `<td class="border-b border-r border-slate-200 print:border-black p-0 relative" style="width: ${W_SCORE}px; min-width: ${W_SCORE}px; max-width: ${W_SCORE}px;"><input type="number" inputmode="decimal" id="${key}_${stu.id}" data-row="${idx}" data-col="${colIndex}" value="${val}" oninput="this.value = this.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''); window.calculateStudentScore('${stu.id}'); window.markUnsaved();" class="score-input ${colorClass}"></td>`;
                }).join("");
                
                rowHtml += `<td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-slate-700 font-mono text-[13px] bg-slate-50" id="total_${stu.id}">${sc.total_score||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-bold text-blue-700 font-mono text-[13px] bg-blue-50" id="avg_${stu.id}">${sc.average||''}</td><td class="p-1 border-b border-r border-slate-200 print:border-black text-center font-black text-rose-600 font-mono text-[13px] bg-orange-50" id="rank_${stu.id}">${sc.rank||''}</td><td class="p-1 border-b border-slate-200 print:border-black text-center font-bold text-emerald-700 font-moul text-[12px] bg-emerald-50" id="grade_${stu.id}">${sc.grade_letter||''}</td>`;
                rowHtml += window.renderEvalInputs(stu.id, sc);
            }

            trs += `<tr id="row_${stu.id}" class="hover:bg-indigo-50/30 transition-colors bg-white group">${rowHtml}</tr>`;
        });

        tbody.innerHTML = trs;
        
        setTimeout(() => {
            window.calculateAllScores();
        }, 50);

    } catch (err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="100" class="p-12 text-center text-rose-500 font-bold bg-rose-50"><i class="fa-solid fa-triangle-exclamation text-3xl mb-2"></i><br>បរាជ័យក្នុងការតភ្ជាប់ទិន្នន័យ សូមព្យាយាមម្តងទៀត</td></tr>`;
    }
};



// ==========================================
// ១០. Mobile Entry Modal (UI Revamped)
// ==========================================
window.openMobileScoreModal = function(studentIndex) {
    if (!window.scoresStudentList || window.scoresStudentList.length === 0) return alert("គ្មានទិន្នន័យសិស្សទេ!");
    window.currentMobileStudentIndex = studentIndex || 0;
    
    let modal = document.getElementById("mobileScoreEntryModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "mobileScoreEntryModal";
        modal.className = "fixed inset-0 z-[3000] hidden bg-slate-900/80 backdrop-blur-sm p-3 md:p-6 transition-opacity font-siemreap flex items-center justify-center";
        
        modal.innerHTML = `
            <div class="bg-slate-50 w-full max-w-lg h-[95vh] md:h-auto md:max-h-[90vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200 animate-slide-up">
                <div class="bg-indigo-50 p-5 shrink-0 relative border-b border-indigo-100 shadow-sm">
                    <div class="flex justify-between items-center relative z-10">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-indigo-200 text-xl text-indigo-600 shadow-sm shrink-0"><i class="fa-solid fa-user-graduate"></i></div>
                            <div class="flex flex-col">
                                <h3 id="mobileScoreStuName" class="font-moul text-lg md:text-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 bg-clip-text text-transparent drop-shadow-sm leading-tight pb-1">ឈ្មោះសិស្ស</h3>
                                <div id="mobileScoreStuInfo" class="flex flex-wrap gap-2 mt-1"></div>
                            </div>
                        </div>
                        <button onclick="window.closeMobileScoreModal()" class="w-10 h-10 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition border border-slate-200 shadow-sm shrink-0"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                </div>
                
                <div id="mobileScoreInputsContainer" class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5 bg-slate-100/50"></div>
                
                <div class="bg-white p-4 shrink-0 border-t border-slate-200 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10">
                    <button id="btnPrevMobileStu" onclick="window.prevMobileStudent()" class="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 border border-slate-200 shadow-sm"><i class="fa-solid fa-chevron-left"></i> អ្នកមុន</button>
                    <button id="btnNextMobileStu" onclick="window.nextMobileStudent()" class="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transform hover:-translate-y-0.5">អ្នកបន្ទាប់ <i class="fa-solid fa-chevron-right"></i></button>
                </div>
                
                <div class="p-4 pt-0 bg-white shrink-0 z-10">
                    <button onclick="window.closeMobileScoreModal()" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 border border-emerald-500/50"><i class="fa-solid fa-check-circle text-lg"></i> រួចរាល់ & បិទផ្ទាំង</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.remove("hidden");
    window.renderMobileScoreInputs();
};

window.closeMobileScoreModal = function() {
    const modal = document.getElementById("mobileScoreEntryModal");
    if (modal) modal.classList.add("hidden");
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
};

window.prevMobileStudent = function() {
    if (window.currentMobileStudentIndex > 0) {
        window.currentMobileStudentIndex--;
        window.renderMobileScoreInputs();
    }
};

window.nextMobileStudent = function() {
    if (window.currentMobileStudentIndex < window.scoresStudentList.length - 1) {
        window.currentMobileStudentIndex++;
        window.renderMobileScoreInputs();
    } else {
        window.closeMobileScoreModal();
    }
};

window.renderMobileScoreInputs = function() {
    const stu = window.scoresStudentList[window.currentMobileStudentIndex];
    if (!stu) return;

    document.getElementById("mobileScoreStuName").innerText = stu.name;
    const toKhNum = typeof window.toKhmerNum === 'function' ? window.toKhmerNum : String;
    
    document.getElementById("mobileScoreStuInfo").innerHTML = `
        <span class="bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-sm font-siemreap font-bold text-[12px] text-indigo-700">ល.រ៖ ${toKhNum(window.currentMobileStudentIndex + 1)}</span>
        <span class="bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-sm font-siemreap font-bold text-[12px] ${stu.gender==='ស្រី'?'text-pink-600':'text-blue-600'}">ភេទ៖ ${stu.gender}</span>
    `;

    const btnPrev = document.getElementById("btnPrevMobileStu");
    const btnNext = document.getElementById("btnNextMobileStu");
    
    if (btnPrev) {
        btnPrev.disabled = window.currentMobileStudentIndex === 0;
        btnPrev.className = window.currentMobileStudentIndex === 0 
            ? "flex-1 py-3.5 bg-slate-50 text-slate-400 font-bold rounded-2xl text-[14px] flex items-center justify-center gap-2 cursor-not-allowed border border-slate-100" 
            : "flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 border border-slate-200 shadow-sm hover:shadow";
    }
    
    if (btnNext) {
        const isLast = window.currentMobileStudentIndex === window.scoresStudentList.length - 1;
        btnNext.innerHTML = isLast ? '<i class="fa-solid fa-check-circle"></i> រួចរាល់' : 'អ្នកបន្ទាប់ <i class="fa-solid fa-chevron-right"></i>';
        btnNext.className = isLast 
            ? "flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transform hover:-translate-y-0.5" 
            : "flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-2xl text-[14px] transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transform hover:-translate-y-0.5";
    }

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    let inputsHtml = "";
    
    if (window.activeSchema && window.activeSchema.length > 0) {
        window.activeSchema.forEach(group => {
            let icon = "fa-book", bgLight = "bg-indigo-50", textDark = "text-indigo-800", textIcon = "text-indigo-500", borderLight = "border-indigo-100", focusBorder = "focus:border-indigo-400";
            if(group.group.includes("ខ្មែរ")) { icon = "fa-language"; bgLight = "bg-blue-50"; textDark = "text-blue-800"; textIcon = "text-blue-500"; borderLight = "border-blue-100"; focusBorder = "focus:border-blue-400"; }
            if(group.group.includes("គណិត")) { icon = "fa-calculator"; bgLight = "bg-rose-50"; textDark = "text-rose-800"; textIcon = "text-rose-500"; borderLight = "border-rose-100"; focusBorder = "focus:border-rose-400"; }
            if(group.group.includes("វិទ្យាសាស្ត្រ")) { icon = "fa-flask"; bgLight = "bg-emerald-50"; textDark = "text-emerald-800"; textIcon = "text-emerald-500"; borderLight = "border-emerald-100"; focusBorder = "focus:border-emerald-400"; }
            if(group.group.includes("សង្គម")) { icon = "fa-globe"; bgLight = "bg-amber-50"; textDark = "text-amber-800"; textIcon = "text-amber-500"; borderLight = "border-amber-100"; focusBorder = "focus:border-amber-400"; }
            if(group.group.includes("ភាសាបរទេស")) { icon = "fa-book-atlas"; bgLight = "bg-slate-100"; textDark = "text-slate-800"; textIcon = "text-slate-500"; borderLight = "border-slate-200"; focusBorder = "focus:border-slate-400"; }

            inputsHtml += `
                <div class="mb-5 bg-white p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div class="absolute left-0 top-0 w-[4px] h-full ${bgLight.replace('50', '500').replace('100', '400')}"></div>
                    <h4 class="font-moul ${textDark} text-[14px] md:text-[15px] mb-4 pb-3 border-b border-slate-100 flex items-center gap-3 drop-shadow-sm ml-1">
                        <div class="w-8 h-8 rounded-[0.6rem] ${bgLight} flex items-center justify-center border ${borderLight}"><i class="fa-solid ${icon} ${textIcon} text-[13px]"></i></div>
                        ${group.group}
                    </h4>
                    <div class="space-y-3 pl-1">`;
            
            let subsToRender = (group.subs && group.subs.length > 0) ? group.subs : [{name: group.group, key: group.key, max: group.max}];
            subsToRender.forEach((sub, sIdx) => {
                const key = sub.key;
                const maxVal = window.schemaMaxMap ? (window.schemaMaxMap[key] || sub.max || 10) : (sub.max || 10);
                
                let inputIdMainTable = `${key}_${stu.id}`;
                if (type === "annual") inputIdMainTable = `${key}_s1_${stu.id}`; 
                if (type === "semester") {
                    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
                    inputIdMainTable = `${key}_${month.includes("២") ? "s2" : "s1"}_${stu.id}`;
                }

                const mainInput = document.getElementById(inputIdMainTable);
                const currentVal = mainInput ? mainInput.value : '';
                const rowBg = sIdx % 2 !== 0 ? 'bg-slate-50/50' : 'bg-transparent';

                inputsHtml += `
                    <div class="flex items-center justify-between input-focus-ring ${rowBg} hover:bg-slate-100 rounded-xl p-2.5 transition-all">
                        <label class="text-[13px] md:text-[14px] text-slate-700 font-siemreap font-bold w-1/2 pl-2 truncate" title="${sub.name}">${sub.name}</label>
                        <div class="relative w-[45%] md:w-[40%]">
                            <input type="number" inputmode="decimal" value="${currentVal}"
                                   oninput="if(typeof window.syncMobileInputToMain === 'function') window.syncMobileInputToMain('${inputIdMainTable}', this.value)"
                                   onkeydown="if(event.key==='Enter'){ event.preventDefault(); let inputs = Array.from(document.querySelectorAll('#mobileScoreInputsContainer input')); let idx = inputs.indexOf(this); if(idx < inputs.length-1) inputs[idx+1].focus(); else document.getElementById('btnNextMobileStu').click(); }"
                                   placeholder="ពេញ ${maxVal}"
                                   class="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-center font-mono font-bold text-[16px] text-indigo-800 outline-none shadow-inner ${focusBorder} focus:ring-2 focus:ring-opacity-30 focus:bg-white transition-all placeholder:font-siemreap placeholder:font-normal placeholder:text-[12px] placeholder:text-slate-300">
                        </div>
                    </div>`;
            });
            inputsHtml += `</div></div>`;
        });
    } else {
        inputsHtml = `<div class="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-200"><i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i><br>មិនមានទិន្នន័យមុខវិជ្ជាទេ!</div>`;
    }

    const container = document.getElementById("mobileScoreInputsContainer");
    if (container) {
        container.innerHTML = inputsHtml;
        container.scrollTop = 0;
        const firstInput = container.querySelector('input');
        if(firstInput) setTimeout(() => { firstInput.focus(); firstInput.select(); }, 150);
    }
};

window.syncMobileInputToMain = function(mainInputId, value) {
    const mainInput = document.getElementById(mainInputId);
    if (mainInput) {
        let cleanValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
        mainInput.value = cleanValue;
        
        const stuId = mainInputId.split('_').pop();
        if(typeof window.calculateStudentScore === 'function') {
            window.calculateStudentScore(stuId);
        }
        window.markUnsaved(); 
    }
};

// ==========================================
// ១១. មុខងារ Import / Export Excel
// ==========================================
window.exportScoreEntryToExcel = function() {
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) {
        if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
        if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("គ្មានទិន្នន័យដើម្បីទាញយកទេ!");
    }

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const districtName = (sInfo.district || "ស្រុកកៀនស្វាយ").replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.....................";
    const academicYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";
    const filename = `បញ្ជីស្រង់ពិន្ទុ_${grade.replace(/ /g, '_')}_${month}.xls`;

    let titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = month.includes("ឆមាសទី១") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី១" : (month.includes("ឆមាសទី២") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី២" : `បញ្ជីស្រង់ពិន្ទុប្រឡង${month}`);
    else if (type === "annual") titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    const rDates = window.reportCardDateSettings || {};
    let locationStr = (rDates.location || "ធ្វើនៅ.........................").trim().replace(/,+$/, '');
    let sDate = (rDates.solarDate || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....").trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = rDates.showLunar !== false ? (rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...") : "";

    let htmlTable = window.getAdvancedScoreTableHtml(true, false);

    let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><style>table { border-collapse: collapse; white-space: nowrap; font-family: "Khmer OS Siemreap", sans-serif; }</style></head>
        <body>
            <table>
                <tr>
                    <td colspan="15" style="border: none; text-align: left; vertical-align: top; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 11pt; padding-left: 10px;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}<br>${schoolName}<br>${grade}</td>
                    <td colspan="15" style="border: none; text-align: center; vertical-align: top; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 12pt;">ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ<br><div style="color: #d97706; font-size: 11px;">❖ ❖ ❖</div></td>
                </tr>
                <tr><td colspan="30" style="border: none; height: 15px;"></td></tr>
                <tr><td colspan="30" style="border: none; text-align: center; font-family: 'Khmer OS Muol Light', Moul, serif; font-size: 14pt; color: red;">${titleText}</td></tr>
                <tr><td colspan="30" style="border: none; text-align: center; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 11pt; font-weight: bold;">ឆ្នាំសិក្សា ៖ ${academicYear}</td></tr>
                <tr><td colspan="30" style="border: none; height: 10px;"></td></tr>
            </table>
            ${htmlTable}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
};

window.openImportExcelModal = function() {
    if (typeof XLSX === 'undefined') return alert("⚠️ សូមប្រាកដថាអ្នកបានបន្ថែម Library XLSX នៅក្នុង index.html ជាមុនសិន!");
    window.selectedExcelFile = null;

    let modalHtml = `
      <div id="importExcelModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-4 font-siemreap transition-all" style="z-index: 999999;">
        <div class="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-xl overflow-hidden flex flex-col transform transition-all scale-100 border border-slate-200 relative">
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex justify-between items-center shadow-md">
                <h3 class="font-moul text-white text-base drop-shadow-md flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/20"><i class="fa-solid fa-file-import"></i></div>បញ្ចូលពិន្ទុតាមរយៈ Excel</h3>
                <button onclick="document.getElementById('importExcelModal').remove()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition shadow-sm border border-white/10"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            
            <div class="p-6 bg-slate-50 space-y-6">
                <div class="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div class="flex gap-4 items-center">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black text-lg flex items-center justify-center border-2 border-blue-200">១</div>
                        <div class="flex-1">
                            <h4 class="font-moul text-blue-900 text-[13px] mb-1">ទាញយកគំរូ Excel (Download Template)</h4>
                            <p class="text-[11px] text-slate-500 mb-3">ប្រព័ន្ធនឹងបង្កើតឯកសារ Excel ដែលមានឈ្មោះសិស្ស និងមុខវិជ្ជាស្រាប់។</p>
                            <button onclick="window.downloadExcelTemplate()" class="px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition flex items-center gap-2 border border-blue-200 shadow-sm"><i class="fa-solid fa-download"></i> ទាញយកគំរូឥឡូវនេះ</button>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div class="flex gap-4 items-center">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-black text-lg flex items-center justify-center border-2 border-emerald-200">២</div>
                        <div class="flex-1">
                            <h4 class="font-moul text-emerald-900 text-[13px] mb-1">ជ្រើសរើសឯកសារបញ្ជូល (Upload)</h4>
                            <p class="text-[11px] text-slate-500 mb-3">ជ្រើសរើសឯកសារ <b>.xlsx</b> ដែលលោកអ្នកបានវាយពិន្ទុពេញលេញ។</p>
                            <label id="uploadLabelBox" class="w-full flex justify-center items-center px-4 py-4 bg-emerald-50 text-emerald-700 rounded-xl border border-dashed border-emerald-300 cursor-pointer hover:bg-emerald-100 transition shadow-sm font-bold text-xs gap-2">
                                <i class="fa-solid fa-cloud-arrow-up text-lg"></i>
                                <span id="importFileName" class="truncate max-w-[250px]">ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ</span>
                                <input type="file" accept=".xlsx, .xls" class="hidden" onchange="window.handleExcelSelect(event)" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button onclick="document.getElementById('importExcelModal').remove()" class="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-sm">បោះបង់</button>
                <button id="btnConfirmImport" onclick="window.processExcelImport()" disabled class="px-6 py-2.5 rounded-xl text-white font-bold bg-emerald-500 hover:bg-emerald-600 opacity-50 cursor-not-allowed shadow-md flex items-center gap-2 transition-all transform text-sm"><i class="fa-solid fa-check-circle"></i> បញ្ជាក់ការទាញចូល</button>
            </div>
        </div>
      </div>
    `;
    const oldModal = document.getElementById('importExcelModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.handleExcelSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    window.selectedExcelFile = file;
    document.getElementById('importFileName').innerText = file.name;
    const labelBox = document.getElementById('uploadLabelBox');
    labelBox.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-700', 'border-dashed');
    labelBox.classList.add('bg-indigo-50', 'border-indigo-300', 'text-indigo-800', 'border-solid');
    
    const btn = document.getElementById('btnConfirmImport');
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-emerald-500', 'hover:bg-emerald-600');
    btn.classList.add('bg-gradient-to-r', 'from-indigo-600', 'to-blue-600', 'hover:from-indigo-700', 'hover:to-blue-700', 'hover:-translate-y-0.5');
};

window.processExcelImport = function() {
    if (!window.selectedExcelFile) return alert("សូមជ្រើសរើសឯកសារជាមុនសិន!");

    const btn = document.getElementById('btnConfirmImport');
    const originalBtnHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងដំណើរការ...`;
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            if(rows.length < 2) throw new Error("ឯកសារ Excel ទទេ ឬខុសទម្រង់!");

            let headerRowIndex = -1;
            for(let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row && row.some(cell => String(cell).includes('អត្តលេខ') || String(cell).includes('ឈ្មោះ') || String(cell).includes('ID'))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if(headerRowIndex === -1) throw new Error("ប្រព័ន្ធរកមិនឃើញជួរក្បាលតារាងដែលមានពាក្យ 'អត្តលេខ' ឬ 'ឈ្មោះសិស្ស' ទេ!");

            const headerRow = rows[headerRowIndex];
            let colMap = {}; 
            
            headerRow.forEach((colName, index) => {
                let cName = String(colName || "").trim();
                if(cName.includes('[') && cName.includes(']')) {
                    const match = cName.match(/\[(.*?)\]/);
                    if(match && match[1]) colMap[match[1].trim()] = index; 
                }
            });

            if(Object.keys(colMap).length === 0) {
                let genderColIndex = headerRow.findIndex(h => String(h).includes('ភេទ'));
                let startCol = genderColIndex !== -1 ? genderColIndex + 1 : 4;
                window.activeSubjectKeys.forEach((key, i) => { colMap[key] = startCol + i; });
            }

            let idColIndex = headerRow.findIndex(h => String(h).includes('អត្តលេខ') || String(h).includes('ID'));
            if (idColIndex === -1) idColIndex = 1; 
            let nameColIndex = headerRow.findIndex(h => String(h).includes('ឈ្មោះ'));
            if (nameColIndex === -1) nameColIndex = 2; 

            const type = document.getElementById("globalPeriodType")?.value || "monthly";
            const month = document.getElementById("globalPeriodValue")?.value || "មករា";
            let importedCount = 0;
            let notFoundStudents = 0;

            for(let i = headerRowIndex + 1; i < rows.length; i++) {
                let row = rows[i];
                if (!row || row.length === 0) continue;

                let stuId = String(row[idColIndex] || "").trim(); 
                let stuName = String(row[nameColIndex] || "").trim(); 
                
                if(stuId.includes("ធ្វើនៅ") || stuName.includes("នាយកសាលា")) continue; 
                if(!stuId && !stuName) continue;

                let stuExists = window.scoresStudentList.find(s => String(s.id).trim() === stuId);
                if(!stuExists) stuExists = window.scoresStudentList.find(s => String(s.name).trim() === stuName);

                if(!stuExists) { notFoundStudents++; continue; }

                window.activeSubjectKeys.forEach(key => {
                    let colIndex = colMap[key];
                    if(colIndex !== undefined && row[colIndex] !== undefined && row[colIndex] !== "") {
                        let scoreVal = String(row[colIndex]).trim();
                        let inputIdMainTable = `${key}_${stuExists.id}`;
                        if (type === "annual") inputIdMainTable = `${key}_s1_${stuExists.id}`; 
                        if (type === "semester") inputIdMainTable = `${key}_${month.includes("២") ? "s2" : "s1"}_${stuExists.id}`;

                        const inputEl = document.getElementById(inputIdMainTable);
                        if(inputEl) {
                            inputEl.value = scoreVal;
                            importedCount++;
                            const maxVal = window.schemaMaxMap[key] || 10;
                            if (parseFloat(scoreVal) < maxVal / 2) { 
                                inputEl.classList.add("text-rose-600"); 
                                inputEl.classList.remove("text-slate-800"); 
                            } else { 
                                inputEl.classList.remove("text-rose-600"); 
                                inputEl.classList.add("text-slate-800"); 
                            }
                        }
                    }
                });
            }

            window.calculateAllScores();
            window.markUnsaved();
            
            const modal = document.getElementById('importExcelModal');
            if (modal) modal.remove();
            
            if (importedCount === 0) {
                alert("⚠️ មិនមានទិន្នន័យត្រូវបានទាញចូលទេ។ សូមពិនិត្យមើលឯកសារ Excel របស់អ្នកឡើងវិញ។");
            } else {
                let msg = `✅ ទាញពិន្ទុបានជោគជ័យ ចំនួន ${importedCount} ក្រឡា!`;
                if(notFoundStudents > 0) msg += `\n⚠️ មានសិស្សចំនួន ${notFoundStudents} នាក់នៅក្នុង Excel រកមិនឃើញក្នុងប្រព័ន្ធ។`;
                if (typeof showToast === 'function') showToast(msg);
                else alert(msg);
            }
            
        } catch (err) {
            alert("⚠️ បរាជ័យក្នុងការទាញចូល: " + err.message);
        } finally {
            const existingBtn = document.getElementById('btnConfirmImport');
            if(existingBtn) {
                existingBtn.innerHTML = originalBtnHtml;
                existingBtn.disabled = false;
            }
        }
    };
    reader.onerror = function() {
        alert("⚠️ មានបញ្ហាក្នុងការអានឯកសារ!");
        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
    };
    reader.readAsArrayBuffer(window.selectedExcelFile);
};

window.downloadExcelTemplate = function() {
    if(!window.scoresStudentList || window.scoresStudentList.length === 0) return alert("មិនមានទិន្នន័យសិស្សទេ!");
    if (typeof XLSX === 'undefined') return alert("Library XLSX មិនដំណើរការទេ! សូមប្រាកដថាបានបន្ថែមវាក្នុង index.html");

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    let rawDistrict = sInfo.district || "ស្រុកកៀនស្វាយ";
    const districtName = rawDistrict.replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const academicYear = sInfo.academic_year || "2026-2027";
    
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    
    let titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំ${month}`;
    else if (type === "annual") titleText = `ទម្រង់បញ្ចូលពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    let headerTh = `
        <th style="width: 50px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ល.រ</th>
        <th style="width: 120px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">អត្តលេខ (ID)</th>
        <th style="width: 200px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ឈ្មោះសិស្ស</th>
        <th style="width: 60px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">ភេទ</th>
    `;
    
    window.activeSchema.forEach(g => {
        let subs = g.subs && g.subs.length > 0 ? g.subs : [{name: g.group, key: g.key}];
        subs.forEach(s => {
            headerTh += `<th style="width: 100px; background-color: #f1f5f9; border: 1px solid #000000; padding: 6px; color: #1e3a8a; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; vertical-align: middle;">${s.name}<br><span style="font-size: 8pt; color: #64748b; font-family: 'Arial', sans-serif;">[${s.key}]</span></th>`;
        });
    });

    let tbodyStr = "";
    window.scoresStudentList.forEach((s, idx) => {
        let tr = `<tr style="height: 28px;">
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-size: 11pt;">${idx + 1}</td>
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #1e3a8a;">${s.id}</td>
            <td style="border: 1px solid #000000; text-align: left; padding-left: 8px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt;">${s.name}</td>
            <td style="border: 1px solid #000000; text-align: center; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 11pt; font-weight: bold; color: ${s.gender==='ស្រី'?'#e11d48':'#1e3a8a'};">${s.gender}</td>`;
        window.activeSubjectKeys.forEach(k => {
            tr += `<td style="border: 1px solid #000000; text-align: center; font-family: 'Times New Roman', serif; font-weight: bold; font-size: 12pt;"></td>`;
        });
        tr += `</tr>`;
        tbodyStr += tr;
    });

    let totalCols = 4 + window.activeSubjectKeys.length;
    let leftCols = Math.floor(totalCols / 2);
    let rightCols = totalCols - leftCols;

    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"></head>
    <body>
        <table border="0" style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td colspan="${leftCols}" style="text-align: left; vertical-align: top;"><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11pt; color: #1e3a8a;">ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">${schoolName}</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ថ្នាក់ទី ${grade}</b>
                </td>
                <td colspan="${rightCols}" style="text-align: right; vertical-align: top;">
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ព្រះរាជាណាចក្រកម្ពុជា</b><br>
                    <b style="font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 12pt; color: #1e3a8a;">ជាតិ សាសនា ព្រះមហាក្សត្រ</b><br>
                    <span style="color: #d97706; font-size: 11pt;">❖ ❖ ❖</span>
                </td>
            </tr>
        </table>
        <table border="0" style="width: 100%; margin-bottom: 15px;">
            <tr><td colspan="${totalCols}" style="text-align: center; padding-top: 10px;"><h2 style="margin: 0; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 16pt; color: #e11d48;">${titleText}</h2></td></tr>
            <tr><td colspan="${totalCols}" style="text-align: center; font-size: 11pt; font-weight: bold; color: #334155; padding-bottom: 10px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif;">ឆ្នាំសិក្សា ៖ ${window.toKhmerNum(academicYear)}</td></tr>
        </table>
        <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #000000;">
            <tr>${headerTh}</tr>
            ${tbodyStr}
        </table>
    </body>
    </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Score_Template_${grade.replace(/ /g, '_')}_${month}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ==========================================================================
// ១. មុខងារកសាងតារាងពិន្ទុ (Advanced Score Table Builder - Full Annual Support)
// ==========================================================================
window.getAdvancedScoreTableHtml = function(isExcel, isRanking = false) {
    let stus = [...window.rankingsDataList];
    if(!stus || stus.length === 0) return "";
    
    // បង្ខំតម្រៀបអក្ខរក្រម បើមិនមែនជាតារាងចំណាត់ថ្នាក់
    if (isRanking) stus.sort((a,b) => a.rank - b.rank);
    else stus.sort((a,b) => String(a.name || "").localeCompare(String(b.name || ""), 'km'));
    
    const type = document.getElementById("globalPeriodType")?.value || "monthly";

    if (type === "semester") {
        let keys = [];
        window.activeSchema.forEach(g => {
            let subs = g.subs && g.subs.length > 0 ? g.subs : [g];
            subs.forEach(s => keys.push(s.key));
        });
        keys.forEach(k => {
            let valid = [...stus].filter(s => s[k] !== undefined && s[k] !== "" && s[k] !== null && !isNaN(parseFloat(s[k])));
            valid.sort((a,b) => parseFloat(b[k]) - parseFloat(a[k]));
            let currentRank = 1;
            valid.forEach((s, i) => {
                if (i > 0 && parseFloat(s[k]) === parseFloat(valid[i-1][k])) s[k+'_rank'] = valid[i-1][k+'_rank'];
                else s[k+'_rank'] = currentRank;
                currentRank++;
            });
        });
    }

    let tableClass = isExcel ? "" : "main-table";
    let tableStyle = isExcel ? `border-collapse: collapse; width: 100%; text-align: center; border: 1.5pt solid #000; margin: 0 auto;` : ``;
    const bgColors = { "ភាសាខ្មែរ": "#eff6ff", "គណិតវិទ្យា": "#fff1f2", "វិទ្យាសាស្ត្រ": "#ecfdf5", "សិក្សាសង្គម": "#fffbeb", "អប់រំកាយ": "#f5f3ff", "បំណិនជីវិត": "#e0e7ff", "ភាសាបរទេស": "#f8fafc" };

    const thStyle = isExcel ? `border: 1pt solid #000; font-family: 'Khmer OS Muol Light', serif; font-size: 10pt; font-weight: normal; padding: 4px; text-align: center; vertical-align: middle;` : ``;
    const tdStyle = isExcel ? `border: 0.5pt solid #000; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 10pt; padding: 3px; text-align: center; vertical-align: middle;` : ``;
    const thVStyle = isExcel ? `${thStyle} mso-rotate: 90; height: 120px; white-space: nowrap; width: 30px; min-width: 30px;` : ``;
    
    const thV = (text, bg = "#f8fafc", color = "#000", rowSpan = 1) => {
        let rs = rowSpan > 1 ? ` rowspan="${rowSpan}"` : "";
        if(isExcel) return `<th${rs} style="${thVStyle} background-color:${bg}; color: ${color};">${text}</th>`;
        return `<th${rs} class="th-vert" style="background-color: ${bg};"><div class="div-vert" style="color: ${color};">${text}</div></th>`;
    };
    const thH = (text, bg = "#f8fafc", color = "#000", colSpan = 1, rowSpan = 1, width = "") => {
        let w = width ? `width: ${width};` : "";
        let rs = rowSpan > 1 ? ` rowspan="${rowSpan}"` : "";
        let cs = colSpan > 1 ? ` colspan="${colSpan}"` : "";
        return `<th${cs}${rs} style="${thStyle} background-color: ${bg}; color:${color}; ${w}">${text}</th>`;
    };

    let thead1 = ""; let thead2 = "";
    let schemaHtmlHeaders1 = ""; let schemaHtmlHeaders2 = "";
    let subjectCount = 0;

    window.activeSchema.forEach(g => {
        let bg = bgColors[g.group] || g.color || "#f8fafc"; 
        let subs = g.subs && g.subs.length > 0 ? g.subs : [{name: g.group, key: g.key}];
        let colSpan = type === "monthly" ? subs.length : subs.length * 2;
        if (type === "annual") colSpan = subs.length; 
        subjectCount += subs.length;
        
        schemaHtmlHeaders1 += thH(g.group, bg, "#000", colSpan, 1);
        subs.forEach(s => {
            schemaHtmlHeaders2 += thV(s.name, bg);
            if (type === "semester") {
                let markStr = isExcel ? "ចំ.ថ្នាក់" : "ចំណាត់ថ្នាក់";
                schemaHtmlHeaders2 += thV(markStr, bg, "#be123c");
            }
        });
    });

    if (type === "annual") {
        let superTopRowHtml = `<tr>${thH("", "#fff", "#000", 3, 1)}${thH("ឆមាសទី១", "#dbeafe", "#1e3a8a", subjectCount + 4, 1)}${thH("ឆមាសទី២", "#dcfce7", "#14532d", subjectCount + 4, 1)}${thH("លទ្ធផលប្រចាំឆ្នាំ", "#fef3c7", "#92400e", 3, 1)}${thH("ការវាយតម្លៃអាកប្បកិរិយា", "#f5f3ff", "#5b21b6", 4, 1)}</tr>`;
        thead1 = superTopRowHtml + `<tr>${thH("ល.រ", "#f1f5f9", "#000", 1, 2, "30px")}${thH("ឈ្មោះសិស្ស", "#f1f5f9", "#000", 1, 2, "140px")}${thH("ភេទ", "#f1f5f9", "#000", 1, 2, "35px")}`;
        
        // Headers សម្រាប់ឆមាសទី១
        thead1 += schemaHtmlHeaders1;
        thead1 += thV("សរុប ឆ.១", "#f1f5f9", "#000", 2) + thV("មធ្យមភាគ ឆ.១", "#eff6ff", "#1d4ed8", 2) + thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2) + thV("និទ្ទេស", "#ecfdf5", "#047857", 2);
        
        // Headers សម្រាប់ឆមាសទី២
        thead1 += schemaHtmlHeaders1;
        thead1 += thV("សរុប ឆ.២", "#f1f5f9", "#000", 2) + thV("មធ្យមភាគ ឆ.២", "#eff6ff", "#1d4ed8", 2) + thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2) + thV("និទ្ទេស", "#ecfdf5", "#047857", 2);
        
        // Headers សម្រាប់ប្រចាំឆ្នាំ
        thead1 += thV("មធ្យមភាគប្រចាំឆ្នាំ", "#fef3c7", "#92400e", 2) + thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2) + thV("លទ្ធផល", "#ecfdf5", "#047857", 2);
        
        thead2 = `<tr>` + schemaHtmlHeaders2 + schemaHtmlHeaders2;
        thead2 += thV("ចំណេះដឹង", "#faf5ff", "#7e22ce") + thV("បំណិន", "#faf5ff", "#7e22ce") + thV("សីលធម៌", "#faf5ff", "#7e22ce") + thV("សាមគ្គីភាព", "#faf5ff", "#7e22ce");

    } else if (type === "monthly") {
        thead1 = `<tr>${thH("ល.រ", "#f1f5f9", "#000", 1, 2, "35px")}${thH("ឈ្មោះសិស្ស", "#f1f5f9", "#000", 1, 2, "160px")}${thH("ភេទ", "#f1f5f9", "#000", 1, 2, "40px")}`;
        thead1 += schemaHtmlHeaders1;
        thead1 += thV("ពិន្ទុសរុប", "#f1f5f9", "#000", 2) + thV("មធ្យមភាគ", "#eff6ff", "#1d4ed8", 2) + thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2) + thV("និទ្ទេស", "#ecfdf5", "#047857", 2) + thH("ការវាយតម្លៃ", "#faf5ff", "#7e22ce", 4, 1);
        thead2 = `<tr>` + schemaHtmlHeaders2;
        thead2 += thV("ចំណេះដឹង", "#faf5ff", "#7e22ce") + thV("បំណិន", "#faf5ff", "#7e22ce") + thV("សីលធម៌", "#faf5ff", "#7e22ce") + thV("សាមគ្គីភាព", "#faf5ff", "#7e22ce");
    } else if (type === "semester") {
        thead1 = `<tr>${thH("ល.រ", "#f1f5f9", "#000", 1, 2, "35px")}${thH("ឈ្មោះសិស្ស", "#f1f5f9", "#000", 1, 2, "160px")}${thH("ភេទ", "#f1f5f9", "#000", 1, 2, "40px")}`;
        thead1 += schemaHtmlHeaders1;
        thead1 += thV("ពិន្ទុសរុប", "#f1f5f9", "#000", 2) + thV("មធ្យមភាគ", "#eff6ff", "#1d4ed8", 2) + thV("ចំណាត់ថ្នាក់", "#fff1f2", "#be123c", 2) + thV("និទ្ទេស", "#ecfdf5", "#047857", 2) + thV("លទ្ធផល", "#f8fafc", "#000", 2) + thH("អវត្តមាន", "#f1f5f9", "#000", 3, 1) + thV("ផ្សេងៗ", "#f1f5f9", "#000", 2);
        thead2 = `<tr>` + schemaHtmlHeaders2;
        thead2 += thV("ច្បាប់", "#f8fafc") + thV("ឥតច្បាប់", "#f8fafc") + thV("សរុប", "#f8fafc");
    }

    let tbody = ``;
    
    // កំណត់ពិន្ទុជាប់ធ្លាក់
    let passMark = 5.0; 
    if (window.activeSchema && window.activeSchema.length > 0) {
        let totalMax = 0, subjCount = 0;
        window.activeSchema.forEach(item => {
            if (item.subs) { item.subs.forEach(s => { totalMax += window.schemaMaxMap[s.key]||10; subjCount++; }); }
            else { totalMax += window.schemaMaxMap[item.key]||10; subjCount++; }
        });
        if(subjCount > 0) passMark = (totalMax / subjCount) / 2;
    }

    stus.forEach((s, idx) => {
        let tr = `<tr><td style="${tdStyle}">${idx + 1}</td><td style="${tdStyle}" ${isExcel ? 'class="text-left"' : ''}>${s.name}</td><td style="${tdStyle} color: ${s.gender === 'ស្រី' ? '#be123c' : '#000'}; font-weight: bold;">${s.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;
        
        if (type === "annual") {
            let sc1 = window.s1Scores ? window.s1Scores.find(x => String(x.student_id) === String(s.id)) : null;
            let sc2 = window.s2Scores ? window.s2Scores.find(x => String(x.student_id) === String(s.id)) : null;

            // មុខវិជ្ជាឆមាសទី១
            window.activeSchema.forEach(g => {
                let subs = g.subs && g.subs.length > 0 ? g.subs : [{key: g.key}];
                subs.forEach(sub => {
                    let val = "";
                    if (sc1 && sc1[sub.key] !== undefined) val = sc1[sub.key];
                    else if (s[sub.key + '_s1'] !== undefined) val = s[sub.key + '_s1']; 
                    let score = val !== "" ? parseFloat(val).toFixed(1).replace('.0','') : "";
                    let scoreColor = '#000';
                    if (score !== "") { const max = window.schemaMaxMap[sub.key] || 10; if (parseFloat(score) < max / 2) scoreColor = '#be123c'; }
                    tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: ${scoreColor}; background-color:#f8fafc;">${score}</td>`;
                });
            });
            
            let s1_tot = sc1?.total_score || s.total_s1 || "";
            let s1_avg = sc1?.average || s.sem1_avg || "";
            let s1_rnk = sc1?.rank || s.rank_s1 || "";
            let s1_gl  = sc1?.grade_letter || s.grade_s1 || "";
            tr += `<td style="${tdStyle} background-color:#f8fafc; font-weight:bold;">${s1_tot}</td><td style="${tdStyle} background-color:#eff6ff; font-weight:bold; color:#1d4ed8;">${s1_avg}</td><td style="${tdStyle} background-color:#fff1f2; font-weight:bold; color:#be123c;">${s1_rnk}</td><td style="${tdStyle} background-color:#ecfdf5; font-weight:bold; color:#047857;">${s1_gl}</td>`;

            // មុខវិជ្ជាឆមាសទី២
            window.activeSchema.forEach(g => {
                let subs = g.subs && g.subs.length > 0 ? g.subs : [{key: g.key}];
                subs.forEach(sub => {
                    let val = "";
                    if (sc2 && sc2[sub.key] !== undefined) val = sc2[sub.key];
                    else if (s[sub.key + '_s2'] !== undefined) val = s[sub.key + '_s2']; 
                    else if (s[sub.key] !== undefined) val = s[sub.key]; 
                    let score = val !== "" ? parseFloat(val).toFixed(1).replace('.0','') : "";
                    let scoreColor = '#000';
                    if (score !== "") { const max = window.schemaMaxMap[sub.key] || 10; if (parseFloat(score) < max / 2) scoreColor = '#be123c'; }
                    tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: ${scoreColor};">${score}</td>`;
                });
            });

            let s2_tot = sc2?.total_score || s.total_s2 || "";
            let s2_avg = sc2?.average || s.sem2_avg || "";
            let s2_rnk = sc2?.rank || s.rank_s2 || "";
            let s2_gl  = sc2?.grade_letter || s.grade_s2 || "";
            tr += `<td style="${tdStyle} font-weight:bold;">${s2_tot}</td><td style="${tdStyle} background-color:#eff6ff; font-weight:bold; color:#1d4ed8;">${s2_avg}</td><td style="${tdStyle} background-color:#fff1f2; font-weight:bold; color:#be123c;">${s2_rnk}</td><td style="${tdStyle} background-color:#ecfdf5; font-weight:bold; color:#047857;">${s2_gl}</td>`;
            
            // លទ្ធផលប្រចាំឆ្នាំ
            let isPassed = s.avg >= passMark;
            let resultStr = isPassed ? "ឡើងថ្នាក់" : "ត្រួតថ្នាក់";
            let resultColor = isPassed ? "#16a34a" : "#be123c";
            let avg = s.avg ? s.avg.toFixed(2) : '';
            let rank = s.rank || '';

            tr += `<td style="${tdStyle} color: #92400e; font-weight: bold; background-color: #fef3c7;">${avg}</td><td style="${tdStyle} color: #be123c; font-weight: bold; background-color: #fff1f2;">${rank}</td><td style="${tdStyle} color: ${resultColor}; font-weight: bold;">${resultStr}</td>`;
            tr += `<td style="${tdStyle}">${s.eval_knowledge || ''}</td><td style="${tdStyle}">${s.eval_skill || ''}</td><td style="${tdStyle}">${s.eval_moral || ''}</td><td style="${tdStyle}">${s.eval_solidarity || ''}</td></tr>`;
            
        } else {
            window.activeSchema.forEach(g => {
                let subs = g.subs && g.subs.length > 0 ? g.subs : [{key: g.key}];
                subs.forEach(sub => {
                    let score = s[sub.key] !== undefined && s[sub.key] !== "" ? parseFloat(s[sub.key]).toFixed(1).replace('.0','') : "";
                    let scoreColor = '#000';
                    if (score !== "") { const max = window.schemaMaxMap[sub.key] || 10; if (parseFloat(score) < max / 2) scoreColor = '#be123c'; }
                    tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: ${scoreColor};">${score}</td>`;
                    if (type === "semester") {
                        let rank = s[sub.key + "_rank"] || "";
                        tr += `<td style="${tdStyle} font-family: 'Khmer OS Siemreap', sans-serif; font-weight: bold; color: #be123c;">${rank}</td>`;
                    }
                });
            });

            let tScore = type === 'semester' ? (s.total_exam || s.exam_avg || s.total_score || '') : (s.total_score || '');
            let avg = s.avg ? s.avg.toFixed(2) : '';
            let rank = s.rank || '';
            let gl = s.gradeLetter || s.grade_letter || '';

            if (type === "monthly") {
                tr += `<td style="${tdStyle} background-color: #f8fafc; font-weight: bold;">${tScore}</td><td style="${tdStyle} color: #1d4ed8; font-weight: bold; background-color: #eff6ff;">${avg}</td><td style="${tdStyle} color: #be123c; font-weight: bold; background-color: #fff1f2;">${rank}</td><td style="${tdStyle} color: #047857; font-weight: bold; background-color: #ecfdf5;">${gl}</td><td style="${tdStyle}">${s.eval_knowledge || ''}</td><td style="${tdStyle}">${s.eval_skill || ''}</td><td style="${tdStyle}">${s.eval_moral || ''}</td><td style="${tdStyle}">${s.eval_solidarity || ''}</td></tr>`;
            } else {
                let resultStr = s.avg >= passMark ? "ជាប់" : "ធ្លាក់";
                let resultColor = s.avg >= passMark ? "#16a34a" : "#be123c";
                tr += `<td style="${tdStyle} background-color: #f8fafc; font-weight: bold;">${tScore}</td><td style="${tdStyle} color: #1d4ed8; font-weight: bold; background-color: #eff6ff;">${avg}</td><td style="${tdStyle} color: #be123c; font-weight: bold; background-color: #fff1f2;">${rank}</td><td style="${tdStyle} color: #047857; font-weight: bold; background-color: #ecfdf5;">${gl}</td><td style="${tdStyle} color: ${resultColor}; font-weight: bold;">${resultStr}</td><td style="${tdStyle}"></td><td style="${tdStyle}"></td><td style="${tdStyle}"></td><td style="${tdStyle}"></td></tr>`;
            }
        }
        tbody += tr;
    });

    return `<table class="${tableClass}" style="${tableStyle}"><thead>${thead1}</tr>${thead2}</tr></thead><tbody>${tbody}</tbody></table>`;
};

// ==========================================================================
// ២. មុខងារបោះពុម្ពបញ្ជីពិន្ទុ (Print Score List) - បានអាប់ដេតកាលបរិច្ឆេទ និង Zoom អត្ថបទ
// ==========================================================================
window.printScoreList = function() {
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("⚠️ គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const districtName = (sInfo.district || "ស្រុកកៀនស្វាយ").replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.....................";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || '.......................');
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    let titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំខែ${month}`;
    if (type === "semester") titleText = month.includes("ឆមាសទី១") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី១" : (month.includes("ឆមាសទី២") ? "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសលើកទី២" : `បញ្ជីស្រង់ពិន្ទុប្រឡង${month}`);
    else if (type === "annual") titleText = `បញ្ជីស្រង់ពិន្ទុប្រចាំឆ្នាំសិក្សា`;

    // 🔴 ជួសជុលប្រព័ន្ធទាញយកកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ ១០០% (Real-time Fetching) 🔴
    let loc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location') || "ធ្វើនៅ.........................";
    let sol = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....";
    let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...";
    
    let isLunarChecked = true;
    const chkBox = document.getElementById('global_lun_chk');
    if (chkBox) isLunarChecked = chkBox.checked;
    else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

    let locationStr = loc.trim().replace(/,+$/, '');
    let sDate = sol.trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    
    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = isLunarChecked ? lun : "";
    // 🔴 ================================================================= 🔴

    // 🔴 បង្ខំតម្រៀបទិន្នន័យតាមអក្ខរក្រម (ក-អ) មុនពេលបង្កើតតារាង
    const originalData = [...window.rankingsDataList];
    window.rankingsDataList.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), 'km'));

    // Hack មុខងារ sort បណ្តោះអាសន្ន ព្រោះ getAdvancedScoreTableHtml អាចនឹងហៅ sort ម្តងទៀត
    const originalSort = Array.prototype.sort;
    Array.prototype.sort = function(compareFn) {
        if (compareFn && compareFn.toString().includes("a.id - b.id")) {
            return originalSort.call(this, (a, b) => String(a.name || "").localeCompare(String(b.name || ""), 'km'));
        }
        return originalSort.call(this, compareFn);
    };

    let htmlTable = window.getAdvancedScoreTableHtml(false, false);

    // 🔴 ស្តារមុខងារ sort និងទិន្នន័យដើមមកវិញបន្ទាប់ពីបាន HTML
    Array.prototype.sort = originalSort;
    window.rankingsDataList = originalData;

    let totalStus = window.rankingsDataList.length;
    let femaleStus = window.rankingsDataList.filter(s => s.gender === 'ស្រី').length;
    
    // គណនាពិន្ទុជាប់ធ្លាក់ដោយស្វ័យប្រវត្តិ (Dynamic Pass Threshold)
    let passMark = 5.0; 
    if (window.activeSchema && window.activeSchema.length > 0) {
        let totalMax = 0, subjCount = 0;
        window.activeSchema.forEach(item => {
            if (item.subs) { item.subs.forEach(s => { totalMax += window.schemaMaxMap[s.key]||10; subjCount++; }); }
            else { totalMax += window.schemaMaxMap[item.key]||10; subjCount++; }
        });
        if(subjCount > 0) passMark = (totalMax / subjCount) / 2;
    }
    
    let passed = window.rankingsDataList.filter(s => s.avg >= passMark).length;
    let passedF = window.rankingsDataList.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = totalStus > 0 ? ((passed / totalStus) * 100).toFixed(2) : "0.00";
    let failPct = totalStus > 0 ? ((failed / totalStus) * 100).toFixed(2) : "0.00";
    let passFPct = femaleStus > 0 ? ((passedF / femaleStus) * 100).toFixed(2) : "0.00";
    let failFPct = femaleStus > 0 ? ((failedF / femaleStus) * 100).toFixed(2) : "0.00";

    // ផ្លាស់ប្តូរពាក្យ ឡើងថ្នាក់/ត្រួតថ្នាក់ សម្រាប់របាយការណ៍ប្រចាំឆ្នាំ
    let passLabel = type === "annual" ? "សិស្សឡើងថ្នាក់សរុប" : "សិស្សជាប់មធ្យមភាគ";
    let failLabel = type === "annual" ? "សិស្សត្រូវត្រួតថ្នាក់សរុប" : "សិស្សធ្លាក់មធ្យមភាគ";

    // 🔴 ការកំណត់ CSS និងទំហំតារាង
    let isAnnual = type === "annual";
    let fontCss = isAnnual ? `7.5pt` : `11pt`;
    let thFontCss = isAnnual ? `8pt` : `11pt`;
    let vertHeight = isAnnual ? `90px` : `120px`;
    let thPaddings = isAnnual ? `3px 1px` : `6px 2px`;
    let tdPaddings = isAnnual ? `2px 1px` : `4px 2px`;
    let defaultZoom = isAnnual ? 0.75 : 1.0; 

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>${titleText} - ${grade}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style id="dynamic-page-style">
          @page { size: A4 landscape; margin: 6mm; }
        </style>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
          html, body { margin: 0; padding: 0; background: #f1f5f9; color: #000; min-height: 100vh; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          
          /* ផ្ទាំងបញ្ជា (Toolbar) */
          .print-toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: white; padding: 12px 20px; border-bottom: 1px solid #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 20px; }
          body { padding-top: 70px; } /* ទុកចន្លោះឱ្យ Toolbar */
          
          @media print {
              .no-print { display: none !important; }
              body { background: #fff; padding-top: 0 !important; }
              /* ដក Background និង Border ពេលព្រីន */
              #print-wrapper { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; height: auto !important; padding: 0 !important; }
          }
          
          /* ការកំណត់ប្រអប់ក្រដាស (Print Wrapper) ឱ្យស្គាល់ខ្នាតទំហំថេរ */
          #print-wrapper { 
              padding: 10mm; 
              width: 297mm; /* ខ្នាត A4 Landscape ស្តង់ដារ */
              min-height: 210mm;
              margin: 20px auto; 
              background: white; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
              border-radius: 8px; 
              overflow: hidden;
          }

          /* 🔴 នេះជាកន្លែងដែលអត្ថបទនឹងរួមតូចឬធំ (Content Scaler) 🔴 */
          #content-scaler {
              width: 100%;
              transform-origin: top left;
              zoom: ${defaultZoom};
          }
          
          .header-box {display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; width: 100%; color: #000c58;}
          .header-left { text-align: left; }
          .header-left p { margin: 0 0 3px 0; font-size: 11pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 3px 0; font-size: 11pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .title-box { text-align: center; margin: 5px 0 10px 0; }
          .title-box h2 { margin: 0 0 4px 0; font-size: 14pt; color: #000b51; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .title-box p { margin: 0; font-size: 11pt; color: #ff0000; font-weight: normal; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          
          table.main-table { width: 100%; margin: 0 auto 10px auto; border-collapse: collapse; text-align: center; border: 1.5pt solid #000; font-size: ${fontCss}; table-layout: auto; }
          .main-table th { font-family: 'Khmer OS Siemreap', 'Siemreap', serif !important; font-size: ${thFontCss}; font-weight: bold; border: 1pt solid #000; padding: ${thPaddings}; vertical-align: middle; }
          .main-table td { border: 0.3pt solid #8399b6; padding: ${tdPaddings}; font-size: ${fontCss}; vertical-align: middle; text-align: center; white-space: nowrap; }
          .main-table tbody tr:nth-child(even) td { background-color: #f8fafc; }
          .main-table td:nth-child(2) { text-align: left; padding-left: 5px; white-space: nowrap; }
          
          .th-vert { height: ${vertHeight}; max-height: ${vertHeight}; vertical-align: middle; text-align: center; padding: 0; width: 25px; min-width: 25px; overflow: hidden; }
          .div-vert { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: ${parseInt(vertHeight)-10}px; display: flex; justify-content: center; align-items: center; margin: 0 auto; font-family: 'Khmer OS Siemreap', 'Siemreap', serif !important; font-size: ${fontCss}; font-weight: bold; }
          
          .summary-table { width: 100%; font-size: 11pt; border-collapse: collapse; margin-bottom: 15px; }
          .summary-table td { padding: 2px 0; border: none; text-align: left; }
          .bottom-sig-container { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 30px; margin-top: 5px; }
          .sig-box-left { width: 40%; text-align: center; }
          .sig-box-right { width: 40%; text-align: center; }
        </style>
      </head>
      <body>
        <!-- ផ្ទាំងបញ្ជា (Toolbar) -->
        <div class="no-print print-toolbar font-siemreap">
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-file text-slate-400"></i> ទំហំក្រដាស៖</span>
                <select id="paperSize" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                    <option value="A4" selected>A4</option>
                    <option value="A3">A3</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                </select>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-rotate text-slate-400"></i> ទិសដៅ៖</span>
                <select id="paperOrientation" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                    <option value="landscape" selected>ផ្តេក (Landscape)</option>
                    <option value="portrait">បញ្ឈរ (Portrait)</option>
                </select>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-magnifying-glass text-slate-400"></i> ទំហំអត្ថបទ (Zoom)៖</span>
                <input type="range" id="zoomLevel" min="0.4" max="1.5" step="0.01" value="${defaultZoom}" oninput="updateSettings()" class="w-32 cursor-pointer">
                <span id="zoomDisplay" class="font-mono text-sm font-bold text-blue-600 w-12 bg-blue-50 py-1 rounded text-center">${Math.round(defaultZoom * 100)}%</span>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <button onclick="window.print()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                ព្រីនឥឡូវនេះ
            </button>
        </div>

        <div id="print-wrapper">
          <div id="content-scaler">
            <div class="header-box">
              <div class="header-left"><br><p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</p><p>${schoolName}</p><p>${grade}</p></div>
              <div class="header-right"><p>ព្រះរាជាណាចក្រកម្ពុជា</p><p>ជាតិ សាសនា ព្រះមហាក្សត្រ</p><div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;"><div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div><span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span><div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div></div></div>
            </div>
            <div class="title-box"><h2>${titleText}</h2><p>ឆ្នាំសិក្សា ៖ ${academicYear}</p></div>
            
            ${htmlTable}
            
            <table class="summary-table">
                <tr><td style="width: 100%;">❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalStus}</b> សិស្សសរុប <b>${totalStus}</b> នាក់ ស្រី <b>${femaleStus}</b> នាក់</td></tr>
                <tr><td style="width: 100%;">❖ ${passLabel} <b>${passed}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedF}</b> នាក់ (<b>${passFPct}%</b>)</td></tr>
                <tr><td style="width: 100%;">❖ ${failLabel} <b>${failed}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedF}</b> នាក់ (<b>${failFPct}%</b>)</td></tr>
            </table>
            <div class="bottom-sig-container">
                <div class="sig-box-left"><br><br><p class="font-moul" style="margin-bottom: 5px; font-size: 11pt;">បានឃើញ និងឯកភាព</p><p class="font-moul" style="margin-bottom: 50px; font-size: 11pt;">នាយកសាលា</p></div>
                <div class="sig-box-right"><p style="margin: 0 0 5px 0; font-size: 11pt;">${lunarDateStr}</p><p style="margin: 0 0 5px 0; font-size: 11pt;">${solarDateStr}</p><p class="font-moul" style="margin-bottom: 50px; font-size: 11pt;">គ្រូបន្ទុកថ្នាក់</p><p class="font-moul" style="font-size: 11pt;">${teacherName}</p></div>
            </div>
          </div>
        </div>

        <script>
            // អនុញ្ញាតឱ្យ Font Awesome icon ដំណើរការ
            const faScript = document.createElement('script');
            faScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
            document.head.appendChild(faScript);

            // មុខងារអាប់ដេតទំហំតារាងពេលអូស Slider
            function updateSettings() {
                const size = document.getElementById('paperSize').value;
                const orientation = document.getElementById('paperOrientation').value;
                const zoom = document.getElementById('zoomLevel').value;
                
                // ១. អាប់ដេត CSS Page (ទម្រង់ព្រីនចេញ)
                document.getElementById('dynamic-page-style').innerHTML = '@page { size: ' + size + ' ' + orientation + '; margin: 6mm; }';
                
                // ២. កំណត់ទំហំប្រអប់តារាងជាក់ស្តែងឱ្យត្រូវខ្នាតក្រដាស
                let wrapperWidth = "297mm"; // Default A4 Landscape
                if (orientation === 'landscape') {
                    if (size === 'A4') wrapperWidth = '297mm';
                    else if (size === 'A3') wrapperWidth = '420mm';
                    else if (size === 'Legal') wrapperWidth = '14in';
                    else if (size === 'Letter') wrapperWidth = '11in';
                } else {
                    if (size === 'A4') wrapperWidth = '210mm';
                    else if (size === 'A3') wrapperWidth = '297mm';
                    else if (size === 'Legal') wrapperWidth = '8.5in';
                    else if (size === 'Letter') wrapperWidth = '8.5in';
                }
                
                // ប្តូរតែទំហំប្រអប់ក្រដាស (Print Wrapper)
                document.getElementById('print-wrapper').style.width = wrapperWidth;

                // ៣. បង្រួម/ពង្រីក តែអត្ថបទ និងតារាងខាងក្នុង (Content Scaler)
                document.getElementById('content-scaler').style.zoom = zoom;
                document.getElementById('zoomDisplay').innerText = Math.round(zoom * 100) + '%';
            }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("⚠️ សូមអនុញ្ញាត Pop-up នៅក្នុង Browser របស់អ្នក។");
    
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
};


// ==========================================
// ១២. បង្ហាញ និងបោះពុម្ពតារាងចំណាត់ថ្នាក់ (បានជួសជុលការទាញយកកាលបរិច្ឆេទ)
// ==========================================
window.printRankingTable = function() {
    if(typeof window.calculateAllScores === 'function') window.calculateAllScores();
    if(!window.rankingsDataList || window.rankingsDataList.length === 0) return alert("⚠️ គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const month = document.getElementById("globalPeriodValue")?.value || "មករា";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const grade = (sInfo.teacher_level && sInfo.teacher_room) ? `${sInfo.teacher_level} ${sInfo.teacher_room}`.trim() : "ថ្នាក់ទី";
    const districtName = (sInfo.district || "ស្រុកកៀនស្វាយ").replace('ស្រុក', '').trim(); 
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា.......................";
    const principalName = sInfo.principal_name || ".......................";
    const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || '.......................');
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || "2026-2027";

    let titleText = `ចំណាត់ថ្នាក់ប្រចាំខែ${month}`;
    if (type === "semester") titleText = month.includes("ឆមាសលើកទី១") ? "ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី១" : (month.includes("ឆមាសលើកទី២") ? "ចំណាត់ថ្នាក់ប្រចាំឆមាសលើកទី២" : `ចំណាត់ថ្នាក់${month}`);
    else if (type === "annual") titleText = `ចំណាត់ថ្នាក់ប្រចាំឆ្នាំ`;

    // 🔴 ជួសជុលប្រព័ន្ធទាញយកកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ ១០០% (Real-time Fetching) 🔴
    let loc = document.getElementById('global_loc_input')?.value || localStorage.getItem('rc_location') || localStorage.getItem('rep_location') || "ធ្វើនៅ.........................";
    let sol = document.getElementById('global_sol_input')?.value || localStorage.getItem('rc_solar_date') || localStorage.getItem('rep_solar_date') || "ថ្ងៃទី....... ខែ....... ឆ្នាំ២០....";
    let lun = document.getElementById('global_lun_input')?.value || localStorage.getItem('rc_lunar_date') || localStorage.getItem('rep_lunar_date') || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...";
    
    let isLunarChecked = true;
    const chkBox = document.getElementById('global_lun_chk');
    if (chkBox) isLunarChecked = chkBox.checked;
    else isLunarChecked = (localStorage.getItem('rc_show_lunar') !== 'false' && localStorage.getItem('rep_show_lunar') !== 'false');

    let locationStr = loc.trim().replace(/,+$/, '');
    let sDate = sol.trim();
    if (sDate.includes("ថ្ងៃទី")) sDate = sDate.substring(sDate.indexOf("ថ្ងៃទី"));
    
    const solarDateStr = `${locationStr}, ${sDate}`;
    const lunarDateStr = isLunarChecked ? lun : "";
    // 🔴 ================================================================= 🔴

    let stus = [...window.rankingsDataList].sort((a, b) => a.rank - b.rank);
    const half = Math.ceil(stus.length / 2);

    let totalStus = stus.length;
    let femaleStus = stus.filter(s => s.gender === 'ស្រី').length;
    let passMark = ((type === "semester" || type === "annual") && window.rankingsDataList.some(s => s.avg > 15)) ? 25.0 : 5.0;
    
    let passed = stus.filter(s => s.avg >= passMark).length;
    let passedF = stus.filter(s => s.avg >= passMark && s.gender === 'ស្រី').length;
    let failed = totalStus - passed;
    let failedF = femaleStus - passedF;

    let passPct = totalStus > 0 ? ((passed / totalStus) * 100).toFixed(2) : "0.00";
    let failPct = totalStus > 0 ? ((failed / totalStus) * 100).toFixed(2) : "0.00";
    let passFPct = femaleStus > 0 ? ((passedF / femaleStus) * 100).toFixed(2) : "0.00";
    let failFPct = femaleStus > 0 ? ((failedF / femaleStus) * 100).toFixed(2) : "0.00";

    let passLabel = type === "annual" ? "សិស្សឡើងថ្នាក់សរុប" : "សិស្សជាប់មធ្យមភាគ";
    let failLabel = type === "annual" ? "សិស្សត្រូវត្រួតថ្នាក់សរុប" : "សិស្សធ្លាក់មធ្យមភាគ";

    let headerHtml = '';
    const thBase = `border: 1pt solid #000; text-align: center; vertical-align: middle; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 10pt; font-weight: normal;`;
    
    const thV = (text, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
        return `<th class="th-vert" style="${thBase} background-color: ${bgHex}; ${leftBorder} padding: 0;"><div class="div-vert">${text}</div></th>`;
    };
    const thN = (text, w, align, padding, bgHex, isRightSide) => {
        const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
        return `<th style="${thBase} background-color: ${bgHex}; width: ${w}; text-align: ${align}; padding-left: ${padding}; ${leftBorder}">${text}</th>`;
    };
    
    if (type === "monthly") {
        headerHtml = `<tr>${thN('ល.រ', '5.5%', 'center', '0', '#f8fafc', false)}${thN('គោត្តនាម និងនាម', '22%', 'left', '6px', '#f8fafc', false)}${thN('ភេទ', '5.5%', 'center', '0', '#f8fafc', false)}${thV('មធ្យមភាគ', '#eff6ff', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}${thN('ល.រ', '5.5%', 'center', '0', '#f8fafc', true)}${thN('គោត្តនាម និងនាម', '22%', 'left', '6px', '#f8fafc', false)}${thN('ភេទ', '5.5%', 'center', '0', '#f8fafc', false)}${thV('មធ្យមភាគ', '#eff6ff', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}</tr>`;
    } else if (type === "semester") {
        headerHtml = `<tr>${thN('ល.រ', '4%', 'center', '0', '#f8fafc', false)}${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}${thV('ម.ប្រឡងឆមាស', '#e0f2fe', false)}${thV('មធ្យមខែ', '#fef3c7', false)}${thV('ម.ប្រចាំឆមាស', '#dcfce7', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}${thN('ល.រ', '4%', 'center', '0', '#f8fafc', true)}${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}${thV('ម.ប្រឡងឆមាស', '#e0f2fe', false)}${thV('មធ្យមខែ', '#fef3c7', false)}${thV('ម.ប្រចាំឆមាស', '#dcfce7', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}</tr>`;
    } else {
        headerHtml = `<tr>${thN('ល.រ', '4%', 'center', '0', '#f8fafc', false)}${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}${thV('ម.ឆមាសទី១', '#e0e7ff', false)}${thV('ម.ឆមាសទី២', '#dcfce7', false)}${thV('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}${thN('ល.រ', '4%', 'center', '0', '#f8fafc', true)}${thN('គោត្តនាម និងនាម', '20%', 'left', '4px', '#f8fafc', false)}${thN('ភេទ', '5%', 'center', '0', '#f8fafc', false)}${thV('ម.ឆមាសទី១', '#e0e7ff', false)}${thV('ម.ឆមាសទី២', '#dcfce7', false)}${thV('ម.ប្រចាំឆ្នាំ', '#fef3c7', false)}${thV('ចំណាត់ថ្នាក់', '#fff1f2', false)}</tr>`;
    }

    let rowsHtml = "";
    const tdBase = `border: 1pt solid #000; padding: 4px 2px; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; font-size: 10pt; text-align: center; vertical-align: middle;`;

    for (let i = 0; i < half; i++) {
        const s1 = stus[i];
        const s2 = stus[half + i];

        const renderRow = (stu, index, isRightSide) => {
            const leftBorder = isRightSide ? 'border-left: 2pt solid #000;' : '';
            if (!stu) { const cols = type === "monthly" ? 5 : 7; return `<td colspan="${cols}" style="${tdBase} ${leftBorder} background-color: transparent;"></td>`; }
            
            const genColor = stu.gender === 'ស្រី' ? 'color: #be123c;' : 'color: #000;';
            const avgScore = (stu.avg !== undefined && !isNaN(stu.avg)) ? stu.avg.toFixed(2) : '';
            const avgColor = (stu.avg >= passMark) ? 'color: #16a34a;' : 'color: #be123c;';
            
            let row = `<td style="${tdBase} ${leftBorder}">${index}</td><td style="${tdBase} text-align: left; padding-left: 6px; font-weight: normal; white-space: nowrap; overflow: hidden;">${stu.name}</td><td style="${tdBase} font-weight: bold; ${genColor}">${stu.gender === 'ស្រី' ? 'ស' : 'ប'}</td>`;
            
            if (type === "monthly") {
                row += `<td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td><td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            } else if (type === "semester") {
                row += `<td style="${tdBase}">${(stu.exam_avg !== undefined && !isNaN(stu.exam_avg)) ? parseFloat(stu.exam_avg).toFixed(2) : ''}</td><td style="${tdBase}">${(stu.monthly_avg !== undefined && !isNaN(stu.monthly_avg)) ? parseFloat(stu.monthly_avg).toFixed(2) : ''}</td><td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td><td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            } else {
                row += `<td style="${tdBase}">${(stu.sem1_avg !== undefined && !isNaN(stu.sem1_avg)) ? parseFloat(stu.sem1_avg).toFixed(2) : ''}</td><td style="${tdBase}">${(stu.sem2_avg !== undefined && !isNaN(stu.sem2_avg)) ? parseFloat(stu.sem2_avg).toFixed(2) : ''}</td><td style="${tdBase} font-weight: bold; ${avgColor}">${avgScore}</td><td style="${tdBase} font-weight: bold; color: #be123c;">${stu.rank||''}</td>`;
            }
            return row;
        };
        const bgRow = i % 2 !== 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
        rowsHtml += `<tr style="${bgRow} height: 26px;">${renderRow(s1, i + 1, false)}${renderRow(s2, half + i + 1, true)}</tr>`;
    }

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>${titleText} - ${grade}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style id="dynamic-page-style">
          @page { size: A4 portrait; margin: 10mm; }
        </style>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap:wght@400;700&display=swap');
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; }
          html, body { margin: 0; padding: 0; background: #f1f5f9; color: #000; min-height: 100vh; }
          .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
          
          /* ផ្ទាំងបញ្ជា (Toolbar) */
          .print-toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: white; padding: 12px 20px; border-bottom: 1px solid #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 20px; }
          body { padding-top: 70px; }
          
          @media print {
              .no-print { display: none !important; }
              body { background: #fff; padding-top: 0 !important; }
              #print-wrapper { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; width: 100% !important; height: auto !important; padding: 0 !important; }
          }
          
          #print-wrapper { 
              padding: 10mm; 
              width: 210mm; /* Default A4 Portrait */
              min-height: 297mm;
              margin: 20px auto; 
              background: white; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
              border-radius: 8px; 
              overflow: hidden;
          }

          /* Content Scaler សម្រាប់ Zoom */
          #content-scaler {
              width: 100%;
              transform-origin: top left;
              zoom: 1.0;
          }
          
          .header-box {display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; width: 100%; color: #000c58;}
          .header-left { text-align: left; }
          .header-left p { margin: 0 0 4px 0; font-size: 12pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .header-right { text-align: center; }
          .header-right p { margin: 0 0 4px 0; font-size: 12pt; line-height: 1.5; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .title-box { text-align: center; margin: 10px 0 15px 0; }
          .title-box h2 { margin: 0 0 6px 0; font-size: 14pt; color: #000b51; letter-spacing: 0.5px; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          .title-box p { margin: 0; font-size: 12pt; color: #ff0000; font-weight: normal; font-family: 'Khmer OS Muol Light', 'Moul', serif; }
          
          table.rnk-table { width: 100%; border-collapse: collapse !important; margin-bottom: 11px; text-align: center; table-layout: fixed; border: 1pt solid #06005e; }
          
          .summary-table { width: 100%; font-size: 12pt; color: #000422; border-collapse: collapse; margin-bottom: 20px; }
          .summary-table td { padding: 3px 0 !important; border: none !important; text-align: left; font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif; }
          .bottom-sig-container { font-size: 12pt; display: flex; color: #00052a; justify-content: space-between; align-items: flex-start; width: 100%; page-break-inside: avoid; padding: 0 20px; margin-top: 15px; }
          .sig-box { width: 40%; text-align: center; }
          
          .th-vert { height: 110px; max-height: 110px; vertical-align: middle; text-align: center; padding: 0; width: 30px; min-width: 30px; }
          .div-vert { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: 100px; display: flex; justify-content: center; align-items: center; text-align: center; margin: 15px auto; font-family: 'Khmer OS Muol Light', 'Moul', serif; font-size: 11pt; font-weight: normal; color: #000c5b; }
        </style>
      </head>
      <body>
        <!-- ផ្ទាំងបញ្ជា (Toolbar) -->
        <div class="no-print print-toolbar font-siemreap">
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-file text-slate-400"></i> ទំហំក្រដាស៖</span>
                <select id="paperSize" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                    <option value="A4" selected>A4</option>
                    <option value="A3">A3</option>
                    <option value="Legal">Legal</option>
                    <option value="Letter">Letter</option>
                </select>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-rotate text-slate-400"></i> ទិសដៅ៖</span>
                <select id="paperOrientation" onchange="updateSettings()" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-bold cursor-pointer">
                    <option value="portrait" selected>បញ្ឈរ (Portrait)</option>
                    <option value="landscape">ផ្តេក (Landscape)</option>
                </select>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-700"><i class="fa-solid fa-magnifying-glass text-slate-400"></i> ទំហំអត្ថបទ (Zoom)៖</span>
                <input type="range" id="zoomLevel" min="0.4" max="1.5" step="0.01" value="1.0" oninput="updateSettings()" class="w-32 cursor-pointer">
                <span id="zoomDisplay" class="font-mono text-sm font-bold text-blue-600 w-12 bg-blue-50 py-1 rounded text-center">100%</span>
            </div>
            <div class="w-px h-6 bg-slate-300"></div>
            <button onclick="window.print()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                ព្រីនឥឡូវនេះ
            </button>
        </div>

        <div id="print-wrapper">
          <div id="content-scaler">
            <div class="header-box">
                <div class="header-left"><br><br><p>ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុក${districtName}</p><p>${schoolName}</p><p>${grade}</p></div>
                <div class="header-right"><p>ព្រះរាជាណាចក្រកម្ពុជា</p><p>ជាតិ សាសនា ព្រះមហាក្សត្រ</p><div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;"><div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div><span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span><div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div></div></div>
            </div>
            <div class="title-box"><h2>${titleText}</h2><p>ឆ្នាំសិក្សា ៖ ${academicYear}</p></div>
            
            <table class="rnk-table"><thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody></table>
            
            <table class="summary-table">
                <tr><td style="width: 100%;">❖ បញ្ឈប់បញ្ជីត្រឹមលេខរៀង <b>${totalStus}</b> សិស្សសរុប <b>${totalStus}</b> នាក់ ស្រី <b>${femaleStus}</b> នាក់</td></tr>
                <tr><td style="width: 100%;">❖ ${passLabel} <b>${passed}</b> នាក់ (<b>${passPct}%</b>) ស្រី <b>${passedF}</b> នាក់ (<b>${passFPct}%</b>)</td></tr>
                <tr><td style="width: 100%;">❖ ${failLabel} <b>${failed}</b> នាក់ (<b>${failPct}%</b>) ស្រី <b>${failedF}</b> នាក់ (<b>${failFPct}%</b>)</td></tr>
            </table>
            <div class="bottom-sig-container">
                <div class="sig-box"><br><br><p class="font-moul" style="margin: 0 0 5px 0; font-size: 11pt;">បានឃើញ និងឯកភាព</p><p class="font-moul" style="margin: 0 0 60px 0; font-size: 11pt;">នាយកសាលា</p></div>
                <div class="sig-box" style="width: 100%;"><p style="margin: 0 0 11px 0; font-size: 12pt; font-family: 'Khmer OS Siemreap', sans-serif;">${lunarDateStr}</p><p style="margin: 0 0 5px 0; font-size: 12pt; font-family: 'Khmer OS Siemreap', sans-serif;">${solarDateStr}</p><p class="font-moul" style="margin-bottom: 60px; font-size: 12pt;">គ្រូបន្ទុកថ្នាក់</p><p class="font-moul" style="font-size: 11pt;">${teacherName}</p></div>
            </div>
          </div>
        </div>

        <script>
            // ហៅ Font Awesome សម្រាប់ Icon
            const faScript = document.createElement('script');
            faScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js';
            document.head.appendChild(faScript);

            // មុខងារប្ដូរទំហំ និងប្រភេទក្រដាស
            function updateSettings() {
                const size = document.getElementById('paperSize').value;
                const orientation = document.getElementById('paperOrientation').value;
                const zoom = document.getElementById('zoomLevel').value;
                
                // ១. អាប់ដេត CSS Page (ទម្រង់ព្រីនចេញ)
                document.getElementById('dynamic-page-style').innerHTML = '@page { size: ' + size + ' ' + orientation + '; margin: 10mm; }';
                
                // ២. កំណត់ទំហំប្រអប់តារាងជាក់ស្តែងឱ្យត្រូវខ្នាតក្រដាស
                let wrapperWidth = "210mm"; // Default A4 Portrait
                if (orientation === 'landscape') {
                    if (size === 'A4') wrapperWidth = '297mm';
                    else if (size === 'A3') wrapperWidth = '420mm';
                    else if (size === 'Legal') wrapperWidth = '14in';
                    else if (size === 'Letter') wrapperWidth = '11in';
                } else {
                    if (size === 'A4') wrapperWidth = '210mm';
                    else if (size === 'A3') wrapperWidth = '297mm';
                    else if (size === 'Legal') wrapperWidth = '8.5in';
                    else if (size === 'Letter') wrapperWidth = '8.5in';
                }
                // ប្តូរតែទំហំប្រអប់ក្រដាស (Print Wrapper)
                document.getElementById('print-wrapper').style.width = wrapperWidth;

                // ៣. បង្រួម/ពង្រីក តែអត្ថបទ និងតារាងខាងក្នុង (Content Scaler)
                document.getElementById('content-scaler').style.zoom = zoom;
                document.getElementById('zoomDisplay').innerText = Math.round(zoom * 100) + '%';
            }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("⚠️ សូមអនុញ្ញាត Pop-up នៅក្នុង Browser របស់អ្នក។");
    
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
};

// =====================================================================
// 🔴 ផ្នែកទី ១៖ មុខងារបង្ហាញក្នុង Modal តារាងចំណាត់ថ្នាក់ (Rankings Content)
// =====================================================================
window.renderRankingsContent = function() {
    window.calculateAllScores();
    const container = document.getElementById("modal-content-rankings");
    if (!container) return;

    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeFull = sInfo.teacher_level && sInfo.teacher_room ? `${sInfo.teacher_level} ${sInfo.teacher_room}` : "ថ្នាក់ទី";

    container.innerHTML = `
      <style>
        .table-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .table-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .table-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .sticky-col { position: sticky; left: 0; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
      </style>
      <div class="w-full flex flex-col gap-4 font-siemreap bg-slate-50/50 p-2 md:p-4 rounded-3xl min-h-full relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-rose-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div id="rankingsKpiContainer" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 no-print relative z-10"></div>
        <div class="w-full h-full bg-white border border-slate-200/80 rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col flex-1 shadow-sm relative z-10 mt-2">
          <div class="overflow-x-auto w-full h-full table-scroll flex-1 pb-4">
            <table id="rankTableMain" class="w-full border-collapse text-[13px] text-center whitespace-nowrap bg-white">
              <thead id="rankTableHead" class="text-slate-700 sticky top-0 z-20 shadow-sm border-b-2 border-slate-200/80"></thead>
              <tbody id="rankingsTableBody" class="divide-y divide-slate-100 text-slate-700"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    buildRankingsTable();
};

window.changeRankViewMode = function(mode) { window.rankingsViewMode = mode; window.renderRankingsContent(); };
window.filterRankingsTable = function(query, gender) { window.rankingsSearchQuery = query.toLowerCase(); window.rankingsGenderFilter = gender; buildRankingsTable(); };

function buildRankingsTable() {
    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";
    const allStudents = window.rankingsDataList || [];

    let total = allStudents.length;
    let female = allStudents.filter(s => s.gender === 'ស្រី').length;
    let passed = allStudents.filter(s => s.avg >= 5.0).length;
    let failed = total - passed;
    let passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
    let classAvg = total > 0 ? (allStudents.reduce((acc, s) => acc + (s.avg || 0), 0) / total).toFixed(2) : "0.00";
    let topStudent = allStudents.find(s => s.rank === 1);

    const kpiEl = document.getElementById("rankingsKpiContainer");
    if (kpiEl && total > 0) {
      kpiEl.innerHTML = `
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-users"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">សិស្សសរុប</div><div class="text-sm md:text-base font-black text-slate-800 font-mono">${total} <span class="text-[10px] font-normal text-slate-400 font-siemreap">(ស្រី ${female})</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-circle-check"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">ជាប់មធ្យមភាគ</div><div class="text-sm md:text-base font-black text-emerald-600 font-mono">${passed} <span class="text-[10px] font-bold text-emerald-700 font-mono">(${passRate}%)</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-circle-xmark"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">ធ្លាក់មធ្យមភាគ</div><div class="text-sm md:text-base font-black text-rose-600 font-mono">${failed} <span class="text-[10px] font-normal text-slate-400 font-siemreap">នាក់</span></div></div>
        </div>
        <div class="bg-white p-3.5 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg md:text-xl shadow-inner"><i class="fa-solid fa-chart-line"></i></div>
          <div><div class="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">មធ្យមភាគថ្នាក់</div><div class="text-sm md:text-base font-black text-indigo-700 font-mono">${classAvg}</div></div>
        </div>
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 md:p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 md:gap-4 col-span-2 sm:col-span-1 lg:col-span-1 transition-transform hover:-translate-y-1 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-16 h-16 bg-white/40 rounded-full blur-xl pointer-events-none"></div>
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md border border-white/50 relative z-10"><i class="fa-solid fa-medal"></i></div>
          <div class="truncate relative z-10"><div class="text-[10px] md:text-[11px] text-amber-800 font-bold uppercase tracking-wider">ជើងឯកលេខ ១</div><div class="text-sm md:text-base font-bold text-slate-800 font-moul truncate mt-0.5">${topStudent ? topStudent.name : '-'}</div></div>
        </div>
      `;
    }

    const th = document.getElementById("rankTableHead");
    const tbody = document.getElementById("rankingsTableBody");
    if (!tbody || !th) return;

    if (allStudents.length === 0) {
        th.innerHTML = "";
        tbody.innerHTML = `<tr><td colspan="12" class="p-16 text-center text-slate-400 font-bold"><i class="fa-solid fa-folder-open text-2xl text-slate-300 mb-4"></i><br>មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ!</td></tr>`;
        return;
    }

    let filteredList = allStudents.filter(s => {
      const matchName = !window.rankingsSearchQuery || s.name.toLowerCase().includes(window.rankingsSearchQuery);
      const matchGender = window.rankingsGenderFilter === "all" || s.gender === window.rankingsGenderFilter;
      return matchName && matchGender;
    });

    const getGradeBadge = (g) => {
      const str = String(g || "E").trim();
      let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
      if (str.includes("A") || str.includes("ល្អប្រសើរ") || str.includes("ល្អណាស់")) colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      else if (str.includes("B") || str.includes("ល្អ")) colorClass = "bg-blue-100 text-blue-700 border-blue-200";
      else if (str.includes("C") || str.includes("បង្គួរ")) colorClass = "bg-teal-100 text-teal-700 border-teal-200";
      else if (str.includes("D") || str.includes("មធ្យម")) colorClass = "bg-amber-100 text-amber-700 border-amber-200";
      else if (str.includes("E") || str.includes("ខ្សោយ") || str.includes("F") || str.includes("ធ្លាក់")) colorClass = "bg-rose-100 text-rose-700 border-rose-200";
      return `<span class="px-3 py-1 rounded-lg text-[11px] md:text-xs font-bold font-siemreap border shadow-sm ${colorClass}">${str}</span>`;
    };

    let colHtml = "";
    if (periodType === "monthly") {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th><th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th><th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th><th class="p-3 w-28 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-x border-white">មធ្យមភាគ</th><th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th><th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    } else if (periodType === "semester") {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th><th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th><th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th><th class="p-3 w-24 bg-orange-50/80 text-orange-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ប្រឡង</th><th class="p-3 w-24 bg-indigo-50/80 text-indigo-800 font-moul text-[11px] md:text-xs border-l border-white">មធ្យមខែ</th><th class="p-3 w-28 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-x border-white">ម.ប្រចាំឆមាស</th><th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th><th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    } else {
       colHtml = `<th class="p-3 w-12 font-moul text-[11px] md:text-xs text-slate-500 bg-slate-50">ល.រ</th><th class="p-3 w-64 text-left px-5 font-moul text-[11px] md:text-xs text-slate-800 sticky-col bg-slate-50">គោត្តនាម និងនាម</th><th class="p-3 w-14 text-[11px] md:text-xs font-moul text-slate-500 bg-slate-50">ភេទ</th><th class="p-3 w-24 bg-blue-50/80 text-blue-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ឆមាសទី១</th><th class="p-3 w-24 bg-indigo-50/80 text-indigo-800 font-moul text-[11px] md:text-xs border-l border-white">ម.ឆមាសទី២</th><th class="p-3 w-28 bg-amber-50/80 text-amber-800 font-moul text-[11px] md:text-xs border-x border-white">ម.ប្រចាំឆ្នាំ</th><th class="p-3 w-28 bg-rose-50/80 text-rose-800 font-moul text-[11px] md:text-xs border-r border-white">ចំណាត់ថ្នាក់</th><th class="p-3 w-28 bg-emerald-50/80 text-emerald-800 font-moul text-[11px] md:text-xs">និទ្ទេស</th>`;
    }
    th.innerHTML = `<tr class="shadow-sm tracking-wide bg-slate-50">${colHtml}</tr>`;

    let rowsHtml = "";
    filteredList.forEach((s, idx) => {
       const isF = s.gender === "ស្រី";
       const genderClass = isF ? `text-rose-500 font-bold` : `text-blue-600 font-bold`;
       const bgClass = idx % 2 !== 0 ? 'bg-slate-50/30' : 'bg-white';
       
       let trData = "";
       if (periodType === "monthly") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td><td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td><td class="p-3 font-siemreap font-black text-blue-700 bg-blue-50/30 border-l border-white text-[13px] md:text-[14px]">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-siemreap font-black text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-x border-white">${s.rank}</td><td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       } else if (periodType === "semester") {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td><td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td><td class="p-3 font-siemreap text-orange-700 bg-orange-50/30 font-bold border-l border-white">${s.exam_avg.toFixed(2)}</td><td class="p-3 font-siemreap text-indigo-700 bg-indigo-50/30 font-bold border-l border-white">${s.monthly_avg.toFixed(2)}</td><td class="p-3 font-siemreap font-black text-blue-700 bg-blue-50/30 text-[13px] md:text-[14px] border-x border-white">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-black font-siemreap text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-r border-white">${s.rank}</td><td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       } else {
         trData = `<td class="p-3 text-slate-400 font-bold font-mono text-xs">${idx + 1}</td><td class="p-3 text-left px-5 font-bold text-slate-800 text-[13px] font-siemreap sticky-col ${bgClass}">${s.name}</td><td class="p-3 text-center ${genderClass} font-siemreap">${isF ? 'ស' : 'ប'}</td><td class="p-3 font-siemreap text-blue-700 bg-blue-50/30 font-bold border-l border-white">${s.sem1_avg.toFixed(2)}</td><td class="p-3 font-siemreap text-indigo-700 bg-indigo-50/30 font-bold border-l border-white">${s.sem2_avg.toFixed(2)}</td><td class="p-3 font-siemreap font-black text-amber-700 bg-amber-50/30 text-[13px] md:text-[14px] border-x border-white">${s.avg.toFixed(2)}</td><td class="p-3 text-center font-black font-siemreap text-rose-600 bg-rose-50/30 text-[13px] md:text-[14px] border-r border-white">${s.rank}</td><td class="p-3 text-center bg-white/50">${getGradeBadge(s.gradeLetter)}</td>`;
       }
       rowsHtml += `<tr class="hover:bg-slate-100 transition-colors border-b border-slate-100/50 ${bgClass}">${trData}</tr>`;
    });
    tbody.innerHTML = rowsHtml;
}


// =====================================================================
// 🔴 ផ្នែកទី ២៖ មុខងារសៀវភៅតាមដានការសិក្សា (Report Cards Content)
// =====================================================================
window.renderReportCardsTab = function() {
    window.calculateAllScores(); 
    const c = document.getElementById("scoreTabContent-reportcards") || document.getElementById("modal-content-reportcards");
    if (!c) return;
    
    if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
        c.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-slate-500 font-bold p-16 bg-white rounded-3xl border border-slate-200 shadow-sm font-siemreap">
              <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-inner"><i class="fa-solid fa-book-open"></i></div>
              <h3 class="text-lg font-bold text-slate-700 font-moul mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់</h3>
              <p class="text-sm text-slate-400">សូមបញ្ចូលពិន្ទុ និងចុច «គណនាចំណាត់ថ្នាក់» ជាមុនសិន។</p>
          </div>
        `;
        return;
    }

    const students = window.rankingsDataList;
    const sOptions = students.map((s, idx) => `<option value="${s.id}" ${window.selectedReportCardStudentId === String(s.id) ? 'selected' : ''}>ល.រ ${idx + 1} ៖ ${s.name} (${s.gender || 'ប្រុស'})</option>`).join('');

    c.innerHTML = `
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      </style>
      <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 relative rounded-3xl">
        <div class="flex flex-col font-siemreap max-w-[1680px] mx-auto pb-16 px-2 md:px-4 pt-4">
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-5 no-print flex flex-col gap-3.5 transition-all">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div class="flex flex-wrap items-center gap-2.5">
                  <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                    <i class="fa-solid fa-file-invoice text-indigo-500 text-xs"></i>
                    <span class="text-xs font-bold text-slate-600">ទម្រង់៖</span>
                    <select onchange="window.changeReportCardViewMode(this.value)" class="bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                      <option value="monthly_sheet" ${window.reportCardPrintType==='monthly_sheet'?'selected':''}>📄 ទំព័រលទ្ធផលប្រចាំខែ (A4)</option>
                      <option value="cover_page" ${window.reportCardPrintType==='cover_page'?'selected':''}>📘 ក្របមុខ និងព័ត៌មាន (Cover)</option>
                      <option value="full_booklet" ${window.reportCardPrintType==='full_booklet'?'selected':''}>📚 សៀវភៅតាមដានពេញ (Booklet)</option>
                    </select>
                  </div>
            
                  <div class="flex flex-1 sm:flex-none items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
                    <i class="fa-solid fa-users text-emerald-600 text-xs"></i>
                    <span class="text-xs font-bold text-slate-600">សិស្ស៖</span>
                    <select onchange="window.filterReportCardStudent(this.value)" class="w-full bg-transparent text-xs font-bold text-emerald-800 outline-none cursor-pointer max-w-[200px]">
                      <option value="all" ${window.selectedReportCardStudentId==='all'?'selected':''}>👥 សិស្សទាំងអស់ (${students.length} នាក់)</option>
                      ${sOptions}
                    </select>
                  </div>
                </div>
                <button onclick="window.printReportCards()" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  <i class="fa-solid fa-print text-sm"></i> បោះពុម្ព (${window.selectedReportCardStudentId==='all' ? students.length + ' នាក់' : '១ នាក់'})
                </button>
              </div>

              <!-- ជម្រើសកំណត់វិន័យ និងសីលធម៌ -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-indigo-50/50 p-2.5 px-3 rounded-xl border border-indigo-100 mt-1">
                <div class="flex items-center gap-2 mb-1 sm:mb-0">
                  <i class="fa-solid fa-award text-indigo-600"></i>
                  <span class="font-bold text-indigo-900">អនុវត្តគំរូវិន័យសីលធម៌ដល់សិស្សទាំងអស់៖</span>
                </div>
                <select onchange="window.applyConductToAll(this.value)" class="w-full sm:w-auto bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-full sm:max-w-[340px]">
                  <option value="" disabled selected>-- ជ្រើសរើសដើម្បីដាក់សិស្សទាំងអស់ --</option>
                  ${window.CONDUCT_TEMPLATES.map((tpl, i) => `<option value="${tpl}">${i + 1}.${tpl.length > 35 ? tpl.substring(0, 35) + '...' : tpl}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Preview Area -->
            <div class="w-full overflow-x-auto custom-scrollbar">
                <div class="flex flex-col items-center gap-8 py-2 min-w-max md:min-w-0" id="reportCardsPreviewArea">
                   ${window.renderReportCardPreview()}
                </div>
            </div>
        </div>
      </div>
    `;
};
window.renderReportCardsContent = window.renderReportCardsTab;

window.changeReportCardViewMode = function(mode) { window.reportCardPrintType = mode; window.refreshRcPreview(); };
window.changeEducationLevel = function(lvl) { window.selectedEducationLevel = lvl; window.refreshRcPreview(); };
window.filterReportCardStudent = function(id) { window.selectedReportCardStudentId = id; window.refreshRcPreview(); };
window.refreshRcPreview = function() {
  const el = document.getElementById("reportCardsPreviewArea");
  if (el) el.innerHTML = window.renderReportCardPreview();
};

window.renderReportCardPreview = function() {
  if (!window.rankingsDataList || window.rankingsDataList.length === 0) return '<div class="p-12 text-slate-400 font-bold bg-white rounded-2xl shadow-sm">គ្មានទិន្នន័យសិស្ស</div>';

  const allStudents = window.rankingsDataList;
  let target = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    target = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  return target.map((s, idx) => {
    let sheetHtml = "";
    if (window.reportCardPrintType === 'cover_page') {
      sheetHtml = window.generateCoverAndProfileHTML(s);
    } else if (window.reportCardPrintType === 'full_booklet') {
      sheetHtml = window.generateCoverAndProfileHTML(s) + `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
    } else {
      sheetHtml = `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
    }

    return `
      <div class="no-print w-full max-w-[210mm] flex items-center justify-between bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-xs text-xs font-siemreap">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono">${idx + 1}</span>
          <span class="font-bold text-slate-800 font-moul text-[13px]">${s.name}</span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500 font-mono">អត្តលេខ៖ <b>${s.id}</b></span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500">ភេទ៖ <b>${s.gender || 'ប្រុស'}</b></span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-indigo-600 font-bold">មធ្យមភាគ៖ <b class="font-mono text-sm">${s.avg != null ? window.toKhmerNum(Number(s.avg).toFixed(2)) : '-'}</b></span>
          <span class="text-rose-600 font-bold">ចំណាត់ថ្នាក់៖ <b class="font-mono text-sm">${s.rank != null ? window.toKhmerNum(s.rank.toString()) : '-'}</b></span>
        </div>
      </div>
      <div class="preview-page-container bg-white shadow-xl rounded-sm mb-6 print:shadow-none print:m-0">
        ${sheetHtml}
      </div>
    `;
  }).join("");
};

function getSubjectScore(stu, sub) {
  if (stu[sub.key] !== undefined && stu[sub.key] !== null && stu[sub.key] !== "") return parseFloat(stu[sub.key]);
  if (stu.scores && stu.scores[sub.key] !== undefined && stu.scores[sub.key] !== "") return parseFloat(stu.scores[sub.key]);
  if (window.currentScores) {
     const found = window.currentScores.find(item => String(item.student_id) === String(stu.id));
     if (found && found[sub.key] !== undefined && found[sub.key] !== "") return parseFloat(found[sub.key]);
  }
  if (sub.aliases) {
    for (let a of sub.aliases) {
      if (stu[a] !== undefined && stu[a] !== null && stu[a] !== "") return parseFloat(stu[a]);
      if (stu.scores && stu.scores[a] !== undefined && stu.scores[a] !== "") return parseFloat(stu.scores[a]);
      if (window.currentScores) {
         const found = window.currentScores.find(item => String(item.student_id) === String(stu.id));
         if (found && found[a] !== undefined && found[a] !== "") return parseFloat(found[a]);
      }
      let el = document.getElementById(`${a}_${stu.id}`);
      if (el && el.value !== "") return parseFloat(el.value);
    }
  }
  let el = document.getElementById(`${sub.key}_${stu.id}`);
  if (el && el.value !== "") return parseFloat(el.value);
  return null;
}

function getGradeTick(score, max) {
  if (score === null || isNaN(score)) return { vg: "", g: "", m: "", w: "" };
  const pct = (score / max) * 100;
  return { vg: pct >= 80 ? "✔" : "", g: (pct >= 65 && pct < 80) ? "✔" : "", m: (pct >= 50 && pct < 65) ? "✔" : "", w: pct < 50 ? "✔" : "" };
}

window.generateMonthlySheetHTML = function(stu, periodOverride = null) {
  const levelStr = document.getElementById("globalLevelSelect")?.value || stu.grade || "ថ្នាក់ទី ២";
  const month = periodOverride || document.getElementById("globalPeriodValue")?.value || "មករា";
  const type = document.getElementById("globalPeriodType")?.value || "monthly";
  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const principalName = sInfo.principal_name || ".......................";
  const teacherName = sInfo.teacher_name || ".......................";
  const academicYear = sInfo.academic_year || "2026-2027"; 

  let headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំខែ ${month}`;
  if (type === "semester") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំ ${month}`;
  else if (type === "annual") headerTitle = `ពិន្ទុ-ចំណាត់ថ្នាក់ ប្រចាំឆ្នាំសិក្សា ${academicYear}`;

  const isPrimary = typeof window.getEducationLevel === 'function' ? (window.getEducationLevel(levelStr) === 'primary') : levelStr.includes("ទី 1");

  let sc = {};
  if (window.currentScores && window.currentScores.length > 0) { sc = window.currentScores.find(item => String(item.student_id) === String(stu.id)) || stu; } 
  else { sc = stu; }

  let schema = window.activeSchema;
  if (!schema || schema.length === 0) {
      schema = [
         { group: "ភាសាខ្មែរ", subs: [{name:"សមត្ថភាពស្តាប់", key:"k_listen", max:10}, {name:"សមត្ថភាពសរសេរ", key:"k_write", max:10}, {name:"សមត្ថភាពអាន", key:"k_read", max:10}, {name:"សមត្ថភាពនិយាយ", key:"k_compose", max:10}] },
         { group: "គណិតវិទ្យា", subs: [{name:"ចំនួន", key:"m_num", max:10}, {name:"រង្វាស់រង្វាល់", key:"m_measure", max:10}, {name:"ធរណីមាត្រ", key:"m_geo", max:10}, {name:"ពីជគណិត", key:"m_alg", max:10}, {name:"ស្ថិតិ", key:"m_stat", max:10}] },
         { group: "វិទ្យាសាស្ត្រ", subs: [{name:"រូបវិទ្យា", key:"s_phy", max:10}, {name:"គីមីវិទ្យា", key:"s_chem", max:10}, {name:"ជីវវិទ្យា", key:"s_bio", max:10}, {name:"ផែនដី-បរិស្ថាន", key:"s_earth", max:10}] },
         { group: "សិក្សាសង្គម", subs: [{name:"សីលធម៌-ពលរដ្ឋ", key:"ss_moral", max:10}, {name:"ភូមិវិទ្យា", key:"ss_geo", max:10}, {name:"ប្រវត្តិវិទ្យា", key:"ss_hist", max:10}] },
         { group: "អប់រំកាយ សុខភាព កីឡា", subs: [{name:"អប់រំកាយ-កីឡា", key:"pe_sport", max:10}, {name:"សុខភាព-អនាម័យ", key:"pe_health", max:10}] },
         { group: "បំណិនជីវិត", key: "life_skill", max: 10 },
         { group: "ភាសាបរទេស", key: "foreign_lang", max: 10 }
      ];
  }

  const renderScoreCellsUniversal = (score, max) => {
    const t = getGradeTick(score, max);
    const sStr = (score !== null && !isNaN(score)) ? Number(score).toString() : "-";
    const b = "border: 1.5px solid #1e3a8a; text-align: center;";
    return `<td style="${b} font-size: 11px; font-mono; width: 10%; color: #334155;">${max}</td><td style="${b} font-size: 11.5px; font-mono; font-weight: bold; width: 13%; color: #1e3a8a; background: #f8fafc;">${sStr}</td><td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.vg}</td><td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.g}</td><td style="${b} font-weight: bold; font-size: 12px; color: #1e3a8a; width: 8.5%;">${t.m}</td><td style="${b} font-weight: bold; font-size: 12px; color: #e11d48; width: 8.5%;">${t.w}</td>`;
  };

  let tableHeaderHtml = ""; let rowsHtml = ""; let calculatedSum = 0; let globalIndex = 1;

  if (isPrimary) {
    tableHeaderHtml = `
      <tr style="background-color: #f8fafc; color: #1e3a8a; height: 28px;">
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 5%; font-family: 'Moul', serif; font-size: 10.5px;">ល.រ</th><th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 38%; font-family: 'Moul', serif; font-size: 10.5px;">មុខវិជ្ជា</th><th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 23%; font-family: 'Moul', serif; font-size: 10.5px;">ពិន្ទុ</th><th colspan="4" style="border: 1.5px solid #1e3a8a; padding: 2px; width: 34%; font-family: 'Moul', serif; font-size: 10.5px;">និទ្ទេស</th>
      </tr>
      <tr style="background-color: #f8fafc; font-size: 9.5px; height: 22px;">
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 20%;">មុខវិជ្ជាគោល</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 18%;">មុខវិជ្ជារង</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 10%;">អតិបរមា</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 13%; color: #1e3a8a;">ពិន្ទុខែ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អបង្គួរ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">មធ្យម</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%; color: #e11d48;">ខ្សោយ</th>
      </tr>
    `;
    schema.forEach((item) => {
        if (item.subs && item.subs.length > 0) {
            const rowSpan = item.subs.length;
            item.subs.forEach((sub, subIdx) => {
                const maxVal = window.schemaMaxMap?.[sub.key] || sub.max || 10;
                const score = getSubjectScore(stu, sub);
                if (score !== null && !isNaN(score)) calculatedSum += score;
                let groupCell = "";
                if (subIdx === 0) {
                    groupCell = `<td rowspan="${rowSpan}" style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${globalIndex++}</td><td rowspan="${rowSpan}" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 20%; background: #fbfcfe;">${item.group}</td>`;
                }
                rowsHtml += `<tr style="height: 19px;">${groupCell}<td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-size: 10px; width: 18%; font-family: 'Siemreap', sans-serif;">${sub.name}</td>${renderScoreCellsUniversal(score, maxVal)}</tr>`;
            });
        } else {
            const maxVal = window.schemaMaxMap?.[item.key] || item.max || 10;
            const score = getSubjectScore(stu, item);
            if (score !== null && !isNaN(score)) calculatedSum += score;
            rowsHtml += `<tr style="height: 20px;"><td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11px; font-weight: bold; width: 5%;">${globalIndex++}</td><td colspan="2" style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 6px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 11px; width: 38%;">${item.group}</td>${renderScoreCellsUniversal(score, maxVal)}</tr>`;
        }
    });
  } else {
    tableHeaderHtml = `
      <tr style="background-color: #f8fafc; color: #1e3a8a; height: 30px;">
         <th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 6%; font-family: 'Moul', serif; font-size: 11px;">ល.រ</th><th rowspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 34%; font-family: 'Moul', serif; font-size: 11px;">មុខវិជ្ជា</th><th colspan="2" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 26%; font-family: 'Moul', serif; font-size: 11px;">ពិន្ទុ</th><th colspan="4" style="border: 1.5px solid #1e3a8a; padding: 4px; width: 34%; font-family: 'Moul', serif; font-size: 11px;">និទ្ទេស</th>
      </tr>
      <tr style="background-color: #f8fafc; font-size: 10.5px; height: 25px;">
         <th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 12%;">អតិបរមា</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 14%; color: #1e3a8a;">ពិន្ទុខែ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">ល្អបង្គួរ</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%;">មធ្យម</th><th style="border: 1.5px solid #1e3a8a; padding: 2px; width: 8.5%; color: #e11d48;">ខ្សោយ</th>
      </tr>
    `;
    schema.forEach((sub, idx) => {
      const maxScore = window.schemaMaxMap?.[sub.key] || sub.max || 50;
      const score = getSubjectScore(stu, sub);
      if (score !== null && !isNaN(score)) calculatedSum += score;
      rowsHtml += `<tr style="height: 24px;"><td style="border: 1.5px solid #1e3a8a; text-align: center; font-size: 11.5px; font-weight: bold; width: 6%;">${idx + 1}</td><td style="border: 1.5px solid #1e3a8a; text-align: left; padding-left: 8px; font-weight: bold; font-family: 'Siemreap', sans-serif; font-size: 12px; width: 34%;">${sub.group || sub.name}</td>${renderScoreCellsUniversal(score, maxScore)}</tr>`;
    });
  }

  let permCount = 0, unexCount = 0;
  if (typeof window.getStudentAttendance === "function") {
    const att = window.getStudentAttendance(stu.id, month);
    if (att && att.hasData) { permCount = att.permission; unexCount = att.unexcused; }
  } else if (stu.permission !== undefined || stu.unexcused !== undefined) {
    permCount = parseInt(stu.permission || 0) || 0;
    unexCount = parseInt(stu.unexcused || 0) || 0;
  }

  const rawTotal = sc.totalScore || sc.total || sc.total_score || stu.totalScore || stu.total || stu.total_score || (calculatedSum > 0 ? calculatedSum : null);
  const targetAvg = sc.average || sc.avg || stu.average || stu.avg;
  const targetRank = sc.rank || stu.rank;
  const targetGrade = sc.grade_letter || stu.gradeLetter || stu.mention || "ល្អ";

  const totalScoreFormatted = rawTotal != null ? Number(rawTotal).toFixed(0) : "......";
  const avgFormatted = (targetAvg !== undefined && targetAvg !== null && !isNaN(targetAvg)) ? Number(targetAvg).toFixed(2) : "......";
  const totalStus = window.rankingsDataList?.length ? window.rankingsDataList.length : "";
  const rankFormatted = (targetRank !== undefined && targetRank !== null && String(targetRank).trim() !== "") ? (totalStus ? `${targetRank} / ${totalStus}` : targetRank) : "......";
  
  const savedConduct = localStorage.getItem(`conduct_${stu.id}`) || stu.conduct || window.CONDUCT_TEMPLATES[0];
  const rDates = window.reportCardDateSettings || {};
  const lunarDateStr = rDates.showLunar !== false ? rDates.lunarDate : "";
  const solarDateStr = typeof window.getFormattedSolarDate === 'function' ? window.getFormattedSolarDate() : "";

  return `
    <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" style="width: 100%; height: 100%; padding: 8mm 12mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
       <div style="position: absolute; top: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; top: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; bottom: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; bottom: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
       <div style="text-align: center; margin-bottom: 2mm;"><h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">${headerTitle}</h2><p style="margin: 1px 0 0 0; font-family: 'Moul', serif; font-size: 12.5px; color: #1e3a8a;">លទ្ធផលនៃការសិក្សា</p></div>
       <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e3a8a; font-size: 12px; margin-bottom: 3mm;"><thead>${tableHeaderHtml}</thead><tbody>${rowsHtml}</tbody></table>
       <div style="font-size: 12px; line-height: 1.8; border-bottom: 1.5px dashed #94a3b8; padding-bottom: 3px; margin-bottom: 2mm;">
         <div>ពិន្ទុសរុបៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #1e3a8a;">${totalScoreFormatted}</span>&nbsp;&nbsp;&nbsp;&nbsp;មធ្យមភាគៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #1e3a8a;">${avgFormatted}</span>&nbsp;&nbsp;&nbsp;&nbsp;ចំណាត់ថ្នាក់ៈ <span style="font-weight: bold; font-family: monospace; font-size: 13px; color: #e11d48;">${rankFormatted}</span>&nbsp;&nbsp;&nbsp;&nbsp;និទ្ទេសៈ <span style="font-weight: bold; font-family: 'Moul', serif; font-size: 11px; color: #059669;">${targetGrade}</span></div>
         <div>អវត្តមានៈ មានច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #1e3a8a; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${permCount}</span> ដង&nbsp;&nbsp;&nbsp;&nbsp;ឥតច្បាប់ <span contenteditable="true" style="font-weight: bold; font-family: monospace; font-size: 12.5px; color: #e11d48; border-bottom: 1px dotted #94a3b8; padding: 0 4px;">${unexCount}</span> ដង</div>
         <div style="margin-top: 1px; display: flex; align-items: center; flex-wrap: wrap;">
           <span style="font-weight: bold; color: #1e293b;">វិន័យសីលធម៌ៈ&nbsp;</span>
           <span id="conduct_display_${stu.id}" contenteditable="true" oninput="localStorage.setItem('conduct_${stu.id}', this.innerText)" style="font-weight: bold; color: #1e3a8a; border-bottom: 1px dotted #94a3b8; padding: 0 4px; outline: none;">${savedConduct}</span>
           <select id="conduct_select_${stu.id}" onchange="window.selectConductTemplate('${stu.id}', this.value)" class="no-print" style="margin-left: 8px; font-size: 10.5px; padding: 1px 5px; border: 1px solid #cbd5e1; border-radius: 5px; background: #f8fafc; color: #334155;"><option value="" disabled>-- ជ្រើសរើសគំរូ --</option>${window.CONDUCT_TEMPLATES.map((tpl, i) => `<option value="${tpl}" ${tpl === savedConduct ? 'selected' : ''}>${i + 1}.${tpl.length > 30 ? tpl.substring(0, 30) + '...' : tpl}</option>`).join('')}</select>
         </div>
       </div>
       <div style="display: flex; justify-content: space-between; align-items: flex-start; text-align: center; margin-bottom: 2mm;">
         <div style="width: 40%;"><p style="margin: 0 0 3px 0; font-size: 11.5px; font-weight: bold;">បានឃើញ និងឯកភាព</p><p style="margin: 0 0 40px 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">នាយកសាលា</p><p style="margin: 0; color: #64748b;">................................................</p></div>
         <div style="width: 50%;">
            <p class="rc-lunar-date-lbl" style="margin: 0 0 2px 0; font-size: 10.5px; color: #1e293b; display: ${rDates.showLunar ? 'block' : 'none'};">${lunarDateStr}</p>
            <p class="rc-solar-date-lbl" style="margin: 0 0 3px 0; font-size: 11px; color: #1e293b;">${solarDateStr}</p>
            <p style="margin: 0 0 40px 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">មូលវិចារគ្រូទទួលបន្ទុកថ្នាក់</p>
            <p style="margin: 0; color: #64748b;">................................................</p>
         </div>
       </div>
       <div style="border-top: 1.5px dashed #94a3b8; padding-top: 3mm;">
         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;"><p style="margin: 0; font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a;">មតិរបស់មាតាបិតា - អាណាព្យាបាលសិស្ស</p><p style="margin: 0; font-size: 10.5px; color: #64748b;">ហត្ថលេខា ឬស្នាមមេដៃ</p></div>
         <div style="line-height: 1.9; font-size: 11.5px; color: #94a3b8; letter-spacing: 1px;"><div>......................................................................................................................................................</div><div>......................................................................................................................................................។</div></div>
       </div>
    </div>
  `;
};

window.generateCoverAndProfileHTML = function(stu) {
    let fullStu = { ...stu };
    try {
        const allStus = JSON.parse(localStorage.getItem('academic_students')) || window.allStudents || [];
        const found = allStus.find(s => String(s.id).trim() === String(stu.id).trim());
        if (found) fullStu = { ...found, ...stu };
    } catch(e) {}

    const levelStr = document.getElementById("globalLevelSelect")?.value || fullStu.grade || "ថ្នាក់ទី 7";
    const room = document.getElementById("globalRoomSelect")?.value || fullStu.room || "«ខ»";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា ដីឥដ្ឋ";
    const clusterName = sInfo.cluster || sInfo.school_cluster || "កម្រងដីឥដ្ឋ";
    const schoolPhone = sInfo.phone || sInfo.school_phone || "012 345 678"; 
    const academicYear = sInfo.academic_year || "2026-2027"; 

    const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    let birthDay = "", birthMonth = "", birthYear = "";
    
    let cleanDob = String(fullStu.dob || "").replace(/["'\s]/g, "").replace(/T[0-9:\.Z]+/gi, "").replace(/-/g, '/');
    if (cleanDob && cleanDob.includes("/")) {
        const parts = cleanDob.split("/");
        if (parts.length >= 3) {
            if (parts[0].length === 4) {
                birthYear = parts[0];
                const mIdx = parseInt(parts[1], 10) - 1;
                birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : parts[1];
                birthDay = parseInt(parts[2], 10).toString();
            } else { 
                birthDay = parseInt(parts[0], 10).toString();
                const mIdx = parseInt(parts[1], 10) - 1;
                birthMonth = (mIdx >= 0 && mIdx < 12) ? khmerMonths[mIdx] : parts[1];
                birthYear = parts[2];
            }
        }
    } else if (cleanDob) { birthDay = cleanDob; }

    let fullDobKhmer = (birthDay && birthMonth && birthYear) ? `ថ្ងៃទី ${birthDay} ខែ ${birthMonth} ឆ្នាំ ${birthYear}` : birthDay;

    const renderField = (val, defaultDots = "....................................................") => {
        if (val && String(val).trim() !== "" && !String(val).includes("...")) return `<span contenteditable="true" style="font-weight: bold; color: #1e3a8a; font-family: 'Siemreap', sans-serif;">${String(val).trim()}</span>`;
        return `<span contenteditable="true" style="color: #94a3b8; letter-spacing: 1px;">${defaultDots}</span>`;
    };

    const photoSrc = fullStu.photo_url || fullStu.photo || "";

    return `
      <!-- ទំព័រទី ១៖ ក្របមុខ -->
      <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 8mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
        <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" style="width: 100%; height: 100%; padding: 12mm 14mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; background: radial-gradient(circle at 50% 15%, rgba(241, 245, 249, 0.6) 0%, #ffffff 70%);">
           <div style="position: absolute; top: 2.5mm; bottom: 2.5mm; left: 2.5mm; right: 2.5mm; border: 1px solid #93c5fd; pointer-events: none; border-radius: 4px;"></div>
           <div style="position: absolute; top: 4mm; bottom: 4mm; left: 4mm; right: 4mm; border: 0.5px dashed #cbd5e1; pointer-events: none;"></div>
           <div style="position: absolute; top: 5.5mm; left: 5.5mm; width: 15px; height: 15px; border-top: 2.5px solid #d97706; border-left: 2.5px solid #d97706;"></div>
           <div style="position: absolute; top: 5.5mm; right: 5.5mm; width: 15px; height: 15px; border-top: 2.5px solid #d97706; border-right: 2.5px solid #d97706;"></div>
           <div style="position: absolute; bottom: 5.5mm; left: 5.5mm; width: 15px; height: 15px; border-bottom: 2.5px solid #d97706; border-left: 2.5px solid #d97706;"></div>
           <div style="position: absolute; bottom: 5.5mm; right: 5.5mm; width: 15px; height: 15px; border-bottom: 2.5px solid #d97706; border-right: 2.5px solid #d97706;"></div>

           <div style="text-align: center; margin-top: 3mm;">
              <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15.5px; color: #1e3a8a; letter-spacing: 0.5px;">ព្រះរាជាណាចក្រកម្ពុជា</h2>
              <h3 style="margin: 3px 0 0 0; font-family: 'Moul', serif; font-size: 13px; color: #1e3a8a; letter-spacing: 0.5px;">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px auto 10px auto; width: 60%;"><div style="height: 1px; flex: 1; background: linear-gradient(to right, transparent, #d97706);"></div><span style="color: #d97706; font-size: 11px;">❖ ❖ ❖</span><div style="height: 1px; flex: 1; background: linear-gradient(to left, transparent, #d97706);"></div></div>
              <div style="margin-top: 4mm;">
                 <p style="margin: 0; font-family: 'Moul', serif; font-size: 13.5px; color: #334155;">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                 <h1 contenteditable="true" style="margin: 4px 0 0 0; font-family: 'Moul', serif; font-size: 20px; color: #1e3a8a; text-shadow: 0 1px 2px rgba(30,58,138,0.1);">${schoolName}</h1>
                 <div style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 2px 14px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 5px;"><span style="font-size: 11px; color: #475569; font-weight: bold;">កម្រងសាលា ៖ ${clusterName || 'ទូទៅ'}</span><span style="color: #cbd5e1;">|</span><span style="font-size: 11px; color: #475569; font-weight: bold;">ទូរសព្ទ ៖ <span style="font-family: monospace;">${schoolPhone}</span></span></div>
              </div>
           </div>
           <div style="display: flex; justify-content: center; margin: 2mm 0;">
              <div style="position: relative; width: 78px; height: 78px;">
                 <svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="47" stroke="#1e3a8a" stroke-width="2.5" fill="#f8fafc"/><circle cx="50" cy="50" r="42" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3 2"/><path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><path d="M50 63C41 57 30 58 22 60V36C30 34 41 34 50 39C59 34 70 34 78 36V60C70 58 59 57 50 63Z" fill="#1e3a8a"/><path d="M50 39V63" stroke="#ffffff" stroke-width="1.8"/><path d="M48 23H52V35H48V23Z" fill="#f59e0b"/><path d="M50 16C46 19.5 46 22 50 24C54 22 54 19.5 50 16Z" fill="#ef4444"/><circle cx="50" cy="50" r="3.5" fill="#ffffff"/></svg>
              </div>
           </div>
           <div style="text-align: center; margin: 2mm 0;">
              <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #2563eb 100%); padding: 9px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2); display: inline-block; min-width: 78%; border: 1.5px solid #fbbf24;">
                 <h1 style="margin: 0; font-family: 'Moul', serif; font-size: 23px; color: #ffffff; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">សៀវភៅតាមដានការសិក្សា</h1>
                 <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: bold; color: #fef08a; letter-spacing: 2px; text-transform: uppercase;">Student Academic Progress Record</p>
              </div>
           </div>
           <div style="margin: 2mm auto; width: 88%; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 14px 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px;">
                 <div style="display: flex; align-items: baseline; gap: 8px;"><span style="font-size: 13px; font-weight: bold; color: #64748b;">សិស្សឈ្មោះ ៖</span><span style="font-family: 'Moul', serif; font-size: 17px; color: #1e3a8a;">${fullStu.name}</span></div>
                 <div style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">ភេទ ៖ ${fullStu.gender || 'ប្រុស'}</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12.5px; text-align: center;">
                 <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 6px; border-radius: 10px;"><div style="font-size: 10.5px; color: #64748b; font-weight: bold; margin-bottom: 2px;">អត្តលេខសិស្ស</div><div style="font-family: monospace; font-weight: bold; font-size: 15px; color: #0f172a;">${fullStu.id || '........'}</div></div>
                 <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 8px 6px; border-radius: 10px;"><div style="font-size: 10.5px; color: #db2777; font-weight: bold; margin-bottom: 2px;">ថ្នាក់រៀន</div><div style="font-family: 'Moul', serif; font-size: 13.5px; color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</div></div>
                 <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 6px; border-radius: 10px;"><div style="font-size: 10.5px; color: #16a34a; font-weight: bold; margin-bottom: 2px;">ឆ្នាំសិក្សា</div><div style="font-family: monospace; font-weight: bold; font-size: 14.5px; color: #15803d;">${academicYear}</div></div>
              </div>
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #64748b;">
                 <span>ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឌីជីថល (Digital School Platform)</span><span style="color: #10b981; font-weight: bold;">● ឯកសារផ្លូវការ</span>
              </div>
           </div>
           <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10mm; margin-bottom: 1mm;">
              <div style="font-size: 10.5px; color: #64748b; line-height: 1.6;"><div>• គោរពតាមកម្មវិធីសិក្សា និងបទបញ្ជាផ្ទៃក្នុងរបស់ក្រសួងអប់រំ</div><div>• បោះពុម្ពចេញពីប្រព័ន្ធស្វ័យប្រវត្តិកាលបរិច្ឆេទ ៖ ${window.getFormattedSolarDate()}</div></div>
              <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 8px;"><svg width="34" height="34" viewBox="0 0 24 24" fill="#1e3a8a"><path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 12h8v8H2v-8zm2 2v4h4v-4H4zm10-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm2 4h2v2h-2v-2zm-4 0h2v2h-2v-2z"/></svg><div style="font-size: 9px; color: #475569; font-weight: bold; line-height: 1.2;">ស្កេនពិនិត្យ<br><span style="color: #2563eb;">E-Portfolio</span></div></div>
           </div>
        </div>
      </div>

      <!-- ទំព័រទី ២៖ ព័ត៌មានលម្អិតសិស្ស -->
      <div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 8mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">
        <div class="report-booklet-page bg-white box-border text-slate-900 shadow-xl print:shadow-none" style="width: 100%; height: 100%; padding: 10mm 14mm; border: 2.5px solid #1e3a8a; position: relative; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
           <div style="position: absolute; top: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; top: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; bottom: 3.5mm; left: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div><div style="position: absolute; bottom: 3.5mm; right: 4mm; font-size: 14px; font-weight: bold; color: #1e3a8a;">❖</div>
           <div>
              <div style="text-align: center; margin-bottom: 4mm; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">
                 <h2 style="margin: 0; font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">ជីវប្រវត្តិសង្ខេបសិស្ស និងព័ត៌មានអាណាព្យាបាល</h2>
                 <p style="margin: 1px 0 0 0; font-size: 11px; color: #64748b; font-weight: bold;">សាលាចំណេះទូទៅ • ${schoolName}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 3mm; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
                 <div style="flex: 1; font-size: 13px; line-height: 2.1;">
                    <div style="display: flex; gap: 16px; align-items: baseline;"><span>ឈ្មោះសិស្ស ៖ <b style="font-family: 'Moul', serif; font-size: 15px; color: #1e3a8a;">${fullStu.name}</b></span><span>ភេទ ៖ <b>${fullStu.gender || 'ប្រុស'}</b></span><span>អត្តលេខ ៖ <b style="font-family: monospace; font-size: 14px; color: #1e3a8a;">${fullStu.id || '........'}</b></span></div>
                    <div>ថ្នាក់ទី ៖ <b style="color: #be123c;">${levelStr.replace('ថ្នាក់ទី ', '')} ${room}</b>&nbsp;&nbsp;&nbsp;&nbsp; ឆ្នាំសិក្សា ៖ <b style="font-family: monospace; color: #1e3a8a;">${academicYear}</b></div>
                    <div>សាលារៀន ៖ <span style="font-weight: bold; color: #334155;">${schoolName}</span>&nbsp;&nbsp;&nbsp;&nbsp; កម្រង ៖ <span>${renderField(clusterName, ".....................")}</span></div>
                 </div>
                 <div style="width: 28mm; height: 36mm; border: 2px dashed #93c5fd; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #ffffff; flex-shrink: 0; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    ${photoSrc ? `<img src="${photoSrc}" style="width: 100%; height: 100%; object-fit: cover;">` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="#94a3b8" style="margin-bottom: 2px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span style="font-size: 10px; font-weight: bold; color: #64748b;">រូបថត 4 x 6</span>`}
                 </div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 12.5px; line-height: 2.3; color: #1e293b; background: #ffffff;">
                 <div style="font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;">I. ទីកន្លែងកំណើត និងអាសយដ្ឋានបច្ចុប្បន្ន</div>
                 <div>• ថ្ងៃខែឆ្នាំកំណើត ៖ ${renderField(fullDobKhmer, "ថ្ងៃទី...... ខែ................ ឆ្នាំ20......")}&nbsp;&nbsp; នៅភូមិ/ក្រុម ៖ ${renderField(fullStu.pob_village, "........................")}</div>
                 <div>• ឃុំ/សង្កាត់ ៖ ${renderField(fullStu.pob_commune, "........................")}&nbsp;&nbsp; ស្រុក/ខណ្ឌ ៖ ${renderField(fullStu.pob_district, "........................")}&nbsp;&nbsp; ខេត្ត/ក្រុង ៖ ${renderField(fullStu.pob_province, "........................")}</div>
                 <div>• អាសយដ្ឋានបច្ចុប្បន្ន ៖ ផ្ទះលេខ ${renderField(fullStu.house_no, "....")}&nbsp; ផ្លូវ ${renderField(fullStu.street, "....")}&nbsp; ភូមិ ${renderField(fullStu.curr_village, "................")}&nbsp; ឃុំ/សង្កាត់ ${renderField(fullStu.curr_commune, "................")}</div>
                 <div>• ស្រុក/ខណ្ឌ ៖ ${renderField(fullStu.curr_district, ".........................")}&nbsp;&nbsp; ខេត្ត/ក្រុង ៖ ${renderField(fullStu.curr_province, ".........................")}</div>
                 <div style="font-family: 'Moul', serif; font-size: 11.5px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-top: 8px; margin-bottom: 4px;">II. ព័ត៌មានមាតាបិតា និងអាណាព្យាបាល</div>
                 <div>• ឪពុកឈ្មោះ ៖ ${renderField(fullStu.father_name)}&nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.father_job)}</div>
                 <div>• ម្ដាយឈ្មោះ ៖ ${renderField(fullStu.mother_name)}&nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.mother_job)}</div>
                 <div>• អាណាព្យាបាលឈ្មោះ ៖ ${renderField(fullStu.guardian_name || fullStu.father_name || fullStu.mother_name)}&nbsp;&nbsp;&nbsp;&nbsp; មុខរបរ ៖ ${renderField(fullStu.guardian_job || fullStu.father_job || fullStu.mother_job)}</div>
                 <div>• លេខទូរស័ព្ទទំនាក់ទំនងអាណាព្យាបាល ៖ <span style="font-family: monospace; font-weight: bold; color: #1e3a8a;">${renderField(fullStu.phone || fullStu.contact, "....................................")}</span></div>
              </div>
              <div style="margin-top: 3mm; background: #eff6ff; border-left: 3.5px solid #2563eb; padding: 6px 12px; border-radius: 4px; font-size: 11px; color: #1e40af; font-style: italic;">« ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាថានឹងគោរពប្រតិបត្តិតាមបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀន ឧស្សាហ៍ព្យាយាមរៀនសូត្រ និងគោរពវិន័យឱ្យបានខ្ជាប់ខ្ជួនបំផុត »</div>
           </div>
           <div style="display: flex; justify-content: space-between; text-align: center; font-size: 12.5px; margin-top: 4mm; padding-top: 3mm; border-top: 1.5px solid #e2e8f0;">
              <div style="width: 44%;"><p style="margin: 0 0 45px 0; font-weight: bold; color: #334155;">ហត្ថលេខា ឬស្នាមមេដៃអាណាព្យាបាល</p><p style="margin: 0; color: #94a3b8; font-size: 11px;">............................................................</p></div>
              <div style="width: 44%;"><p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">${window.getFormattedSolarDate()}</p><p style="margin: 0 0 35px 0; font-family: 'Moul', serif; font-size: 12.5px; color: #1e3a8a;">នាយកសាលា</p><p style="margin: 0; color: #94a3b8; font-size: 11px;">............................................................</p></div>
           </div>
        </div>
      </div>
    `;
};

window.printReportCards = function() {
  const allStudents = window.rankingsDataList;
  if (!allStudents || allStudents.length === 0) return alert("គ្មានទិន្នន័យដើម្បីបោះពុម្ពទេ!");

  let printStudents = allStudents;
  if (window.selectedReportCardStudentId && window.selectedReportCardStudentId !== 'all') {
    printStudents = allStudents.filter(s => String(s.id).trim() === String(window.selectedReportCardStudentId).trim());
  }

  let fullHtml = "";
  printStudents.forEach(s => {
    if (window.reportCardPrintType === 'cover_page') {
      fullHtml += window.generateCoverAndProfileHTML(s);
    } else if (window.reportCardPrintType === 'full_booklet') {
      fullHtml += window.generateCoverAndProfileHTML(s) + `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
    } else {
      fullHtml += `<div class="print-page-wrapper" style="width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; page-break-after: always; display: flex; align-items: center; justify-content: center;">${window.generateMonthlySheetHTML(s, null)}</div>`;
    }
  });

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>បោះពុម្ពសៀវភៅតាមដានការសិក្សា</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 portrait; margin: 0mm !important; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0 !important; padding: 0 !important; background: #fff; font-family: 'Siemreap', sans-serif; display: flex; flex-direction: column; align-items: center; }
        .font-moul { font-family: 'Moul', serif !important; }
        .print-page-wrapper { page-break-after: always; break-after: page; margin: 0 auto; }
        @media print { .no-print { display: none !important; } }
      </style>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      ${fullHtml}
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=1050,height=900');
  printWin.document.open();
  printWin.document.write(printDocument);
  printWin.document.close();

  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 800);
};

window.selectConductTemplate = function(studentId, text) {
  const displayEl = document.getElementById(`conduct_display_${studentId}`);
  if (displayEl) displayEl.innerText = text;
  try { localStorage.setItem(`conduct_${studentId}`, text); } catch(e) {}
  if (window.rankingsDataList) {
    const s = window.rankingsDataList.find(item => String(item.id).trim() === String(studentId).trim());
    if (s) s.conduct = text;
  }
};

window.applyConductToAll = function(selectedTemplate) {
  if (!selectedTemplate) return;
  (window.rankingsDataList || []).forEach(s => {
    window.selectConductTemplate(s.id, selectedTemplate);
    const selEl = document.getElementById(`conduct_select_${s.id}`);
    if (selEl) selEl.value = selectedTemplate;
  });
  if (typeof showToast === 'function') showToast("✅ បានអនុវត្តគំរូវិន័យសីលធម៌ដល់សិស្សទាំងអស់!");
};

window.triggerMobilePrint = function(styleBlock, htmlBody) {
    let printArea = document.getElementById('mobile-print-area');
    if (printArea) printArea.remove();
    
    printArea = document.createElement('div');
    printArea.id = 'mobile-print-area';
    document.body.appendChild(printArea);
    
    let oldCss = document.getElementById('mobile-print-global-css');
    if (oldCss) oldCss.remove();

    let printCSS = document.createElement('style');
    printCSS.id = 'mobile-print-global-css';
    printCSS.innerHTML = `
        @media print {
            body > *:not(#mobile-print-area) { display: none !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            #mobile-print-area { display: block !important; width: 100%; position: absolute; top: 0; left: 0; background: white; z-index: 999999; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen {
            #mobile-print-area { display: none !important; }
        }
    `;
    document.head.appendChild(printCSS);
    printArea.innerHTML = styleBlock + htmlBody;
    
    setTimeout(() => { window.print(); }, 800); 
};


// =====================================================================
// 🔴 ផ្នែកទី ៣៖ មុខងារតារាងកិត្តិយស (Honor Board Content & Canva Tools)
// =====================================================================
window.renderHonorBoardContent = function() {
    window.calculateAllScores();
    const container = document.getElementById("modal-content-honorboard") || document.getElementById("scoreTabContent-honorboard");
    if (!container) return;

    if (!window.rankingsDataList || window.rankingsDataList.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-slate-500 font-bold p-16 bg-white rounded-3xl border border-slate-200">
             <div class="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mb-4"><i class="fa-solid fa-trophy"></i></div>
             <h3 class="text-lg font-bold text-slate-700 font-moul mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់</h3>
             <p class="text-sm font-normal">សូមបញ្ចូលពិន្ទុ និងគណនាជាមុនសិន។</p>
          </div>`;
        return;
    }

    container.innerHTML = `
      <div class="w-full flex flex-col space-y-4 font-siemreap bg-slate-50 p-4 rounded-b-3xl min-h-full">
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4 no-print relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          
          <div class="flex flex-wrap items-center gap-3 pl-3">
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button onclick="window.setHonorTopCount(3)" class="px-4 py-1.5 rounded-lg transition ${window.honorBoardTopCount===3?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:bg-slate-200'}">Top 3</button>
              <button onclick="window.setHonorTopCount(5)" class="px-4 py-1.5 rounded-lg transition ${window.honorBoardTopCount===5?'bg-white text-amber-700 shadow-sm':'text-slate-500 hover:bg-slate-200'}">Top 5</button>
            </div>

            <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span class="text-slate-500 font-bold"><i class="fa-solid fa-palette text-amber-500"></i> ស្ទីល៖</span>
              <select onchange="window.setHonorTheme(this.value)" class="bg-transparent font-bold text-slate-800 outline-none cursor-pointer">
                <option value="gold" ${window.honorBoardTheme==='gold'?'selected':''}>✨ ពណ៌មាសប្រណីត (Gold)</option>
                <option value="blue" ${window.honorBoardTheme==='blue'?'selected':''}>🏛️ ពណ៌ខៀវផ្លូវការ (Blue)</option>
                <option value="slate" ${window.honorBoardTheme==='slate'?'selected':''}>💎 ប្រាក់ស្រាល (Silver)</option>
                <option value="clean" ${window.honorBoardTheme==='clean'?'selected':''}>📄 សាមញ្ញ (Minimal)</option>
              </select>
            </div>

            <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700">
              <button onclick="window.adjustHonorScale(-0.05)" class="w-7 h-7 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
              <span id="honorZoomLevelLbl" class="w-12 text-center font-mono text-indigo-700 bg-white py-1 rounded shadow-inner">${Math.round(window.honorBoardScale * 100)}%</span>
              <button onclick="window.adjustHonorScale(0.05)" class="w-7 h-7 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            </div>

            <div class="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-xl p-1 shadow-inner">
               <button onclick="window.addCustomText()" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-xs font-bold transition tooltip" title="បន្ថែមអក្សរថ្មី"><i class="fa-solid fa-t"></i></button>
               <button onclick="window.addCustomSticker('🏆')" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-sm font-bold transition">🏆</button>
               <button onclick="window.addCustomSticker('⭐')" class="px-3 py-1.5 hover:bg-white text-indigo-700 rounded-lg text-sm font-bold transition">⭐</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm m-0">
              <i class="fa-solid fa-camera"></i> ប្ដូរឡូហ្គោ
              <input type="file" accept="image/*" class="hidden" onchange="window.changeHonorLogo(event)">
            </label>

            <label class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm m-0">
              <i class="fa-solid fa-image"></i> បញ្ចូលស៊ុម (Frame)
              <input type="file" accept="image/*" class="hidden" onchange="window.changeHonorFrame(event)">
            </label>

            <button onclick="window.printOfficialHonorBoard()" class="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-black shadow-md transition flex items-center gap-2 transform hover:scale-105">
              <i class="fa-solid fa-print"></i> បោះពុម្ព
            </button>
          </div>
        </div>

        <div class="w-full flex justify-center overflow-auto p-4 md:p-8 bg-slate-300 rounded-3xl border border-slate-200 custom-scrollbar shadow-inner mt-3" id="top5HonorContainer" style="min-height: 800px;"></div>
      </div>
    `;
    renderTop5HonorBoard();
};

window.setHonorTopCount = function(count) { window.honorBoardTopCount = count; window.renderHonorBoardContent(); };
window.adjustHonorScale = function(delta) {
    window.honorBoardScale = Math.min(Math.max(window.honorBoardScale + delta, 0.4), 1.5);
    const board = document.getElementById("top5HonorPrintArea");
    if (board) board.style.transform = `scale(${window.honorBoardScale})`;
    const lbl = document.getElementById("honorZoomLevelLbl");
    if (lbl) lbl.textContent = `${Math.round(window.honorBoardScale * 100)}%`;
};
window.setHonorTheme = function(theme) { window.honorBoardTheme = theme; window.currentHonorBg = ""; renderTop5HonorBoard(); };
window.changeHonorFrame = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { window.currentHonorBg = e.target.result; renderTop5HonorBoard(); };
        reader.readAsDataURL(file);
    }
};
window.changeHonorLogo = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { window.currentHonorLogo = e.target.result; renderTop5HonorBoard(); };
        reader.readAsDataURL(file);
    }
};

function renderTop5HonorBoard() {
    const container = document.getElementById("top5HonorContainer");
    if (!container) return;

    const level = document.getElementById("globalLevelSelect")?.value || "ថ្នាក់ទី";
    const room = document.getElementById("globalRoomSelect")?.value || "";
    const periodType = document.getElementById("globalPeriodType")?.value || "monthly";
    const periodVal = document.getElementById("globalPeriodValue")?.value || "";
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const school_name = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
    const teacher_name = sInfo.teacher_name || "គ្រូបន្ទុកថ្នាក់";
    const principal_name = sInfo.principal_name || "នាយកសាលា";
    const academic_year = sInfo.academic_year || "២០២៦-២០២៧";
    const current_year = new Date().getFullYear();

    let periodTitleText = periodType === "monthly" ? `លទ្ធផលសិក្សាប្រចាំខែ ${periodVal}` : (periodType === "semester" ? `លទ្ធផលសិក្សាប្រចាំ${periodVal}` : `លទ្ធផលសិក្សាប្រចាំឆ្នាំសិក្សា ${window.toKhmerNum(academic_year)}`);

    const topStudents = window.rankingsDataList.filter(s => s.rank >= 1 && s.rank <= window.honorBoardTopCount);
    const getS = (r) => topStudents.find(s => s.rank === r) || null;

    const renderStudentCard = (stu, rankNum, isChampion = false) => {
        let theme = {};
        if (rankNum === 1) theme = { border: 'border-amber-400', ring: 'ring-amber-200', badge: 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600', shadow: 'shadow-amber-500/40', medal: '🥇' };
        else if (rankNum === 2) theme = { border: 'border-slate-300', ring: 'ring-slate-200', badge: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500', shadow: 'shadow-slate-500/30', medal: '🥈' };
        else if (rankNum === 3) theme = { border: 'border-orange-400', ring: 'ring-orange-200', badge: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600', shadow: 'shadow-orange-500/40', medal: '🥉' };
        else theme = { border: 'border-indigo-400', ring: 'ring-indigo-200', badge: 'bg-gradient-to-br from-indigo-500 to-indigo-700', shadow: 'shadow-indigo-500/30', medal: '⭐' };

        const cardScale = isChampion ? 'w-[145px]' : 'w-[125px]';
        const photoBox = isChampion ? 'w-[115px] h-[150px]' : 'w-[100px] h-[130px]';
        const badgeSize = isChampion ? 'w-11 h-11 text-sm -top-3 -right-3' : 'w-9 h-9 text-xs -top-2.5 -right-2.5';
        
        if (!stu) return `<div class="canva-el cursor-grab flex flex-col items-center justify-center ${photoBox} border-2 border-dashed border-slate-400 bg-white/40 text-slate-500 text-xs font-bold rounded-2xl opacity-60 mx-auto backdrop-blur-sm"><i class="fa-solid fa-user-slash text-xl mb-2"></i> ទទេ</div>`;

        const photoSrc = stu.photo_url || stu.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.name)}&background=random&size=200`;

        return `
          <div class="canva-el cursor-grab flex flex-col items-center relative z-10 ${cardScale} mx-auto transition-transform duration-200 hover:scale-105 group hover:z-50">
            <div class="relative">
              <div class="absolute ${badgeSize} rounded-full ${theme.badge} text-white font-black flex items-center justify-center shadow-xl border-[2.5px] border-white z-20 font-moul pointer-events-none transition-transform group-hover:rotate-12">${theme.medal} ${window.toKhmerNum(rankNum.toString())}</div>
              <div class="${photoBox} rounded-2xl overflow-hidden border-[3.5px] ${theme.border} shadow-xl ${theme.shadow} ring-[3px] ${theme.ring} bg-white pointer-events-none"><img src="${photoSrc}" class="w-full h-full object-cover"></div>
            </div>
            <div class="mt-3 bg-white/95 backdrop-blur-md border border-white rounded-2xl w-[115%] p-2.5 text-center shadow-lg relative z-10 hover:ring-2 hover:ring-dashed hover:ring-blue-400">
              <h4 contenteditable="true" spellcheck="false" class="font-moul text-[12px] truncate outline-none hover:bg-slate-100 px-1 rounded text-slate-900 drop-shadow-sm">${stu.name}</h4>
              <div class="inline-flex bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-600 shadow-inner mt-1.5 pointer-events-none">
                 មធ្យម៖ <span class="text-indigo-700 font-mono text-[11px] font-black pointer-events-auto ml-1" contenteditable="true" spellcheck="false">${stu.avg.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
    };

    let themeBg = "";
    let wrapperBorder = "";
    if (window.currentHonorBg) {
        themeBg = `<img src="${window.currentHonorBg}" class="absolute inset-0 w-full h-full object-fill z-0 print:object-fill">`;
        wrapperBorder = "border-none bg-white";
    } else {
        if (window.honorBoardTheme === 'blue') {
            themeBg = `<div class="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-slate-100 z-0"></div><div class="absolute inset-4 border-[4px] border-double border-blue-600/30 rounded-3xl z-0 pointer-events-none"></div>`;
            wrapperBorder = "border-[8px] border-solid border-blue-900/10 bg-white";
        } else if (window.honorBoardTheme === 'slate') {
            themeBg = `<div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200 z-0"></div><div class="absolute inset-4 border-[2px] border-slate-300 rounded-3xl z-0 pointer-events-none"></div>`;
            wrapperBorder = "border border-slate-300 bg-white";
        } else if (window.honorBoardTheme === 'clean') {
            themeBg = `<div class="absolute inset-0 bg-white z-0"></div>`;
            wrapperBorder = "border border-slate-200 bg-white";
        } else {
            themeBg = `
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 via-white to-orange-50/50 z-0"></div>
              <div class="absolute inset-5 border-[6px] border-double border-amber-600/30 rounded-3xl z-0 pointer-events-none"></div>
              <div class="absolute top-8 left-8 text-amber-500/40 text-2xl pointer-events-none">❖</div><div class="absolute top-8 right-8 text-amber-500/40 text-2xl pointer-events-none">❖</div>
              <div class="absolute bottom-8 left-8 text-amber-500/40 text-2xl pointer-events-none">❖</div><div class="absolute bottom-8 right-8 text-amber-500/40 text-2xl pointer-events-none">❖</div>
            `;
            wrapperBorder = "border-[12px] border-double border-amber-700 bg-white";
        }
    }

    let studentGridHtml = "";
    if (window.honorBoardTopCount === 3) {
        studentGridHtml = `
          <div class="flex-1 flex flex-col justify-center items-center gap-10 relative z-10 w-full my-auto">
            <div class="flex justify-center w-full z-20">${renderStudentCard(getS(1), 1, true)}</div>
            <div class="flex justify-center gap-24 w-full z-10">${renderStudentCard(getS(2), 2)} ${renderStudentCard(getS(3), 3)}</div>
          </div>
        `;
    } else {
        studentGridHtml = `
          <div class="flex-1 flex flex-col justify-center items-center gap-4 relative z-10 w-full my-auto">
            <div class="flex justify-center w-full z-30">${renderStudentCard(getS(1), 1, true)}</div>
            <div class="flex justify-center gap-16 w-full z-20">${renderStudentCard(getS(2), 2)} ${renderStudentCard(getS(3), 3)}</div>
            <div class="flex justify-center gap-24 w-full z-10">${renderStudentCard(getS(4), 4)} ${renderStudentCard(getS(5), 5)}</div>
          </div>
        `;
    }

    const paddingClass = window.currentHonorBg ? 'px-[75px] py-[65px]' : 'px-14 py-12';
    
    container.innerHTML = `
      <div id="top5HonorPrintArea" class="w-[794px] h-[1123px] relative flex flex-col justify-between print:w-[210mm] print:h-[297mm] shadow-2xl print:shadow-none text-slate-900 font-siemreap shrink-0 box-border overflow-hidden rounded-xl print:rounded-none ${wrapperBorder}" style="transform: scale(${window.honorBoardScale}); transform-origin: top center; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
        ${themeBg}
        <div class="w-full h-full relative z-10 flex flex-col ${paddingClass}">
            <div class="shrink-0 relative flex justify-between items-start w-full z-20">
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl text-center leading-tight transition-colors hover:bg-white/40 backdrop-blur-sm z-20">
                  <p contenteditable="true" spellcheck="false" class="font-moul text-amber-950 text-[13px] outline-none mt-1 hover:bg-white/60 px-2 py-0.5 rounded">${school_name}</p>
                </div>
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl text-center transition-colors hover:bg-white/40 backdrop-blur-sm z-20">
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-slate-900 outline-none drop-shadow-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[14px] mt-1 text-slate-800 outline-none drop-shadow-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div class="text-[10px] text-amber-600/70 tracking-[0.5em] mt-1 pointer-events-none">❖ ❖ ❖</div>
                </div>
            </div>

            <div class="text-center mt-3 mb-1 relative z-20 flex flex-col items-center gap-2">
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl transition-colors hover:bg-white/30 z-20">
                    <h1 contenteditable="true" spellcheck="false" class="font-moul text-[42px] text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 tracking-wider drop-shadow-sm outline-none inline-block px-4 py-1" style="-webkit-text-stroke: 0.5px rgba(255,255,255,0.7);">តារាងកិត្តិយស</h1>
                </div>
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-1 rounded-full transition-transform z-20">
                    <p contenteditable="true" spellcheck="false" class="font-bold text-[14px] text-amber-950 bg-white/90 inline-block px-6 py-1.5 rounded-full border border-amber-200 backdrop-blur-md shadow-sm outline-none">${periodTitleText}</p>
                </div>
                <div class="canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-2 rounded-xl transition-colors hover:bg-white/40 z-20">
                    <p class="text-amber-900 font-bold text-[13px]">ថ្នាក់រៀន ៖ <span contenteditable="true" class="text-[14px] outline-none font-moul text-rose-700 bg-white/50 px-2 rounded">${level.replace('ថ្នាក់ទី ', '')} ${room}</span> <span class="mx-2 text-slate-400">|</span> ឆ្នាំសិក្សា ៖ <span contenteditable="true" class="font-bold outline-none font-mono text-[14px] bg-white/50 px-2 rounded">${window.toKhmerNum(academic_year)}</span></p>
                </div>
            </div>

            ${studentGridHtml}

            <div class="shrink-0 mt-auto pt-4 relative z-10">
              <div class="flex justify-between items-end text-[13px] font-bold px-8">
                <div class="text-center canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-3 rounded-xl transition-colors hover:bg-white/50 backdrop-blur-sm">
                  <p contenteditable="true" spellcheck="false" class="mb-2 text-slate-800 outline-none font-normal">បានឃើញ និងឯកភាព</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[12px] text-slate-900 mb-10 outline-none">នាយកសាលា</p>
                  <div contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-indigo-950 outline-none min-w-[120px] border-b border-dashed border-transparent hover:border-slate-400 pb-1">${principal_name}</div>
                </div>
                <div class="text-center canva-el cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 p-3 rounded-xl transition-colors hover:bg-white/50 backdrop-blur-sm">
                  <p contenteditable="true" spellcheck="false" class="font-normal text-[11px] text-slate-700 mb-2 outline-none">ធ្វើនៅ....................., ថ្ងៃទី........ខែ........ឆ្នាំ ${window.toKhmerNum(current_year.toString())}</p>
                  <p contenteditable="true" spellcheck="false" class="font-moul text-[12px] text-slate-900 mb-10 outline-none">គ្រូទទួលបន្ទុកថ្នាក់</p>
                  <div contenteditable="true" spellcheck="false" class="font-moul text-[14px] text-indigo-950 outline-none min-w-[120px] border-b border-dashed border-transparent hover:border-slate-400 pb-1">${teacher_name}</div>
                </div>
              </div>
            </div>
        </div>
      </div>
    `;
    if (typeof window.initCanvaEngine === 'function') window.initCanvaEngine(); 
}

window.printOfficialHonorBoard = function() {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return alert("⚠️ រកមិនឃើញតារាងកិត្តិយសទេ!");

    if (typeof window.closeCanvaToolbar === 'function') window.closeCanvaToolbar();

    const clonedPrintArea = printArea.cloneNode(true);
    clonedPrintArea.style.transform = 'none'; 
    clonedPrintArea.style.width = '210mm';
    clonedPrintArea.style.height = '297mm';
    clonedPrintArea.style.boxShadow = 'none';
    clonedPrintArea.style.borderRadius = '0';
    
    const printContent = clonedPrintArea.outerHTML;

    const printDocument = `
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="utf-8">
        <title>បោះពុម្ពតារាងកិត្តិយស</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
          @page { size: A4 portrait; margin: 0mm !important; }
          * { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { margin: 0 !important; padding: 0 !important; display: flex; justify-content: center; background: #fff; font-family: 'Siemreap', sans-serif; }
          .font-moul { font-family: 'Moul', serif !important; }
          #top5HonorPrintArea { width: 210mm !important; height: 297mm !important; margin: 0 !important; border-radius: 0 !important; }
          .canva-el { outline: none !important; box-shadow: none !important; border: none !important; background: transparent !important; }
        </style>
      </head>
      <body class="font-siemreap">
        ${printContent}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 800);
};

let activeEl = null;
let isDragging = false;
let startX, startY, initialX, initialY;

window.initCanvaEngine = function() {
    let toolbar = document.getElementById('canva-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'canva-toolbar';
        toolbar.className = 'fixed z-[9999] hidden bg-slate-900/95 text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-1.5 flex flex-wrap items-center gap-1 border border-slate-700 backdrop-blur-md transition-opacity animate-fade-in no-print';
        toolbar.innerHTML = `
          <button onclick="window.changeFontSize(1)" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-slate-700 transition tooltip" title="ពង្រីកអក្សរ"><i class="fa-solid fa-plus text-sm"></i></button>
          <button onclick="window.changeFontSize(-1)" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-slate-700 transition tooltip" title="បង្រួមអក្សរ"><i class="fa-solid fa-minus text-sm"></i></button>
          <div class="w-px h-6 bg-slate-700 mx-1"></div>
          <div class="relative flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-700 transition overflow-hidden tooltip" title="ពណ៌អក្សរ">
             <input type="color" id="canvaTextColor" onchange="window.changeTextColor(this.value)" class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 opacity-0">
             <div id="colorIndicator" class="w-5 h-5 rounded-full border-2 border-white pointer-events-none" style="background-color: #000;"></div>
          </div>
          <div class="w-px h-6 bg-slate-700 mx-1"></div>
          <button onclick="window.deleteActiveElement()" class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-rose-500/80 text-rose-300 hover:text-white transition tooltip" title="លុប"><i class="fa-solid fa-trash-can text-sm"></i></button>
        `;
        document.body.appendChild(toolbar);
    }

    document.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('click', showToolbarOnClick);

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('click', showToolbarOnClick);
};

function dragStart(e) {
    if (e.target.tagName.toLowerCase() === 'input' || (e.target.contentEditable === 'true' && document.activeElement === e.target)) return;
    if (e.target.closest('.canva-el')) {
        isDragging = true;
        activeEl = e.target.closest('.canva-el');
        let currentTransform = activeEl.style.transform;
        initialX = 0; initialY = 0;
        if (currentTransform && currentTransform.includes("translate")) {
            const match = currentTransform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
            if (match) { initialX = parseFloat(match[1]); initialY = parseFloat(match[2]); }
        }
        startX = e.clientX; startY = e.clientY;
        activeEl.style.cursor = 'grabbing';
        activeEl.style.zIndex = '100';
    }
}

function drag(e) {
    if (isDragging && activeEl) {
        e.preventDefault(); 
        const scale = window.honorBoardScale || 1;
        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;
        activeEl.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        const toolbar = document.getElementById('canva-toolbar');
        if (toolbar && !toolbar.classList.contains('hidden')) updateToolbarPosition();
    }
}

function dragEnd(e) {
    isDragging = false;
    if (activeEl) {
        activeEl.style.cursor = 'grab';
        activeEl.style.zIndex = '10';
    }
}

function showToolbarOnClick(e) {
    const toolbar = document.getElementById('canva-toolbar');
    if (!toolbar) return;

    const clickedEl = e.target.closest('.canva-el');
    if (clickedEl && !isDragging) {
        activeEl = clickedEl;
        toolbar.classList.remove('hidden');
        updateToolbarPosition();
        
        const colorPicker = document.getElementById('canvaTextColor');
        const colorInd = document.getElementById('colorIndicator');
        if(colorPicker && colorInd) {
            const textTarget = activeEl.querySelector('[contenteditable="true"]') || activeEl;
            const rgb = window.getComputedStyle(textTarget).color;
            const hex = rgbToHex(rgb) || '#000000';
            colorPicker.value = hex;
            colorInd.style.backgroundColor = hex;
        }
    } else if (!e.target.closest('#canva-toolbar') && !isDragging) {
        window.closeCanvaToolbar();
    }
}

function updateToolbarPosition() {
    const toolbar = document.getElementById('canva-toolbar');
    if (toolbar && activeEl) {
        const rect = activeEl.getBoundingClientRect();
        toolbar.style.top = `${rect.top - 60}px`;
        toolbar.style.left = `${rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
    }
}

window.closeCanvaToolbar = function() {
    const toolbar = document.getElementById('canva-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
};

window.changeFontSize = function(delta) {
    if (!activeEl) return;
    const target = activeEl.querySelector('[contenteditable="true"]') || activeEl;
    const currentSize = parseFloat(window.getComputedStyle(target).fontSize);
    target.style.fontSize = `${currentSize + (delta * 3)}px`;
    target.style.lineHeight = 'normal';
    updateToolbarPosition();
};

window.changeTextColor = function(color) {
    if (!activeEl) return;
    const targets = activeEl.querySelectorAll('[contenteditable="true"]');
    if (targets.length > 0) {
        targets.forEach(t => { t.style.color = color; t.style.webkitTextFillColor = color; t.style.backgroundImage = 'none'; });
    } else {
        activeEl.style.color = color;
    }
    const colorInd = document.getElementById('colorIndicator');
    if(colorInd) colorInd.style.backgroundColor = color;
};

window.deleteActiveElement = function() {
    if (activeEl) {
        activeEl.remove();
        window.closeCanvaToolbar();
    }
};

window.addCustomText = function() {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return;
    const newEl = document.createElement("div");
    newEl.className = "canva-el absolute z-50 p-2 cursor-grab outline-none hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm transition-transform";
    newEl.style.top = "40%";
    newEl.style.left = "40%";
    newEl.innerHTML = `<p contenteditable="true" spellcheck="false" class="font-moul text-[24px] text-slate-800 outline-none">អត្ថបទថ្មី</p>`;
    printArea.appendChild(newEl);
};

window.addCustomSticker = function(emoji) {
    const printArea = document.getElementById("top5HonorPrintArea");
    if (!printArea) return;
    const newEl = document.createElement("div");
    newEl.className = "canva-el absolute z-50 p-2 cursor-grab hover:ring-2 hover:ring-dashed hover:ring-blue-400 rounded-full text-[60px] drop-shadow-lg transition-transform hover:scale-110";
    newEl.style.top = "40%";
    newEl.style.left = "40%";
    newEl.innerHTML = emoji;
    printArea.appendChild(newEl);
};

function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return null;
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

// =====================================================================
// 🔴 ផ្នែកទី ៤៖ មុខងារគ្រប់គ្រងមុខវិជ្ជា (Subject Manager)
// =====================================================================

window.SUBJECT_COLOR_THEMES = [
    { name: "ខៀវ (ភាសាខ្មែរ)", color: "#dbeafe", borderColor: "#93c5fd", textColor: "#1e3a8a" },
    { name: "ស្វាយ (គណិតវិទ្យា)", color: "#ede9fe", borderColor: "#c4b5fd", textColor: "#4c1d95" },
    { name: "បៃតង (វិទ្យាសាស្ត្រ)", color: "#dcfce7", borderColor: "#86efac", textColor: "#14532d" },
    { name: "លឿង (សិក្សាសង្គម)", color: "#fef9c3", borderColor: "#fde047", textColor: "#713f12" },
    { name: "ផ្កាឈូក (អប់រំកាយ/សិល្បៈ)", color: "#ffe4e6", borderColor: "#fda4af", textColor: "#881337" },
    { name: "ផ្ទៃមេឃ (ភាសាបរទេស)", color: "#e0f2fe", borderColor: "#7dd3fc", textColor: "#0c4a6e" },
    { name: "ប្រផេះ (ទូទៅ)", color: "#f1f5f9", borderColor: "#cbd5e1", textColor: "#1e293b" }
];

window.openSubjectManagerModal = function() {
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const levelStr = document.getElementById("globalLevelSelect")?.value || sInfo.teacher_level || "ថ្នាក់ទី ១";
    const roomStr = document.getElementById("globalRoomSelect")?.value || sInfo.teacher_room || "«ក»";
    const gradeFull = `${levelStr} ${roomStr}`;
    const schoolLevel = window.getSchoolLevel(levelStr);
    const type = document.getElementById("globalPeriodType")?.value || "monthly";
    const trackStr = document.getElementById("globalTrackSelect")?.value || "sci";

    // ទាញយក Schema បច្ចុប្បន្នមកដាក់ក្នុងអថេរបណ្ដោះអាសន្នសម្រាប់ការកែប្រែ
    window.tempEditingSchema = JSON.parse(JSON.stringify(window.getScoreSchema(schoolLevel, type, trackStr)));

    const oldModal = document.getElementById("subjectManagerModal");
    if (oldModal) oldModal.remove();

    const modalHtml = `
        <div id="subjectManagerModal" class="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 font-siemreap z-[999999] animate-fade-in">
            <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-5 flex justify-between items-center text-white shrink-0">
                    <div class="flex items-center gap-3.5">
                        <div class="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl border border-white/20 shadow-inner"><i class="fa-solid fa-layer-group"></i></div>
                        <div>
                            <h3 class="font-moul text-base sm:text-lg">គ្រប់គ្រង និងបន្ថែមមុខវិជ្ជាសិក្សា</h3>
                            <p class="text-xs text-blue-100 mt-0.5">កំណត់មុខវិជ្ជា ពិន្ទុអតិបរមា និងមេគុណសម្រាប់៖ <b class="font-moul text-[11px]">${gradeFull}</b></p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('subjectManagerModal').remove()" class="w-9 h-9 rounded-full bg-white/15 hover:bg-rose-500 text-white flex items-center justify-center transition"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <div class="p-4 sm:p-5 bg-indigo-50/70 border-b border-indigo-100 shrink-0">
                    <div class="text-xs font-moul text-indigo-900 mb-3 flex items-center gap-2"><i class="fa-solid fa-circle-plus text-indigo-600"></i> បន្ថែមមុខវិជ្ជាថ្មីចូលក្នុងតារាង</div>
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div class="sm:col-span-3">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1">ក្រុមមុខវិជ្ជាគោល</label>
                            <input type="text" id="newSubGroupInput" list="existingGroupsList" placeholder="ឧ. ភាសាបរទេស" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500">
                            <datalist id="existingGroupsList"></datalist>
                        </div>
                        <div class="sm:col-span-3">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1">ឈ្មោះមុខវិជ្ជា (រង)</label>
                            <input type="text" id="newSubNameInput" placeholder="ឧ. អង់គ្លេស" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1">ពិន្ទុអតិបរមា</label>
                            <input type="number" id="newSubMaxInput" value="10" min="1" max="500" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center text-slate-800 bg-white outline-none focus:border-indigo-500">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1">ពណ៌កូឡោន</label>
                            <select id="newSubColorSelect" class="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500 cursor-pointer">
                                ${window.SUBJECT_COLOR_THEMES.map((t, i) => `<option value="${i}">${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="sm:col-span-2">
                            <button type="button" onclick="window.addSubjectToTempSchema()" class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"><i class="fa-solid fa-plus"></i> បន្ថែម</button>
                        </div>
                    </div>
                </div>

                <div id="subjectManagerListArea" class="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 bg-slate-50"></div>

                <div class="p-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
                    <button type="button" onclick="window.resetSchemaToDefault()" class="px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold border border-rose-200 text-xs transition flex items-center gap-2"><i class="fa-solid fa-rotate-left"></i> កំណត់មុខវិជ្ជាដើមវិញ (Default)</button>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="document.getElementById('subjectManagerModal').remove()" class="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 text-xs transition">បោះបង់</button>
                        <button type="button" onclick="window.saveCustomSubjectSchema()" class="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md text-xs flex items-center gap-2 transition active:scale-95"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក & អនុវត្តលើតារាង</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    window.renderSubjectManagerList();
};

window.renderSubjectManagerList = function() {
    const container = document.getElementById("subjectManagerListArea");
    const datalist = document.getElementById("existingGroupsList");
    if (!container) return;

    if (datalist) datalist.innerHTML = window.tempEditingSchema.map(g => `<option value="${g.group}">`).join("");

    if (window.tempEditingSchema.length === 0) {
        container.innerHTML = `<div class="p-10 text-center text-slate-400 font-bold">មិនទាន់មានមុខវិជ្ជាទេ! សូមបន្ថែមមុខវិជ្ជាខាងលើ។</div>`;
        return;
    }

    container.innerHTML = window.tempEditingSchema.map((group, gIdx) => {
        const subs = (group.subs && group.subs.length > 0) ? group.subs : [{ name: group.group, key: group.key, max: group.max || 10, coeff: group.coeff || 1 }];
        const subsHtml = subs.map((sub, sIdx) => `
            <div class="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 transition">
                <div class="flex items-center gap-2.5 flex-1 min-w-[180px]">
                    <span class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center shadow-sm">${sIdx + 1}</span>
                    <input type="text" value="${sub.name}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'name', this.value)" class="px-2.5 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent focus:bg-white font-bold text-xs text-slate-800 outline-none flex-1 transition-all">
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span>ពិន្ទុពេញ:</span>
                        <input type="number" value="${sub.max || 10}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'max', parseFloat(this.value)||10)" class="w-12 border-none bg-transparent text-center font-mono font-bold text-xs text-indigo-700 outline-none">
                    </div>
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <span>មេគុណ:</span>
                        <input type="number" value="${sub.coeff || 1}" onchange="window.updateTempSubItem(${gIdx}, ${sIdx}, 'coeff', parseFloat(this.value)||1)" class="w-10 border-none bg-transparent text-center font-mono font-bold text-xs text-slate-700 outline-none">
                    </div>
                    <button type="button" onclick="window.removeTempSubItem(${gIdx}, ${sIdx})" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition shadow-sm" title="លុបមុខវិជ្ជានេះ"><i class="fa-solid fa-trash-can text-xs"></i></button>
                </div>
            </div>
        `).join("");

        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                <div class="px-4 py-2.5 border-b border-slate-200 flex justify-between items-center transition-colors" style="background-color: ${group.color || '#f1f5f9'};">
                    <div class="flex items-center gap-2">
                        <span class="font-moul text-xs drop-shadow-sm" style="color: ${group.textColor || '#1e293b'};">${group.group}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-white/50 shadow-sm">${subs.length} មុខវិជ្ជា</span>
                    </div>
                    <button type="button" onclick="window.removeTempGroup(${gIdx})" class="text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-500 px-2 py-1 rounded-lg transition flex items-center gap-1"><i class="fa-solid fa-xmark"></i> លុបក្រុមនេះ</button>
                </div>
                <div class="p-3 space-y-2">${subsHtml}</div>
            </div>
        `;
    }).join("");
};

window.updateTempSubItem = function(gIdx, sIdx, field, val) {
    const group = window.tempEditingSchema[gIdx];
    if (!group) return;
    if (!group.subs || group.subs.length === 0) group.subs = [{ name: group.group, key: group.key, max: group.max || 10, coeff: group.coeff || 1 }];
    if (group.subs[sIdx]) group.subs[sIdx][field] = val;
};

window.removeTempSubItem = function(gIdx, sIdx) {
    const group = window.tempEditingSchema[gIdx];
    if (!group) return;
    if (!group.subs || group.subs.length <= 1) window.tempEditingSchema.splice(gIdx, 1);
    else group.subs.splice(sIdx, 1);
    window.renderSubjectManagerList();
};

window.removeTempGroup = function(gIdx) {
    if (!confirm("តើអ្នកពិតជាចង់លុបក្រុមមុខវិជ្ជានេះទាំងមូលមែនទេ?")) return;
    window.tempEditingSchema.splice(gIdx, 1);
    window.renderSubjectManagerList();
};

window.addSubjectToTempSchema = function() {
    const groupName = (document.getElementById("newSubGroupInput")?.value || "").trim();
    const subName = (document.getElementById("newSubNameInput")?.value || "").trim();
    const maxVal = parseFloat(document.getElementById("newSubMaxInput")?.value) || 10;
    const colorIdx = parseInt(document.getElementById("newSubColorSelect")?.value || "0", 10);
    const theme = window.SUBJECT_COLOR_THEMES[colorIdx] || window.SUBJECT_COLOR_THEMES[0];

    if (!groupName || !subName) return alert("⚠️ សូមបញ្ចូលទាំង «ក្រុមមុខវិជ្ជាគោល» និង «ឈ្មោះមុខវិជ្ជា»!");

    const customKey = "sub_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 100);
    const newSubObj = { name: subName, key: customKey, max: maxVal, coeff: 1 };

    let existingGroup = window.tempEditingSchema.find(g => g.group === groupName);
    if (existingGroup) {
        if (!existingGroup.subs || existingGroup.subs.length === 0) {
            existingGroup.subs = [{ name: existingGroup.group, key: existingGroup.key, max: existingGroup.max || 10, coeff: existingGroup.coeff || 1 }];
        }
        existingGroup.subs.push(newSubObj);
    } else {
        window.tempEditingSchema.push({ group: groupName, color: theme.color, borderColor: theme.borderColor, textColor: theme.textColor, subs: [newSubObj] });
    }

    document.getElementById("newSubNameInput").value = "";
    window.renderSubjectManagerList();
};

window.saveCustomSubjectSchema = async function() {
    if (!window.tempEditingSchema || window.tempEditingSchema.length === 0) return alert("⚠️ ត្រូវមានមុខវិជ្ជាយ៉ាងហោចណាស់ ១ នៅក្នុងតារាង!");
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeKey = ((sInfo.teacher_level || "ថ្នាក់ទី ១") + "_" + (sInfo.teacher_room || "ក")).replace(/\s+/g, '');
    
    // រក្សាទុក Schema ថ្មីចូលទៅក្នុង LocalStorage
    localStorage.setItem(`custom_score_schema_${gradeKey}`, JSON.stringify(window.tempEditingSchema));
    
    document.getElementById("subjectManagerModal")?.remove();
    if (typeof showToast === "function") showToast("✅ បានរក្សាទុក និងអាប់ដេតតារាងមុខវិជ្ជាដោយជោគជ័យ!");
    
    // Refresh តារាងធំ
    await window.fetchStudentsForScores();
    window.calculateAllScores();
};

window.resetSchemaToDefault = async function() {
    if (!confirm("តើអ្នកពិតជាចង់ត្រឡប់ទៅប្រើទម្រង់មុខវិជ្ជាដើម (Default) វិញមែនទេ? រាល់មុខវិជ្ជាដែលអ្នកបានបន្ថែមថ្មីនឹងត្រូវបាត់បង់។")) return;
    
    const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
    const gradeKey = ((sInfo.teacher_level || "ថ្នាក់ទី ១") + "_" + (sInfo.teacher_room || "ក")).replace(/\s+/g, '');
    
    // លុបចោល Custom Schema
    localStorage.removeItem(`custom_score_schema_${gradeKey}`);
    
    document.getElementById("subjectManagerModal")?.remove();
    if (typeof showToast === "function") showToast("🔄 បានកំណត់មុខវិជ្ជាដើមឡើងវិញដោយជោគជ័យ!");
    
    // Refresh តារាងធំ
    await window.fetchStudentsForScores();
    window.calculateAllScores();
};