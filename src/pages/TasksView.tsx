import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Filter,
  Mic,
  MicOff,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TasksViewProps {
  initialOpenModal?: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({ initialOpenModal = false }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useData();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [responsiblePerson, setResponsiblePerson] = useState('المدير');

  const todayStr = new Date().toISOString().split('T')[0];

  // Speech Recognition for Task description
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
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate(todayStr);
    setPriority('medium');
    setStatus('not_started');
    setResponsiblePerson('المدير');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
    setResponsiblePerson(task.responsiblePerson || 'المدير');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title,
        description,
        dueDate,
        priority,
        status,
        responsiblePerson,
      });
    } else {
      await addTask({
        title,
        description,
        dueDate,
        priority,
        status,
        responsiblePerson,
      });
    }

    setIsModalOpen(false);
  };

  // Quick templates for Algerian middle school administration
  const administrativeTemplates = [
    'إعداد جداول الحصص الأسبوعية للأساتذة',
    'إرسال إحصائيات الدخول المدرسي لمصلحة التمدرس',
    'فحص جاهزية التدفئة المركزية والمطعم المدرسي',
    'توزيع مقررات مجالس الأقسام على الأساتذة الرئيسيين',
    'المصادقة على محاضر التنصيب والتحويلات',
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedStatus === 'overdue') {
        return t.status !== 'completed' && t.dueDate < todayStr;
      }
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      return true;
    }).sort((a, b) => {
      // Uncompleted first, then by due date
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, selectedStatus, selectedPriority, todayStr]);

  const priorityLabels: Record<TaskPriority, { text: string; color: string }> = {
    urgent: { text: 'عاجل جداً', color: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
    high: { text: 'أولوية عالية', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
    medium: { text: 'متوسطة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
    low: { text: 'منخفضة', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  };

  const statusLabels: Record<TaskStatus, string> = {
    not_started: 'لم تبدأ',
    in_progress: 'قيد الإنجاز',
    completed: 'مكتملة',
    postponed: 'مؤجلة',
    overdue: 'متأخرة',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span>المهام الإدارية والمتابعة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            متابعة المهام التنفيذية، التكليفات الداخلية، والقرارات الإدارية
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Templates Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>نماذج سريعة:</span>
        </span>
        {administrativeTemplates.map((tpl, i) => (
          <button
            key={i}
            onClick={() => {
              setTitle(tpl);
              openCreateModal();
              setTitle(tpl);
            }}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 whitespace-nowrap transition cursor-pointer"
          >
            + {tpl}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: 'كافة المهام' },
            { id: 'not_started', label: 'لم تبدأ' },
            { id: 'in_progress', label: 'قيد الإنجاز' },
            { id: 'completed', label: 'المكتملة' },
            { id: 'overdue', label: 'المتأخرة' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">كافة الأولويات</option>
            <option value="urgent">عاجل جداً</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              لا توجد مهام تطابق الفرز المحدد
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70'
                    : isOverdue
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-1 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title={isCompleted ? 'إعادة للمهام الجارية' : 'تعليم كمكتمل'}
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
                          {task.title}
                        </h3>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            priorityLabels[task.priority].color
                          }`}
                        >
                          {priorityLabels[task.priority].text}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {statusLabels[task.status]}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>المكلف: {task.responsiblePerson || 'المدير'}</span>
                        </span>
                        <span>•</span>
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : ''
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>الأجل: {task.dueDate}</span>
                          {isOverdue && <span className="text-[10px] bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">(متأخر)</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
                          deleteTask(task.id);
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
          })
        )}
      </div>

      {/* Task Create / Edit Modal with Voice Dictation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? 'تعديل مهمة إدارية' : 'إضافة مهمة إدارية جديدة'}
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
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مراجعة محاضر التنصيب ومطابقتها"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المسؤول عن التنفيذ
                  </label>
                  <select
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="المدير">المدير شخصياً</option>
                    <option value="الناظر">الناظر (مدير الدروس)</option>
                    <option value="مستشار التربية">مستشار التربية</option>
                    <option value="المقتصد">المقتصد / المصالح الاقتصادية</option>
                    <option value="أمانة المؤسسة">أمانة المديرية</option>
                    <option value="الأساتذة الرئيسيون">الأساتذة الرئيسيون</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الأجل المحدد للإنجاز *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    درجة الأولوية
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="urgent">عاجل جداً</option>
                    <option value="high">أولوية عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حالة الإنجاز
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="not_started">لم تبدأ بعد</option>
                    <option value="in_progress">قيد الإنجاز</option>
                    <option value="completed">مكتملة</option>
                    <option value="postponed">مؤجلة</option>
                  </select>
                </div>
              </div>

              {/* Voice Dictation for Task Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    شرح المهمة والملاحظات
                  </label>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'إيقاف الإملاء' : 'إملاء صوتي 🎙️'}</span>
                  </button>
                </div>
                {statusMessage && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-1 font-medium">
                    {statusMessage}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="التوجيهات والمعايير المطلوبة للمهمة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingTask ? 'حفظ التعديلات' : 'إضافة المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
