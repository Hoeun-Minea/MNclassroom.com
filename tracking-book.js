// ==========================================================
// ឯកសារ js/tracking-book.js - សៀវភៅតាមដានការសិក្សា (Update ថ្មី: ទាញទិន្នន័យផ្ទាល់ និងទម្រង់ប្រចាំឆ្នាំ)
// ==========================================================

function openTrackingBookModal() {
  let modal = document.getElementById("trackingBookModal");
  if (!modal) {
    const modalHtml = `
      <div id="trackingBookModal" class="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-sm hidden flex-col items-center justify-center p-2 md:p-4 font-siemreap fade-in no-print">
        <div class="bg-slate-200 rounded-3xl shadow-2xl w-full max-w-[1200px] h-[95vh] flex flex-col overflow-hidden border border-slate-300">
          
          <div class="p-4 md:p-5 border-b border-slate-300 bg-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0 shadow-sm z-10">
            <h2 class="font-black text-lg md:text-xl text-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm"><i class="fa-solid fa-book-open-reader"></i></div>
              សៀវភៅតាមដានការសិក្សា
            </h2>
            
            <div class="flex flex-wrap items-center gap-2 md:gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full xl:w-auto">
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
                <span class="text-[10px] font-bold text-slate-500 uppercase ml-1">ថ្នាក់ទី</span>
                <select id="tbLevelSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer">
                  <option value="ថ្នាក់ទី ១">ទី ១</option><option value="ថ្នាក់ទី ២" selected>ទី ២</option><option value="ថ្នាក់ទី ៣">ទី ៣</option>
                  <option value="ថ្នាក់ទី ៤">ទី ៤</option><option value="ថ្នាក់ទី ៥">ទី ៥</option><option value="ថ្នាក់ទី ៦">ទី ៦</option>
                </select>
                <select id="tbRoomSelect" onchange="updateTbStudentSelect()" class="border-none bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer">
                  <option value="«ក»">«ក»</option><option value="«ខ»" selected>«ខ»</option><option value="«គ»">«គ»</option>
                </select>
              </div>

              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm flex-1 min-w-[150px]">
                <i class="fa-solid fa-user-graduate text-slate-400 text-xs ml-1"></i>
                <select id="tbStudentSelect" onchange="renderTrackingBookPreview()" class="w-full border-none bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate">
                  <option value="">-- ជ្រើសរើសសិស្ស --</option>
                </select>
              </div>

              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
                <i class="fa-solid fa-calendar text-slate-400 text-xs ml-1"></i>
                <select id="tbPeriodSelect" onchange="renderTrackingBookPreview()" class="border-none bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer">
                  <option value="ខែ តុលា">ខែ តុលា</option><option value="ខែ វិច្ឆិកា">ខែ វិច្ឆិកា</option><option value="ខែ ធ្នូ">ខែ ធ្នូ</option>
                  <option value="ខែ មករា" selected>ខែ មករា</option><option value="ខែ កុម្ភៈ">ខែ កុម្ភៈ</option><option value="ខែ មីនា">ខែ មីនា</option>
                  <option value="ខែ មេសា">ខែ មេសា</option><option value="ខែ ឧសភា">ខែ ឧសភា</option><option value="ខែ មិថុនា">ខែ មិថុនា</option><option value="ខែ កក្កដា">ខែ កក្កដា</option>
                  <option value="ប្រចាំឆ្នាំ">ប្រចាំឆ្នាំ</option>
                </select>
              </div>

              <div class="w-px h-6 bg-slate-300 mx-1 hidden md:block"></div>

              <button onclick="executeTrackingBookPrint('print')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2">
                <i class="fa-solid fa-print"></i> បោះពុម្ព
              </button>
              <button onclick="executeTrackingBookPrint('word')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2">
                <i class="fa-solid fa-file-word"></i> Word
              </button>
            </div>
            
            <button onclick="closeTrackingBookModal()" class="w-10 h-10 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition flex justify-center items-center shadow-sm shrink-0 absolute top-4 right-4 xl:static">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-300 custom-scrollbar flex flex-col items-center gap-8" id="tbPreviewContainer">
            <div class="text-slate-500 font-bold mt-20 flex flex-col items-center">
               <i class="fa-solid fa-spinner fa-spin text-4xl mb-3 opacity-50"></i>
               <p>កំពុងរៀបចំទិន្នន័យសៀវភៅតាមដាន...</p>
            </div>
          </div>
          
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById("trackingBookModal");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  updateTbStudentSelect();
}

function closeTrackingBookModal() {
  const m = document.getElementById("trackingBookModal");
  if(m) { m.classList.add("hidden"); m.classList.remove("flex"); }
}

function updateTbStudentSelect() {
  const level = document.getElementById("tbLevelSelect").value;
  const room = document.getElementById("tbRoomSelect").value;
  const targetGrade = `${level} ${room}`.trim();
  const select = document.getElementById("tbStudentSelect");
  
  // ទាញសិស្សពីទិន្នន័យចំណាត់ថ្នាក់ (Rankings Data) ដើម្បីយកពិន្ទុ មធ្យមភាគ និងនិទ្ទេស
  if (typeof rankingsDataList !== 'undefined' && rankingsDataList.length > 0) {
    let studentsInGrade = rankingsDataList;
    if (studentsInGrade.length === 0) {
      select.innerHTML = `<option value="">-- គ្មានសិស្ស --</option>`;
      document.getElementById("tbPreviewContainer").innerHTML = `<div class="mt-20 text-slate-500 font-bold">គ្មានសិស្សក្នុងថ្នាក់ ${targetGrade} ទេ!</div>`;
    } else {
      select.innerHTML = studentsInGrade.map(s => `<option value="${s.id}">${s.name} (${s.gender})</option>`).join("");
      renderTrackingBookPreview();
    }
  } else {
    select.innerHTML = `<option value="">-- សូមទាញយកទិន្នន័យចំណាត់ថ្នាក់សិន --</option>`;
  }
}

// គូររូបរាងសៀវភៅបញ្ចូលទៅក្នុង Pop-up
function renderTrackingBookPreview() {
  const studentId = document.getElementById("tbStudentSelect").value;
  const period = document.getElementById("tbPeriodSelect").value;
  const container = document.getElementById("tbPreviewContainer");

  if (!studentId) return;
  const student = rankingsDataList.find(s => String(s.id) === String(studentId));
  if (!student) return;

  const sInfo = typeof appSettings !== 'undefined' ? appSettings : {};
  const schoolName = sInfo.school_name || "សាលាបឋមសិក្សាគំរូ";
  const academicYear = sInfo.academic_year || "២០២៦-២០២៧";
  const grade = student.grade || "ថ្នាក់ទី ២ «ខ»";

  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (str) => String(str).split('').map(n => khmerNumbers[n] || n).join('');
  
  let dobStr = student.dob || "....................";
  if (dobStr.includes("-")) {
      const p = dobStr.split("-");
      if(p.length === 3) dobStr = `${p[2]}/${p[1]}/${p[0]}`;
  }

  const avgStr = student.avg ? student.avg.toFixed(2) : "";
  const rankStr = student.rank || "";
  const gradeStr = student.gradeLetter || "";

  // Common CSS classes (A4 Landscape)
  const pageClass = "w-[297mm] h-[210mm] bg-white shadow-xl flex p-[10mm] shrink-0 box-border gap-[10mm] text-[#0000ff] mx-auto transform scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-top font-siemreap printable-page mb-4";
  const halfClass = "w-1/2 h-full border-[3px] border-double border-[#0000ff] p-[8mm] relative flex flex-col box-border";

  // ==========================================
  // ទំព័រទី១៖ គម្របមុខ និង ក្រោយ
  // ==========================================
  const coverHtml = `
    <div class="${pageClass}">
      <div class="${halfClass} border-none text-[#0000ff]">
         <!-- គម្របក្រោយ (ទទេ) -->
      </div>
      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <h3 class="font-moul text-[14px] mt-2">ព្រះរាជាណាចក្រកម្ពុជា</h3>
        <h3 class="font-moul text-[14px] mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
        <div class="tracking-[2px] mt-[-4px] font-serif text-[12px]">𑁋𑁋𑁋 📖 𑁋𑁋𑁋</div>

        <h2 class="font-moul text-[18px] mt-8">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
        <h1 class="font-moul text-[24px] mt-4">${schoolName}</h1><br><br>
        
        
        <p class="text-[12px] mt-2 font-moul">ទូរសព្ទសាលា....................................</p>

        <h1 class="font-moul text-[28px] mt-10 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
        
        <div class="mt-10 text-left px-6 text-[15px] leading-[2.5]">
           របស់សិស្សឈ្មោះ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[150px] text-center font-moul hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.name}</span> អត្តលេខ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id)}</span><br>
           <div class="flex items-center mt-2">
              <span class="w-[60px]">ថ្នាក់ទី៖</span> <br>
              <span class="border-b border-dotted border-[#0000ff] flex-1 text-center font-moul hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${grade}</span>
           </div>
        </div>

        <div class="mt-auto mb-6 text-[14px]">
           ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី២៖ បទបញ្ជា និង ជីវប្រវត្តិ
  // ==========================================
  const rulesHtml = `
    <div class="${pageClass}">
      <div class="${halfClass} text-[#0000ff]">
        <h3 class="font-moul text-center text-[13px] mt-0 leading-[1.6]">
           ចំណុចសំខាន់ៗនៃបទបញ្ជាផ្ទៃក្នុង<br>
           នាយកសាលា គ្រូបង្រៀន និងគ្រប់គ្រងសៀវភៅតាមដានការសិក្សា<br>
           ហើយត្រូវអនុវត្តតាមចំណុចខាងក្រោម៖
        </h3>
        <ol class="pl-5 text-[11px] text-justify mt-4 space-y-[6px]">
           <li>សិស្សត្រូវអនុវត្តតាមអាកប្បកិរិយា និងបទបញ្ជាផ្ទៃក្នុងរបស់សាលារៀនឱ្យបានម៉ឺងម៉ាត់។</li>
           <li>សិស្សត្រូវស្លៀកពាក់ឯកសណ្ឋានឱ្យបានត្រឹមត្រូវ អាវស ខៀវ តាមឯកសណ្ឋានសាលា ត្រូវកាត់សក់ខ្លី និងសំអាតខ្លួនប្រាណ។ មិនត្រូវពាក់គ្រឿងអលង្ការមកសាលាដាច់ខាត។</li>
           <li>សិស្សត្រូវខិតខំរៀនសូត្រ ខិតខំកែលម្អការរស់នៅរបស់លោកគ្រូ/អ្នកគ្រូ និងនាយកសាលា ត្រូវចូលរួមគ្រប់សកម្មភាពការងារសង្គម អនាម័យ យាមកាម...។ល។</li>
           <li>សិស្សឈប់កិច្ចការ ក្នុងពេលប្រឡងឆមាសត្រូវធ្លាក់ស្វ័យប្រវត្តិ។ សិស្សដែលមិនប្រឡង ៣ មុខវិជ្ជាក្នុងឆមាសណាមួយ ត្រូវចាត់ទុកថា "ធ្លាក់ចំណាត់ថ្នាក់"។</li>
           <li>សិស្សអាចឡើងថ្នាក់បាន លុះត្រាតែមានពិន្ទុមធ្យមភាគឡើងថ្នាក់ សីលធម៌រស់នៅ និងអវត្តមានតិចជាង ១៥ ថ្ងៃ។ សិស្សក្រោមមធ្យមភាគត្រូវប្រឡងឡើងថ្នាក់ ឬរៀនត្រួតថ្នាក់។</li>
           <li>សិស្សឈប់រៀនដោយមានឬគ្មានហេតុផលត្រឹមត្រូវពី ៣១ ទៅ ៦០ ពេល ត្រូវប្រឡងឡើងថ្នាក់ បើលើសពី ៦០ ពេល ត្រូវរៀនត្រួតថ្នាក់។</li>
           <li>សិស្សដែលឈប់រៀនជាប់គ្នាលើសពី ៦០ ពេល ត្រូវលុបឈ្មោះចេញពីបញ្ជីសាលារៀន។</li>
           <li>ចំពោះសិស្សផ្ទេរការសិក្សា នាយកសាលាត្រូវបូកសរុបលទ្ធផលនៃការសិក្សារបស់សិស្សឱ្យបានសព្វគ្រប់ រួចផ្ញើទៅសាលាថ្មី។</li>
           <li>ហាមផ្តាច់មិនឱ្យប្រគល់សៀវភៅនេះឱ្យសិស្សកាន់ដោយខ្លួនឯង។ ក្នុងករណីមានកំហុសឆ្គង នាយកសាលា និងគ្រូបង្រៀនជាអ្នកទទួលខុសត្រូវ។</li>
        </ol>
      </div>

      <div class="${halfClass} text-center text-[#0000ff]">
        <div class="absolute top-2 left-2 font-moul text-[10px]">/\\</div>
        <div class="absolute top-2 right-2 font-moul text-[10px]">/\\</div>
        
        <h3 class="font-moul text-[12px] mt-1">ព្រះរាជាណាចក្រកម្ពុជា</h3>
        <h3 class="font-moul text-[12px] mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
        <div class="tracking-[2px] mt-[-2px] text-[12px] font-serif">* * * 📖 * * *</div>

        <h2 class="font-moul text-[16px] mt-4">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
        <h1 class="font-moul text-[22px] mt-6 leading-snug">សៀវភៅតាមដានការសិក្សា</h1>
        <h2 class="font-moul text-[14px] mt-6">សាលាបឋមសិក្សាចំណេះទូទៅ</h2>

        <div class="mt-6 text-left px-2 text-[12px] leading-[2.4]">
           សាលាបឋមសិក្សា៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[160px] font-moul text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${schoolName}</span> កម្រងសាលា៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[80px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           ឈ្មោះសិស្ស៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[140px] font-moul text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.name}</span> ភេទ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.gender}</span> រៀនថ្នាក់ទី៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[60px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${grade}</span> អត្តលេខ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(student.id)}</span><br>
           កើតថ្ងៃទី៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[100px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${dobStr}</span> នៅភូមិ/ក្រុម៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[140px] truncate text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.pob || ''}</span> ឃុំ/សង្កាត់៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[90px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           ស្រុក/ខណ្ឌ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[130px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span> ខេត្ត/ក្រុង៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[130px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           ឪពុកឈ្មោះ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[160px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.father_name || ''}</span> មុខរបរ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[120px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.father_job || ''}</span><br>
           ម្តាយឈ្មោះ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[160px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.mother_name || ''}</span> មុខរបរ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[120px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.mother_job || ''}</span><br>
           អាណាព្យាបាលឈ្មោះ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[140px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span> មុខរបរ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[100px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           ស្នាក់នៅផ្ទះលេខ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[50px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span> ផ្លូវ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[50px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span> ភូមិ/ក្រុម៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[110px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${student.address || ''}</span> ឃុំ/សង្កាត់៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[80px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           ស្រុក/ខណ្ឌ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[130px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span> ខេត្ត/ក្រុង៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[130px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
           <div class="mt-4 text-center">
             ឆ្នាំសិក្សា៖ ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(2, 4))}</span> - ២០<span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${toKhmerNum(academicYear.substring(7, 9))}</span>
           </div>
        </div>

        <div class="absolute bottom-2 left-2 font-moul text-[10px]">\\/</div>
        <div class="absolute bottom-2 right-2 font-moul text-[10px]">\\/</div>
      </div>
    </div>
  `;

  // ==========================================
  // ទំព័រទី៣៖ តារាងពិន្ទុ (Tick ដោយចុចលើក្រឡាផ្ទាល់)
  // ==========================================
  const subjects = [
    "អាន", "សរសេរតាមអាន", "តែងសេចក្តី", "មេសូត្រ", "អក្សរផ្ចង់", 
    "គណិតវិទ្យា", "វិទ្យាសាស្ត្រអនុវត្ត", "ប្រវត្តិវិទ្យា", "ភូមិវិទ្យា", 
    "សីលធម៌ ពលរដ្ឋវិជ្ជា", "គំនូរ", "កិច្ចការ-ផ្ទះ", "អប់រំកាយ-កីឡា", 
    "សិល្បៈបំណិនសិល្បៈ", "សីលធម៌រស់នៅ", "សុខភាព-អនាម័យ"
  ];

  const getTickMark = (score) => {
    if (score == null || score === "") return ["", "", "", ""];
    const s = parseFloat(score);
    if (s >= 8) return ["✔", "", "", ""];
    if (s >= 6.5) return ["", "✔", "", ""];
    if (s >= 5) return ["", "", "✔", ""];
    return ["", "", "", "✔"];
  };

  const buildResultTable = (title, isAnnual) => {
    let tbody = subjects.map(sub => {
      let scoreVal = (student.scores && student.scores[sub] !== undefined) ? student.scores[sub] : null;
      let ticks = getTickMark(scoreVal);

      // បន្ថែម onclick សម្រាប់ Tick ដូរចុះឡើង និង contenteditable សម្រាប់វាយអក្សរ
      return `
        <tr class="h-[17px]">
          <td class="text-left px-[4px] border border-[#0000ff]">${sub}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[0]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[1]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[2]}</td>
          <td class="border border-[#0000ff] text-center font-bold text-rose-600 text-[13px] cursor-pointer hover:bg-blue-100 tb-tick-cell" onclick="toggleBookTick(this)">${ticks[3]}</td>
          <td class="border border-[#0000ff] text-left px-1 text-[9px] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></td>
        </tr>
      `;
    }).join("");

    const displayTitle = isAnnual ? `លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំសិក្សា ២០<span class="font-sans" contenteditable="true">${academicYear.substring(2, 4)}</span>-២០<span class="font-sans" contenteditable="true">${academicYear.substring(7, 9)}</span>` : `លទ្ធផលនៃការសិក្សាប្រចាំ ${title}`;

    return `
      <h3 class="font-moul text-center text-[13px] mb-[6px] text-[#0000ff] outline-none hover:bg-blue-50 cursor-text" contenteditable="true">${displayTitle}</h3>
      <table class="w-full border-collapse border border-[#0000ff] text-[11px] text-center text-[#0000ff]">
        <tr class="bg-slate-50 border border-[#0000ff]">
          <th rowspan="2" class="w-[30%] border border-[#0000ff] font-moul text-[11px] font-normal">មុខវិជ្ជា</th>
          <th colspan="4" class="border border-[#0000ff] font-moul text-[11px] font-normal">និទ្ទេស</th>
          <th rowspan="2" class="w-[26%] border border-[#0000ff] font-moul text-[9px] font-normal leading-tight">ចំណុចដែលត្រូវជួយ<br>ពង្រឹងបន្ថែម</th>
        </tr>
        <tr class="bg-slate-50 border border-[#0000ff]">
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ល្អ<br><span class="font-sans text-[7px]">ពិន្ទុ 8-10</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ល្អបង្គួរ<br><span class="font-sans text-[7px]">ពិន្ទុ 6.5-7.99</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">មធ្យម<br><span class="font-sans text-[7px]">ពិន្ទុ 5-6.49</span></th>
          <th class="w-[11%] border border-[#0000ff] font-moul text-[9px] font-normal">ខ្សោយ<br><span class="font-sans text-[7px]">ពិន្ទុ 4.99-0</span></th>
        </tr>
        ${tbody}
      </table>
      <div class="text-[11px] mt-[8px] leading-[2] text-left text-[#0000ff]">
         មធ្យមភាគ៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[40px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${avgStr}</span> 
         ចំណាត់ថ្នាក់ទី៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${rankStr}</span> 
         និទ្ទេស៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[35px] text-center font-bold text-rose-600 hover:bg-blue-50 outline-none cursor-text" contenteditable="true">${gradeStr}</span><br> 
         អវត្តមានមានច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[25px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true"></span> ដង អត់ច្បាប់ <span class="border-b border-dotted border-[#0000ff] inline-block w-[25px] text-center hover:bg-blue-50 outline-none cursor-text font-bold text-rose-600" contenteditable="true"></span> ដង<br>
         វិន័យសីលធម៌៖ <span class="border-b border-dotted border-[#0000ff] inline-block w-[80%] hover:bg-blue-50 outline-none cursor-text" contenteditable="true"></span><br>
         <div class="flex justify-between mt-1 px-4">
           <span>ថ្ងៃទី.......ខែ..........ឆ្នាំ២០.......</span>
           <span class="mr-4">ថ្ងៃទី.......ខែ..........ឆ្នាំ២០.......</span>
         </div>
         <div class="flex justify-between font-moul text-center mt-2 px-1">
           <span class="text-[9px]">បានឃើញ និង ឯកភាព<br>នាយកសាលា</span>
           <span class="text-[9px] mt-1">មតិរបស់មាតាបិតា ឬអាណាព្យាបាលសិស្ស</span>
           <span class="text-[9px]">គ្រូប្រចាំថ្នាក់</span>
         </div>
      </div>
    `;
  };

  const annualInstructions = `
    <h3 class="font-moul text-center text-[15px] mb-2 text-[#0000ff]">សេចក្តីណែនាំ</h3>
    <p class="text-[12px] text-justify leading-relaxed indent-4">
      សូមលោកគ្រូ/អ្នកគ្រូ មាតាបិតា ឬអាណាព្យាបាលសិស្ស មេត្តាអាននូវសេចក្តីណែនាំពីរបៀបបំពេញខាងក្រោម៖
    </p>
    <p class="text-[12px] text-justify leading-relaxed mt-2">
      <span class="font-bold">១. ខ្ទង់និទ្ទេស៖</span> សូមលោកគ្រូ-អ្នកគ្រូគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់និទ្ទេសតាមលទ្ធផលនៃការសិក្សារបស់សិស្ស។<br>
      <span class="font-bold">២. ខ្ទង់ចំណុចដែលត្រូវជួយបន្ថែម៖</span><br>
      <span class="font-bold ml-4">ក. ចំពោះគ្រូ៖</span> អាចសរសេរបញ្ជាក់ឱ្យបានច្បាស់ អំពីមេរៀនដែលសិស្សទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ឧទាហរណ៍៖ ទទួលបានលទ្ធផលខ្សោយ ដូចនេះគួរសរសេរមេរៀនអ្វីខ្លះ? ឬអាចគ្រាន់តែគូសសញ្ញា " ✔ " នៅក្នុងខ្ទង់ដែលត្រូវជួយបន្ថែមចំពោះមុខវិជ្ជាណាដែលទទួលបានលទ្ធផលមិនល្អ "ខ្សោយ" ដូចជាសិស្សបាននិទ្ទេសខ្សោយ រៀនអាន-ពណ៌នាត្រា-វិទ្យាសាស្ត្រអនុវត្តកិច្ចដើម ។ល។<br>
      <span class="font-bold ml-4">ខ. ចំពោះមាតាបិតាសិស្ស ឬអាណាព្យាបាលសិស្ស៖</span> សូមយកចិត្តទុកដាក់អានលើខ្ទង់ "ចំណុចដែលត្រូវជួយបន្ថែម" នេះ ដែលជាការផ្តល់ព័ត៌មានពីលទ្ធផលនៃការសិក្សារបស់កូន ហើយលោកគ្រូ/អ្នកគ្រូ សូមធ្វើការចូលរួមជួយពីសំណាក់លោក/លោកស្រី មេត្តាជួយផ្តល់មតិយោបល់ផ្សេងៗ បើពុំមាននៃការសិក្សារបស់កូនអស់លោក/លោកស្រីផង។
    </p>
    <div class="mt-auto flex justify-center pb-4 opacity-70">
      <i class="fa-solid fa-book-open text-4xl"></i>
    </div>
  `;

  let resultsHtml = "";
  if (period === "ប្រចាំឆ្នាំ") {
    resultsHtml = `
      <div class="${pageClass}">
        <div class="${halfClass}">${buildResultTable("", true)}</div>
        <div class="${halfClass} text-[#0000ff]">${annualInstructions}</div>
      </div>
    `;
  } else {
    resultsHtml = `
      <div class="${pageClass}">
        <div class="${halfClass}">${buildResultTable(period, false)}</div>
        <div class="${halfClass} flex flex-col items-center justify-center bg-slate-50 border-dashed border-[#0000ff]">
           <i class="fa-solid fa-file-lines text-4xl text-slate-300 mb-2"></i>
           <span class="text-slate-400 font-bold text-sm">ទំព័រទំនេរ</span>
        </div>
      </div>
    `;
  }

  // បញ្ចូល HTML ទំព័រទាំង ៣ ទៅក្នុង Preview Container
  container.innerHTML = coverHtml + rulesHtml + resultsHtml;
}

// មុខងារសម្រាប់ចុច Tick (✔) ដោយផ្ទាល់លើតារាង
function toggleBookTick(cell) {
  const row = cell.parentElement;
  // ទាញយកក្រឡា Tick ទាំងអស់ក្នុងជួរដេកតែមួយ
  const allTickCells = row.querySelectorAll('.tb-tick-cell');
  
  const hasTick = cell.innerText.trim() === "✔";
  
  // លុប Tick ចាស់ចេញទាំងអស់ក្នុងជួរនោះសិន
  allTickCells.forEach(c => c.innerText = "");
  
  // ប្រសិនបើមិនទាន់មាន Tick ទេ ឱ្យដាក់ "✔" ចូល
  if (!hasTick) {
    cell.innerText = "✔";
  }
}

// ==========================================
// មុខងារ Print / Word Export 
// ==========================================
function executeTrackingBookPrint(actionType) {
  const container = document.getElementById("tbPreviewContainer");
  const studentSelect = document.getElementById("tbStudentSelect");
  
  if (!studentSelect.value || container.innerHTML.includes("គ្មានសិស្ស")) {
    alert("⚠️ សូមជ្រើសរើសសិស្សឱ្យបានត្រឹមត្រូវសិន!");
    return;
  }
  
  const studentName = studentSelect.options[studentSelect.selectedIndex].text.split('(')[0].trim();
  const pages = container.querySelectorAll('.printable-page');
  let cleanHtml = "";
  
  pages.forEach(p => {
    let pageHtml = p.outerHTML
        .replace(/scale-\[\d\.\d+\]/g, '')
        .replace(/sm:scale-\d+/g, '')
        .replace(/md:scale-\d+/g, '')
        .replace(/lg:scale-\d+/g, '')
        .replace(/shadow-xl/g, '')
        .replace(/mx-auto/g, '')
        .replace(/bg-slate-50/g, 'bg-white')
        .replace(/border-dashed/g, 'border-double')
        .replace(/mb-4/g, ''); // លុបគម្លាតពេល Print
    cleanHtml += pageHtml;
  });

  const printDocument = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="utf-8">
      <title>សៀវភៅតាមដាន - ${studentName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Siemreap', sans-serif; color: #0000ff; }
        .printable-page { page-break-after: always; break-after: page; }
      </style>
    </head>
    <body>
      ${cleanHtml}
    </body>
    </html>
  `;

  if (actionType === "print") {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    printWindow.document.open();
    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1200);
  } else if (actionType === "word") {
    const blob = new Blob(['\ufeff', printDocument], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `សៀវភៅតាមដាន_${studentName.replace(/ /g, '_')}.doc`;
    link.click();
  }
}