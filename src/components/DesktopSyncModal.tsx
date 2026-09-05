import React, { useState, useEffect } from 'react';
import {
  Monitor,
  RefreshCw,
  Copy,
  Check,
  X,
  Code2,
  Terminal,
  Server,
  ArrowDownUp,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useData } from '../context/DataContext';

interface DesktopSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopSyncModal: React.FC<DesktopSyncModalProps> = ({ isOpen, onClose }) => {
  const { syncNow, lastSyncedAt, appointments, tasks, deadlines, meetings } = useData();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python');
  const [syncInfo, setSyncInfo] = useState<{
    apiKey: string;
    syncUrl: string;
    userName: string;
    institutionName: string;
  } | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch live sync token & server status
    apiClient
      .getDesktopSyncToken()
      .then((data) => setSyncInfo(data))
      .catch((err) => console.warn('Could not fetch desktop sync token', err));

    apiClient
      .getDesktopSyncStatus()
      .then((res) => setServerStatus(res))
      .catch((err) => console.warn('Could not fetch desktop sync status', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const syncBaseUrl = syncInfo?.syncUrl || `${currentOrigin}/api/desktop-sync`;
  const apiKey = syncInfo?.apiKey || 'dsk_chamkha_principal_secure_key';

  const handleCopy = (text: string, type: 'key' | 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleTriggerDesktopSync = async () => {
    setIsSyncingLive(true);
    setSyncFeedback(null);
    try {
      // Simulate sending a test task from desktop to test bidirectional sync
      const testTask = {
        id: 'desk-sync-' + Date.now(),
        title: 'مهمة من تطبيق سطح المكتب: متابعة ملفات الأساتذة',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'high',
        status: 'in_progress',
      };
      await apiClient.syncBidirectionalDesktop({
        tasks: [testTask],
      });
      await syncNow();
      const status = await apiClient.getDesktopSyncStatus();
      setServerStatus(status);
      setSyncFeedback('✓ تمت المزامنة الثنائية بنجاح! تم استلام وتحديث كافة البيانات.');
    } catch (err: any) {
      setSyncFeedback('تعذر إتمام المزامنة: ' + (err.message || 'خطأ في الاتصال'));
    } finally {
      setIsSyncingLive(false);
    }
  };

  const pythonCode = `"""
تطبيق سطح المكتب - مزامنة بيانات مدير المتوسطة
يعمل بلغة Python ويتصل بـ REST API لتطبيق الويب في كلا الاتجاهين
المتطلبات: pip install requests
"""
import requests
import json
import time

SERVER_URL = "${syncBaseUrl}"
API_KEY = "${apiKey}"

HEADERS = {
    "Content-Type": "application/json",
    "x-desktop-sync-key": API_KEY
}

def check_status():
    """التحقق من حالة الخادم والاتصال"""
    try:
        res = requests.get(f"{SERVER_URL}/status", headers=HEADERS, timeout=8)
        if res.status_code == 200:
            data = res.json()
            print(f"[✓] متصل بالخادم | المؤسسة: {data['user']['institutionName']}")
            print(f"    المواعيد: {data['counts']['appointments']} | المهام: {data['counts']['tasks']} | الغيابات: {data['counts']['absences']}")
            return True
        else:
            print(f"[!] خطأ في الاتصال: {res.status_code}")
            return False
    except Exception as e:
        print(f"[X] تعذر الوصول إلى الخادم: {e}")
        return False

def pull_data_from_web():
    """جلب كافة البيانات (مواعيد، مهام، غيابات) من الويب إلى سطح المكتب"""
    res = requests.get(f"{SERVER_URL}/pull", headers=HEADERS)
    if res.status_code == 200:
        dataset = res.json().get("data", {})
        print(f"[✓] تم استيراد {len(dataset.get('appointments', []))} موعد و {len(dataset.get('tasks', []))} مهمة")
        # حفظ محلياً في ملف JSON أو SQLite على الحاسوب
        with open("desktop_local_db.json", "w", encoding="utf-8") as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        return dataset
    return None

def push_data_to_web(local_changes):
    """إرسال التعديلات أو المهام والغيابات المسجلة من الحاسوب إلى الويب"""
    res = requests.post(f"{SERVER_URL}/push", headers=HEADERS, json=local_changes)
    if res.status_code == 200:
        print("[✓] تم تحديث بيانات الويب بنجاح من سطح المكتب")
        return res.json()
    return None

def sync_bidirectional(local_changes=None):
    """مزامنة ثنائية الاتجاه فورية (إرسال المحلي واستقبال المحدث)"""
    payload = {"localChanges": local_changes or {}}
    res = requests.post(f"{SERVER_URL}/sync-bidirectional", headers=HEADERS, json=payload)
    if res.status_code == 200:
        merged = res.json().get("mergedData", {})
        print("[✓] اكتملت المزامنة الثنائية بنجاح!")
        return merged
    return None

if __name__ == "__main__":
    print("=== بدء تشغيل مزامن سطح المكتب لمدير المتوسطة ===")
    if check_status():
        pull_data_from_web()
        
        # مثال: إضافة غياب أو مهمة جديدة من تطبيق سطح المكتب
        new_task = {
            "id": f"task-desk-{int(time.time())}",
            "title": "إعداد تقرير مجالس الأقسام للثلاثي الأول",
            "dueDate": "2026-09-10",
            "priority": "urgent",
            "status": "not_started"
        }
        push_data_to_web({"tasks": [new_task]})
`;

  const nodeCode = `// desktop-sync.js - Node.js / Electron Client
// مزامنة سطح المكتب ثنائية الاتجاه مع تطبيق الويب
const SERVER_URL = '${syncBaseUrl}';
const API_KEY = '${apiKey}';

const headers = {
  'Content-Type': 'application/json',
  'x-desktop-sync-key': API_KEY,
};

async function syncWithWeb(localUpdates = {}) {
  try {
    const response = await fetch(\`\${SERVER_URL}/sync-bidirectional\`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ localChanges: localUpdates }),
    });

    if (!response.ok) throw new Error(\`Sync failed: \${response.statusText}\`);
    const result = await response.json();
    console.log('✓ تم المزامنة بنجاح:', result.syncedAt);
    return result.mergedData;
  } catch (error) {
    console.error('X خطأ في مزامنة سطح المكتب:', error);
  }
}

// تشغيل مزامنة دورية كل دقيقتين
setInterval(() => syncWithWeb(), 2 * 60 * 1000);
syncWithWeb();
`;

  const curlCode = `# 1. فحص حالة الاتصال
curl -X GET "${syncBaseUrl}/status" \\
  -H "x-desktop-sync-key: ${apiKey}"

# 2. قراءة كافة البيانات (Pull)
curl -X GET "${syncBaseUrl}/pull" \\
  -H "x-desktop-sync-key: ${apiKey}"

# 3. إرسال مهام ومواعيد وغيابات من سطح المكتب (Push)
curl -X POST "${syncBaseUrl}/push" \\
  -H "Content-Type: application/json" \\
  -H "x-desktop-sync-key: ${apiKey}" \\
  -d '{
    "tasks": [
      {
        "id": "task-desktop-01",
        "title": "متابعة غيابات الأساتذة لليوم",
        "dueDate": "2026-09-06",
        "priority": "high",
        "status": "in_progress"
      }
    ]
  }'
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Monitor className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>تزامن البيانات مع تطبيق سطح المكتب</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  اتجاهين (Bidirectional)
                </span>
              </h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                ربط وتحديث المواعيد، المهام، الاجتماعات والغيابات آلياً بين الحاسوب وتطبيق الويب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-100">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">حالة الاتصال والخدمة: </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">جاهز ومتاح للمزامنة</span>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  آخر مزامنة مسجلة: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('ar-DZ') : 'الآن'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerDesktopSync}
              disabled={isSyncingLive}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'جاري المزامنة...' : 'اختبار المزامنة الآن'}</span>
            </button>
          </div>

          {syncFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Connection Endpoints & Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sync URL */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>رابط خادم المزامنة (REST API Endpoint):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncBaseUrl}
                  className="flex-1 text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-200 truncate"
                />
                <button
                  onClick={() => handleCopy(syncBaseUrl, 'url')}
                  className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  title="نسخ الرابط"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Desktop API Key */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>مفتاح الربط المباشر (Desktop Sync API Key):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-200 truncate"
                />
                <button
                  onClick={() => handleCopy(apiKey, 'key')}
                  className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  title="نسخ المفتاح"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Code Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'python'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🐍 بايثون (Python Script)
                </button>
                <button
                  onClick={() => setActiveTab('node')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'node'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ⚡ نود جي إس (Node/Electron)
                </button>
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'curl'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📟 cURL / REST Endpoints
                </button>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    activeTab === 'python' ? pythonCode : activeTab === 'node' ? nodeCode : curlCode,
                    'code'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ الكود بالكامل</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] sm:text-xs text-emerald-400 overflow-x-auto text-left ltr max-h-72">
              <pre className="whitespace-pre">
                {activeTab === 'python' ? pythonCode : activeTab === 'node' ? nodeCode : curlCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            يدعم المزامنة اللحظية والتلقائية مع برامج Windows (C#, Python, Electron)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
