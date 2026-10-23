// ==========================================
// ឯកសារ js/settings.js - ផ្ទាំងកំណត់ទូទៅ (Global Settings Manager)
// ==========================================

// ១. ដំណើរការអាន Settings ជាសកលភ្លាមៗពេល Load
window.loadGlobalSettings = function() {
    let savedSettings = localStorage.getItem("school_settings");
    if (savedSettings) {
        try { window.appSettings = JSON.parse(savedSettings); } 
        catch (e) { window.appSettings = {}; }
    } else { window.appSettings = {}; }
};
window.loadGlobalSettings();

window.loadSettingsView = function() {
    const container = document.getElementById("settingsContainer") || document.getElementById("mainContentArea") || document.getElementById("appView");
    if (!container) return console.error("រកមិនឃើញ ID: settingsContainer ទេ!");

    window.loadGlobalSettings();

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-8 animate-fade-in font-siemreap pb-20">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden border border-slate-700">
           <div class="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
           <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
           <div class="relative z-10">
             <h2 class="text-2xl md:text-3xl font-black font-moul mb-3 tracking-wide drop-shadow-md">ការកំណត់ទូទៅនៃប្រព័ន្ធ</h2>
             <p class="text-sm md:text-base text-indigo-200 font-medium">គ្រប់គ្រងព័ត៌មានសាលារៀន គ្រូបង្រៀន រូបភាពផ្លូវការ និងប្រព័ន្ធទិន្នន័យ</p>
           </div>
           <div class="w-16 h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-inner relative z-10 backdrop-blur-md">
             <i class="fa-solid fa-gears text-indigo-100"></i>
           </div>
        </div>

        <!-- ផ្ទាំងប្រវត្តិរូបគ្រូបង្រៀន (Teacher Profile View) -->
        <div class="w-full bg-slate-50 border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden mb-8 relative">
            <div class="h-32 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative">
                <div class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
            </div>
            
            <div class="px-6 md:px-10 pb-8 flex flex-col items-center relative -mt-16">
                <!-- User Avatar -->
                <div class="relative group">
                    <div class="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg border border-slate-100">
                        <img id="profile_avatar_preview" src="${window.appSettings.profile_avatar || 'https://ui-avatars.com/api/?name=Teacher&background=e0e7ff&color=4338ca&size=150'}" class="w-full h-full rounded-full object-cover bg-slate-100">
                    </div>
                    <label class="absolute bottom-1 right-1 w-9 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform transform hover:scale-110 border-2 border-white">
                        <i class="fa-solid fa-camera text-sm"></i>
                        <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'profile_avatar_preview', 'val_profile_avatar', null)" class="hidden">
                    </label>
                    <input type="hidden" id="val_profile_avatar" value="${window.appSettings.profile_avatar || ''}">
                </div>
                
                <h3 id="display_teacher_name" class="font-moul text-xl text-slate-800 mt-4 mb-1 uppercase tracking-wider">${window.appSettings.teacher_name || 'មិនទាន់មានឈ្មោះ'}</h3>
                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold font-mono shadow-sm">ID: ${localStorage.getItem('auth_teacher_id') || 'TCH-000'}</span>
            </div>

            <!-- Profile Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-200 bg-slate-50">
                
                <!-- ផ្នែកខាងឆ្វេង៖ ព័ត៌មានផ្ទាល់ខ្លួន -->
                <div class="p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
                    <div class="flex items-center gap-3 mb-6 bg-indigo-600 text-white px-4 py-2 rounded-xl w-max shadow-sm">
                        <i class="fa-solid fa-address-card"></i>
                        <h4 class="font-moul text-sm">ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-user text-indigo-400 w-4 text-center"></i>
                                <span>នាមត្រកូល និងនាមខ្លួន</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_teacher_name" value="${window.appSettings.teacher_name || ''}" placeholder="បញ្ចូលឈ្មោះ..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition" onkeyup="document.getElementById('display_teacher_name').textContent = this.value || 'មិនទាន់មានឈ្មោះ'">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-venus-mars text-indigo-400 w-4 text-center"></i>
                                <span>ភេទ</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <select id="prof_teacher_gender" class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition appearance-none cursor-pointer" dir="rtl">
                                    <option value="ប្រុស" ${window.appSettings.teacher_gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option>
                                    <option value="ស្រី" ${window.appSettings.teacher_gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option>
                                </select>
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-calendar-day text-indigo-400 w-4 text-center"></i>
                                <span>ថ្ងៃខែឆ្នាំកំណើត</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="date" id="prof_teacher_dob" value="${window.appSettings.teacher_dob || ''}" class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-phone text-indigo-400 w-4 text-center"></i>
                                <span>លេខទូរស័ព្ទ</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_teacher_phone" value="${window.appSettings.teacher_phone || ''}" placeholder="012 345..." class="text-right font-mono font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-envelope text-indigo-400 w-4 text-center"></i>
                                <span>អ៊ីមែល (Email)</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="email" id="prof_teacher_email" value="${window.appSettings.teacher_email || ''}" placeholder="example@gmail.com" class="text-right font-mono font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-graduation-cap text-indigo-400 w-4 text-center"></i>
                                <span>កម្រិតវប្បធម៌ទូទៅ</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_teacher_edu" value="${window.appSettings.teacher_edu || ''}" placeholder="ឧ. បរិញ្ញាបត្រ" class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-indigo-500 text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ផ្នែកខាងស្តាំ៖ ព័ត៌មានការងារ & ទីតាំង -->
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-3 mb-6 bg-teal-600 text-white px-4 py-2 rounded-xl w-max shadow-sm">
                        <i class="fa-solid fa-briefcase"></i>
                        <h4 class="font-moul text-sm">ព័ត៌មានការងារ & ទីលំនៅ</h4>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-school text-teal-500 w-4 text-center"></i>
                                <span>កម្រិតថ្នាក់បង្រៀន</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <select id="prof_teacher_level" class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition appearance-none cursor-pointer" dir="rtl">
                                    <option value="ថ្នាក់ទី ១" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ១' ? 'selected' : ''}>ថ្នាក់ទី ១</option>
                                    <option value="ថ្នាក់ទី ២" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ២' ? 'selected' : ''}>ថ្នាក់ទី ២</option>
                                    <option value="ថ្នាក់ទី ៣" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៣' ? 'selected' : ''}>ថ្នាក់ទី ៣</option>
                                    <option value="ថ្នាក់ទី ៤" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៤' ? 'selected' : ''}>ថ្នាក់ទី ៤</option>
                                    <option value="ថ្នាក់ទី ៥" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៥' ? 'selected' : ''}>ថ្នាក់ទី ៥</option>
                                    <option value="ថ្នាក់ទី ៦" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៦' ? 'selected' : ''}>ថ្នាក់ទី ៦</option>
                                    <option value="ថ្នាក់ទី ៧" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៧' ? 'selected' : ''}>ថ្នាក់ទី ៧</option>
                                    <option value="ថ្នាក់ទី ៨" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៨' ? 'selected' : ''}>ថ្នាក់ទី ៨</option>
                                    <option value="ថ្នាក់ទី ៩" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ៩' ? 'selected' : ''}>ថ្នាក់ទី ៩</option>
                                    <option value="ថ្នាក់ទី ១០" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ១០' ? 'selected' : ''}>ថ្នាក់ទី ១០</option>
                                    <option value="ថ្នាក់ទី ១១" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ១១' ? 'selected' : ''}>ថ្នាក់ទី ១១</option>
                                    <option value="ថ្នាក់ទី ១២" ${window.appSettings.teacher_level === 'ថ្នាក់ទី ១២' ? 'selected' : ''}>ថ្នាក់ទី ១២</option>
                                </select>
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-door-open text-teal-500 w-4 text-center"></i>
                                <span>បន្ទប់ / កម្រង</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_teacher_room" value="${window.appSettings.teacher_room || '«ក»'}" placeholder="បន្ទប់..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-location-dot text-teal-500 w-4 text-center"></i>
                                <span>ភូមិ</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_village" value="${window.appSettings.village || ''}" placeholder="ឈ្មោះភូមិ..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-map text-teal-500 w-4 text-center"></i>
                                <span>ឃុំ / សង្កាត់</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_commune" value="${window.appSettings.commune || ''}" placeholder="ឈ្មោះឃុំ..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-building text-teal-500 w-4 text-center"></i>
                                <span>ក្រុង / ស្រុក / ខណ្ឌ</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_district" value="${window.appSettings.district || ''}" placeholder="ឈ្មោះស្រុក..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>

                        <div class="flex justify-between items-center py-2.5 border-b border-slate-100 group">
                            <div class="flex items-center gap-3 text-slate-500 text-sm">
                                <i class="fa-solid fa-map-location-dot text-teal-500 w-4 text-center"></i>
                                <span>រាជធានី / ខេត្ត</span>
                            </div>
                            <div class="flex items-center gap-2 w-1/2 justify-end">
                                <input type="text" id="prof_province" value="${window.appSettings.province || ''}" placeholder="ឈ្មោះខេត្ត..." class="text-right font-bold text-slate-800 text-sm outline-none bg-transparent w-full focus:bg-white focus:ring-2 focus:ring-teal-200 rounded px-2 py-1 transition">
                                <i class="fa-solid fa-pen text-slate-300 group-hover:text-teal-500 text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <form id="settingsForm" onsubmit="window.handleSaveSettings(event)" class="space-y-8">
           
           <!-- ១. ព័ត៌មានសាលារៀន (School Info) -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3">
                   <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-school"></i></div>
                   ១. ព័ត៌មានសាលារៀន
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (ខ្មែរ) *</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-graduation-cap text-slate-400"></i></div>
                         <input type="text" id="set_school_name" required placeholder="ឧ. សាលាបឋមសិក្សាគំរូ" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-moul text-blue-800 text-[13px] shadow-sm transition">
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ឈ្មោះសាលារៀន (អង់គ្លេស)</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-language text-slate-400"></i></div>
                         <input type="text" id="set_school_en" placeholder="ឧ. Kumro Primary School" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium shadow-sm transition">
                     </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">លេខកូដសាលា</label>
                         <input type="text" id="set_school_code" placeholder="ឧ. KPS" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono uppercase shadow-sm transition text-center">
                      </div>
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ឆ្នាំសិក្សា *</label>
                         <input type="text" id="set_academic_year" required placeholder="២០២៦-២០២៧" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-center shadow-sm transition font-siemreap">
                      </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">ប្រភេទសាលា</label>
                         <select id="set_school_type" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold shadow-sm transition appearance-none cursor-pointer font-siemreap text-[13px]">
                           <option value="មត្តេយ្យសិក្សា">មត្តេយ្យសិក្សា</option>
                           <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                           <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                           <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                           <option value="ចំណេះទូទៅ">ចំណេះទូទៅ (គ្រប់កម្រិត)</option>
                         </select>
                      </div>
                      <div>
                         <label class="block text-xs font-bold text-slate-600 mb-2">កម្រងសាលា</label>
                         <input type="text" id="set_cluster" placeholder="ឧ. កម្រង..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-center text-slate-800 shadow-sm transition font-siemreap text-[13px]">
                      </div>
                  </div>

                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">នាយក / នាយិកាសាលា *</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-user-tie text-slate-400"></i></div>
                         <input type="text" id="set_principal_name" required placeholder="ឈ្មោះនាយកសាលា" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-slate-800 shadow-sm transition font-moul text-[13px]">
                     </div>
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-600 mb-2">ទំនាក់ទំនង (ទូរស័ព្ទ ឬ អ៊ីមែល)</label>
                     <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fa-solid fa-phone text-slate-400"></i></div>
                         <input type="text" id="set_school_contact" placeholder="012 345 678" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono shadow-sm transition font-siemreap">
                     </div>
                  </div>
               </div>
           </div>

           <!-- ៣. ចំណូលចិត្តប្រព័ន្ធ (System Settings) -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3">
                   <div class="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-sliders"></i></div>
                   ៣. ចំណូលចិត្តប្រព័ន្ធ (System Preferences)
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div class="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition">
                    <div>
                      <h4 class="font-bold text-slate-700 flex items-center gap-2 font-siemreap"><i class="fa-solid fa-cloud-arrow-up text-purple-500"></i> ស្វ័យប្រវត្តិ Sync ទិន្នន័យ</h4>
                      <p class="text-[11px] text-slate-500 mt-1 font-siemreap">រក្សាទុកទៅ Cloud ដោយស្វ័យប្រវត្តិពេលមានអ៊ីនធឺណិត</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="set_auto_sync" class="sr-only peer" checked>
                      <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
               </div>
           </div>

           <!-- ៤. រូបភាពផ្លូវការ (Official Images) -->
           <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition duration-300">
               <h3 class="font-bold text-slate-800 border-b-2 border-slate-100 pb-4 mb-6 text-lg flex items-center gap-3 font-siemreap">
                   <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-image"></i></div>
                   ៤. រូបភាពផ្លូវការ (សម្រាប់បោះពុម្ពឯកសារផ្សេងៗ)
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative hover:border-indigo-300 hover:bg-indigo-50/30 transition duration-300 group">
                      <label class="block text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2 font-siemreap"><i class="fa-solid fa-shield-cat text-indigo-500"></i> ឡូហ្គោសាលា</label>
                      <div class="w-28 h-28 mx-auto mb-5 border-2 border-dashed border-slate-300 group-hover:border-indigo-400 rounded-full p-2 bg-white flex items-center justify-center overflow-hidden transition shadow-inner">
                          <img id="preview_logo" src="" class="w-full h-full object-contain hidden" alt="Logo">
                          <div id="icon_logo" class="flex flex-col items-center justify-center text-slate-400">
                              <i class="fa-solid fa-image text-2xl mb-1"></i>
                              <span class="text-[10px]">ជ្រើសរើសរូប</span>
                          </div>
                      </div>
                      <label class="block w-full bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm font-siemreap">
                          <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសឡូហ្គោ
                          <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'preview_logo', 'val_logo', 'icon_logo')" class="hidden">
                      </label>
                      <input type="hidden" id="val_logo">
                  </div>

                  <div class="border-2 border-slate-100 rounded-3xl p-6 text-center bg-slate-50/50 shadow-sm relative hover:border-emerald-300 hover:bg-emerald-50/30 transition duration-300 group">
                      <label class="block text-sm font-bold text-slate-700 mb-4 flex items-center justify-center gap-2 font-siemreap"><i class="fa-solid fa-signature text-emerald-500"></i> ហត្ថលេខានាយក</label>
                      <div class="w-36 h-28 mx-auto mb-5 border-2 border-dashed border-slate-300 group-hover:border-emerald-400 rounded-2xl p-2 bg-white flex items-center justify-center overflow-hidden transition shadow-inner">
                          <img id="preview_sig" src="" class="w-full h-full object-contain hidden" alt="Signature">
                          <div id="icon_sig" class="flex flex-col items-center justify-center text-slate-400">
                              <i class="fa-solid fa-signature text-2xl mb-1"></i>
                              <span class="text-[10px]">ជ្រើសរើសហត្ថលេខា</span>
                          </div>
                      </div>
                      <label class="block w-full bg-white border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm font-siemreap">
                          <i class="fa-solid fa-upload mr-1"></i> ជ្រើសរើសហត្ថលេខា
                          <input type="file" accept="image/png, image/jpeg" onchange="window.processSettingsImage(this, 'preview_sig', 'val_sig', 'icon_sig')" class="hidden">
                      </label>
                      <p class="text-[9px] text-slate-400 mt-3 font-medium font-siemreap">* គួរប្រើរូបភាព .PNG ផ្ទៃថ្លា (Transparent)</p>
                      <input type="hidden" id="val_sig">
                  </div>
               </div>
           </div>

           <!-- ៥. គ្រប់គ្រងទិន្នន័យ (Data Backup) -->
           <div class="bg-rose-50/50 p-6 md:p-8 rounded-3xl shadow-sm border border-rose-100">
               <h3 class="font-bold text-rose-900 border-b-2 border-rose-100 pb-4 mb-6 text-lg flex items-center gap-3 font-siemreap">
                   <div class="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fa-solid fa-database"></i></div>
                   ៥. គ្រប់គ្រងទិន្នន័យ (Data Management)
               </h3>

               <div class="flex flex-wrap gap-4 items-center font-siemreap">
                  <button type="button" onclick="window.exportBackupData()" class="px-6 py-3 bg-white border border-rose-200 text-rose-700 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> ទាញយកទិន្នន័យ (Backup)
                  </button>
                  
                  <label class="px-6 py-3 bg-white border border-teal-200 text-teal-700 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-50 hover:border-teal-300 transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-upload"></i> នាំចូលទិន្នន័យ (Restore)
                    <input type="file" accept=".json" class="hidden" onchange="window.importBackupData(event)">
                  </label>

                  <div class="w-px h-10 bg-rose-200 mx-2 hidden md:block"></div>

                  <button type="button" onclick="window.clearLocalCacheWithConfirm()" class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                    <i class="fa-solid fa-trash-can"></i> លុបសម្អាត Cache ទាំងអស់
                  </button>
               </div>
               <p class="text-xs text-rose-500 mt-4 bg-white/60 inline-block px-3 py-1.5 rounded-lg border border-rose-100 font-siemreap">* ប្រសិនបើកម្មវិធីមានបញ្ហា លោកគ្រូអាចចុច "លុបសម្អាត Cache" ដើម្បីឱ្យប្រព័ន្ធទាញទិន្នន័យស្រស់ៗពី Server មកវិញដោយស្វ័យប្រវត្តិ។</p>
           </div>

           <!-- Submit Button -->
           <div class="flex justify-end pt-4 sticky bottom-6 z-50">
              <button type="submit" id="btnSaveSettings" class="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center gap-3 text-base border border-indigo-500 font-siemreap">
                 <i class="fa-solid fa-floppy-disk text-xl"></i> <span>រក្សាទុកការកំណត់ទាំងអស់</span>
              </button>
           </div>
        </form>
      </div>
    `;

    window.fillSettingsForm();
};

window.fillSettingsForm = function() {
    const s = typeof appSettings !== 'undefined' ? appSettings : {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    
    setVal("set_school_name", s.school_name);
    setVal("set_school_en", s.school_en);
    setVal("set_school_code", s.school_code);
    setVal("set_school_type", s.school_type || "បឋមសិក្សា");
    setVal("set_cluster", s.cluster || s.school_cluster); 
    setVal("set_principal_name", s.principal_name);
    setVal("set_academic_year", s.academic_year);
    setVal("set_school_contact", s.school_contact);
    
    setVal("prof_teacher_name", s.teacher_name);
    setVal("prof_teacher_phone", s.teacher_phone);
    setVal("prof_teacher_level", s.teacher_level || "ថ្នាក់ទី ១");
    setVal("prof_teacher_room", s.teacher_room || "«ក»");
    setVal("prof_teacher_gender", s.teacher_gender || "ប្រុស");
    setVal("prof_teacher_dob", s.teacher_dob || "");
    setVal("prof_teacher_email", s.teacher_email || "");
    setVal("prof_teacher_edu", s.teacher_edu || "");
    
    setVal("prof_province", s.province);
    setVal("prof_district", s.district);
    setVal("prof_commune", s.commune);
    setVal("prof_village", s.village);

    if(document.getElementById("set_auto_sync")) document.getElementById("set_auto_sync").checked = s.auto_sync !== false;
    
    if (s.logo_url) {
        const preview = document.getElementById("preview_logo");
        const icon = document.getElementById("icon_logo");
        if(preview) { preview.src = s.logo_url; preview.classList.remove("hidden"); }
        if(icon) icon.classList.add("hidden");
        setVal("val_logo", s.logo_url);
    }
    if (s.signature_url) {
        const preview = document.getElementById("preview_sig");
        const icon = document.getElementById("icon_sig");
        if(preview) { preview.src = s.signature_url; preview.classList.remove("hidden"); }
        if(icon) icon.classList.add("hidden");
        setVal("val_sig", s.signature_url);
    }
};

window.processSettingsImage = function(inputEl, previewImgId, hiddenInputId, iconId) {
    const file = inputEl.files[0];
    if (!file) return;

    const previewImg = document.getElementById(previewImgId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const iconEl = document.getElementById(iconId);

    if(previewImg) {
        previewImg.classList.add("opacity-50", "animate-pulse");
        previewImg.classList.remove("hidden");
    }
    if(iconEl) iconEl.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 300; 
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
            
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL("image/png", 0.8); 

            if(previewImg) {
                previewImg.src = compressedBase64;
                previewImg.classList.remove("opacity-50", "animate-pulse");
            }
            if(hiddenInput) hiddenInput.value = compressedBase64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.handleSaveSettings = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("btnSaveSettings");
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-xl"></i> <span>កំពុងរក្សាទុក...</span>`;
    btn.disabled = true;
    btn.classList.add("opacity-90", "cursor-not-allowed");

    const payload = {
        school_name: document.getElementById("set_school_name").value.trim(),
        school_en: document.getElementById("set_school_en").value.trim(),
        school_code: document.getElementById("set_school_code").value.trim(),
        school_type: document.getElementById("set_school_type").value,
        cluster: document.getElementById("set_cluster").value.trim(), 
        principal_name: document.getElementById("set_principal_name").value.trim(),
        academic_year: document.getElementById("set_academic_year").value.trim(),
        school_contact: document.getElementById("set_school_contact").value.trim(),
        
        teacher_name: document.getElementById("prof_teacher_name").value.trim(),
        teacher_gender: document.getElementById("prof_teacher_gender").value,
        teacher_dob: document.getElementById("prof_teacher_dob").value,
        teacher_phone: document.getElementById("prof_teacher_phone").value.trim(),
        teacher_email: document.getElementById("prof_teacher_email").value.trim(),
        teacher_edu: document.getElementById("prof_teacher_edu").value.trim(),
        
        teacher_level: document.getElementById("prof_teacher_level").value,
        teacher_room: document.getElementById("prof_teacher_room").value,
        province: document.getElementById("prof_province").value.trim(),
        district: document.getElementById("prof_district").value.trim(),
        commune: document.getElementById("prof_commune").value.trim(),
        village: document.getElementById("prof_village").value.trim(),
        
        auto_sync: document.getElementById("set_auto_sync").checked,
        
        profile_avatar: document.getElementById("val_profile_avatar") ? document.getElementById("val_profile_avatar").value : "",
        logo_url: document.getElementById("val_logo").value,
        signature_url: document.getElementById("val_sig").value
    };

    try {
        window.appSettings = payload;
        localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
        
        localStorage.setItem('selected_academic_year', payload.academic_year);
        const globalYearDrop = document.getElementById("globalAcademicYear");
        if (globalYearDrop) globalYearDrop.value = payload.academic_year;

        if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings();

        if (payload.auto_sync && typeof apiPost === "function") {
            try {
                let cloudPayload = { ...payload };
                cloudPayload.teacher_id = localStorage.getItem('auth_teacher_id'); 
                
                if (cloudPayload.logo_url && cloudPayload.logo_url.startsWith('data:image')) delete cloudPayload.logo_url;
                if (cloudPayload.signature_url && cloudPayload.signature_url.startsWith('data:image')) delete cloudPayload.signature_url;
                if (cloudPayload.profile_avatar && cloudPayload.profile_avatar.startsWith('data:image')) delete cloudPayload.profile_avatar;

                await apiPost("updateSettings", { data: cloudPayload });
            } catch (networkError) {
                console.warn("⚠️ រក្សាទុកក្នុងប្រព័ន្ធបានជោគជ័យ តែការបញ្ជូនទៅ Cloud បរាជ័យ:", networkError);
            }
        }
        
        if(typeof showToast === 'function') showToast("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");
        else alert("✅ រក្សាទុកការកំណត់បានជោគជ័យ!");
        
    } catch (error) {
        console.error(error);
        alert("❌ មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។ សូមលុប Cache បន្តិចសិន។");
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.classList.remove("opacity-90", "cursor-not-allowed");
    }
};

window.updateUIWithSettings = function() {
    const s = window.appSettings || {};
    const sidebarTitle = document.getElementById("sidebarSchoolName");
    if(sidebarTitle && s.school_name) sidebarTitle.textContent = s.school_name;

    const sidebarYear = document.getElementById("sidebarAcademicYear");
    if(sidebarYear && s.academic_year) {
        const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(s.academic_year) : s.academic_year;
        sidebarYear.textContent = "ឆ្នាំសិក្សា: " + khmerYear;
    }

    const sidebarLogo = document.getElementById("sidebarLogo");
    if(sidebarLogo && s.logo_url) {
        sidebarLogo.src = s.logo_url;
        sidebarLogo.classList.remove('hidden');
        if(sidebarLogo.nextElementSibling) sidebarLogo.nextElementSibling.classList.add('hidden');
    }
};

window.exportBackupData = function() {
    const data = {
        settings: JSON.parse(localStorage.getItem("school_settings") || "{}"),
        students: JSON.parse(localStorage.getItem("academic_students") || "[]"),
        examScores: JSON.parse(localStorage.getItem("academic_scores") || "[]"),
        academicData: JSON.parse(localStorage.getItem("academic_data") || "{}"),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SchoolApp_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.importBackupData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.settings) {
                localStorage.setItem("school_settings", JSON.stringify(data.settings));
                window.appSettings = data.settings;
            }
            if (data.students) localStorage.setItem("academic_students", JSON.stringify(data.students));
            if (data.examScores) localStorage.setItem("academic_scores", JSON.stringify(data.examScores));
            if (data.academicData) localStorage.setItem("academic_data", JSON.stringify(data.academicData));
            
            alert("✅ នាំចូលទិន្នន័យបានជោគជ័យ! ប្រព័ន្ធនឹងផ្ទុកឡើងវិញ (Reload)។");
            window.location.reload();
        } catch (error) {
            alert("❌ ឯកសារមិនត្រឹមត្រូវ ឬមានបញ្ហាក្នុងការនាំចូលទិន្នន័យ!");
        }
    };
    reader.readAsText(file);
    event.target.value = ""; 
};

window.clearLocalCacheWithConfirm = function() {
    if(confirm("⚠️ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបសម្អាតទិន្នន័យបណ្តោះអាសន្ន (Cache) មែនទេ?\n\nបញ្ជាក់៖ ប្រព័ន្ធនឹងទាមទារទាញយកទិន្នន័យថ្មីពី Server ម្តងទៀតនៅពេលចុច OK។")) {
        localStorage.removeItem('academic_scores');
        localStorage.removeItem('academic_students');
        localStorage.removeItem('academic_data');
        if(typeof showToast === 'function') showToast("🧹 បានសម្អាត Cache ដោយជោគជ័យ!");
        setTimeout(() => window.location.reload(), 1500);
    }
};

setTimeout(() => { if (typeof window.updateUIWithSettings === "function") window.updateUIWithSettings(); }, 500);

// មុខងារធ្វើបច្ចុប្បន្នភាព Sidebar ពី Settings (សម្រាប់ Layout ធំ)
window.updateSidebarFromSettings = function() {
    let savedSettings = {};
    try {
        const rawSettings = localStorage.getItem('school_settings') || localStorage.getItem('appSettings');
        if (rawSettings) savedSettings = JSON.parse(rawSettings);
    } catch (e) {}

    const sInfo = Object.keys(savedSettings).length > 0 ? savedSettings : (typeof appSettings !== 'undefined' ? appSettings : {});

    const schoolName = sInfo.school_name || "សាលាបឋមសិក្សា";
    const academicYear = document.getElementById("globalAcademicYear")?.value || localStorage.getItem('selected_academic_year') || sInfo.academic_year || "2026-2027";
    const logoUrl = sInfo.logo_url || sInfo.school_logo || "";

    const nameEl = document.getElementById("sidebarSchoolName");
    if (nameEl) { nameEl.textContent = schoolName; nameEl.title = schoolName; }

    const yearEl = document.getElementById("sidebarAcademicYear");
    if (yearEl) {
        const khmerYear = typeof window.toKhmerNum === 'function' ? window.toKhmerNum(academicYear) : academicYear;
        yearEl.textContent = "ឆ្នាំសិក្សា " + khmerYear;
    }

    const logoEl = document.getElementById("sidebarLogo");
    if (logoEl) {
        const fallbackIcon = logoEl.nextElementSibling; 
        if (logoUrl.trim() !== "") {
            logoEl.src = logoUrl;
            logoEl.classList.remove("hidden");
            if (fallbackIcon) fallbackIcon.classList.add("hidden");
        } else {
            logoEl.classList.add("hidden");
            if (fallbackIcon) fallbackIcon.classList.remove("hidden");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { if (typeof window.updateSidebarFromSettings === 'function') window.updateSidebarFromSettings(); }, 100); 
});

// 🔴 មុខងារផ្លាស់ប្តូរឆ្នាំសិក្សា (Dynamic Dropdowns)
window.changeGlobalAcademicYear = function(selectElement) {
    if (!selectElement) return;
    const newYear = selectElement.value;
    
    localStorage.setItem('selected_academic_year', newYear);
    if (window.appSettings) {
        window.appSettings.academic_year = newYear;
        localStorage.setItem("school_settings", JSON.stringify(window.appSettings));
    }

    // សម្អាត Cache ពេលដូរឆ្នាំសិក្សា ដើម្បីឱ្យវាទាញទិន្នន័យឆ្នាំថ្មី
    localStorage.removeItem('academic_scores');
    localStorage.removeItem('academic_students');
    localStorage.removeItem('academic_data');

    const loadingHtml = `
    <div id="globalYearLoading" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999999] flex flex-col justify-center items-center font-siemreap">
        <div class="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-5 border border-white/20 shadow-2xl">
            <i class="fa-solid fa-rotate fa-spin text-4xl text-sky-400"></i>
        </div>
        <h2 class="text-white text-2xl font-bold font-moul mb-3 tracking-wide">ប្តូរទៅឆ្នាំសិក្សា ${window.toKhmerNum(newYear)}</h2>
        <p class="text-sky-200 text-sm font-medium bg-white/10 px-4 py-2 rounded-full">ប្រព័ន្ធកំពុងទាញយកទិន្នន័យថ្មី សូមរង់ចាំបន្តិច...</p>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', loadingHtml);

    setTimeout(() => { window.location.reload(); }, 1500); 
};

document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "globalAcademicYear") window.changeGlobalAcademicYear(e.target);
});

window.syncGlobalYearDropdown = function() {
    const yearSelect = document.getElementById("globalAcademicYear");
    if (yearSelect) {
        let savedYear = localStorage.getItem('selected_academic_year') || window.appSettings?.academic_year;
        if (savedYear) yearSelect.value = savedYear;
    }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => window.syncGlobalYearDropdown(), 300); });