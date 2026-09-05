import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Bell, X, Calendar, AlertTriangle, VolumeX } from 'lucide-react';
import { soundAlerts } from '../utils/audioAlerts';

export const NotificationToast: React.FC = () => {
  const { activeAlerts, dismissAlert, settings } = useData();
  const lastAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeAlerts.length > 0 && settings.soundEnabled) {
      const newestAlert = activeAlerts[0];
      if (newestAlert.id !== lastAlertIdRef.current) {
        lastAlertIdRef.current = newestAlert.id;
        soundAlerts.playAlarm();
      }
    }
  }, [activeAlerts, settings.soundEnabled]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-5 z-50 flex flex-col gap-2.5 w-[92vw] max-w-md pointer-events-none">
      {activeAlerts.map((alert) => {
        const isUrgent = alert.type === 'deadline';

        return (
          <div
            key={alert.id}
            onClick={() => {
              soundAlerts.stopAlarm();
            }}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 cursor-pointer ${
              isUrgent
                ? 'bg-amber-600/95 text-white border-amber-500 shadow-amber-600/30'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40 ring-1 ring-white/10'
            }`}
          >
            <div className="p-2 rounded-xl bg-white/15 text-white shrink-0 mt-0.5">
              {alert.type === 'appointment' ? (
                <Calendar className="w-5 h-5" />
              ) : alert.type === 'deadline' ? (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate">{alert.title}</h4>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-medium shrink-0">
                  {alert.time}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-90 leading-relaxed line-clamp-2">{alert.message}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundAlerts.stopAlarm();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition cursor-pointer active:scale-95"
                title="إيقاف صوت المنبه"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">إيقاف التنبيه</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundAlerts.stopAlarm();
                  dismissAlert(alert.id);
                }}
                className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
