export type Role = 'principal';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institutionName: string;
  wilaya: string;
  academicYear: string;
  phone?: string;
  avatarUrl?: string;
  settings: AppSettings;
  createdAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  alertSound: 'chime' | 'bell' | 'soft' | 'marimba';
  alertAdvanceMinutes: number; // 5, 10, 15, 30, 60, 1440
  notificationsEnabled: boolean;
  autoSyncIntervalMinutes: number;
  academicYear: string;
}

export type AppointmentType =
  | 'meeting'              // اجتماع
  | 'parent_reception'     // استقبال ولي
  | 'parents'              // استقبال أولياء
  | 'visit'                // زيارة
  | 'inspection'           // زيارة تفتيشية
  | 'inspector_meeting'    // لقاء مع مفتش
  | 'administrative'       // موعد إداري
  | 'directorate'          // مديرية التربية
  | 'employee'             // موعد مع موظف
  | 'teacher'              // موعد مع أستاذ
  | 'student'              // موعد مع تلميذ
  | 'external'             // خارجي
  | 'external_entity'      // موعد مع جهة خارجية
  | 'personal'             // موعد شخصي
  | 'other';               // أخرى

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskPriority = PriorityLevel;

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  size: number;
  dataUrl?: string;
  category?: string;
  uploadedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  location: string;
  personOrEntity: string;
  type: AppointmentType;
  priority: PriorityLevel;
  notes?: string;
  attachments?: Attachment[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | 'not_started'  // لم تبدأ
  | 'in_progress'  // قيد الإنجاز
  | 'completed'    // مكتملة
  | 'postponed'    // مؤجلة
  | 'overdue';     // متأخرة

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TaskStatus;
  responsiblePerson?: string;
  notes?: string;
  files?: Attachment[];
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdministrativeDeadline {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  authority: string; // e.g. مديرية التربية، مصلحة التمدرس
  priority: 'normal' | 'urgent' | 'high' | 'medium';
  status: 'pending' | 'completed';
  referenceNumber?: string;
  reminderDaysBefore?: number;
  completedAt?: string;
  files?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type MeetingType =
  | 'class_council'               // مجلس القسم
  | 'teaching_council'            // مجلس التعليم
  | 'coordination_council'        // مجلس التنسيق
  | 'administrative_coordination' // مجلس التنسيق الإداري
  | 'education_management'        // مجلس التربية والتسيير
  | 'education_management_council'// مجلس التربية والتسيير
  | 'disciplinary_board'          // مجلس التأديب
  | 'discipline_council'          // مجلس التأديب
  | 'administrative_meeting'      // الاجتماعات الإدارية
  | 'emergency_meeting'           // اجتماع طارئ
  | 'pedagogical_staff_meeting'   // اجتماعات الطاقم التربوي
  | 'other';                      // اجتماعات أخرى

export interface Meeting {
  id: string;
  userId: string;
  type: MeetingType;
  title: string;
  date: string;
  time: string;
  location: string;
  subject: string;
  agenda: string[];
  participants: string[];
  notes?: string;
  minutes?: string;
  documents?: Attachment[];
  generatedTasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceMemo {
  id: string;
  userId: string;
  title: string;
  content: string;
  transcript: string;
  category?: string;
  tags?: string[];
  createdAt: string;
}

export interface ArchiveDocument {
  id: string;
  userId: string;
  title: string;
  category: string;
  academicYear: string;
  referenceNumber?: string;
  tags?: string[];
  notes?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  file?: Attachment;
  date?: string;
  createdAt: string;
}

export interface SyncPayload {
  appointments: Appointment[];
  tasks: Task[];
  deadlines: AdministrativeDeadline[];
  meetings: Meeting[];
  voiceMemos: VoiceMemo[];
  archives: ArchiveDocument[];
  settings: AppSettings;
  lastSyncedAt: string;
}
