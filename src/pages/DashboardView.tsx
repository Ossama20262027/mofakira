import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  CheckSquare,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Mic,
  FileText,
  School,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectView: (view: string) => void;
  onOpenVoiceAssistant: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewTask: () => void;
  onOpenNewDeadline: () => void;
  onOpenNewMeeting: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectView,
  onOpenVoiceAssistant,
  onOpenNewAppointment,
  onOpenNewTask,
  onOpenNewDeadline,
  onOpenNewMeeting,
}) => {
  const { user } = useAuth();
  const { appointments, tasks, deadlines, meetings, toggleTaskStatus } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);

  // Deadlines due today or within 3 days
  const upcomingDeadlines = deadlines.filter((d) => {
    if (d.status === 'completed') return false;
    const diff = (new Date(d.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 5;
  });

  const overdueDeadlines = deadlines.filter((d) => d.status !== 'completed' && d.dueDate < todayStr);

  const upcomingMeetings = meetings
    .filter((m) => !m.isCompleted && m.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <School className="w-3.5 h-3.5 text-amber-300" />
              <span>{user?.institutionName || 'متوسطة الشهيد زبانة'}</span>
              <span>•</span>
              <span>السنة الدراسية: {user?.academicYear || '2026/2027'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              أهلاً بك، {user?.name || 'الأستاذ أمحمد شامخة'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              مساعدك الإداري متزامن وجاهز. لديك اليوم{' '}
              <strong className="text-white font-bold">{todayAppointments.length} مواعيد</strong>، و{' '}
              <strong className="text-white font-bold">{pendingTasks.length} مهام إدارية</strong> قيد المتابعة.
            </p>
          </div>

          {/* Quick Voice Assistant Card Action */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 animate-bounce" />
              <span>المساعد الصوتي 🎙️</span>
            </button>
            <button
              onClick={() => onSelectView('appointments')}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition cursor-pointer"
            >
              <span>جدول اليوم</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Mawa'eed Alyawm */}
        <div
          onClick={() => onSelectView('appointments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {todayAppointments.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">مواعيد اليوم</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {todayAppointments.length > 0 ? `${todayAppointments[0].time} - ${todayAppointments[0].title}` : 'لا توجد مواعيد'}
          </p>
        </div>

        {/* 2. Maham */}
        <div
          onClick={() => onSelectView('tasks')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
              <CheckSquare className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {pendingTasks.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">المهام الجارية</h4>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            {completedTasks.length} مكتملة
          </p>
        </div>

        {/* 3. Ajal Qariba */}
        <div
          onClick={() => onSelectView('deadlines')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {upcomingDeadlines.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">آجال قريبة</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">خلال 5 أيام</p>
        </div>

        {/* 4. Muta'akhira */}
        <div
          onClick={() => onSelectView('tasks')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-red-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-red-600 dark:text-red-400">
              {overdueTasks.length + overdueDeadlines.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">متأخرات</h4>
          <p className="text-[10px] text-red-500 mt-0.5">تتطلب تسوية فورية</p>
        </div>

        {/* 5. Majalis & Ijtima'at */}
        <div
          onClick={() => onSelectView('meetings')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
              {upcomingMeetings.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">مجالس مبرمجة</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {upcomingMeetings.length > 0 ? upcomingMeetings[0].title : 'لا توجد مجالس'}
          </p>
        </div>

        {/* 6. Memos & Files */}
        <div
          onClick={() => onSelectView('voice-memos')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">
              {user?.settings?.alertSound ? 'مفعل' : 'صامت'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">المذكرات الصوتية</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">تسجيل ومتابعة سريعة</p>
        </div>
      </div>

      {/* Fast Action Buttons Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          إجراءات إدارية سريعة:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>موعد / زيارة</span>
          </button>
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مهمة إدارية</span>
          </button>
          <button
            onClick={onOpenNewDeadline}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>أجل إداري</span>
          </button>
          <button
            onClick={onOpenNewMeeting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مجلس مؤسسة</span>
          </button>
        </div>
      </div>

      {/* Main Content Two Columns: Today's Agenda + Urgent Deadlines & Councils */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column (2 spans): Today's Schedule & Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Timeline */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  جدول مواعيد اليوم
                </h3>
              </div>
              <button
                onClick={() => onSelectView('appointments')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
                  <p className="text-xs">لا توجد مواعيد مبرمجة لليوم</p>
                  <button
                    onClick={onOpenNewAppointment}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    + إضافة موعد جديد
                  </button>
                </div>
              ) : (
                todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold shrink-0 mt-0.5">
                        {apt.time}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{apt.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          مع: <span className="font-semibold text-slate-700 dark:text-slate-200">{apt.personOrEntity}</span> • المكان: {apt.location || 'مكتب المدير'}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{apt.notes}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                        apt.type === 'parents'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : apt.type === 'inspection'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {apt.type === 'parents'
                        ? 'استقبال أولياء'
                        : apt.type === 'inspection'
                        ? 'زيارة تفتيشية'
                        : 'إداري'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks Quick List */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  المهام الإدارية الأولوية
                </h3>
              </div>
              <button
                onClick={() => onSelectView('tasks')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة كافة المهام</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title="تعليم كمكتمل"
                    >
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 flex items-center justify-center hover:border-emerald-500">
                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        الأجل: {task.dueDate} • المكلف: {task.responsiblePerson || 'المدير'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      task.priority === 'urgent'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {task.priority === 'urgent' ? 'عاجل جداً' : task.priority === 'high' ? 'أولوية عالية' : 'عادي'}
                  </span>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ✓ أحسنت أستاذ المدير! جميع المهام مكتملة حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Column (1 span): Urgent Deadlines & Upcoming Councils */}
        <div className="space-y-6">
          {/* Urgent Administrative Deadlines */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  الآجال والمراسلات القريبة
                </h3>
              </div>
              <button
                onClick={() => onSelectView('deadlines')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                الكل
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  لا توجد آجال ملحة في الأيام القليلة القادمة
                </div>
              ) : (
                upcomingDeadlines.slice(0, 4).map((dl) => {
                  const isToday = dl.dueDate === todayStr;
                  return (
                    <div
                      key={dl.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isToday
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {dl.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isToday
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isToday ? 'ينتهي اليوم' : dl.dueDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        الجهة المستلمة: <span className="font-semibold">{dl.authority}</span>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Councils & Meetings Widget */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  مجالس المؤسسة
                </h3>
              </div>
              <button
                onClick={() => onSelectView('meetings')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                البرنامج
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  لا توجد مجالس مبرمجة حالياً
                </div>
              ) : (
                upcomingMeetings.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                        {m.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      الساعة: {m.time} • المكان: {m.location}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{m.participants.length} مشارك</span>
                      <span>{m.generatedTasks?.length || 0} مهام متابعة</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
