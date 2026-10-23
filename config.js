// ==========================================
// ឯកសារ js/config.js (Advanced Cloud Sync & Multi-Teacher API)
// ==========================================

// 👉 URL របស់ Google Apps Script 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSww8UsHFDSwQ3wzECa-FhDf3A4WMstrbI5UTDNga-A8vJ9DUw4laVtWrlMHmijK5p/exec";

// =========================================================
// ១. ការកំណត់ទូទៅ (Global Settings Data)
// =========================================================
let appSettings = {
  school_name: "សាលាបឋមសិក្សា",
  academic_year: "២០២៦-២០២៧",
  principal_name: "នាយកសាលា",
  teacher_name: "គ្រូបង្រៀន",
  district: ".......",
  school_logo: "",
  grade_format: "khmer", 
  auto_sync: true
};

async function fetchSystemSettings() {
  const cached = localStorage.getItem("school_settings");
  if (cached) { 
    try {
        appSettings = { ...appSettings, ...JSON.parse(cached) }; 
        applySettingsToUI(); 
    } catch(e) {}
  }

  try {
    const res = await apiGet("getSettings");
    if (res && res.data) {
      appSettings = { ...appSettings, ...res.data };
      localStorage.setItem("school_settings", JSON.stringify(appSettings));
      applySettingsToUI();
    }
  } catch (error) {
    console.warn("⚠️ ប្រើប្រាស់ Settings ចាស់ក្នុងម៉ាស៊ីន ដោយសារបណ្តាញមានបញ្ហា។");
  }
}

function applySettingsToUI() {
  const nameEl = document.getElementById("navSchoolName");
  if (nameEl) nameEl.textContent = appSettings.school_name || "សាលារៀន";
  const yearEl = document.getElementById("navSchoolYear");
  if (yearEl) yearEl.textContent = "ឆ្នាំសិក្សា " + (appSettings.academic_year || "២០២៦-២០២៧");
  const logoEl = document.getElementById("sidebarLogo");
  if (logoEl && appSettings.logo_url) {
      logoEl.src = appSettings.logo_url;
      logoEl.style.display = "block";
      if(logoEl.nextElementSibling) logoEl.nextElementSibling.style.display = "none";
  }
}

// =========================================================
// ២. ប្រព័ន្ធ API (GET & POST) សម្រាប់ Google Apps Script (កែសម្រួលបន្ថែម Auth)
// =========================================================

/**
 * មុខងារសម្រាប់ទាញយក អត្តសញ្ញាណគ្រូ និងឆ្នាំសិក្សាបច្ចុប្បន្ន
 */
function getAuthCredentials() {
    return {
        teacher_id: localStorage.getItem('auth_teacher_id') || "TCH-001", // យកពីប្រព័ន្ធ Login
        academic_year: localStorage.getItem('selected_academic_year') || appSettings.academic_year || "2026-2027" // យកពី Dropdown ឆ្នាំសិក្សា
    };
}

/**
 * មុខងារសម្រាប់ហៅទិន្នន័យ (GET)
 */
async function apiGet(action, params = {}) {
  // 🟢 បញ្ចូលអត្តសញ្ញាណគ្រូ និងឆ្នាំសិក្សា ទៅក្នុងប៉ារ៉ាម៉ែត្រជានិច្ច 🟢
  const auth = getAuthCredentials();
  const finalParams = { ...auth, ...params };
  
  const cacheKey = `cache_${action}_${JSON.stringify(finalParams)}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    fetchDataFromAPI(action, finalParams, cacheKey).catch(e => console.warn("Background Sync API Get Error"));
    return JSON.parse(cachedData);
  }

  return await fetchDataFromAPI(action, finalParams, cacheKey);
}

async function fetchDataFromAPI(action, params, cacheKey) {
  try {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append("action", action);
    for (const [key, val] of Object.entries(params)) { 
      if (val !== undefined && val !== null) url.searchParams.append(key, val); 
    }
    
    const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    
    if (data.status === "success") {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    return data;
  } catch (err) { 
    console.warn(`API GET Error [${action}]: បរាជ័យក្នុងការតភ្ជាប់។`, err);
    return { status: "error", data: null, message: err.toString() };
  }
}


// មុខងារទាញយកទិន្នន័យសិស្សប្រកបដោយល្បឿនលឿន (Cache-First Strategy)
window.fetchStudentsDataFast = async function() {
    const currentTeacherId = localStorage.getItem('auth_teacher_id');
    const currentYear = document.getElementById("globalAcademicYear")?.value || "2026-2027";

    // ១. បង្ហាញទិន្នន័យពី LocalStorage ភ្លាមៗ (Instant Display)
    try {
        const rawData = localStorage.getItem('academic_students');
        if (rawData) {
            const parsed = JSON.parse(rawData) || [];
            window.allStudents = parsed.filter(s => String(s.teacher_id) === String(currentTeacherId) && String(s.academic_year) === String(currentYear));
            window.filterStudents(); // បង្ហាញលើតារាងភ្លាមៗ មិនបាច់រង់ចាំអុិនធឺណិត
        }
    } catch(e) {}

    // ២. ទាញទិន្នន័យថ្មីពី Google Sheets មកបំពេញបន្ថែមនៅខាងក្រោយ (Background Sync)
    if (typeof window.apiGet === 'function') {
        window.apiGet("getStudents").then(res => {
            if (res && res.status === "success" && Array.isArray(res.data)) {
                localStorage.setItem('academic_students', JSON.stringify(res.data));
                window.allStudents = res.data.filter(s => String(s.teacher_id) === String(currentTeacherId) && String(s.academic_year) === String(currentYear));
                window.filterStudents(); // Refresh តារាងម្តងទៀតជាមួយទិន្នន័យស្រស់ៗពី Cloud
            }
        }).catch(err => console.warn("Background fetch skipped:", err));
    }
};

/**
 * មុខងារសម្រាប់បញ្ជូនទិន្នន័យ (POST)
 */
async function apiPost(action, payload = {}) {
  // 🟢 បញ្ចូលអត្តសញ្ញាណគ្រូ និងឆ្នាំសិក្សា ទៅក្នុងទិន្នន័យរាល់ពេលបញ្ជូន 🟢
  const auth = getAuthCredentials();
  
  const requestBody = {
      action: action,
      teacher_id: auth.teacher_id,
      academic_year: auth.academic_year,
      // រៀបចំ payload
      data: payload.data ? payload.data : payload
  };
  
  // បើសិនមាន id ដាច់ដោយឡែក (e.g. សម្រាប់មុខងារ Delete)
  if (payload && payload.id) requestBody.id = payload.id;
  else if (payload && payload.data && payload.data.id) requestBody.id = payload.data.id;

  // ការងារបន្ទាន់ដែលត្រូវបាញ់ទៅ Server ភ្លាមៗ (មិនឆ្លងកាត់ Queue)
  const instantActions = [
      "loginUser", 
      "generateWithAI", 
      "deleteStudent", 
      "deleteStaff", 
      "deleteBook", 
      "deleteAsset"
  ];
  
  if (instantActions.includes(action)) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        // Google Apps Script ទាមទារ text/plain ដើម្បីកុំឱ្យជាប់ CORS error
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(requestBody)
      });
      return await response.json();
    } catch (error) {
      console.error(`API POST Instant Error [${action}]:`, error);
      throw new Error("បញ្ហាតភ្ជាប់បណ្តាញ (Network Error)"); 
    }
  }

  // សម្រាប់ទិន្នន័យធម្មតា ត្រូវរក្សាទុកក្នុងកុំព្យូទ័រសិន (Offline-First Queue)
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  
  // ដកសំណើចាស់ៗដែលស្ទួន (Duplicate) ចេញសិនមុននឹងបន្ថែមសំណើថ្មី
  syncQueue = syncQueue.filter(item => item.action !== action);
  syncQueue.push({ 
      action, 
      requestBody: requestBody, // រក្សាទុកកញ្ចប់ទិន្នន័យទាំងមូលរួមទាំង teacher_id
      timestamp: new Date().getTime() 
  });
  
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  updateSyncBadgeUI(syncQueue.length);

  // ប្រសិនបើកំណត់ Auto Sync = true នោះបាញ់ទៅ Cloud ស្វ័យប្រវត្តិ
  if (appSettings.auto_sync !== false) {
      setTimeout(() => { syncDataToServer(true); }, 1500);
  }

  return { status: "success", message: "បានរក្សាទុកក្នុងម៉ាស៊ីន! (Pending Cloud Sync)" };
}

/**
 * មុខងារបញ្ជូនទិន្នន័យដែលនៅសល់ក្នុងបញ្ជីរង់ចាំ (Queue) ទៅកាន់ Google Sheet
 */
async function syncDataToServer(isSilent = false) {
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  if (syncQueue.length === 0) {
      if(!isSilent) {
          if(typeof showToast === 'function') showToast("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
          else alert("✅ គ្មានទិន្នន័យថ្មីត្រូវបញ្ជូនទេ!");
      }
      return;
  }

  const btn = document.getElementById("btnSyncData");
  const originalHtml = btn ? btn.innerHTML : "Sync";
  if (btn && !isSilent) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបញ្ជូន...`;

  try {
    let failedQueue = [];

    for (let i = 0; i < syncQueue.length; i++) {
      const task = syncQueue[i];
      
      try {
          const res = await fetch(SCRIPT_URL, { 
            method: "POST", 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(task.requestBody) // បញ្ជូនអ្វីដែលបានចងក្រងទុករួចរាល់
          });
          
          const result = await res.json();
          if (result.status !== "success") {
             console.error(`Task [${task.action}] failed response:`, result);
             throw new Error(result.message);
          }
      } catch (reqErr) {
          console.warn(`Task [${task.action}] fetch failed:`, reqErr);
          failedQueue.push(task); 
      }
    }
    
    // រក្សាទុកតែទិន្នន័យដែលបរាជ័យ
    localStorage.setItem('syncQueue', JSON.stringify(failedQueue));
    updateSyncBadgeUI(failedQueue.length);
    
    if(failedQueue.length === 0) {
        if(!isSilent && typeof showToast === 'function') showToast("☁️ ទិន្នន័យត្រូវបាន Sync ទៅកាន់ Cloud ជោគជ័យ ១០០%!");
    } else {
        if(!isSilent && typeof showToast === 'function') showToast(`⚠️ នៅសល់ទិន្នន័យ ${failedQueue.length} មិនទាន់អាចបញ្ជូនបាន។`, true);
    }

  } catch (error) { 
    console.error("Global Sync Error:", error);
    if(!isSilent && typeof showToast === 'function') showToast("បរាជ័យក្នុងការធ្វើសមកាលកម្ម! សូមពិនិត្យអ៊ីនធឺណិត។", true);
  } finally { 
    if (btn && !isSilent) btn.innerHTML = originalHtml; 
  }
}

// មុខងារសម្អាត LocalStorage និងធ្វើបច្ចុប្បន្នភាពទំព័រ
window.clearLocalCacheWithConfirm = function() {
  if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាញយកទិន្នន័យថ្មីពី Cloud មកវិញ (ទិន្នន័យដែលមិនទាន់ Sync នឹងត្រូវបាត់បង់)។")) {
      Object.keys(localStorage).forEach(key => { 
        if (key.startsWith('cache_') || key === 'syncQueue' || key === 'academic_students' || key === 'exam_scores_data') {
            localStorage.removeItem(key); 
        }
      });
      if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
      setTimeout(() => location.reload(), 1500);
  }
};

function updateSyncBadgeUI(count) {
  const badge = document.getElementById("syncBadgeCount");
  const syncBtn = document.getElementById("btnSyncData");
  
  if (badge) { 
    badge.textContent = count; 
  }
  if (syncBtn) {
    if (count > 0) syncBtn.classList.remove("hidden");
    else syncBtn.classList.add("hidden");
  }
}

// =========================================================
// ៣. មុខងារបោះពុម្ព (Print Iframe with Fonts Support)
// =========================================================
window.printSpecificSheet = function(elementId, orientation = 'landscape') {
  const target = document.getElementById(elementId);
  if (!target) {
    alert("រកមិនឃើញសន្លឹកការងារសម្រាប់បោះពុម្ពទេ!");
    return;
  }

  let oldIframe = document.getElementById("print_frame_helper");
  if (oldIframe) oldIframe.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print_frame_helper";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const clone = target.cloneNode(true);
  
  const origInputs = target.querySelectorAll("input, select, textarea");
  const cloneInputs = clone.querySelectorAll("input, select, textarea");
  
  origInputs.forEach((inp, idx) => {
    if (cloneInputs[idx]) {
      const span = document.createElement("span");
      if (inp.tagName === "SELECT") {
          span.textContent = inp.options[inp.selectedIndex]?.text || "";
      } else {
          span.textContent = inp.value || "";
      }
      span.style.cssText = "font-weight:bold; font-family:monospace; display:inline-block; text-align:center;";
      cloneInputs[idx].parentNode.replaceChild(span, cloneInputs[idx]);
    }
  });

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <meta charset="UTF-8">
      <title>បោះពុម្ពឯកសារ</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap" rel="stylesheet">
      
      <script src="https://cdn.tailwindcss.com"><\/script>
      <script>
        tailwind.config = { theme: { extend: { fontFamily: { siemreap: ['Siemreap', 'sans-serif'], moul: ['Moul', 'sans-serif'] } } } }
      <\/script>

      <style>
        @page { 
          size: A4 ${orientation}; 
          margin: 8mm; 
        }
        
        @media print {
          body, html { width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; }
          #${elementId}, .bg-white, .shadow-xl { max-width: 100% !important; width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        }

        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { color: black !important; font-family: 'Siemreap', sans-serif !important; }
        .font-moul { font-family: 'Moul', serif !important; font-weight: normal !important;}
        .font-siemreap { font-family: 'Siemreap', sans-serif !important; font-weight: 500 !important; }
        .no-print { display: none !important; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black !important; }
        .border-dashed { border-style: dashed !important; }
      </style>
    </head>
    <body>
      ${clone.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 1500); 
};


// =========================================================
// ៤. ដំណើរការនៅពេលកម្មវិធីចាប់ផ្តើម (Load)
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  updateSyncBadgeUI(queue.length);
  
  fetchSystemSettings(); 
  
  if (queue.length > 0 && appSettings.auto_sync) {
      setTimeout(() => { syncDataToServer(true); }, 3000);
  }
});