import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Menu,
  RotateCw,
  Search,
  Mic,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  User,
  School,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenSearch: () => void;
  onSelectView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenVoiceAssistant,
  onOpenSearch,
  onSelectView,
}) => {
  const { user } = useAuth();
  const { isOnline, isSyncing, lastSyncedAt, syncNow, settings, updateSettings, testSound } = useData();

  // Arabic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير أستاذ المدير' : 'مساء الخير أستاذ المدير';

  // Format today's Arabic date
  const todayFormatted = new Intl.DateTimeFormat('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    updateSettings({ soundEnabled: nextState });
    if (nextState) {
      testSound();
    }
  };

  const formatLastSync = () => {
    if (!lastSyncedAt) return 'لم تتم المزامنة بعد';
    const date = new Date(lastSyncedAt);
    return date.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Right Section (RTL Start): Hamburger + Greeting + Date */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{greeting}</span>
                  {user?.name && <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">({user.name})</span>}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-medium">{todayFormatted}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span>{user?.institutionName || 'متوسطة الشهيد زبانة'}</span>
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  السنة: {user?.academicYear || '2026/2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Section (RTL End): Status + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
              title={isOnline ? 'متصل بالإنترنت وقاعدة البيانات السحابية' : 'وضع عدم الاتصال: البيانات محفوظة محلياً على الجهاز'}
            >
              {isOnline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>غير متصل</span>
                </>
              )}
            </div>

            {/* Sync Button */}
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
              title={`مزامنة الآن (آخر مزامنة: ${formatLastSync()})`}
            >
              <RotateCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">مزامنة الآن</span>
            </button>

            {/* Smart Voice Assistant Button 🎙️ */}
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-bold shadow-sm hover:from-blue-800 hover:to-indigo-800 active:scale-95 transition cursor-pointer"
              title="المساعد الصوتي الذكي"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>تحدث 🎙️</span>
            </button>

            {/* Global Search Button 🔍 */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="البحث العام في المواعيد، المهام، والوثائق"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sound Mute Toggle Button */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition cursor-pointer ${
                settings.soundEnabled
                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={settings.soundEnabled ? 'التنبيهات الصوتية مفعلة' : 'التنبيهات الصوتية معطلة'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* User Profile Avatar Link */}
            <button
              onClick={() => onSelectView('profile')}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="الملف الشخصي والحساب"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
                {user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
