// ==========================================
// មុខងារបង្ហាញ Dashboard (Dashboard Render)
// ==========================================
window.loadDashboard = function() {
    try {
        const container = document.getElementById("dashboardView") || document.getElementById("mainContentArea") || document.getElementById("appView");
        if (!container) return;

        let sInfo = {};
        try {
            if (typeof appSettings !== 'undefined' && appSettings) {
                sInfo = appSettings;
            } else {
                const localSet = localStorage.getItem('school_settings');
                if (localSet && localSet !== "undefined" && localSet !== "null") {
                    sInfo = JSON.parse(localSet);
                }
            }
        } catch (e) { console.warn("បញ្ហាទាញយកការកំណត់សាលា:", e); }

        const teacherName = window.AuthState ? window.AuthState.teacherName : (localStorage.getItem('auth_teacher_name') || 'លោកគ្រូ អ្នកគ្រូ');
        const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";

        let rawStudents = [];
        try {
            if (window.allStudents && Array.isArray(window.allStudents) && window.allStudents.length > 0) {
                rawStudents = window.allStudents;
            } else {
                const localStus = localStorage.getItem('academic_students');
                if (localStus && localStus !== "undefined" && localStus !== "null") {
                    rawStudents = JSON.parse(localStus);
                    if (!Array.isArray(rawStudents)) rawStudents = [];
                }
            }
        } catch (e) { rawStudents = []; }

        const students = rawStudents.filter(s => s && s.status !== "Dropped");
        const dropStudents = rawStudents.filter(s => s && s.status === "Dropped").length;

        const totalStudents = students.length;
        const femaleStudents = students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length;
        const poorStudents = students.filter(s => s.poor_id && String(s.poor_id).trim() !== "").length;
        const scholarStudents = students.filter(s => s.scholarship === true || s.scholarship === "true" || s.scholarship === "បាទ/ចាស").length;

        let teacherGradeStr = "មិនទាន់កំណត់ថ្នាក់រៀន";
        if (students.length > 0) {
            let sGrade = String(students[0].grade || "ថ្នាក់ទី 1").trim();
            if (!sGrade.includes("ថ្នាក់ទី")) sGrade = "ថ្នាក់ទី " + sGrade;
            teacherGradeStr = `${sGrade} ${students[0].room || '«ក»'}`;
        } else {
            const levelStr = sInfo.teacher_level || "ថ្នាក់ទី 1";
            const roomStr = sInfo.teacher_room || "«ក»";
            teacherGradeStr = `${levelStr} ${roomStr}`;
        }

        // 🟢 ទាញយកកាលបរិច្ឆេទពី Settings ដែលទើប Update ថ្មី 🟢
        const rDates = window.reportCardDateSettings || {};
        let displaySolarDate = rDates.solarDate || "ថ្ងៃទី........ខែ........ឆ្នាំ២០....";
        
        displaySolarDate = displaySolarDate.replace(/ធ្វើនៅ.*?,?\s*/g, '').trim();
        if (displaySolarDate.includes("ថ្ងៃទី")) {
            displaySolarDate = displaySolarDate.substring(displaySolarDate.indexOf("ថ្ងៃទី"));
        }
        
        const displayLunarDate = rDates.lunarDate || "ថ្ងៃ......................... ខែ............ ឆ្នាំ............ ព.ស.២៥៧...";

        container.className = "p-2 md:p-6 transition-all duration-500 h-full w-full flex flex-col min-h-0 bg-slate-50";
        container.innerHTML = `
            <style>
                .font-moul { font-family: 'Khmer OS Muol Light', 'Moul', serif !important; font-weight: normal; }
                .font-siemreap { font-family: 'Khmer OS Siemreap', 'Siemreap', sans-serif !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .bg-ornament { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; pointer-events: none; }
            </style>
            
            <div class="bg-ornament w-96 h-96 bg-blue-400/20 top-[-10%] left-[-5%]"></div>
            <div class="bg-ornament w-[500px] h-[500px] bg-amber-300/10 bottom-[-20%] right-[-10%]"></div>

            <div class="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
                <div class="flex animate-fade-in flex-col font-siemreap text-slate-800 max-w-[1680px] mx-auto pb-16 px-1 md:px-2 pt-1 min-h-full">
                    
                    <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden group border border-indigo-400/30">
                        <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:translate-x-1/3 transition duration-1000"></div>
                        <div class="absolute bottom-0 left-10 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl group-hover:scale-125 transition duration-1000"></div>
                        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-50 z-0"></div>
                        
                        <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div class="flex-1">
                                <div class="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full text-indigo-50 font-bold mb-5 shadow-sm text-[13px] font-siemreap">
                                    <i class="fa-solid fa-graduation-cap text-amber-300 text-base"></i> 
                                    <span>ឆ្នាំសិក្សា ${academicYear}</span>
                                </div>
                                <h2 class="text-3xl md:text-[42px] font-moul text-white mb-4 drop-shadow-md leading-tight tracking-wide flex items-center gap-3">
                                    សួស្តី ${teacherName}! <span class="animate-wave inline-block origin-bottom-right font-siemreap">👋</span>
                                </h2>
                                <p class="text-indigo-100 font-bold text-base md:text-lg opacity-90 max-w-2xl leading-relaxed flex items-center gap-2 font-siemreap">
                                    <i class="fa-solid fa-chalkboard-user text-sky-200"></i>
                                    លោកគ្រូអ្នកគ្រូកំពុងស្ថិតក្នុងទំព័រគ្រប់គ្រងសិស្ស <span class="text-white bg-indigo-900/40 px-3 py-1 rounded-lg border border-indigo-300/30 font-moul text-[15px] shadow-inner ml-2">${teacherGradeStr}</span>
                                </p>
                            </div>
                            
                            <!-- 🟢 កាតបង្ហាញម៉ោង និងកាលបរិច្ឆេទ 🟢 -->
                            <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] p-6 flex flex-col gap-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/20 transition-colors w-full lg:w-auto font-siemreap min-w-[340px]">
                                <div class="flex items-center gap-5 border-b border-white/10 pb-4">
                                    <div class="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30"><i class="fa-regular fa-clock text-white"></i></div>
                                    <div>
                                        <p class="text-[12px] uppercase tracking-widest font-black text-indigo-100 mb-1">ម៉ោងបច្ចុប្បន្ន</p>
                                        <p class="text-3xl font-black font-siemreap drop-shadow-md tracking-wider text-amber-300" id="dashClock">00:00:00</p>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-2.5 pt-1 text-[13.5px] font-bold text-indigo-50">
                                    <div id="dashLunarContainer" class="flex items-start gap-3" style="display: ${rDates.showLunar !== false ? 'flex' : 'none'};">
                                        <i class="fa-solid fa-moon text-amber-200 mt-1 text-base"></i>
                                        <span id="dashLunarDateDisplay" class="leading-relaxed tracking-wide">${displayLunarDate}</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <i class="fa-regular fa-calendar text-sky-300 mt-1 text-base"></i>
                                        <span id="dashSolarDateDisplay" class="leading-relaxed tracking-wide">${displaySolarDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8 font-siemreap">
                        <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-users"></i></div>
                                <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[11px] font-bold">សរុប</span>
                            </div>
                            <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">សិស្សក្នុងបន្ទុក</h3>
                            <p class="text-3xl md:text-4xl font-black text-slate-800">${totalStudents}</p>
                        </div>
                        <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-pink-50 text-pink-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-venus"></i></div>
                                <span class="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg text-[11px] font-bold">ស្រី</span>
                            </div>
                            <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">សិស្សស្រី</h3>
                            <p class="text-3xl md:text-4xl font-black text-slate-800">${femaleStudents}</p>
                        </div>
                        <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-star"></i></div>
                                <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[11px] font-bold">ក្រីក្រ</span>
                            </div>
                            <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">ប័ណ្ណក្រីក្រ</h3>
                            <p class="text-3xl md:text-4xl font-black text-slate-800">${poorStudents}</p>
                        </div>
                        <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-award"></i></div>
                                <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-bold">អាហារូបករណ៍</span>
                            </div>
                            <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">អាហារូបករណ៍</h3>
                            <p class="text-3xl md:text-4xl font-black text-slate-800">${scholarStudents}</p>
                        </div>
                        <div class="bg-white p-5 md:p-6 rounded-[1.8rem] shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1 group col-span-2 md:col-span-4 xl:col-span-1">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-[1.2rem] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"><i class="fa-solid fa-person-walking-arrow-right"></i></div>
                                <span class="bg-rose-100 text-rose-700 px-2 py-1 rounded-lg text-[10px] font-bold">បោះបង់</span>
                            </div>
                            <h3 class="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">បោះបង់ការសិក្សា</h3>
                            <p class="text-3xl md:text-4xl font-black text-slate-800">${dropStudents}</p>
                        </div>
                    </div>

                    <h3 class="font-moul text-[17px] text-slate-800 mb-5 px-2 flex items-center gap-3"><i class="fa-solid fa-bolt text-amber-500 text-xl"></i> សកម្មភាពរហ័ស</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 font-siemreap">
                        <button onclick="if(typeof window.switchView==='function') window.switchView('students'); else alert('មុខងារកំពុងរៀបចំ');" class="bg-white hover:bg-indigo-50 border border-slate-200 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition shadow-sm hover:shadow-md group">
                            <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-users-gear"></i></div>
                            <span class="font-bold text-slate-700 text-[13px] md:text-sm">បញ្ជីឈ្មោះសិស្ស</span>
                        </button>
                        <button onclick="if(typeof window.switchView==='function') window.switchView('attendance'); else alert('មុខងារកំពុងរៀបចំ');" class="bg-white hover:bg-emerald-50 border border-slate-200 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition shadow-sm hover:shadow-md group">
                            <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-clipboard-user"></i></div>
                            <span class="font-bold text-slate-700 text-[13px] md:text-sm">កត់វត្តមានសិស្ស</span>
                        </button>
                        <button onclick="if(typeof window.switchView==='function') window.switchView('scores'); else alert('មុខងារកំពុងរៀបចំ');" class="bg-white hover:bg-rose-50 border border-slate-200 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition shadow-sm hover:shadow-md group">
                            <div class="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner"><i class="fa-solid fa-marker"></i></div>
                            <span class="font-bold text-slate-700 text-[13px] md:text-sm">បញ្ចូលពិន្ទុខែ</span>
                        </button>
                        <button onclick="if(typeof window.fetchStudentsData === 'function') window.fetchStudentsData(); else alert('មុខងារទាញទិន្នន័យមិនទាន់ត្រៀមរួចរាល់');" class="bg-slate-800 hover:bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition shadow-lg shadow-slate-300 group">
                            <div class="w-14 h-14 bg-slate-700 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-180 transition duration-500 shadow-inner"><i class="fa-solid fa-arrows-rotate"></i></div>
                            <span class="font-bold text-white text-[13px] md:text-sm">ទាញទិន្នន័យថ្មី (Sync)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const clockEl = document.getElementById("dashClock");
        if(clockEl) {
            clearInterval(window.dashClockInterval);
            window.dashClockInterval = setInterval(() => {
                const now = new Date();
                const hStr = String(now.getHours()).padStart(2, '0');
                const mStr = String(now.getMinutes()).padStart(2, '0');
                const sStr = String(now.getSeconds()).padStart(2, '0');
                clockEl.textContent = `${hStr}:${mStr}:${sStr}`;
            }, 1000);
        }

    } catch (error) {
        console.error("មានកំហុសធ្ងន់ធ្ងរក្នុងការគូរ Dashboard:", error);
    }
};

if(document.getElementById("dashboardView") && !document.getElementById("dashboardView").classList.contains("hidden")) {
    window.loadDashboard();
}