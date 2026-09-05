import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DocumentTemplate, CensorSettings } from '../types';
import {
  Mail,
  Send,
  User,
  Building,
  AtSign,
  Phone,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  FileText,
  Clock,
  Sparkles,
  Edit3,
  X,
  FilePlus,
  Layers,
} from 'lucide-react';
import { FileUploadInput, UploadedFileMeta } from '../components/FileUploadInput';

interface CensorContactViewProps {
  initialAttachedTemplate?: DocumentTemplate | null;
  onClearInitialTemplate?: () => void;
  onNavigateToTemplates?: () => void;
}

export const CensorContactView: React.FC<CensorContactViewProps> = ({
  initialAttachedTemplate,
  onClearInitialTemplate,
  onNavigateToTemplates,
}) => {
  const { user } = useAuth();
  const {
    censorSettings,
    updateCensorSettings,
    templates,
    censorMessages,
    sendCensorEmail,
  } = useData();

  // Form states
  const [recipientChoice, setRecipientChoice] = useState<'official' | 'personal' | 'both'>('official');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(
    initialAttachedTemplate || null
  );
  const [customUploadedFile, setCustomUploadedFile] = useState<UploadedFileMeta | null>(null);

  // Template Picker Modal
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isEditCensorModalOpen, setIsEditCensorModalOpen] = useState(false);

  // Edit Censor Settings Form
  const [censorName, setCensorName] = useState(censorSettings.name || '');
  const [censorOfficialEmail, setCensorOfficialEmail] = useState(censorSettings.officialEmail || '');
  const [censorPersonalEmail, setCensorPersonalEmail] = useState(censorSettings.personalEmail || '');
  const [censorPhone, setCensorPhone] = useState(censorSettings.phone || '');
  const [censorNotes, setCensorNotes] = useState(censorSettings.notes || '');

  // Sending status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastMailtoUrl, setLastMailtoUrl] = useState<string | null>(null);

  // Synchronize when initialAttachedTemplate arrives from TemplatesView
  useEffect(() => {
    if (initialAttachedTemplate) {
      setSelectedTemplate(initialAttachedTemplate);
      if (!subject) {
        setSubject(`مرفق: ${initialAttachedTemplate.title}`);
      }
    }
  }, [initialAttachedTemplate]);

  // Keep edit form in sync with settings
  useEffect(() => {
    setCensorName(censorSettings.name || 'الأستاذ بلقاسم العربي (ناظر المتوسطة)');
    setCensorOfficialEmail(censorSettings.officialEmail || 'censor.cem.zabana@education.gov.dz');
    setCensorPersonalEmail(censorSettings.personalEmail || 'belkacem.censor@gmail.com');
    setCensorPhone(censorSettings.phone || '0555123456');
    setCensorNotes(censorSettings.notes || '');
  }, [censorSettings]);

  // Quick subject suggestions
  const quickSubjects = [
    'استدعاء لانعقاد مجلس التنسيق الإداري والبيداغوجي',
    'متابعة غيابات الأساتذة والتأطير البيداغوجي للأسبوع',
    'تحضير رزنامة مداولات مجالس الأقسام للفصل الدراسي',
    'ضبط جدول فروض المراقبة المستمرة والتقويم',
    'متابعة وضعية التوجيه المدرسي لتلاميذ السنة الرابعة',
    'طلب تقرير بيداغوجي حول حصص الاستدراك والدعم',
  ];

  // Resolve target email addresses
  const targetEmails = React.useMemo(() => {
    const list: string[] = [];
    if (recipientChoice === 'official' || recipientChoice === 'both') {
      if (censorSettings.officialEmail) list.push(censorSettings.officialEmail);
    }
    if (recipientChoice === 'personal' || recipientChoice === 'both') {
      if (censorSettings.personalEmail) list.push(censorSettings.personalEmail);
    }
    return list;
  }, [recipientChoice, censorSettings]);

  const handleSendEmail = async (openMailClient: boolean = false) => {
    setErrorMessage(null);
    setSubmitSuccess(null);

    if (!subject.trim()) {
      setErrorMessage('يرجى كتابة موضوع الرسالة');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('يرجى كتابة نص الرسالة');
      return;
    }
    if (targetEmails.length === 0) {
      setErrorMessage('يرجى إدخال عنوان بريد إلكتروني للناظر في الإعدادات');
      return;
    }

    setIsSubmitting(true);
    try {
      const attachedFileName = selectedTemplate?.fileName || customUploadedFile?.name;
      const attachedTemplateId = selectedTemplate?.id;
      const attachedFileDataUrl = selectedTemplate?.dataUrl || customUploadedFile?.dataUrl;

      const res = await sendCensorEmail({
        toEmailType: recipientChoice,
        toEmails: targetEmails,
        subject: subject.trim(),
        content: content.trim(),
        attachedTemplateId,
        attachedFileName,
        attachedFileDataUrl,
      });

      setLastMailtoUrl(res.mailtoUrl);
      setSubmitSuccess('تم إرسال وحفظ الرسالة بنجاح في سجل المراسلات المباشرة مع السيد الناظر.');

      if (openMailClient && res.mailtoUrl) {
        window.location.href = res.mailtoUrl;
      }

      // Reset form
      setSubject('');
      setContent('');
      setSelectedTemplate(null);
      setCustomUploadedFile(null);
      if (onClearInitialTemplate) onClearInitialTemplate();
    } catch (err: any) {
      setErrorMessage('حدث خطأ أثناء الإرسال: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCensorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCensorSettings({
      name: censorName.trim(),
      officialEmail: censorOfficialEmail.trim(),
      personalEmail: censorPersonalEmail.trim(),
      phone: censorPhone.trim(),
      notes: censorNotes.trim(),
    });
    setIsEditCensorModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Censor Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Censor Card Info */}
          <div className="flex items-start gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  متصل ومتاح للتواصل
                </span>
                <span className="text-xs text-indigo-300 font-semibold">ناظر المتوسطة</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {censorSettings.name || 'الأستاذ بلقاسم العربي'}
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {censorSettings.notes ||
                  'المسؤول عن التنسيق البيداغوجي، متابعة جداول التوقيت، مجالس الأقسام ومتابعة غيابات الأساتذة.'}
              </p>
            </div>
          </div>

          {/* Email addresses pills */}
          <div className="flex flex-col sm:flex-row items-start lg:items-center gap-3 shrink-0">
            <div className="space-y-1.5 text-right w-full sm:w-auto">
              {/* Official Email */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">الرسمي:</span>
                <span className="font-mono text-indigo-200 truncate max-w-[200px]" title={censorSettings.officialEmail}>
                  {censorSettings.officialEmail || 'غير محدد'}
                </span>
              </div>

              {/* Personal Email */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <AtSign className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">الشخصي:</span>
                <span className="font-mono text-blue-200 truncate max-w-[200px]" title={censorSettings.personalEmail}>
                  {censorSettings.personalEmail || 'غير محدد'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditCensorModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer self-stretch sm:self-center justify-center"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل بيانات الناظر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Message Composer & Sent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Message Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    إنشاء رسالة جديدة إلى السيد الناظر
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    مراسلة إدارية داخلية مع إمكانية إرفاق وثائق رسمية
                  </p>
                </div>
              </div>
            </div>

            {/* Notification messages */}
            {submitSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
                {lastMailtoUrl && (
                  <a
                    href={lastMailtoUrl}
                    className="underline text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 flex items-center gap-1"
                  >
                    <span>فتح في تطبيق البريد</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Recipient Selector Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  عنوان الإرسال المستهدف:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecipientChoice('official')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-1 ${
                      recipientChoice === 'official'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">البريد الرسمي للمؤسسة</span>
                      <Building className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-mono truncate text-slate-500 dark:text-slate-400">
                      {censorSettings.officialEmail || 'censor@cem-zabana.dz'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientChoice('personal')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-1 ${
                      recipientChoice === 'personal'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">البريد الشخصي للناظر</span>
                      <AtSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-mono truncate text-slate-500 dark:text-slate-400">
                      {censorSettings.personalEmail || 'belkacem.censor@gmail.com'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientChoice('both')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between gap-1 ${
                      recipientChoice === 'both'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">كلا العنوانين معاً</span>
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      إرسال مزدوج لضمان التبليغ
                    </span>
                  </button>
                </div>
              </div>

              {/* Subject with suggestions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الموضوع *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع الرسالة أو التعليمات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />

                {/* Quick suggestions pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
                  <span className="text-[10px] text-slate-400 shrink-0">مقترحات شائعة:</span>
                  {quickSubjects.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSubject(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[10px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص الرسالة *
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="السيد ناظر المؤسسة المحترم، يرجى موافاتنا بـ / اتخاذ الإجراءات اللازمة بخصوص..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed font-sans"
                />
              </div>

              {/* Attachment from "النماذج والوثائق" or Local Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span>إرفاق وثيقة من قسم "النماذج والوثائق" أو من الجهاز</span>
                  </label>
                  <span className="text-[11px] text-slate-400">(اختياري)</span>
                </div>

                {/* Selected Template Badge */}
                {selectedTemplate ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {selectedTemplate.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {selectedTemplate.fileName} • {selectedTemplate.fileSize}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(null);
                        if (onClearInitialTemplate) onClearInitialTemplate();
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition"
                      title="إزالة المرفق"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Choose or Upload Buttons */
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTemplatePickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-200/60 dark:border-indigo-900/40"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>اختيار نموذج من دليل النماذج والوثائق ({templates.length})</span>
                    </button>
                  </div>
                )}

                {/* Optional Custom File Upload if no template picked */}
                {!selectedTemplate && (
                  <div className="pt-2">
                    <FileUploadInput
                      value={customUploadedFile}
                      onChange={setCustomUploadedFile}
                      label="أو رفع ملف مخصص من الحاسوب / الماسح الضوئي (Scanner / USB)"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons: System Send & Open in Mail Client */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 w-full sm:w-auto text-right">
                  سيتم حفظ نسخة كاملة في سجل المراسلات تلقائياً
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {/* Mailto link trigger */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendEmail(true)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="فتح الرسالة في تطبيق البريد المثبت على الجهاز (mailto:)"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>إرسال عبر تطبيق البريد (Outlook / Gmail)</span>
                  </button>

                  {/* Direct system send */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendEmail(false)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جارٍ الإرسال...' : 'إرسال وحفظ في السجل'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sent History Log */}
        <div className="space-y-4 text-right">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  سجل الرسائل المرسلة للناظر
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                {censorMessages.length} رسالة
              </span>
            </div>

            {censorMessages.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700/60 text-slate-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  لم يتم إرسال أي رسائل للناظر بعد
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {censorMessages.map((msg) => {
                  const sentDate = new Date(msg.sentAt).toLocaleDateString('ar-DZ', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 hover:border-indigo-300 transition"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{sentDate}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                          تم الإرسال
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {msg.subject}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {msg.content}
                      </p>

                      {msg.attachedFileName && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border-t border-slate-200/60 dark:border-slate-800">
                          <Paperclip className="w-3 h-3 shrink-0" />
                          <span className="truncate">{msg.attachedFileName}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Template Picker from "النماذج والوثائق" */}
      {isTemplatePickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsTemplatePickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  اختر نموذجاً أو وثيقة لإرفاقها في الرسالة
                </h3>
              </div>
              <button
                onClick={() => setIsTemplatePickerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t);
                    if (!subject) setSubject(`مرفق: ${t.title}`);
                    setIsTemplatePickerOpen(false);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.fileName} • {t.fileSize}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition"
                  >
                    اختيار
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setIsTemplatePickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Censor Profile / Emails */}
      {isEditCensorModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsEditCensorModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تعديل بيانات السيد ناظر المتوسطة
                </h3>
              </div>
              <button
                onClick={() => setIsEditCensorModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCensorProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم وصفة الناظر *
                </label>
                <input
                  type="text"
                  value={censorName}
                  onChange={(e) => setCensorName(e.target.value)}
                  placeholder="الأستاذ بلقاسم العربي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني الرسمي الخاص بالمؤسسة *
                </label>
                <input
                  type="email"
                  value={censorOfficialEmail}
                  onChange={(e) => setCensorOfficialEmail(e.target.value)}
                  placeholder="censor.cem.zabana@education.gov.dz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني الشخصي للناظر *
                </label>
                <input
                  type="email"
                  value={censorPersonalEmail}
                  onChange={(e) => setCensorPersonalEmail(e.target.value)}
                  placeholder="belkacem.censor@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  value={censorPhone}
                  onChange={(e) => setCensorPhone(e.target.value)}
                  placeholder="0555123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو مهام خاصة
                </label>
                <textarea
                  rows={2}
                  value={censorNotes}
                  onChange={(e) => setCensorNotes(e.target.value)}
                  placeholder="ملاحظات حول صلاحيات الناظر ومواعيد المداومة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditCensorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
