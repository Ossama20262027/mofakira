import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  Users,
  FolderArchive,
  Bell,
  Mic,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  GraduationCap,
  Sparkles,
  Monitor,
  Files,
  MailCheck,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenDesktopSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  onOpenVoiceAssistant,
  onOpenDesktopSync,
}) => {
  const { logout } = useAuth();
  const { appointments, tasks, deadlines, meetings, voiceMemos, activeAlerts, templates, censorMessages } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointmentsCount = appointments.filter(
    (a) => a.date === todayStr && a.status !== 'completed' && a.status !== 'cancelled'
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  const upcomingDeadlinesCount = deadlines.filter((d) => d.status !== 'completed').length;

  const upcomingMeetingsCount = meetings.filter((m) => !m.isCompleted && m.date >= todayStr).length;

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    {
      id: 'appointments',
      label: 'المواعيد والزيارات',
      icon: Calendar,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'tasks',
      label: 'المهام الإدارية',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'deadlines',
      label: 'الآجال الإدارية',
      icon: Clock,
      badge: upcomingDeadlinesCount > 0 ? upcomingDeadlinesCount : undefined,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'meetings',
      label: 'الاجتماعات والمجالس',
      icon: Users,
      badge: upcomingMeetingsCount > 0 ? upcomingMeetingsCount : undefined,
      badgeColor: 'bg-purple-600',
    },
    {
      id: 'templates',
      label: 'النماذج والوثائق',
      icon: Files,
      badge: templates.length > 0 ? templates.length : undefined,
      badgeColor: 'bg-indigo-600',
    },
    {
      id: 'censor',
      label: 'التواصل مع الناظر',
      icon: MailCheck,
      badge: censorMessages.length > 0 ? censorMessages.length : undefined,
      badgeColor: 'bg-cyan-600',
    },
    { id: 'archives', label: 'الأرشيف والملفات', icon: FolderArchive },
    {
      id: 'voice-memos',
      label: 'المذكرات الصوتية',
      icon: Mic,
      badge: voiceMemos.length > 0 ? voiceMemos.length : undefined,
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'alerts',
      label: 'مركز التنبيهات',
      icon: Bell,
      badge: activeAlerts.length > 0 ? activeAlerts.length : undefined,
      badgeColor: 'bg-red-600',
    },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات والنسخ', icon: Settings },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-72 bg-slate-900 text-slate-100 flex flex-col justify-between border-l border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">مساعد مدير المتوسطة</h2>
                <p className="text-[11px] text-slate-400">إشراف: أ. شامخة أمحمد</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Voice Assistant Trigger Box */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => {
                onOpenVoiceAssistant();
                onClose();
              }}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-800/60 hover:border-blue-700 transition cursor-pointer text-right group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-blue-600 text-white group-hover:scale-105 transition">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-200">المساعد الذكي 🎙️</div>
                  <div className="text-[10px] text-slate-400">سجل موعداً بالصوت</div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Desktop Sync & System Info */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {onOpenDesktopSync && (
            <button
              onClick={() => {
                onOpenDesktopSync();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 border border-indigo-900/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span>تزامن مع سطح المكتب</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-900/60 font-mono text-indigo-200">
                PC Sync
              </span>
            </button>
          )}

          <div className="pt-1 text-center text-[10px] text-slate-500 font-mono">
            مساعد مدير المتوسطة • الأستاذ أمحمد شامخة
          </div>
        </div>
      </aside>
    </>
  );
};
