import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, X, Calendar, CheckSquare, Clock, Users, FileText, Mic } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectView }) => {
  const { appointments, tasks, deadlines, meetings, archives, voiceMemos } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { appointments: [], tasks: [], deadlines: [], meetings: [], archives: [], voiceMemos: [] };

    return {
      appointments: appointments.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.personOrEntity.toLowerCase().includes(term) ||
          (a.notes && a.notes.toLowerCase().includes(term))
      ),
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term)) ||
          (t.responsiblePerson && t.responsiblePerson.toLowerCase().includes(term))
      ),
      deadlines: deadlines.filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          d.authority.toLowerCase().includes(term) ||
          (d.description && d.description.toLowerCase().includes(term))
      ),
      meetings: meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.subject.toLowerCase().includes(term) ||
          m.participants.some((p) => p.toLowerCase().includes(term)) ||
          (m.notes && m.notes.toLowerCase().includes(term))
      ),
      archives: archives.filter(
        (ar) =>
          ar.title.toLowerCase().includes(term) ||
          ar.category.toLowerCase().includes(term) ||
          (ar.notes && ar.notes.toLowerCase().includes(term))
      ),
      voiceMemos: voiceMemos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.content.toLowerCase().includes(term) ||
          v.transcript.toLowerCase().includes(term)
      ),
    };
  }, [searchTerm, appointments, tasks, deadlines, meetings, archives, voiceMemos]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.appointments.length +
    results.tasks.length +
    results.deadlines.length +
    results.meetings.length +
    results.archives.length +
    results.voiceMemos.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-2xl max-h-[80vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن موعد، مهمة، اجتماع، جهة، وثيقة، أو ملاحظة..."
            autoFocus
            className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            إغلاق
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!searchTerm && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">اكتب كلمة البحث للوصول الفوري لكافة السجلات الإدارية</p>
            </div>
          )}

          {searchTerm && totalResultsCount === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">لم يتم العثور على أي نتائج تطابق "{searchTerm}"</p>
            </div>
          )}

          {/* Appointments */}
          {results.appointments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>المواعيد ({results.appointments.length})</span>
              </div>
              <div className="space-y-2">
                {results.appointments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelectView('appointments');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {a.date} | الساعة: {a.time} | مع: {a.personOrEntity}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                      موعد
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meetings */}
          {results.meetings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>الاجتماعات والمجالس ({results.meetings.length})</span>
              </div>
              <div className="space-y-2">
                {results.meetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectView('meetings');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {m.date} | المكان: {m.location} | الموضوع: {m.subject}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                      اجتماع
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4" />
                <span>المهام ({results.tasks.length})</span>
              </div>
              <div className="space-y-2">
                {results.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectView('tasks');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الأجل: {t.dueDate} | المسؤول: {t.responsiblePerson || 'المدير'}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                      مهمة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines */}
          {results.deadlines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>الآجال الإدارية ({results.deadlines.length})</span>
              </div>
              <div className="space-y-2">
                {results.deadlines.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectView('deadlines');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{d.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تاريخ الاستحقاق: {d.dueDate} | الجهة: {d.authority}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                      أجل إداري
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archives */}
          {results.archives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>الأرشيف والوثائق ({results.archives.length})</span>
              </div>
              <div className="space-y-2">
                {results.archives.map((ar) => (
                  <div
                    key={ar.id}
                    onClick={() => {
                      onSelectView('archives');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ar.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        التصنيف: {ar.category} | السنة: {ar.academicYear}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      وثيقة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice memos */}
          {results.voiceMemos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
                <Mic className="w-4 h-4" />
                <span>المذكرات الصوتية ({results.voiceMemos.length})</span>
              </div>
              <div className="space-y-2">
                {results.voiceMemos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelectView('voice-memos');
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{v.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{v.content}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium">
                      مذكرة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
