import React from 'react';
import { useData } from '../context/DataContext';
import { Bell, X, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeAlerts, dismissAlert } = useData();

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-5 left-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {activeAlerts.map((alert) => {
        const isUrgent = alert.type === 'deadline';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${
              isUrgent
                ? 'bg-amber-500/95 text-white border-amber-600 shadow-amber-500/20'
                : 'bg-blue-900/95 text-white border-blue-800 shadow-blue-900/30'
            }`}
          >
            <div className="p-2 rounded-xl bg-white/15 text-white shrink-0 mt-0.5">
              {alert.type === 'appointment' ? (
                <Calendar className="w-5 h-5" />
              ) : alert.type === 'deadline' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold tracking-tight">{alert.title}</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                  {alert.time}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">{alert.message}</p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
