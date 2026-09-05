import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { AdministrativeDeadline } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Clock,
  Plus,
  Calendar,
  AlertTriangle,
  Building2,
  FileCheck,
  X,
  Trash2,
  Edit2,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  FileText,
} from 'lucide-react';

interface DeadlinesViewProps {
  initialOpenModal?: boolean;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({ initialOpenModal = false }) => {
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useData();

  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingDeadline, setEditingDeadline] = useState<AdministrativeDeadline | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('مديرية التربية - مصلحة التمدرس والامتحانات');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium'>('high');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

  const todayStr = new Date().toISOString().split('T')[0];

  // Speech Recognition
  const {
    isListening,
    startListening,
    stopListening,
    statusMessage,
  } = useSpeechRecognition({
    lang: 'ar-DZ',
    onTranscript: (spoken) => {
      setDescription((prev) => (prev ? prev + ' ' : '') + spoken);
    },
  });

  const openCreateModal = () => {
    setEditingDeadline(null);
    setTitle('');
    setAuthority('مديرية التربية - مصلحة التمدرس والامتحانات');
    setDueDate(todayStr);
    setReferenceNumber('');
    setDescription('');
    setPriority('high');
    setReminderDaysBefore(3);
    setIsModalOpen(true);
  };

  const openEditModal = (dl: AdministrativeDeadline) => {
    setEditingDeadline(dl);
    setTitle(dl.title);
    setAuthority(dl.authority);
    setDueDate(dl.dueDate);
    setReferenceNumber(dl.referenceNumber || '');
    setDescription(dl.description || '');
    setPriority(dl.priority);
    setReminderDaysBefore(dl.reminderDaysBefore || 3);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    if (editingDeadline) {
      await updateDeadline(editingDeadline.id, {
        title,
        authority,
        dueDate,
        referenceNumber,
        description,
        priority,
        reminderDaysBefore,
      });
    } else {
      await addDeadline({
        title,
        authority,
        dueDate,
        referenceNumber,
        description,
        priority,
        status: 'pending',
        reminderDaysBefore,
      });
    }

    setIsModalOpen(false);
  };

  // Middle school recurring administrative deadline templates
  const deadlineTemplates = [
    { title: 'إرسال التقرير النهائي للدخول المدرسي', auth: 'مديرية التربية - مصلحة التمدرس' },
    { title: 'إيداع كشف الرواتب ومنحة المردودية الثلاثية', auth: 'الخزينة العمومية ومصلحة المالية' },
    { title: 'إرسال إحصاء المستفيدين من منحة 5000 دج والكتب المدرسية', auth: 'مديرية التربية - النشاط الاجتماعي' },
    { title: 'إرسال قوائم التلاميذ المترشحين لشهادة BEM', auth: 'فرع الديوان الوطني للامتحانات والمسابقات' },
    { title: 'إيداع الحساب المالي الإداري والميزانية السنوية', auth: 'مفتشية التربية الوطنية للمصالح المادية والمالية' },
  ];

  // Grouping deadlines by urgency
  const groupedDeadlines = useMemo(() => {
    const overdue: AdministrativeDeadline[] = [];
    const dueToday: AdministrativeDeadline[] = [];
    const dueSoon: AdministrativeDeadline[] = [];
    const upcoming: AdministrativeDeadline[] = [];
    const completed: AdministrativeDeadline[] = [];

    const nowTime = new Date(todayStr).getTime();

    deadlines.forEach((dl) => {
      if (dl.status === 'completed') {
        completed.push(dl);
        return;
      }

      const dueTime = new Date(dl.dueDate).getTime();
      const diffDays = Math.round((dueTime - nowTime) / (1000 * 3600 * 24));

      if (diffDays < 0) {
        overdue.push(dl);
      } else if (diffDays === 0) {
        dueToday.push(dl);
      } else if (diffDays <= 4) {
        dueSoon.push(dl);
      } else {
        upcoming.push(dl);
      }
    });

    return { overdue, dueToday, dueSoon, upcoming, completed };
  }, [deadlines, todayStr]);

  const renderDeadlineCard = (dl: AdministrativeDeadline, statusBadgeText: string, statusBadgeColor: string) => {
    const isCompleted = dl.status === 'completed';

    return (
      <div
        key={dl.id}
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isCompleted
            ? 'bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70'
            : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() =>
                updateDeadline(dl.id, {
                  status: isCompleted ? 'pending' : 'completed',
                  completedAt: isCompleted ? undefined : new Date().toISOString(),
                })
              }
              className="mt-1 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
              title={isCompleted ? 'إعادة للأجل الجاري' : 'تعليم كمودع / منجز'}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-400 hover:border-emerald-500'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </button>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-base font-bold text-slate-900 dark:text-white ${
                    isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                >
                  {dl.title}
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${statusBadgeColor}`}>
                  {statusBadgeText}
                </span>
                {dl.referenceNumber && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    رقم: {dl.referenceNumber}
                  </span>
                )}
              </div>

              {dl.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dl.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>الجهة المعنية: {dl.authority}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الاستحقاق: {dl.dueDate}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => openEditModal(dl)}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="تعديل"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذا الأجل الإداري؟')) {
                  deleteDeadline(dl.id);
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>الآجال الإدارية والمراسلات الرسمية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            متابعة تواريخ إرسال التقارير، المناشير الوزارية، والمراسلات مع مديرية التربية
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أجل إداري جديد</span>
        </button>
      </div>

      {/* Quick Templates */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>آجال ومراسلات دورية:</span>
        </span>
        {deadlineTemplates.map((tpl, i) => (
          <button
            key={i}
            onClick={() => {
              setTitle(tpl.title);
              setAuthority(tpl.auth);
              openCreateModal();
              setTitle(tpl.title);
              setAuthority(tpl.auth);
            }}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 whitespace-nowrap transition cursor-pointer"
          >
            + {tpl.title}
          </button>
        ))}
      </div>

      {/* Sections by Urgency */}
      {/* 1. Overdue */}
      {groupedDeadlines.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>آجال متأخرة تتطلب معالجة فورية ({groupedDeadlines.overdue.length})</span>
          </div>
          {groupedDeadlines.overdue.map((dl) =>
            renderDeadlineCard(dl, 'متأخر عن الأجل', 'bg-red-500 text-white animate-pulse')
          )}
        </div>
      )}

      {/* 2. Due Today */}
      {groupedDeadlines.dueToday.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>تنتهي اليوم ({groupedDeadlines.dueToday.length})</span>
          </div>
          {groupedDeadlines.dueToday.map((dl) =>
            renderDeadlineCard(dl, 'ينتهي اليوم', 'bg-amber-500 text-white')
          )}
        </div>
      )}

      {/* 3. Due Soon */}
      {groupedDeadlines.dueSoon.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>خلال 3 إلى 5 أيام ({groupedDeadlines.dueSoon.length})</span>
          </div>
          {groupedDeadlines.dueSoon.map((dl) =>
            renderDeadlineCard(dl, 'خلال أيام', 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300')
          )}
        </div>
      )}

      {/* 4. Upcoming */}
      {groupedDeadlines.upcoming.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>آجال لاحقة ({groupedDeadlines.upcoming.length})</span>
          </div>
          {groupedDeadlines.upcoming.map((dl) =>
            renderDeadlineCard(dl, 'لاحقاً', 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300')
          )}
        </div>
      )}

      {/* 5. Completed */}
      {groupedDeadlines.completed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>مودعة ومكتملة ({groupedDeadlines.completed.length})</span>
          </div>
          {groupedDeadlines.completed.map((dl) =>
            renderDeadlineCard(dl, 'تم الإيداع', 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300')
          )}
        </div>
      )}

      {deadlines.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            لا توجد آجال إدارية مسجلة حالياً
          </p>
          <button
            onClick={openCreateModal}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
          >
            + إضافة أجل إداري
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDeadline ? 'تعديل أجل إداري' : 'تسجيل أجل إداري جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  موضوع الإرسالية أو الأجل الإداري *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: إرسال تقرير الدخول المدرسي النهائي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجهة المستقبلة *
                  </label>
                  <input
                    type="text"
                    required
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="مديرية التربية - مصلحة التمدرس"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ انتهاء الأجل *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم المنشور أو المراسلة المرجعية
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="مثال: رقم 245/م.ت/2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التنبيه قبل الموعد بـ
                  </label>
                  <select
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="1">يوم واحد</option>
                    <option value="2">يومان</option>
                    <option value="3">3 أيام (مستحسن)</option>
                    <option value="5">5 أيام</option>
                    <option value="7">أسبوع كامل</option>
                  </select>
                </div>
              </div>

              {/* Voice Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ملاحظات وتوجيهات إضافية
                  </label>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'إيقاف الإملاء' : 'إملاء صوتي 🎙️'}</span>
                  </button>
                </div>
                {statusMessage && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mb-1 font-medium">
                    {statusMessage}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="الملفات المطلوبة مع الإرسالية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingDeadline ? 'حفظ التعديلات' : 'تسجيل الأجل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
