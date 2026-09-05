import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Mic,
  MicOff,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Copy,
  Check,
  Clock,
  Sparkles,
  Volume2,
  ShieldAlert,
  RotateCcw,
  X,
} from 'lucide-react';

export const VoiceMemosView: React.FC = () => {
  const { voiceMemos, addVoiceMemo, deleteVoiceMemo, addTask, addAppointment } = useData();

  const [newTitle, setNewTitle] = useState('');
  const [content, setContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    isListening,
    startListening,
    stopListening,
    statusMessage,
    permissionError,
    clearPermissionError,
    transcript,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'ar-DZ',
    onTranscript: (spoken) => {
      setContent(spoken);
    },
  });

  const handleSaveMemo = async () => {
    const finalContent = content || transcript;
    if (!finalContent.trim()) return;

    await addVoiceMemo({
      title: newTitle.trim() || `مذكرة صوتية - ${new Date().toLocaleTimeString('ar-DZ')}`,
      content: finalContent,
      transcript: finalContent,
    });

    setNewTitle('');
    setContent('');
    resetTranscript();
  };

  const handleCopyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConvertToTask = async (memo: any) => {
    await addTask({
      title: memo.title,
      description: memo.content,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'not_started',
      responsiblePerson: 'المدير',
    });
    alert('✓ تم تحويل المذكرة الصوتية إلى مهمة إدارية بنجاح!');
  };

  const handleConvertToAppointment = async (memo: any) => {
    await addAppointment({
      title: memo.title,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      durationMinutes: 30,
      location: 'مكتب المدير',
      personOrEntity: 'إداري',
      type: 'administrative',
      priority: 'medium',
      recurrence: 'none',
      reminderMinutes: 15,
      notes: memo.content,
      status: 'scheduled',
    });
    alert('✓ تم تحويل المذكرة الصوتية إلى موعد في الجدول بنجاح!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-rose-600" />
          <span>المذكرات الصوتية والكتابة السريعة</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          سجل ملاحظاتك وأفكارك الإدارية بصوتك، مع إمكانية تحويلها إلى مهام أو مواعيد بنقرة واحدة
        </p>
      </div>

      {/* Recording Studio Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-md text-right space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              تسجيل مذكرة جديدة بالصوت والكتابة
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'إيقاف الاستماع' : 'ابدأ التحدث بالصوت 🎙️'}</span>
            </button>
          </div>
        </div>

        {/* Microphone Permission Diagnostic Card */}
        {permissionError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                    {permissionError.title}
                  </h4>
                  <button
                    onClick={clearPermissionError}
                    className="text-amber-500 hover:text-amber-700 p-1"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  {permissionError.message}
                </p>
                {permissionError.instructions.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pr-1 pt-1 font-medium">
                    {permissionError.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => startListening()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة فحص وتفعيل الميكروفون</span>
                  </button>
                  <button
                    onClick={clearPermissionError}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-xs transition"
                  >
                    متابعة بالكتابة اليدوية
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {statusMessage && !permissionError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {statusMessage}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان المذكرة (اختياري)..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />

          <textarea
            rows={4}
            value={content || transcript}
            onChange={(e) => setContent(e.target.value)}
            placeholder="تحدث بصوتك أو اكتب ملاحظتك الإدارية هنا مباشرة..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {(content || transcript) && (
            <button
              onClick={() => {
                setContent('');
                resetTranscript();
              }}
              className="text-xs px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
            >
              مسح النص
            </button>
          )}

          <button
            onClick={handleSaveMemo}
            disabled={!content && !transcript}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-40"
          >
            حفظ المذكرة
          </button>
        </div>
      </div>

      {/* Saved Memos List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          المذكرات المحفوظة ({voiceMemos.length})
        </h3>

        {voiceMemos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Mic className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              لا توجد مذكرات صوتية مسجلة حتى الآن
            </p>
          </div>
        ) : (
          voiceMemos.map((memo) => (
            <div
              key={memo.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{memo.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(memo.createdAt).toLocaleDateString('ar-DZ')} • {new Date(memo.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyToClipboard(memo.id, memo.content)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                    title="نسخ النص"
                  >
                    {copiedId === memo.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه المذكرة؟')) {
                        deleteVoiceMemo(memo.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 transition cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-line">
                {memo.content}
              </p>

              {/* Conversion Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">تحويل فوري:</span>
                <button
                  onClick={() => handleConvertToTask(memo)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>تحويل إلى مهمة إدارية</span>
                </button>
                <button
                  onClick={() => handleConvertToAppointment(memo)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تحويل إلى موعد في الجدول</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
