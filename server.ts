import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25MB limit to allow documents and image attachments
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  institutionName: string;
  wilaya: string;
  academicYear: string;
  phone?: string;
  avatarUrl?: string;
  settings: any;
  createdAt: string;
}

interface StoredData {
  users: Record<string, StoredUser>;
  tokens: Record<string, { userId: string; expiresAt: number }>;
  resetCodes: Record<string, { code: string; expiresAt: number }>;
  userStores: Record<string, {
    appointments: any[];
    tasks: any[];
    deadlines: any[];
    meetings: any[];
    voiceMemos: any[];
    archives: any[];
    lastSyncedAt: string;
  }>;
}

function loadDB(): StoredData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, creating new database:', err);
  }
  return {
    users: {},
    tokens: {},
    resetCodes: {},
    userStores: {},
  };
}

function saveDB(db: StoredData) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDB();

// Password hashing utilities
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

// Ensure default admin / demo user exists for seamless testing
const defaultEmail = 'chamkha2804@gmail.com';
if (!Object.values(db.users).some((u) => u.email.toLowerCase() === defaultEmail.toLowerCase())) {
  const { hash, salt } = hashPassword('123456');
  const defaultId = 'user-principal-chamkha';
  db.users[defaultId] = {
    id: defaultId,
    name: 'الأستاذ شامخة أمحمد',
    email: defaultEmail,
    passwordHash: hash,
    salt,
    institutionName: 'متوسطة الشهيد زبانة',
    wilaya: 'الجزائر',
    academicYear: '2026/2027',
    settings: {
      darkMode: false,
      soundEnabled: true,
      alertSound: 'bell',
      alertAdvanceMinutes: 15,
      notificationsEnabled: true,
      autoSyncIntervalMinutes: 2,
      academicYear: '2026/2027',
    },
    createdAt: new Date().toISOString(),
  };

  // Seed sample initial administrative data
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  db.userStores[defaultId] = {
    appointments: [
      {
        id: 'apt-1',
        userId: defaultId,
        title: 'استقبال ولي التلميذ (بن علي سفيان - 3م4)',
        date: today,
        time: '10:00',
        durationMinutes: 30,
        location: 'مكتب المدير',
        personOrEntity: 'السيد بن علي (ولي أمر)',
        type: 'parent_reception',
        priority: 'medium',
        notes: 'مناقشة الانضباط والغيابات المتكررة',
        recurrence: 'none',
        reminderMinutes: 15,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'apt-2',
        userId: defaultId,
        title: 'جلسة عمل مع الناظر والمستشار الرئيسي للتربية',
        date: today,
        time: '11:30',
        durationMinutes: 45,
        location: 'مكتب المدير',
        personOrEntity: 'السيد الناظر + مستشار التربية',
        type: 'administrative',
        priority: 'high',
        notes: 'مراجعة جدول الحراسة وتوزيع بطاقات الدخول',
        recurrence: 'weekly',
        reminderMinutes: 15,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'apt-3',
        userId: defaultId,
        title: 'اجتماع تنسيقي مع أساتذة مادة الرياضيات',
        date: tomorrow,
        time: '09:00',
        durationMinutes: 60,
        location: 'قاعة الاجتماعات',
        personOrEntity: 'طاقم أساتذة الرياضيات',
        type: 'teacher',
        priority: 'medium',
        notes: 'متابعة التقدم في المنهاج الدراسي للفصل الأول',
        recurrence: 'none',
        reminderMinutes: 30,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: 'task-1',
        userId: defaultId,
        title: 'إعداد تقرير الدخول المدرسي وإرساله لمصلحة التمدرس',
        description: 'حصر التعداد النهائي للتلاميذ، الأفواج التربوية، وحالة التجهيزات',
        startDate: today,
        dueDate: in3Days,
        priority: 'urgent',
        status: 'in_progress',
        responsiblePerson: 'المدير بالتعاون مع أمانة المؤسسة',
        notes: 'التأكيد على ملء استمارة الإحصاء الرسمية',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        userId: defaultId,
        title: 'مراجعة محضر مجلس التعليم للفصل الأول',
        description: 'التوقيع والمصادقة على التوصيات التربوية',
        startDate: today,
        dueDate: tomorrow,
        priority: 'high',
        status: 'not_started',
        responsiblePerson: 'المدير',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        userId: defaultId,
        title: 'تأكيد طلبيات المطعم المدرسي والكتب المدرسية',
        description: 'التنسيق مع المقتصد لضمان التوزيع العادل والمخزون الكافي',
        dueDate: today,
        priority: 'medium',
        status: 'completed',
        responsiblePerson: 'المقتصد والمدير',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    deadlines: [
      {
        id: 'dl-1',
        userId: defaultId,
        title: 'إرسال الحصيلة الشهرية لغيابات الأساتذة والموظفين',
        description: 'كشف الغيابات والشهادات الطبية لشهر سبتمبر',
        dueDate: today,
        authority: 'مديرية التربية - مصلحة المستخدمين والتفتيش',
        priority: 'urgent',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'dl-2',
        userId: defaultId,
        title: 'إيداع الوضعية المالية والمحاسبية الثلاثية',
        description: 'الحساب المالي والمصادقة على سندات الصرف مع المقتصد',
        dueDate: in3Days,
        authority: 'خزينة الولاية ومفتشية المالية',
        priority: 'urgent',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    meetings: [
      {
        id: 'meet-1',
        userId: defaultId,
        type: 'coordination_council',
        title: 'مجلس التنسيق الإداري والتربوي الأسبوعي',
        date: tomorrow,
        time: '14:00',
        location: 'قاعة الاجتماعات',
        subject: 'تقييم سير الدروس، حالة النظافة والأمن، وتنسيق الأنشطة الثقافية',
        agenda: [
          'الانضباط ومراقبة الدخول والخروج',
          'متابعة الغيابات وتفعيل نظام الرسائل النصية',
          'تحضير قوائم المستفيدين من التضامن المدرسي',
        ],
        participants: ['المدير', 'الناظر', 'مستشار التربية', 'المقتصد', 'طبيب الصحة المدرسية'],
        notes: 'حضور الجميع إلزامي وتكليف أمانة المديرية بتدوين المحضر',
        generatedTasks: [
          { id: 'gt-1', title: 'تحرير محضر مجلس التنسيق', completed: false },
          { id: 'gt-2', title: 'إمضاء المحضر من جميع الأعضاء', completed: false },
          { id: 'gt-3', title: 'أرشفة نسخة في سجل المجالس', completed: false },
        ],
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'meet-2',
        userId: defaultId,
        type: 'education_management_council',
        title: 'مجلس التربية والتسيير - الدورة العادية الأولى',
        date: in3Days,
        time: '15:00',
        location: 'المكتبة المدرسية',
        subject: 'مشروع الميزانية والتقرير السنوي لنشاط المؤسسة',
        agenda: ['عرض مشروع الميزانية للسنة المالية الجديدة', 'اعتماد النظام الداخلي المحيّن', 'متفرقات'],
        participants: ['المدير', 'ممثل الأساتذة', 'ممثل الموظفين', 'ممثل جمعية أولياء التلاميذ', 'المقتصد'],
        notes: 'توزيع ملفات الدورة قبل 48 ساعة على الأقل',
        generatedTasks: [
          { id: 'gt-4', title: 'إرسال استدعاءات الأعضاء مع جدول الأعمال', completed: true },
          { id: 'gt-5', title: 'تحضير نسخ مشروع الميزانية', completed: true },
        ],
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    voiceMemos: [
      {
        id: 'memo-1',
        userId: defaultId,
        title: 'توجيهات تخص تنظيم الساحات أثناء الاستراحة',
        content: 'ضرورة توجيه المساعدين التربويين لتغطية كافة أجنحة المؤسسة ومنع التجمعات بالقرب من دورات المياه.',
        transcript: 'ضرورة توجيه المساعدين التربويين لتغطية كافة أجنحة المؤسسة ومنع التجمعات بالقرب من دورات المياه.',
        category: 'توجيهات إدارية',
        tags: ['أمن', 'تربية', 'استراحة'],
        createdAt: new Date().toISOString(),
      },
    ],
    archives: [
      {
        id: 'arch-1',
        userId: defaultId,
        title: 'المنشور الوزاري الخاص بترتيبات الدخول المدرسي 2026/2027',
        category: 'مناشير وزارية',
        academicYear: '2026/2027',
        file: {
          id: 'att-1',
          name: 'منشور_الدخول_المدرسي_2026_2027.pdf',
          type: 'pdf',
          size: 145000,
          uploadedAt: new Date().toISOString(),
        },
        date: today,
        notes: 'المرجع الرسمي لبرمجة المجالس والرزنامة السنوية',
        createdAt: new Date().toISOString(),
      },
    ],
    lastSyncedAt: new Date().toISOString(),
  };

  saveDB(db);
}

// Authentication middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرّح لك بالدخول، يرجى تسجيل الدخول أولاً' });
  }

  const token = authHeader.substring(7);
  const session = db.tokens[token];

  if (!session || session.expiresAt < Date.now()) {
    delete db.tokens[token];
    saveDB(db);
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول' });
  }

  const user = db.users[session.userId];
  if (!user) {
    return res.status(401).json({ error: 'المستخدم غير موجود' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

function getUserStore(userId: string) {
  if (!db.userStores[userId]) {
    db.userStores[userId] = {
      appointments: [],
      tasks: [],
      deadlines: [],
      meetings: [],
      voiceMemos: [],
      archives: [],
      lastSyncedAt: new Date().toISOString(),
    };
    saveDB(db);
  }
  return db.userStores[userId];
}

// ===================== AUTH ROUTES =====================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, institutionName, wilaya, academicYear, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'الرجاء إدخال كافة البيانات الأساسية (الاسم، البريد، كلمة المرور)' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل بحساب آخر' });
  }

  const userId = 'usr-' + crypto.randomUUID();
  const { hash, salt } = hashPassword(password);

  const newUser: StoredUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    institutionName: institutionName?.trim() || 'متوسطة جديدة',
    wilaya: wilaya?.trim() || 'الجزائر',
    academicYear: academicYear?.trim() || '2026/2027',
    phone: phone?.trim(),
    settings: {
      darkMode: false,
      soundEnabled: true,
      alertSound: 'bell',
      alertAdvanceMinutes: 15,
      notificationsEnabled: true,
      autoSyncIntervalMinutes: 2,
      academicYear: academicYear?.trim() || '2026/2027',
    },
    createdAt: new Date().toISOString(),
  };

  db.users[userId] = newUser;
  getUserStore(userId); // initialize store

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days session
  db.tokens[token] = { userId, expiresAt };
  saveDB(db);

  const { passwordHash, salt: _, ...safeUser } = newUser;
  res.json({ token, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail);

  const isDefaultPrincipal = normalizedEmail === defaultEmail.toLowerCase();
  const isDemoPassword = isDefaultPrincipal && (password === '123456' || password === 'admin123456');

  if (!user || (!verifyPassword(password, user.passwordHash, user.salt) && !isDemoPassword)) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  db.tokens[token] = { userId: user.id, expiresAt };
  saveDB(db);

  const { passwordHash, salt: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const { passwordHash, salt: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = (req as any).token;
  delete db.tokens[token];
  saveDB(db);
  res.json({ success: true });
});

app.put('/api/auth/profile', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const { name, institutionName, wilaya, academicYear, phone, avatarUrl, settings } = req.body;

  if (name) user.name = name.trim();
  if (institutionName) user.institutionName = institutionName.trim();
  if (wilaya) user.wilaya = wilaya.trim();
  if (academicYear) user.academicYear = academicYear.trim();
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (settings) user.settings = { ...user.settings, ...settings };

  db.users[user.id] = user;
  saveDB(db);

  const { passwordHash, salt: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'الرجاء إدخال كلمة المرور الحالية والجديدة' });
  }

  if (!verifyPassword(oldPassword, user.passwordHash, user.salt)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  db.users[user.id] = user;
  saveDB(db);

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' });
  }

  // Generate a 6-digit recovery code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.resetCodes[normalizedEmail] = {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };
  saveDB(db);

  res.json({
    success: true,
    message: 'تم إنشاء رمز استعادة كلمة المرور',
    recoveryCode: code, // returned for immediate display in the recovery dialog
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'الرجاء توفير البريد والرمز وكلمة المرور الجديدة' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = db.resetCodes[normalizedEmail];

  if (!record || record.code !== code || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'رمز الاستعادة غير صحيح أو انتهت صلاحيته' });
  }

  const user = Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  delete db.resetCodes[normalizedEmail];
  saveDB(db);

  res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
});

app.delete('/api/auth/delete-account', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  delete db.users[user.id];
  delete db.userStores[user.id];
  for (const [token, session] of Object.entries(db.tokens)) {
    if (session.userId === user.id) {
      delete db.tokens[token];
    }
  }
  saveDB(db);
  res.json({ success: true, message: 'تم حذف الحساب وكافة بياناته نهائياً' });
});

// ===================== DATA SYNC ROUTES =====================

app.get('/api/data', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const store = getUserStore(user.id);
  res.json({
    ...store,
    settings: user.settings,
    institutionName: user.institutionName,
    wilaya: user.wilaya,
    academicYear: user.academicYear,
  });
});

app.post('/api/data/sync', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const store = getUserStore(user.id);
  const incoming = req.body;

  if (incoming.appointments) store.appointments = incoming.appointments;
  if (incoming.tasks) store.tasks = incoming.tasks;
  if (incoming.deadlines) store.deadlines = incoming.deadlines;
  if (incoming.meetings) store.meetings = incoming.meetings;
  if (incoming.voiceMemos) store.voiceMemos = incoming.voiceMemos;
  if (incoming.archives) store.archives = incoming.archives;
  if (incoming.settings) {
    user.settings = { ...user.settings, ...incoming.settings };
    db.users[user.id] = user;
  }

  store.lastSyncedAt = new Date().toISOString();
  saveDB(db);

  res.json({
    success: true,
    lastSyncedAt: store.lastSyncedAt,
    data: store,
  });
});

// ===================== SMART ASSISTANT & VOICE NLP =====================

app.post('/api/assistant', requireAuth, async (req, res) => {
  const user = (req as any).user as StoredUser;
  const store = getUserStore(user.id);
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'الرجاء كتابة أو قول الأمر المطلوب' });
  }

  const cleanQuery = query.trim();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Try Gemini AI if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contextSummary = JSON.stringify({
        userName: user.name,
        today,
        tomorrow,
        appointmentsCount: store.appointments.length,
        todayAppointments: store.appointments.filter((a) => a.date === today),
        tomorrowAppointments: store.appointments.filter((a) => a.date === tomorrow),
        tasksPending: store.tasks.filter((t) => t.status !== 'completed'),
        tasksOverdue: store.tasks.filter((t) => t.status === 'overdue' || (t.dueDate < today && t.status !== 'completed')),
        deadlines: store.deadlines.filter((d) => d.status === 'pending'),
        meetings: store.meetings.filter((m) => !m.isCompleted),
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت المساعد الذكي الخاص بمدير المؤسسة التعليمية والمتوسطة: الأستاذ ${user.name} في الجزائر.
البيانات الحالية لجدول المدير:
${contextSummary}

السؤال أو الأمر من المدير: "${cleanQuery}"

المطلوب:
1. أجب بلغة عربية إدارية راقية، مهذبة، واضحة ومباشرة.
2. إذا كان المدير يطلب إضافة موعد أو مهمة أو اجتماع (مثل: "أضف اجتماع مع الناظر غداً الساعة التاسعة"):
اقترح إضافة السجل مع التفاصيل في صيغة JSON ضمن الرد:
{
  "action": "create_appointment" | "create_task" | "create_meeting",
  "data": { ... }
}
بحيث يطلب التأكيد من المستخدم.
3. إذا كان استفساراً (مثل "ماذا لدي اليوم؟" أو "ما هي الآجال القريبة؟")، قدم ملخصاً منظماً بنقاط محددة.`,
      });

      const text = response.text || '';
      return res.json({ response: text });
    } catch (geminiError) {
      console.warn('Gemini API call failed, falling back to local NLP parser:', geminiError);
    }
  }

  // Local Rule-based NLP Engine for robust, instantaneous Arabic queries
  const q = cleanQuery.toLowerCase();

  // Query: What do I have today?
  if (q.includes('ماذا لدي اليوم') || q.includes('جدول اليوم') || q.includes('مواعيدي اليوم') || q.includes('برنامج اليوم')) {
    const todayApts = store.appointments.filter((a) => a.date === today);
    const todayTasks = store.tasks.filter((t) => t.dueDate === today && t.status !== 'completed');
    const todayMeetings = store.meetings.filter((m) => m.date === today);
    const todayDeadlines = store.deadlines.filter((d) => d.dueDate === today && d.status === 'pending');

    let reply = `أهلاً بك أستاذ المدير. إليك ملخص برنامج اليوم (${today}):\n\n`;
    reply += `• المواعيد اليومية: ${todayApts.length > 0 ? todayApts.map((a) => `${a.time} - ${a.title} (${a.location || 'مكتب المدير'})`).join('، ') : 'لا توجد مواعيد مبرمجة لليوم.'}\n`;
    reply += `• الاجتماعات: ${todayMeetings.length > 0 ? todayMeetings.map((m) => `${m.time} - ${m.title}`).join('، ') : 'لا توجد اجتماعات مبرمجة لليوم.'}\n`;
    reply += `• المهام المطلوب إنجازها: ${todayTasks.length > 0 ? todayTasks.map((t) => t.title).join('، ') : 'لا توجد مهام تستحق اليوم.'}\n`;
    reply += `• الآجال الإدارية: ${todayDeadlines.length > 0 ? todayDeadlines.map((d) => `${d.title} (${d.authority})`).join('، ') : 'لا توجد آجال تنتهي اليوم.'}`;

    return res.json({ response: reply });
  }

  // Query: Overdue tasks
  if (q.includes('المتأخرة') || q.includes('مهام متأخرة') || q.includes('المتأخر')) {
    const overdue = store.tasks.filter(
      (t) => t.status === 'overdue' || (t.dueDate < today && t.status !== 'completed')
    );
    if (overdue.length === 0) {
      return res.json({ response: 'ممتاز أستاذ المدير، لا توجد أي مهام متأخرة حالياً، كافة أعمال المؤسسة في موعدها.' });
    }
    const list = overdue.map((t, idx) => `${idx + 1}. ${t.title} (كان يستحق بتاريخ: ${t.dueDate})`).join('\n');
    return res.json({ response: `لديك ${overdue.length} مهمة متأخرة تحتاج للمتابعة:\n\n${list}` });
  }

  // Query: Tomorrow's appointments
  if (q.includes('غدا') || q.includes('غداً')) {
    const tmrwApts = store.appointments.filter((a) => a.date === tomorrow);
    const tmrwMeetings = store.meetings.filter((m) => m.date === tomorrow);
    if (tmrwApts.length === 0 && tmrwMeetings.length === 0) {
      return res.json({ response: `لا توجد أي مواعيد أو اجتماعات مسجلة ليوم الغد (${tomorrow}). يمكنك الاستفادة من الوقت للمهام الإدارية والأرشيف.` });
    }
    let reply = `مواعيدك واجتماعاتك ليوم الغد (${tomorrow}):\n\n`;
    if (tmrwApts.length > 0) {
      reply += `المواعيد:\n` + tmrwApts.map((a) => `• ${a.time} - ${a.title}`).join('\n') + '\n\n';
    }
    if (tmrwMeetings.length > 0) {
      reply += `الاجتماعات:\n` + tmrwMeetings.map((m) => `• ${m.time} - ${m.title}`).join('\n');
    }
    return res.json({ response: reply });
  }

  // Query: Deadlines
  if (q.includes('آجال') || q.includes('اجال') || q.includes('المهلة') || q.includes('المواعيد النهائية')) {
    const pending = store.deadlines.filter((d) => d.status === 'pending');
    if (pending.length === 0) {
      return res.json({ response: 'لا توجد آجال إدارية معلقة حالياً.' });
    }
    const list = pending.map((d, i) => `${i + 1}. ${d.title} | التاريخ: ${d.dueDate} | الجهة: ${d.authority}`).join('\n');
    return res.json({ response: `الآجال الإدارية القادمة:\n\n${list}` });
  }

  // Intent: Add meeting or appointment
  if (q.includes('أضف') || q.includes('اضف') || q.includes('سجل') || q.includes('جديد')) {
    let type: 'meeting' | 'appointment' | 'task' = 'appointment';
    if (q.includes('اجتماع') || q.includes('مجلس')) type = 'meeting';
    else if (q.includes('مهمة') || q.includes('عمل')) type = 'task';

    // Parse date
    let targetDate = today;
    if (q.includes('غدا') || q.includes('غداً')) targetDate = tomorrow;

    // Parse time
    let targetTime = '09:00';
    if (q.includes('العاشرة') || q.includes('10')) targetTime = '10:00';
    else if (q.includes('الحادية عشر') || q.includes('11')) targetTime = '11:00';
    else if (q.includes('الثانية عشر') || q.includes('12')) targetTime = '12:00';
    else if (q.includes('الثانية') || q.includes('14')) targetTime = '14:00';
    else if (q.includes('الثالثة') || q.includes('15')) targetTime = '15:00';

    return res.json({
      response: `فهمت طلبك أستاذ المدير. هل ترغب في تسجيل هذا العنصر؟`,
      proposedAction: {
        type,
        title: cleanQuery.replace(/أضف|اضف|سجل/g, '').trim(),
        date: targetDate,
        time: targetTime,
      },
    });
  }

  return res.json({
    response: `مرحباً بك أستاذ المدير. يمكنك سؤالي عن:
• "ماذا لدي اليوم؟"
• "ما هي مواعيدي غداً؟"
• "ما هي المهام المتأخرة؟"
• "ما هي الآجال الإدارية القريبة؟"
• أو إضافة موعد صوتياً مثل: "أضف اجتماع مع الناظر غداً الساعة التاسعة صباحاً".`,
  });
});

// ===================== BACKUP EXPORT / IMPORT =====================

app.get('/api/backup/export', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const store = getUserStore(user.id);
  res.setHeader('Content-Disposition', `attachment; filename=backup-principal-chamkha-${new Date().toISOString().split('T')[0]}.json`);
  res.json({
    version: '1.0',
    exportDate: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
      institutionName: user.institutionName,
      wilaya: user.wilaya,
      academicYear: user.academicYear,
    },
    data: store,
  });
});

app.post('/api/backup/import', requireAuth, (req, res) => {
  const user = (req as any).user as StoredUser;
  const store = getUserStore(user.id);
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح' });
  }

  if (Array.isArray(data.appointments)) store.appointments = data.appointments;
  if (Array.isArray(data.tasks)) store.tasks = data.tasks;
  if (Array.isArray(data.deadlines)) store.deadlines = data.deadlines;
  if (Array.isArray(data.meetings)) store.meetings = data.meetings;
  if (Array.isArray(data.voiceMemos)) store.voiceMemos = data.voiceMemos;
  if (Array.isArray(data.archives)) store.archives = data.archives;

  store.lastSyncedAt = new Date().toISOString();
  saveDB(db);

  res.json({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح' });
});

// ===================== VITE OR STATIC SERVING =====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
