import React, { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useData } from '../context/DataContext';
import { apiClient } from '../services/api';
import { Mic, MicOff, Sparkles, X, Send, CheckCircle2, CornerDownLeft, AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { addAppointment, addMeeting, addTask } = useData();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; action?: any }>>([
    {
      sender: 'assistant',
      text: 'مرحباً بك أستاذ المدير. أنا مساعدك الإداري الذكي. يمكنك التحدث معي بالصوت أو الكتابة، وسؤالي عن جدولك، مهامك، أو إضافة موعد جديد.',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isListening,
    transcript,
    statusMessage,
    permissionError,
    clearPermissionError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'ar-DZ',
    onTranscript: (liveText) => {
      setInputText(liveText);
    },
  });

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputText || transcript).trim();
    if (!text || isProcessing) return;

    // Stop listening if currently active
    if (isListening) {
      stopListening();
    }

    const userMsg = { sender: 'user' as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    resetTranscript();
    setIsProcessing(true);

    try {
      const res = await apiClient.queryAssistant(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.response,
          action: res.proposedAction,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'عذراً أستاذ المدير، تعذر الاتصال حالياً. تحقق من اتصالك بالإنترنت وسأكون جاهزاً لمساعدتك.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async (action: any) => {
    if (!action) return;
    try {
      if (action.type === 'meeting') {
        await addMeeting({
          type: 'administrative_meeting',
          title: action.title || 'اجتماع جديد',
          date: action.date || new Date().toISOString().split('T')[0],
          time: action.time || '09:00',
          location: 'مكتب المدير',
          subject: action.title,
          agenda: ['مناقشة الترتيبات'],
          participants: ['المدير'],
          generatedTasks: [],
          isCompleted: false,
        });
      } else if (action.type === 'task') {
        await addTask({
          title: action.title || 'مهمة جديدة',
          dueDate: action.date || new Date().toISOString().split('T')[0],
          priority: 'high',
          status: 'not_started',
        });
      } else {
        await addAppointment({
          title: action.title || 'موعد جديد',
          date: action.date || new Date().toISOString().split('T')[0],
          time: action.time || '09:00',
          durationMinutes: 30,
          location: 'مكتب المدير',
          personOrEntity: 'إداري',
          type: 'administrative',
          priority: 'medium',
          recurrence: 'none',
          reminderMinutes: 15,
          status: 'scheduled',
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `✓ تم تأكيد وإضافة "${action.title}" بنجاح إلى جدولك.`,
        },
      ]);
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة');
    }
  };

  const quickPrompts = [
    'ماذا لدي اليوم؟',
    'ما هي مواعيدي غداً؟',
    'ما هي المهام المتأخرة؟',
    'ما هي الآجال الإدارية القريبة؟',
    'أضف اجتماع مع الناظر غداً الساعة التاسعة صباحاً',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl h-[85vh] max-h-[680px] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">المساعد الإداري الذكي 🎙️</h3>
              <p className="text-xs text-blue-200">التعرف على الصوت والأوامر الإدارية باللغة العربية</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isListening) stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 shrink-0">أوامر سريعة:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {msg.text}

                  {/* Proposed action card with confirmation */}
                  {msg.action && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        طلب تأكيد: {msg.action.type === 'meeting' ? 'اجتماع' : msg.action.type === 'task' ? 'مهمة' : 'موعد'}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {msg.action.title} | التاريخ: {msg.action.date} | الساعة: {msg.action.time}
                      </div>
                      <button
                        onClick={() => handleConfirmAction(msg.action)}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        تأكيد الإضافة للجدول
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>جاري تحليل الأمر وإعداد الرد...</span>
            </div>
          )}
        </div>

        {/* Microphone Permission Diagnostic Alert */}
        {permissionError && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-900/60 text-xs">
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
                    title="إغلاق التنبيه"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة فحص الميكروفون وتجربة التحدث</span>
                  </button>
                  <button
                    onClick={clearPermissionError}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-xs transition"
                  >
                    الكتابة بدلاً من الصوت
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Status Indicator Bar */}
        {(isListening || statusMessage) && !permissionError && (
          <div className="px-6 py-2 bg-blue-50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2 font-medium">
              {isListening && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
              <span>{statusMessage || 'جاري التقاط الصوت...'}</span>
            </div>
            {isListening && (
              <button
                onClick={stopListening}
                className="text-[11px] underline text-blue-600 hover:text-blue-800"
              >
                إيقاف الاستماع
              </button>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          {/* Microphone toggle button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-2xl transition shadow-md cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:opacity-90'
            }`}
            title={isListening ? 'إيقاف الاستماع' : 'تحدث الآن'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText || transcript}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={isListening ? 'جاري الاستماع لصوتك...' : 'تحدث بصوتك أو اكتب هنا...'}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText && !transcript}
            className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            title="إرسال"
          >
            <Send className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
