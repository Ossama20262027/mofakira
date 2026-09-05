import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Appointment,
  Task,
  AdministrativeDeadline,
  Meeting,
  VoiceMemo,
  ArchiveDocument,
  AppSettings,
  SyncPayload,
} from '../types';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';
import { soundAlerts } from '../utils/audioAlerts';

interface ActiveAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'deadline' | 'meeting' | 'system';
}

interface DataContextType {
  appointments: Appointment[];
  tasks: Task[];
  deadlines: AdministrativeDeadline[];
  meetings: Meeting[];
  voiceMemos: VoiceMemo[];
  archives: ArchiveDocument[];
  settings: AppSettings;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  activeAlerts: ActiveAlert[];
  dismissAlert: (id: string) => void;
  syncNow: () => Promise<void>;
  // Appointment mutations
  addAppointment: (apt: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, apt: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  // Task mutations
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  // Deadline mutations
  addDeadline: (dl: Omit<AdministrativeDeadline, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<AdministrativeDeadline>;
  updateDeadline: (id: string, dl: Partial<AdministrativeDeadline>) => Promise<void>;
  deleteDeadline: (id: string) => Promise<void>;
  // Meeting mutations
  addMeeting: (m: Omit<Meeting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Meeting>;
  updateMeeting: (id: string, m: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  createTasksFromMeeting: (meetingId: string) => Promise<void>;
  // Voice Memo mutations
  addVoiceMemo: (memo: Omit<VoiceMemo, 'id' | 'userId' | 'createdAt'>) => Promise<VoiceMemo>;
  deleteVoiceMemo: (id: string) => Promise<void>;
  // Archive mutations
  addArchiveDocument: (doc: Omit<ArchiveDocument, 'id' | 'userId' | 'createdAt'>) => Promise<ArchiveDocument>;
  deleteArchiveDocument: (id: string) => Promise<void>;
  // Settings & Sound
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  testSound: () => void;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  soundEnabled: true,
  alertSound: 'bell',
  alertAdvanceMinutes: 15,
  notificationsEnabled: true,
  autoSyncIntervalMinutes: 2,
  academicYear: '2026/2027',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<AdministrativeDeadline[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [voiceMemos, setVoiceMemos] = useState<VoiceMemo[]>([]);
  const [archives, setArchives] = useState<ArchiveDocument[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const alertedIdsRef = useRef<Set<string>>(new Set());

  // Listen to network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when coming back online
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save state to local storage whenever collections change
  const saveStateLocally = useCallback(
    (nextState?: {
      appointments?: Appointment[];
      tasks?: Task[];
      deadlines?: AdministrativeDeadline[];
      meetings?: Meeting[];
      voiceMemos?: VoiceMemo[];
      archives?: ArchiveDocument[];
      settings?: AppSettings;
    }) => {
      if (!user) return;
      const dataToSave = {
        appointments: nextState?.appointments || appointments,
        tasks: nextState?.tasks || tasks,
        deadlines: nextState?.deadlines || deadlines,
        meetings: nextState?.meetings || meetings,
        voiceMemos: nextState?.voiceMemos || voiceMemos,
        archives: nextState?.archives || archives,
        settings: nextState?.settings || settings,
        lastSyncedAt: new Date().toISOString(),
        userId: user.id,
      };
      apiClient.saveLocalData(dataToSave);
    },
    [user, appointments, tasks, deadlines, meetings, voiceMemos, archives, settings]
  );

  // Load initial data when user logs in
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      setTasks([]);
      setDeadlines([]);
      setMeetings([]);
      setVoiceMemos([]);
      setArchives([]);
      return;
    }

    // First load from local storage cache for instant rendering
    const cached = apiClient.getLocalData();
    if (cached && cached.userId === user.id) {
      if (cached.appointments) setAppointments(cached.appointments);
      if (cached.tasks) setTasks(cached.tasks);
      if (cached.deadlines) setDeadlines(cached.deadlines);
      if (cached.meetings) setMeetings(cached.meetings);
      if (cached.voiceMemos) setVoiceMemos(cached.voiceMemos);
      if (cached.archives) setArchives(cached.archives);
      if (cached.settings) setSettings(cached.settings);
      if (cached.lastSyncedAt) setLastSyncedAt(cached.lastSyncedAt);
    }

    if (user.settings) {
      setSettings((prev) => ({ ...prev, ...user.settings }));
    }

    // Then fetch fresh data from the server
    triggerSync();
  }, [user]);

  // Sync execution
  const triggerSync = async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      const serverData = await apiClient.fetchServerData();
      if (serverData) {
        if (Array.isArray(serverData.appointments)) setAppointments(serverData.appointments);
        if (Array.isArray(serverData.tasks)) setTasks(serverData.tasks);
        if (Array.isArray(serverData.deadlines)) setDeadlines(serverData.deadlines);
        if (Array.isArray(serverData.meetings)) setMeetings(serverData.meetings);
        if (Array.isArray(serverData.voiceMemos)) setVoiceMemos(serverData.voiceMemos);
        if (Array.isArray(serverData.archives)) setArchives(serverData.archives);
        if (serverData.settings) setSettings((prev) => ({ ...prev, ...serverData.settings }));
        setLastSyncedAt(serverData.lastSyncedAt || new Date().toISOString());

        saveStateLocally({
          appointments: serverData.appointments,
          tasks: serverData.tasks,
          deadlines: serverData.deadlines,
          meetings: serverData.meetings,
          voiceMemos: serverData.voiceMemos,
          archives: serverData.archives,
          settings: serverData.settings,
        });
      }
      setIsOnline(true);
    } catch (err: any) {
      if (err.message === 'OFFLINE' || !navigator.onLine) {
        setIsOnline(false);
      }
      console.warn('Sync notice:', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const payload: Partial<SyncPayload> = {
        appointments,
        tasks,
        deadlines,
        meetings,
        voiceMemos,
        archives,
        settings,
      };
      const res = await apiClient.syncWithServer(payload);
      if (res?.lastSyncedAt) {
        setLastSyncedAt(res.lastSyncedAt);
      }
      setIsOnline(true);
    } catch (err: any) {
      if (err.message === 'OFFLINE' || !navigator.onLine) {
        setIsOnline(false);
      }
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic background auto-sync (every 2 minutes)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, (settings.autoSyncIntervalMinutes || 2) * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, settings.autoSyncIntervalMinutes]);

  // Audio and Visual Alert Monitor (runs every 20 seconds)
  useEffect(() => {
    if (!user) return;

    const checkAlerts = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      // Check appointments
      appointments.forEach((apt) => {
        if (apt.date !== todayStr || apt.status === 'completed' || apt.status === 'cancelled') return;

        const [aptH, aptM] = apt.time.split(':').map(Number);
        const aptTotalMinutes = aptH * 60 + aptM;
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        const diffMinutes = aptTotalMinutes - currentTotalMinutes;

        const reminderWindow = apt.reminderMinutes || settings.alertAdvanceMinutes || 15;

        // If within reminder window and hasn't alerted yet today
        const alertKey = `apt-${apt.id}-${todayStr}`;
        if (diffMinutes >= 0 && diffMinutes <= reminderWindow && !alertedIdsRef.current.has(alertKey)) {
          alertedIdsRef.current.add(alertKey);

          // Trigger sound
          if (settings.soundEnabled) {
            soundAlerts.playByType(settings.alertSound);
          }

          // Trigger push notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('مساعد مدير المتوسطة - تذكير بموعد', {
              body: `لديك "${apt.title}" بعد ${diffMinutes === 0 ? 'لحظات' : diffMinutes + ' دقيقة'}.`,
              icon: '/icon.svg',
            });
          }

          // Add to in-app active alerts
          setActiveAlerts((prev) => [
            {
              id: alertKey,
              title: `موعد قادم: ${apt.title}`,
              message: `المكان: ${apt.location || 'مكتب المدير'} - الوقت: ${apt.time} (بعد ${diffMinutes} دقيقة)`,
              time: apt.time,
              type: 'appointment',
            },
            ...prev,
          ]);
        }
      });

      // Check upcoming deadlines
      deadlines.forEach((dl) => {
        if (dl.status === 'completed' || dl.dueDate !== todayStr) return;
        const alertKey = `dl-${dl.id}-${todayStr}`;
        if (!alertedIdsRef.current.has(alertKey)) {
          alertedIdsRef.current.add(alertKey);

          if (settings.soundEnabled) {
            soundAlerts.playByType(settings.alertSound);
          }

          setActiveAlerts((prev) => [
            {
              id: alertKey,
              title: `أجل إداري ينتهي اليوم: ${dl.title}`,
              message: `الجهة: ${dl.authority}`,
              time: 'اليوم',
              type: 'deadline',
            },
            ...prev,
          ]);
        }
      });
    };

    const alertInterval = setInterval(checkAlerts, 20000);
    checkAlerts(); // Run once immediately

    return () => clearInterval(alertInterval);
  }, [appointments, deadlines, settings, user]);

  const dismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const testSound = () => {
    soundAlerts.playByType(settings.alertSound);
  };

  // ===================== CRUD IMPLEMENTATIONS =====================

  const addAppointment = async (aptData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newApt: Appointment = {
      ...aptData,
      id: 'apt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newApt, ...appointments];
    setAppointments(next);
    saveStateLocally({ appointments: next });

    // Sync in background if online
    if (navigator.onLine) {
      apiClient.syncWithServer({ appointments: next }).catch(console.warn);
    }
    return newApt;
  };

  const updateAppointment = async (id: string, aptData: Partial<Appointment>) => {
    const next = appointments.map((a) => (a.id === id ? { ...a, ...aptData, updatedAt: new Date().toISOString() } : a));
    setAppointments(next);
    saveStateLocally({ appointments: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ appointments: next }).catch(console.warn);
    }
  };

  const deleteAppointment = async (id: string) => {
    const next = appointments.filter((a) => a.id !== id);
    setAppointments(next);
    saveStateLocally({ appointments: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ appointments: next }).catch(console.warn);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newTask, ...tasks];
    setTasks(next);
    saveStateLocally({ tasks: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ tasks: next }).catch(console.warn);
    }
    return newTask;
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, ...taskData, updatedAt: new Date().toISOString() } : t));
    setTasks(next);
    saveStateLocally({ tasks: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ tasks: next }).catch(console.warn);
    }
  };

  const deleteTask = async (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    saveStateLocally({ tasks: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ tasks: next }).catch(console.warn);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    await updateTask(id, { status: newStatus });
  };

  const addDeadline = async (dlData: Omit<AdministrativeDeadline, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AdministrativeDeadline> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newDl: AdministrativeDeadline = {
      ...dlData,
      id: 'dl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newDl, ...deadlines];
    setDeadlines(next);
    saveStateLocally({ deadlines: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ deadlines: next }).catch(console.warn);
    }
    return newDl;
  };

  const updateDeadline = async (id: string, dlData: Partial<AdministrativeDeadline>) => {
    const next = deadlines.map((d) => (d.id === id ? { ...d, ...dlData, updatedAt: new Date().toISOString() } : d));
    setDeadlines(next);
    saveStateLocally({ deadlines: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ deadlines: next }).catch(console.warn);
    }
  };

  const deleteDeadline = async (id: string) => {
    const next = deadlines.filter((d) => d.id !== id);
    setDeadlines(next);
    saveStateLocally({ deadlines: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ deadlines: next }).catch(console.warn);
    }
  };

  const addMeeting = async (mData: Omit<Meeting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Meeting> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newM: Meeting = {
      ...mData,
      id: 'meet-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [newM, ...meetings];
    setMeetings(next);
    saveStateLocally({ meetings: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ meetings: next }).catch(console.warn);
    }
    return newM;
  };

  const updateMeeting = async (id: string, mData: Partial<Meeting>) => {
    const next = meetings.map((m) => (m.id === id ? { ...m, ...mData, updatedAt: new Date().toISOString() } : m));
    setMeetings(next);
    saveStateLocally({ meetings: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ meetings: next }).catch(console.warn);
    }
  };

  const deleteMeeting = async (id: string) => {
    const next = meetings.filter((m) => m.id !== id);
    setMeetings(next);
    saveStateLocally({ meetings: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ meetings: next }).catch(console.warn);
    }
  };

  // Generate the 5 essential administrative post-meeting tasks
  const createTasksFromMeeting = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting || !user) return;

    const standardMeetingTasks = [
      'تحرير محضر الاجتماع والمصادقة عليه',
      'إمضاء المحضر من طرف الأعضاء الحاضرين',
      'أرشفة المحضر في سجل المجالس الرسمي',
      'إرسال نسخة من الوثيقة إلى الجهات المعنية',
      'متابعة تنفيذ التوصيات والقرارات المنبثقة',
    ];

    const newGeneratedTasks: Task[] = standardMeetingTasks.map((title, idx) => ({
      id: 'task-meet-' + meeting.id + '-' + idx + '-' + Date.now(),
      userId: user.id,
      title: `${title} - (${meeting.title})`,
      description: `مهمة تنفيذية ناتجة عن ${meeting.title} المنعقد بتاريخ ${meeting.date}`,
      dueDate: meeting.date,
      priority: 'high',
      status: 'not_started',
      responsiblePerson: 'المدير / أمانة المؤسسة',
      meetingId: meeting.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const nextTasks = [...newGeneratedTasks, ...tasks];
    setTasks(nextTasks);

    const updatedGeneratedTaskList = standardMeetingTasks.map((t, i) => ({
      id: 'gt-' + i + '-' + Date.now(),
      title: t,
      completed: false,
    }));

    const nextMeetings = meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            generatedTasks: [...(m.generatedTasks || []), ...updatedGeneratedTaskList],
            updatedAt: new Date().toISOString(),
          }
        : m
    );
    setMeetings(nextMeetings);

    saveStateLocally({ tasks: nextTasks, meetings: nextMeetings });
    if (navigator.onLine) {
      apiClient.syncWithServer({ tasks: nextTasks, meetings: nextMeetings }).catch(console.warn);
    }
  };

  const addVoiceMemo = async (memoData: Omit<VoiceMemo, 'id' | 'userId' | 'createdAt'>): Promise<VoiceMemo> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newMemo: VoiceMemo = {
      ...memoData,
      id: 'memo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const next = [newMemo, ...voiceMemos];
    setVoiceMemos(next);
    saveStateLocally({ voiceMemos: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ voiceMemos: next }).catch(console.warn);
    }
    return newMemo;
  };

  const deleteVoiceMemo = async (id: string) => {
    const next = voiceMemos.filter((m) => m.id !== id);
    setVoiceMemos(next);
    saveStateLocally({ voiceMemos: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ voiceMemos: next }).catch(console.warn);
    }
  };

  const addArchiveDocument = async (docData: Omit<ArchiveDocument, 'id' | 'userId' | 'createdAt'>): Promise<ArchiveDocument> => {
    if (!user) throw new Error('المستخدم غير مسجل');
    const newDoc: ArchiveDocument = {
      ...docData,
      id: 'arch-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const next = [newDoc, ...archives];
    setArchives(next);
    saveStateLocally({ archives: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ archives: next }).catch(console.warn);
    }
    return newDoc;
  };

  const deleteArchiveDocument = async (id: string) => {
    const next = archives.filter((a) => a.id !== id);
    setArchives(next);
    saveStateLocally({ archives: next });
    if (navigator.onLine) {
      apiClient.syncWithServer({ archives: next }).catch(console.warn);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStateLocally({ settings: updated });
    if (navigator.onLine) {
      apiClient.syncWithServer({ settings: updated }).catch(console.warn);
    }
  };

  return (
    <DataContext.Provider
      value={{
        appointments,
        tasks,
        deadlines,
        meetings,
        voiceMemos,
        archives,
        settings,
        isOnline,
        isSyncing,
        lastSyncedAt,
        activeAlerts,
        dismissAlert,
        syncNow,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addDeadline,
        updateDeadline,
        deleteDeadline,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        createTasksFromMeeting,
        addVoiceMemo,
        deleteVoiceMemo,
        addArchiveDocument,
        deleteArchiveDocument,
        updateSettings,
        testSound,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
