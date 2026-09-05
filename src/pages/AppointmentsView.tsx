import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Appointment, AppointmentType } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Filter,
  Mic,
  MicOff,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  CalendarDays,
  CalendarRange,
  ListFilter,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface AppointmentsViewProps {
  initialOpenModal?: boolean;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ initialOpenModal = false }) => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useData();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'list'>('daily');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState('مكتب المدير');
  const [personOrEntity, setPersonOrEntity] = useState('');
  const [type, setType] = useState<AppointmentType>('administrative');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [notes, setNotes] = useState('');

  // Speech Recognition for appointment form
  const {
    isListening,
    startListening,
    stopListening,
    statusMessage,
  } = useSpeechRecognition({
    lang: 'ar-DZ',
    onTranscript: (spokenText) => {
      setNotes((prev) => (prev ? prev + ' ' : '') + spokenText);
    },
  });

  const openCreateModal = () => {
    setEditingApt(null);
    setTitle('');
    setDate(selectedDate);
    setTime('09:00');
    setDurationMinutes(30);
    setLocation('مكتب المدير');
    setPersonOrEntity('');
    setType('administrative');
    setPriority('medium');
    setReminderMinutes(15);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setTitle(apt.title);
    setDate(apt.date);
    setTime(apt.time);
    setDurationMinutes(apt.durationMinutes || 30);
    setLocation(apt.location || 'مكتب المدير');
    setPersonOrEntity(apt.personOrEntity);
    setType(apt.type);
    setPriority(apt.priority);
    setReminderMinutes(apt.reminderMinutes || 15);
    setNotes(apt.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingApt) {
      await updateAppointment(editingApt.id, {
        title,
        date,
        time,
        durationMinutes,
        location,
        personOrEntity,
        type,
        priority,
        reminderMinutes,
        notes,
      });
    } else {
      await addAppointment({
        title,
        date,
        time,
        durationMinutes,
        location,
        personOrEntity: personOrEntity || 'شخصي',
        type,
        priority,
        recurrence: 'none',
        reminderMinutes,
        notes,
        status: 'scheduled',
      });
    }

    setIsModalOpen(false);
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedType !== 'all' && apt.type !== selectedType) return false;

      if (viewMode === 'daily') {
        return apt.date === selectedDate;
      }
      if (viewMode === 'weekly') {
        const target = new Date(selectedDate);
        const aptD = new Date(apt.date);
        const diff = Math.abs((aptD.getTime() - target.getTime()) / (1000 * 3600 * 24));
        return diff <= 3;
      }
      if (viewMode === 'monthly') {
        return apt.date.startsWith(selectedDate.substring(0, 7));
      }
      if (viewMode === 'yearly') {
        return apt.date.startsWith(selectedDate.substring(0, 4));
      }
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments, selectedType, viewMode, selectedDate]);

  const typeLabels: Record<string, string> = {
    parents: 'استقبال أولياء',
    parent_reception: 'استقبال أولياء',
    meeting: 'اجتماع',
    inspection: 'زيارة تفتيشية',
    inspector_meeting: 'لقاء مع مفتش',
    administrative: 'إداري',
    external: 'موعد خارجي',
    external_entity: 'جهة خارجية',
    directorate: 'مديرية التربية',
    teacher: 'موعد مع أستاذ',
    student: 'تلميذ',
    employee: 'موعد مع موظف',
    personal: 'شخصي',
    visit: 'زيارة',
    other: 'أخرى',
  };

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>جدول المواعيد والزيارات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة مواعيد استقبال الأولياء، الزيارات التفتيشية، واللقاءات الإدارية
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موعد جديد</span>
        </button>
      </div>

      {/* Toolbar: Views + Filters + Date Navigator */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* View Switchers */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs font-semibold overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'daily', label: 'يومي' },
            { id: 'weekly', label: 'أسبوعي' },
            { id: 'monthly', label: 'شهري' },
            { id: 'yearly', label: 'سنوي' },
            { id: 'list', label: 'كل المواعيد' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                viewMode === mode.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Date Navigator & Type Filter Container */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Date Navigator */}
          {viewMode !== 'list' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDateBy(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                title="اليوم التالي"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-800 dark:text-white"
              />
              <button
                onClick={() => changeDateBy(-1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                title="اليوم السابق"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="all">جميع الأنواع</option>
              <option value="parents">استقبال أولياء</option>
              <option value="inspection">زيارات تفتيشية</option>
              <option value="inspector_meeting">لقاء مع مفتش</option>
              <option value="administrative">إداري</option>
              <option value="external">موعد خارجي</option>
              <option value="directorate">مديرية التربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Grid / List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              لا توجد مواعيد مبرمجة لهذه الفترة
            </p>
            <button
              onClick={openCreateModal}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              + إضافة موعد الآن
            </button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Right side: Time Badge + Title + Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 font-mono font-bold shrink-0">
                      <span className="text-xs sm:text-sm">{apt.time}</span>
                      <span className="text-[9px] sm:text-[10px] font-normal text-slate-500">{apt.durationMinutes} د</span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white break-words ${isCompleted ? 'line-through' : ''}`}>
                          {apt.title}
                        </h3>
                        <span
                          className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
                            apt.type === 'parents'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : apt.type === 'inspection'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {typeLabels[apt.type] || apt.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>مع: {apt.personOrEntity}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{apt.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{apt.location || 'مكتب المدير'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>تنبيه قبل {apt.reminderMinutes || 15} د</span>
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl mt-2 leading-relaxed break-words">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Left Side: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                    <button
                      onClick={() =>
                        updateAppointment(apt.id, {
                          status: apt.status === 'completed' ? 'scheduled' : 'completed',
                        })
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'مكتمل' : 'تعليم كمنجز'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(apt)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
                          deleteAppointment(apt.id);
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

      {/* Appointment Create / Edit Modal with Voice Dictation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingApt ? 'تعديل موعد' : 'إضافة موعد جديد'}
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
                  عنوان الموعد أو الزيارة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: استقبال ولي التلميذ بن عيسى ريان"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الطرف المقابل (الشخص أو الهيئة) *
                  </label>
                  <input
                    type="text"
                    required
                    value={personOrEntity}
                    onChange={(e) => setPersonOrEntity(e.target.value)}
                    placeholder="مثال: ولي أمر / السيد مفتش إدارة المتوسطات"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع الموعد
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AppointmentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="parents">استقبال أولياء</option>
                    <option value="inspection">زيارة تفتيشية</option>
                    <option value="inspector_meeting">لقاء مع مفتش</option>
                    <option value="administrative">إداري</option>
                    <option value="external">موعد خارجي</option>
                    <option value="directorate">مديرية التربية</option>
                    <option value="other">أخرى</option>
                  </select>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التوقيت *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المدة المتوقعة (دقائق)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مكان الموعد
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مكتب المدير"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التنبيه المسبق
                  </label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="5">قبل 5 دقائق</option>
                    <option value="15">قبل 15 دقيقة (الموصى به)</option>
                    <option value="30">قبل 30 دقيقة</option>
                    <option value="60">قبل ساعة</option>
                    <option value="1440">قبل يوم كامل</option>
                  </select>
                </div>
              </div>

              {/* Notes with Speech-to-Text Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ملاحظات وتفاصيل إضافية
                  </label>
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'إيقاف الإملاء الصوتي' : 'إملاء صوتي 🎙️'}</span>
                  </button>
                </div>
                {statusMessage && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mb-1 font-medium">
                    {statusMessage}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب أو أملِ بصوتك تفاصيل الموعد وما يجب تحضيره من وثائق..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {editingApt ? 'حفظ التعديلات' : 'تأكيد وحفظ الموعد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
