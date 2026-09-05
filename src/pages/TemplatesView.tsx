import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { DocumentTemplate, TemplateCategory } from '../types';
import { templateCategoryMeta } from '../data/standardTemplates';
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  Mail,
  Send,
  FileCheck,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  Printer,
  X,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { FileUploadInput, UploadedFileMeta } from '../components/FileUploadInput';
import {
  generateTemplatePreviewContent,
  downloadDocumentTemplateFile,
} from '../utils/templateContentGenerator';
import { useAuth } from '../context/AuthContext';

interface TemplatesViewProps {
  onSelectTemplateForCensor?: (template: DocumentTemplate) => void;
  onNavigateToCensor?: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onSelectTemplateForCensor,
  onNavigateToCensor,
}) => {
  const { templates, addDocumentTemplate, deleteDocumentTemplate } = useData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  // New Template Upload Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('admin_letters');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMeta | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.fileName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleSaveCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!title.trim()) {
      setUploadError('يرجى كتابة عنوان النموذج');
      return;
    }

    if (!uploadedFile) {
      setUploadError('يرجى رفع ملف النموذج (PDF، Word أو صورة من الماسح الضوئي)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDocumentTemplate({
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        fileType: uploadedFile.type === 'word' ? 'word' : uploadedFile.type === 'pdf' ? 'pdf' : 'other',
        fileName: uploadedFile.name,
        fileSize: uploadedFile.sizeFormatted,
        dataUrl: uploadedFile.dataUrl,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setUploadedFile(null);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      setUploadError('حدث خطأ أثناء حفظ النموذج: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (t: DocumentTemplate) => {
    downloadDocumentTemplateFile(t, user?.institutionName || 'متوسطة الشهيد زبانة');
  };

  const handleSendToCensor = (t: DocumentTemplate) => {
    if (onSelectTemplateForCensor) {
      onSelectTemplateForCensor(t);
    }
    if (onNavigateToCensor) {
      onNavigateToCensor();
    }
  };

  const activeCategoryTitle =
    selectedCategory === 'all'
      ? 'كافة النماذج والوثائق المعتمدة'
      : templateCategoryMeta[selectedCategory]?.label || 'النماذج';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-20 -translate-y-20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/10">
              <Layers className="w-3.5 h-3.5" />
              <span>دليل الوثائق والنماذج الرسمية لقطاع التربية الوطنية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              النماذج والوثائق الإدارية والبيداغوجية
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              نماذج جاهزة للطباعة والتحميل وفق التشريع المدرسي الجزائري (مراسلات، شهادات عمل وتمدرس، محاضر مجالس التوجيه والتعليم)، مع إمكانية رفع نماذج مخصصة وإرسالها مباشرة للسيد الناظر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-blue-50 font-bold text-sm shadow-lg shadow-black/10 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة / رفع نموذج جديد</span>
            </button>
            {onNavigateToCensor && (
              <button
                onClick={onNavigateToCensor}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>مراسلة الناظر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في النماذج باسم الوثيقة أو محتواها (مثال: شهادة عمل، محضر، توجيه)..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 shrink-0 self-center">
            إجمالي النماذج المعروضة: <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredTemplates.length}</span>
          </div>
        </div>

        {/* Categories Tab Pills (The 5 exact required categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>كافة النماذج</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
              {categoryCounts.all || 0}
            </span>
          </button>

          {Object.entries(templateCategoryMeta).map(([catKey, meta]) => {
            const isSelected = selectedCategory === catKey;
            const count = categoryCounts[catKey] || 0;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{meta.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Category Info Box */}
      {selectedCategory !== 'all' && templateCategoryMeta[selectedCategory] && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              {templateCategoryMeta[selectedCategory].label}
            </h3>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
              {templateCategoryMeta[selectedCategory].description}
            </p>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              لا توجد نماذج مطابقة لبحثك
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو اختر تصنيفاً آخر، أو اضغط زر "إضافة / رفع نموذج جديد" لإدراج وثيقتك.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((item) => {
            const catMeta = templateCategoryMeta[item.category];
            const isWord = item.fileType === 'word';
            const isPdf = item.fileType === 'pdf';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Header: Category badge & type */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {catMeta?.label || item.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.isStandard && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          معتمد رسمياً
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                          isWord
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : isPdf
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isWord ? 'DOCX' : isPdf ? 'PDF' : 'IMAGE'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* File Metadata */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-700/60">
                    <span className="truncate max-w-[170px]" title={item.fileName}>
                      {item.fileName}
                    </span>
                    <span>{item.fileSize}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition cursor-pointer"
                      title="معاينة النموذج الرسمي"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>معاينة</span>
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="تحميل النموذج إلى الجهاز"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Send to Censor Button */}
                    <button
                      type="button"
                      onClick={() => handleSendToCensor(item)}
                      className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                      title="إرسال هذا النموذج إلى السيد الناظر عبر البريد"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete (if custom) */}
                    {!item.isStandard && (
                      <button
                        type="button"
                        onClick={() => deleteDocumentTemplate(item.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition cursor-pointer"
                        title="حذف هذا النموذج المخصص"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Template Preview & Print Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {previewTemplate.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewTemplate.fileName} • {previewTemplate.fileSize}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Authentic Algerian Layout Content */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-6 sm:p-8 space-y-6 shadow-inner">
              {/* Algerian Header */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                  الجمهورية الجزائرية الديمقراطية الشعبية
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  وزارة التربية الوطنية
                </p>
                <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400 pt-2 font-medium">
                  <div>مديرية التربية لولاية {user?.wilaya || 'الجزائر'}</div>
                  <div>السنة الدراسية: {user?.academicYear || '2026/2027'}</div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                  <div>{user?.institutionName || 'متوسطة الشهيد زبانة'}</div>
                  <div className="font-mono">رقم: ... / {new Date().getFullYear()}</div>
                </div>
              </div>

              {/* Body */}
              <div
                className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{
                  __html: generateTemplatePreviewContent(
                    previewTemplate,
                    user?.institutionName || 'متوسطة الشهيد زبانة',
                    user?.wilaya || 'الجزائر',
                    user?.academicYear || '2026/2027',
                    user?.name || 'الأستاذ أمحمد شامخة'
                  ).bodyHtml,
                }}
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewTemplate)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToCensor(previewTemplate)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال للسيد الناظر</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload / Add New Custom Template */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    رفع / إضافة نموذج وثيقة جديدة
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    من الجهاز أو الماسح الضوئي (Scanner / USB)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveCustomTemplate} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تصنيف النموذج الإداري *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="admin_letters">1. نماذج المراسلات الإدارية</option>
                  <option value="work_certs">2. شهادات العمل</option>
                  <option value="school_certs">3. الشهادات المدرسية</option>
                  <option value="guidance_minutes">4. محاضر مجلس التوجيه/الإدارة</option>
                  <option value="pedagogic_minutes">5. محاضر المجلس التربوي (البيداغوجي)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان النموذج *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: استمارة تحويل تلميذ، محضر جلسة تنسيق مادة الرياضيات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوصف أو الاستعمال الإداري
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للوثيقة ومجال استعمالها في المؤسسة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Reusable File Upload Input */}
              <div>
                <FileUploadInput
                  value={uploadedFile}
                  onChange={(f) => {
                    setUploadedFile(f);
                    if (f && !title) {
                      setTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  label="ملف النموذج (PDF، Word، أو صورة ممسوحة ضوئياً)"
                  helpText="اختر ملفاً من الحاسوب أو وحدة تخزين USB أو الماسح الضوئي"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ النموذج في الدليل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
