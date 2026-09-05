import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Users,
  Building,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { appointments, tasks, meetings, deadlines } = useData();
  const { user } = useAuth();

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Computed metrics
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const parentsAppointments = appointments.filter((a) => a.type === 'parents').length;
  const inspectionAppointments = appointments.filter((a) => a.type === 'inspection' || a.type === 'inspector_meeting').length;
  const otherAppointments = appointments.length - parentsAppointments - inspectionAppointments;

  const completedDeadlines = deadlines.filter((d) => d.status === 'completed').length;
  const pendingDeadlines = deadlines.filter((d) => d.status === 'pending').length;

  const completedMeetings = meetings.filter((m) => m.isCompleted).length;

  // Chart data: Activities summary
  const activityData = [
    { name: 'المهام المنجزة', count: completedTasks, color: '#10b981' },
    { name: 'مهام قيد الإنجاز', count: pendingTasks, color: '#f59e0b' },
    { name: 'استقبال أولياء', count: parentsAppointments, color: '#3b82f6' },
    { name: 'زيارات تفتيش', count: inspectionAppointments, color: '#8b5cf6' },
    { name: 'مجالس منعقدة', count: completedMeetings, color: '#ec4899' },
    { name: 'آجال مودعة', count: completedDeadlines, color: '#06b6d4' },
  ];

  // Chart data: Appointments distribution
  const appointmentPieData = [
    { name: 'استقبال الأولياء', value: Math.max(parentsAppointments, 1), color: '#3b82f6' },
    { name: 'زيارات التفتيش', value: Math.max(inspectionAppointments, 1), color: '#8b5cf6' },
    { name: 'مواعيد إدارية وخارجية', value: Math.max(otherAppointments, 1), color: '#10b981' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <span>المتابعة والتقارير الإحصائية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            لوحة قيادة المتابعة الدورية، نسب الإنجاز، وإصدار التقرير الإداري الرسمي
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {[
              { id: 'daily', label: 'يومي' },
              { id: 'weekly', label: 'أسبوعي' },
              { id: 'monthly', label: 'شهري' },
              { id: 'yearly', label: 'سنوي' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  period === p.id
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">نسبة إنجاز المهام</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedTasks} من أصل {totalTasks} مهمة
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">استقبال الأولياء</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {parentsAppointments}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مقابلة تم تسجيلها
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">مجالس المؤسسة</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {completedMeetings} / {meetings.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مجلس منعقد وموثق
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">الآجال والمراسلات</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {completedDeadlines} / {deadlines.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            تم إيداعها في الآجال
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            توزيع مؤشرات النشاط الإداري
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            توزيع المواعيد والاستقبالات
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Printable Official Periodic Report Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6 text-right print:p-0 print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            الجمهورية الجزائرية الديمقراطية الشعبية
          </p>
          <p className="text-xs text-slate-500">
            وزارة التربية الوطنية • مديرية التربية لولاية {user?.wilaya || 'الجزائر'}
          </p>
          <h3 className="text-base font-black text-slate-900 dark:text-white pt-2">
            {user?.schoolName || 'متوسطة النجاح'}
          </h3>
          <p className="text-xs text-teal-700 dark:text-teal-400 font-bold">
            تقرير المتابعة الإدارية والبيداغوجية الدوري
          </p>
          <p className="text-[11px] text-slate-400">
            السنة الدراسية: {user?.academicYear || '2026/2027'} • إعداد السيد المدير: {user?.fullName || 'الأستاذ شامخة أمحمد'}
          </p>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                <th className="p-3 font-bold">المجال الإداري</th>
                <th className="p-3 font-bold">العدد الإجمالي</th>
                <th className="p-3 font-bold">المكتمل / المنجز</th>
                <th className="p-3 font-bold">الحالة ونسبة الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">المهام والتكليفات الإدارية</td>
                <td className="p-3 font-mono">{totalTasks}</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">{completedTasks}</td>
                <td className="p-3">{taskCompletionRate}% إنجاز تام</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">استقبال الأولياء والمواطنين</td>
                <td className="p-3 font-mono">{parentsAppointments}</td>
                <td className="p-3 font-mono text-blue-600 font-bold">{parentsAppointments}</td>
                <td className="p-3">تم الاستماع والتوجيه</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">مجالس المؤسسة المبرمجة</td>
                <td className="p-3 font-mono">{meetings.length}</td>
                <td className="p-3 font-mono text-purple-600 font-bold">{completedMeetings}</td>
                <td className="p-3">محاضر موثقة ومصادق عليها</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900 dark:text-white">المراسلات والآجال الإدارية</td>
                <td className="p-3 font-mono">{deadlines.length}</td>
                <td className="p-3 font-mono text-amber-600 font-bold">{completedDeadlines}</td>
                <td className="p-3">مودعة لدى المصالح المختصة</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Line */}
        <div className="pt-8 flex justify-between items-end text-xs font-bold text-slate-700 dark:text-slate-300">
          <div>
            <span>ختم المؤسسة:</span>
          </div>
          <div className="text-center">
            <span>حرر بتاريخ: {new Date().toLocaleDateString('ar-DZ')}</span>
            <br />
            <span className="mt-1 inline-block">مدير المتوسطة: {user?.fullName || 'الأستاذ شامخة أمحمد'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
