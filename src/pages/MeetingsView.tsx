import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Meeting, MeetingType } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  ListTodo,
  ShieldAlert,
} from 'lucide-react';

interface MeetingsViewProps {
  initialOpenModal?: boolean;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({ initialOpenModal = false }) => {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, createTasksFromMeeting } = useData();

  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState<Meeting | null>(null);

  // Form states
  const [type, setType] = useState<MeetingType>('class_council');
  const [title, setTitle] = useState('مجلس القسم للثلاثي الأول');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('13:30');
  const [location, setLocation] = useState('قاعة الاجتماعات');
  const [subject, setSubject] = useState('تقييم نتائج الفصل الأول وتوجيه التلاميذ');
  const [agendaInput, setAgendaInput] = useState('1. كلمة السيد المدير\n2. عرض نتائج القسم ونسب النجاح\n3. تدخلات الأساتذة\n4. التوجيه والملاحظات');
  const [participantsInput, setParticipantsInput] = useState('المدير (رئيساً)، مستشار التربية، الأساتذة، مندوب القسم، ممثل أولياء التلاميذ');
  const [minutes, setMinutes] = useState('');

  // Speech Recognition for Meeting Minutes
  const {
    isListening,
    startListening,
    stopListening,
    statusMessage,
  } = useSpeechRecognition({
    lang: 'ar-DZ',
    onTranscript: (spoken) => {
      setMinutes((prev) => (prev ? prev + ' ' : '') + spoken);
    },
  });

  const councilTypes: Record<string, { label: string; color: string; desc: string }> = {
    class_council: {
      label: 'مجلس القسم',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      desc: 'دراسة نتائج التلاميذ وسيرورة العملية التعليمية في كل قسم',
    },
    teaching_council: {
      label: 'مجلس التعليم',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
      desc: 'التنسيق البيداغوجي وتوزيع البرامج بين أساتذة المادة',
    },
    coordination_council: {
      label: 'مجلس التنسيق الإداري',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      desc: 'التنسيق بين المدير، الناظر، مستشار التربية، والمقتصد',
    },
    administrative_coordination: {
      label: 'مجلس التنسيق الإداري',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      desc: 'التنسيق بين المدير، الناظر، مستشار التربية، والمقتصد',
    },
    education_management: {
      label: 'مجلس التربية والتسيير',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      desc: 'المصادقة على مشروع المؤسسة، الميزانية، والتقرير السنوي',
    },
    education_management_council: {
      label: 'مجلس التربية والتسيير',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      desc: 'المصادقة على مشروع المؤسسة، الميزانية، والتقرير السنوي',
    },
    disciplinary_board: {
      label: 'مجلس التأديب',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
      desc: 'النظر في المخالفات السلوكية الجسيمة واتخاذ القرارات القانونية',
    },
    discipline_council: {
      label: 'مجلس التأديب',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
      desc: 'النظر في المخالفات السلوكية الجسيمة واتخاذ القرارات القانونية',
    },
    administrative_meeting: {
      label: 'اجتماع إداري',
      color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
      desc: 'جلسة عمل دورية لتنظيم العمل اليومي',
    },
    emergency_meeting: {
      label: 'اجتماع طارئ',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      desc: 'معالجة وضعية خاصة أو مستجدة داخل المؤسسة',
    },
  };

  const openCreateModal = (suggestedType?: MeetingType) => {
    setEditingMeeting(null);
    const chosenType = suggestedType || 'class_council';
    setType(chosenType);
    setTitle(councilTypes[chosenType].label);
    setDate(new Date().toISOString().split('T')[0]);
    setTime('13:30');
    setLocation('قاعة الاجتماعات');
    setSubject(councilTypes[chosenType].desc);
    setMinutes('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Meeting) => {
    setEditingMeeting(m);
    setType(m.type);
    setTitle(m.title);
    setDate(m.date);
    setTime(m.time);
    setLocation(m.location);
    setSubject(m.subject);
    setAgendaInput(m.agenda.join('\n'));
    setParticipantsInput(m.participants.join('، '));
    setMinutes(m.minutes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const agenda = agendaInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const participants = participantsInput
      .split(/[,،]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, {
        type,
        title,
        date,
        time,
        location,
        subject,
        agenda,
        participants,
        minutes,
      });
    } else {
      await addMeeting({
        type,
        title,
        date,
        time,
        location,
        subject,
        agenda,
        participants,
        minutes,
        generatedTasks: [],
        isCompleted: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleGenerateTasks = async (meetingId: string) => {
    await createTasksFromMeeting(meetingId);
    alert('✓ تم بنجاح توليد المهام التنفيذية المنبثقة عن المجلس وإضافتها إلى قائمة المهام!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>مجالس المؤسسة والاجتماعات الإدارية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            برمجة مجالس الأقسام، مجالس التعليم، مجلس التنسيق الإداري، وتوثيق محاضر الجلسات
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>برمجة مجلس جديد</span>
        </button>
      </div>

      {/* Official Councils Quick Templates Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { type: 'class_council' as MeetingType, label: 'مجلس القسم' },
          { type: 'teaching_council' as MeetingType, label: 'مجلس التعليم' },
          { type: 'administrative_coordination' as MeetingType, label: 'مجلس التنسيق الإداري' },
          { type: 'education_management' as MeetingType, label: 'مجلس التربية والتسيير' },
          { type: 'disciplinary_board' as MeetingType, label: 'مجلس التأديب' },
        ].map((c) => (
          <div
            key={c.type}
            onClick={() => openCreateModal(c.type)}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 transition cursor-pointer group shadow-xs hover:shadow-sm text-right"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
              + {c.label}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              {councilTypes[c.type].desc}
            </div>
          </div>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              لم تتم برمجة أي مجالس حتى الآن
            </p>
            <button
              onClick={() => openCreateModal()}
              className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition cursor-pointer"
            >
              + برمجة مجلس الآن
            </button>
          </div>
        ) : (
          meetings.map((m) => {
            const isCompleted = m.isCompleted;

            return (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        councilTypes[m.type]?.color || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {councilTypes[m.type]?.label || m.title}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{m.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{m.time}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{m.location}</span>
                    </span>
                  </div>
                </div>

                {/* Subject and Agenda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      موضوع الجلسة:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {m.subject}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      جدول الأعمال:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {m.agenda.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Participants */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    الأعضاء المدعوون / الحاضرون:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.participants.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Minutes section if available */}
                {m.minutes && (
                  <div className="text-xs space-y-1 pt-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>محضر الجلسة والقرارات:</span>
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 leading-relaxed whitespace-pre-line">
                      {m.minutes}
                    </p>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Generate Follow-up Tasks button */}
                  <button
                    onClick={() => handleGenerateTasks(m.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                    title="توليد 5 مهام إدارية منبثقة تلقائياً (تحرير المحضر، الإمضاء، الأرشفة، الإرسال، المتابعة)"
                  >
                    <ListTodo className="w-4 h-4 text-amber-300" />
                    <span>توليد المهام الإدارية المنبثقة بنقرة واحدة ⚡</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateMeeting(m.id, {
                          isCompleted: !isCompleted,
                        })
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'انعقد وتم التوثيق' : 'تعليم كانعقد'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(m)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="تعديل أو كتابة المحضر"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا المجلس؟')) {
                          deleteMeeting(m.id);
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

      {/* Meeting Modal with Voice Dictation for Minutes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMeeting ? 'تعديل وتوثيق المجلس' : 'برمجة مجلس أو اجتماع مؤسسة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع المجلس *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as MeetingType;
                      setType(newType);
                      setTitle(councilTypes[newType].label);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="class_council">مجلس القسم</option>
                    <option value="teaching_council">مجلس التعليم</option>
                    <option value="administrative_coordination">مجلس التنسيق الإداري</option>
                    <option value="education_management">مجلس التربية والتسيير</option>
                    <option value="disciplinary_board">مجلس التأديب</option>
                    <option value="administrative_meeting">اجتماع إداري</option>
                    <option value="emergency_meeting">اجتماع طارئ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان المجلس أو الجلسة *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الساعة *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مكان الانعقاد
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="قاعة الاجتماعات"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  موضوع الجلسة
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع المجلس..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  جدول الأعمال (كل نقطة في سطر)
                </label>
                <textarea
                  rows={3}
                  value={agendaInput}
                  onChange={(e) => setAgendaInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الأعضاء الحاضرون (افصل بينهم بفاصلة)
                </label>
                <input
                  type="text"
                  value={participantsInput}
                  onChange={(e) => setParticipantsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Minutes with Voice Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    محضر الجلسة والقرارات المتخذة
                  </label>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'إيقاف الإملاء' : 'إملاء المحضر بالصوت 🎙️'}</span>
                  </button>
                </div>
                {statusMessage && (
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 mb-1 font-medium">
                    {statusMessage}
                  </div>
                )}
                <textarea
                  rows={4}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="أملِ أو دوّن خلاصة النقاش، التوصيات، والقرارات المصادق عليها في المجلس..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingMeeting ? 'حفظ التعديلات' : 'برمجة المجلس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
