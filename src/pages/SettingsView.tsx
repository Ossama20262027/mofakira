import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { soundAlerts, playAdminChime } from '../utils/audioAlerts';
import {
  Settings as SettingsIcon,
  User,
  School,
  Bell,
  Volume2,
  VolumeX,
  Database,
  Download,
  Upload,
  RefreshCw,
  Check,
  Shield,
  Smartphone,
  Mail,
  Building,
  AtSign,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const {
    syncNow,
    isSyncing,
    appointments,
    tasks,
    meetings,
    deadlines,
    archives,
    voiceMemos,
    censorSettings,
    updateCensorSettings,
  } = useData();

  const [fullName, setFullName] = useState(user?.name || 'الأستاذ أمحمد شامخة');
  const [schoolName, setSchoolName] = useState(user?.institutionName || 'متوسطة الشهيد زبانة');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || '2026/2027');
  const [wilaya, setWilaya] = useState(user?.wilaya || 'الجزائر');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Censor Settings state
  const [censorName, setCensorName] = useState(censorSettings?.name || 'الأستاذ بلقاسم العربي (ناظر المتوسطة)');
  const [censorOfficialEmail, setCensorOfficialEmail] = useState(censorSettings?.officialEmail || 'censor.cem.zabana@education.gov.dz');
  const [censorPersonalEmail, setCensorPersonalEmail] = useState(censorSettings?.personalEmail || 'belkacem.censor@gmail.com');
  const [censorPhone, setCensorPhone] = useState(censorSettings?.phone || '0555123456');
  const [censorSavedSuccess, setCensorSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.institutionName) setSchoolName(user.institutionName);
      if (user.academicYear) setAcademicYear(user.academicYear);
      if (user.wilaya) setWilaya(user.wilaya);
      if (user.phone !== undefined) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (censorSettings) {
      if (censorSettings.name) setCensorName(censorSettings.name);
      if (censorSettings.officialEmail) setCensorOfficialEmail(censorSettings.officialEmail);
      if (censorSettings.personalEmail) setCensorPersonalEmail(censorSettings.personalEmail);
      if (censorSettings.phone) setCensorPhone(censorSettings.phone);
    }
  }, [censorSettings]);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: fullName,
      institutionName: schoolName,
      academicYear,
      wilaya,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      principal: user?.name,
      school: user?.institutionName,
      appointments,
      tasks,
      meetings,
      deadlines,
      archives,
      voiceMemos,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `نسخة_احتياطية_${user?.institutionName || 'المتوسطة'}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTestChime = () => {
    playAdminChime('urgent');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-right">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span>إعدادات التطبيق والمؤسسة</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          تخصيص بيانات المدير، المؤسسة التربوية، التنبيهات الصوتية، والنسخ الاحتياطي
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم حفظ الإعدادات والبيانات بنجاح!</span>
        </div>
      )}

      {/* Profile & Institution Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <School className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            بيانات السيد المدير والمؤسسة التربوية
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم ولقب السيد المدير
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المؤسسة التربوية (المتوسطة)
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              السنة الدراسية الحالية
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              مديرية التربية لولاية
            </label>
            <input
              type="text"
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم الهاتف الإداري
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05 / 06 / 07 ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            حفظ البيانات
          </button>
        </div>
      </form>

      {/* Censor Contact Settings Card */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await updateCensorSettings({
            name: censorName.trim(),
            officialEmail: censorOfficialEmail.trim(),
            personalEmail: censorPersonalEmail.trim(),
            phone: censorPhone.trim(),
          });
          setCensorSavedSuccess(true);
          setTimeout(() => setCensorSavedSuccess(false), 2500);
        }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                بيانات التواصل مع السيد ناظر المتوسطة
              </h3>
              <p className="text-[11px] text-slate-400">
                تُحفظ عناوين البريد الإلكتروني مرة واحدة وتُستخدم تلقائياً عند إرسال المراسلات والوثائق
              </p>
            </div>
          </div>
          {censorSavedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>تم حفظ بيانات الناظر</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم وصفة الناظر *
            </label>
            <input
              type="text"
              value={censorName}
              onChange={(e) => setCensorName(e.target.value)}
              placeholder="الأستاذ بلقاسم العربي"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم هاتف الناظر
            </label>
            <input
              type="tel"
              value={censorPhone}
              onChange={(e) => setCensorPhone(e.target.value)}
              placeholder="0555123456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              <span>البريد الإلكتروني الرسمي الخاص بالمؤسسة *</span>
            </label>
            <input
              type="email"
              value={censorOfficialEmail}
              onChange={(e) => setCensorOfficialEmail(e.target.value)}
              placeholder="censor.cem.zabana@education.gov.dz"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">البريد المعتمد للمراسلات الإدارية الرسمية</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-blue-500" />
              <span>البريد الإلكتروني الشخصي للناظر *</span>
            </label>
            <input
              type="email"
              value={censorPersonalEmail}
              onChange={(e) => setCensorPersonalEmail(e.target.value)}
              placeholder="belkacem.censor@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">البريد الاحتياطي للمراسلات العاجلة والإشعارات</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            حفظ إعدادات بريد الناظر
          </button>
        </div>
      </form>

      {/* Audio & Notification Settings */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            صوت المنبه والتنبيهات الإدارية (Alarm Audio Alerts)
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              صوت تنبيه المنبه القوي (Web Audio API)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              نغمات تنبيه واضحة وعالية النبرة تحاكي صوت المنبه عند اقتراب المواعيد أو حلول الآجال، لضمان لفت انتباه المدير دون تفويت أي التزام.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => soundAlerts.playAlarm()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
              title="تشغيل صوت المنبه الإلكتروني القوي"
            >
              <Volume2 className="w-4 h-4" />
              <span>تجربة صوت المنبه ⏰</span>
            </button>

            <button
              type="button"
              onClick={() => soundAlerts.playAlarmBell()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
              title="تشغيل رنين الجرس المدرسي المتكرر"
            >
              <Bell className="w-4 h-4" />
              <span>جرس المنبه المدرسي 🔔</span>
            </button>

            <button
              type="button"
              onClick={() => soundAlerts.stopAlarm()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="إيقاف صوت المنبه فوراً"
            >
              <VolumeX className="w-4 h-4" />
              <span>إيقاف الصوت ⏹️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Cloud Synchronization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            إدارة البيانات والنسخ الاحتياطي والمزامنة
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          جميع بيانات المؤسسة (المواعيد، المهام، المجالس، الآجال، والأرشيف) تخزن محلياً على جهازك
          لضمان العمل دون إنترنت، مع إمكانية المزامنة السحابية وتصدير نسخة احتياطية كاملة في أي وقت.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جارِ المزامنة...' : 'مزامنة البيانات الآن'}</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير نسخة احتياطية كاملة (JSON)</span>
          </button>
        </div>
      </div>

      {/* PWA & Mobile Installation */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-300" />
          <h3 className="text-sm font-bold">تطبيق الهاتف والحاسوب (PWA)</h3>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          يمكنك تثبيت تطبيق «مساعد مدير المتوسطة» على شاشة هاتفك أو حاسوبك المكتبي لفتحه مباشرة
          دون متصفح، والحصول على التنبيهات السريعة والعمل دون اتصال بالإنترنت.
        </p>
        <div className="pt-2">
          <PWAInstallButton />
        </div>
      </div>
    </div>
  );
};
