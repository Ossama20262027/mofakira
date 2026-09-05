import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { DashboardView } from './pages/DashboardView';
import { AppointmentsView } from './pages/AppointmentsView';
import { TasksView } from './pages/TasksView';
import { DeadlinesView } from './pages/DeadlinesView';
import { MeetingsView } from './pages/MeetingsView';
import { ArchiveView } from './pages/ArchiveView';
import { VoiceMemosView } from './pages/VoiceMemosView';
import { ReportsView } from './pages/ReportsView';
import { SettingsView } from './pages/SettingsView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationToast } from './components/NotificationToast';
import { Mic, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Quick modals triggers
  const [openModalFlags, setOpenModalFlags] = useState<{
    appointment?: boolean;
    task?: boolean;
    deadline?: boolean;
    meeting?: boolean;
  }>({});

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToWithModal = (view: string, modalKey: 'appointment' | 'task' | 'deadline' | 'meeting') => {
    setOpenModalFlags({ [modalKey]: true });
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectView={setCurrentView}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            onOpenNewAppointment={() => navigateToWithModal('appointments', 'appointment')}
            onOpenNewTask={() => navigateToWithModal('tasks', 'task')}
            onOpenNewDeadline={() => navigateToWithModal('deadlines', 'deadline')}
            onOpenNewMeeting={() => navigateToWithModal('meetings', 'meeting')}
          />
        );
      case 'appointments':
        return <AppointmentsView initialOpenModal={!!openModalFlags.appointment} />;
      case 'tasks':
        return <TasksView initialOpenModal={!!openModalFlags.task} />;
      case 'deadlines':
      case 'alerts':
        return <DeadlinesView initialOpenModal={!!openModalFlags.deadline} />;
      case 'meetings':
        return <MeetingsView initialOpenModal={!!openModalFlags.meeting} />;
      case 'archives':
        return <ArchiveView />;
      case 'voice-memos':
        return <VoiceMemosView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
      case 'profile':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onSelectView={setCurrentView}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            onOpenNewAppointment={() => navigateToWithModal('appointments', 'appointment')}
            onOpenNewTask={() => navigateToWithModal('tasks', 'task')}
            onOpenNewDeadline={() => navigateToWithModal('deadlines', 'deadline')}
            onOpenNewMeeting={() => navigateToWithModal('meetings', 'meeting')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Toast Alert Notifications with Web Audio Chime */}
      <NotificationToast />

      {/* Main Layout Container */}
      <div className="flex flex-1 relative min-h-screen">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setOpenModalFlags({});
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectView={(view) => {
              setOpenModalFlags({});
              setCurrentView(view);
            }}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Floating Quick Voice Assistant Action Button (for instant voice commands anytime) */}
      <button
        id="floating-voice-assistant-btn"
        onClick={() => setIsVoiceAssistantOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer group border border-white/20 backdrop-blur-xs"
        title="فتح المساعد الإداري الذكي والأوامر الصوتية"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <Mic className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">المساعد الذكي</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectView={(view) => {
          setOpenModalFlags({});
          setCurrentView(view);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}
