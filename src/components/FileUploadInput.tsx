import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Attachment } from '../types';

export interface UploadedFileMeta {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'image' | 'excel' | 'other';
  size: number;
  sizeFormatted: string;
  dataUrl: string;
  uploadedAt: string;
}

interface FileUploadInputProps {
  value?: UploadedFileMeta | null;
  onChange: (file: UploadedFileMeta | null) => void;
  label?: string;
  helpText?: string;
  allowedTypes?: string; // default: pdf, images, word
  id?: string;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  value,
  onChange,
  label = 'رفع ملف من الجهاز أو الماسح الضوئي / USB',
  helpText = 'يدعم صيغ PDF، صور الماسح الضوئي (JPG/PNG)، ومستندات Word (.doc, .docx)',
  allowedTypes = '.pdf,image/png,image/jpeg,image/jpg,image/webp,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  id = 'file-upload-input',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const detectFileType = (mimeType: string, fileName: string): 'pdf' | 'word' | 'image' | 'excel' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (mimeType.includes('pdf') || ext === 'pdf') return 'pdf';
    if (
      mimeType.includes('word') ||
      mimeType.includes('msword') ||
      mimeType.includes('officedocument.wordprocessingml') ||
      ext === 'doc' ||
      ext === 'docx'
    ) {
      return 'word';
    }
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '')) {
      return 'image';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx') {
      return 'excel';
    }
    return 'other';
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Limit to 20MB for browser responsiveness
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 20 ميغابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fileType = detectFileType(file.type, file.name);
      const now = new Date();
      const uploadedDateFormatted = now.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newFileMeta: UploadedFileMeta = {
        id: 'file-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: file.name,
        type: fileType,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        dataUrl,
        uploadedAt: uploadedDateFormatted,
      };

      onChange(newFileMeta);
    };

    reader.onerror = () => {
      setErrorMessage('تعذر قراءة الملف من الجهاز. الرجاء المحاولة مجدداً.');
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so the same file can be selected again if replaced
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDownload = () => {
    if (!value?.dataUrl) return;
    const a = document.createElement('a');
    a.href = value.dataUrl;
    a.download = value.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-2 text-right">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        id={id}
        accept={allowedTypes}
        onChange={handleInputChange}
        className="hidden"
      />

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!value ? (
        /* Empty Upload State: Dropzone & Button */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              اضغط لاختيار ملف من الجهاز أو الماسح الضوئي (Scanner / USB)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              أو اسحب الملف وأفلته مباشرة هنا
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
            {helpText}
          </div>
        </div>
      ) : (
        /* Uploaded File Card with Thumbnail Preview, Replace and Delete */
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Thumbnail & File Details */}
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
            {/* Thumbnail Box */}
            <div className="relative shrink-0 w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              {value.type === 'image' && value.dataUrl ? (
                <img
                  src={value.dataUrl}
                  alt={value.name}
                  className="w-full h-full object-cover cursor-pointer hover:scale-110 transition"
                  onClick={() => setPreviewModalOpen(true)}
                  title="اضغط للتكبير والمعاينة"
                />
              ) : value.type === 'pdf' ? (
                <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold font-mono uppercase">PDF</span>
                </div>
              ) : value.type === 'word' ? (
                <div className="flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold font-mono uppercase">DOCX</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <FileCode className="w-6 h-6" />
                  <span className="text-[9px] font-bold font-mono uppercase">FILE</span>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={value.name}>
                  {value.name}
                </h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                  {value.sizeFormatted}
                </span>
                <span>•</span>
                <span>تاريخ الرفع: {value.uploadedAt}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Preview, Download, Replace, Delete */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700/60 w-full sm:w-auto justify-end">
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="معاينة الملف"
            >
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="تحميل الملف إلى الجهاز"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Replace Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="استبدال الملف بملف آخر"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>استبدال</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition cursor-pointer"
              title="حذف الملف المرفوع"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal for Images / PDF / Document info */}
      {previewModalOpen && value && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
                    {value.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    الحجم: {value.sizeFormatted} • رُفع في: {value.uploadedAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="flex-1 overflow-auto rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-center min-h-[300px]">
              {value.type === 'image' && value.dataUrl ? (
                <img
                  src={value.dataUrl}
                  alt={value.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : value.type === 'pdf' ? (
                <div className="text-center space-y-3 p-6">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">مستند بصيغة PDF</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    يمكنك فتح المستند في تبويب مستقل أو تحميله مباشرة للاطلاع والطباعة.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل مستند PDF</span>
                    </button>
                    {value.dataUrl && (
                      <a
                        href={value.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-4 h-4" />
                        <span>فتح في تبويب جديد</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">مستند Word (.docx)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    جاهز للتحميل والتعديل بواسطة برنامج Microsoft Word أو LibreOffice.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 mx-auto transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل المستند الآن</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استبدال هذا الملف</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
