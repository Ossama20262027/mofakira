/**
 * Helper utility to explicitly verify and request microphone permissions
 * with user-friendly Arabic error messaging and troubleshooting guides.
 */

export interface MicPermissionResult {
  granted: boolean;
  error?: 'denied' | 'not-found' | 'unsupported' | 'not-secure' | 'busy' | 'other';
  title: string;
  message: string;
  instructions: string[];
}

export async function requestMicrophoneAccess(): Promise<MicPermissionResult> {
  if (typeof window === 'undefined') {
    return {
      granted: false,
      error: 'unsupported',
      title: 'البيئة غير مدعومة',
      message: 'تعذر التحقق من توفر الميكروفون في هذه البيئة.',
      instructions: ['يرجى استخدام متصفح حديث.'],
    };
  }

  // Check if running in a secure context (HTTPS or localhost)
  if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return {
      granted: false,
      error: 'not-secure',
      title: 'اتصال آمن مطلوب (HTTPS)',
      message: 'يتطلب الوصول إلى الميكروفون بروتوكول اتصال مشفر HTTPS وفق معايير أمان المتصفح.',
      instructions: ['تأكد من فتح التطبيق عبر رابط https:// مشفر.'],
    };
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      granted: false,
      error: 'unsupported',
      title: 'المتصفح لا يدعم الميكروفون',
      message: 'متصفحك الحالي لا يدعم واجهة برمجة الوسائط (MediaDevices API).',
      instructions: [
        'يرجى فتح التطبيق في أحدث إصدار من Google Chrome أو Microsoft Edge أو Safari على أجهزة Apple.',
      ],
    };
  }

  try {
    // Explicitly prompt the user for microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop all tracks immediately as this is just a permission probe / initialization
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {}
    });

    return {
      granted: true,
      title: 'تم منح الإذن بنجاح',
      message: 'الميكروفون متاح وجاهز للاستخدام في الأوامر الصوتية.',
      instructions: [],
    };
  } catch (err: any) {
    console.warn('Microphone permission check failed:', err);

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return {
        granted: false,
        error: 'denied',
        title: 'تم رفض إذن الوصول إلى الميكروفون',
        message: 'تم حظر أو رفض استخدام الميكروفون في المتصفح. لا يمكن للمساعد الصوتي الاستماع دون إذنك.',
        instructions: [
          'اضغط على أيقونة القفل 🔒 أو أيقونة الكاميرا/الميكروفون الموجودة في شريط العنوان أعلى المتصفح (بجانب رابط الموقع).',
          'قم بتغيير إعداد الميكروفون (Microphone) إلى "سماح" أو "Allow".',
          'أعد تحميل الصفحة أو انقر على زر "إعادة المحاولة" بالأسفل.',
        ],
      };
    }

    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        granted: false,
        error: 'not-found',
        title: 'لم يتم العثور على ميكروفون',
        message: 'الجهاز الحالي لا يحتوي على ميكروفون متصل، أو أنه غير معرف بالنظام.',
        instructions: [
          'تأكد من توصيل ميكروفون خارجي أو سماعة رأس (Headset) بجهاز الكمبيوتر.',
          'تأكد من تفعيل الميكروفون في إعدادات الصوت لنظام التشغيل (Windows / Mac / Android).',
        ],
      };
    }

    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return {
        granted: false,
        error: 'busy',
        title: 'الميكروفون مستخدم في تطبيق آخر',
        message: 'الميكروفون مشغول حالياً بواسطة برنامج آخر (مثل Zoom أو Meet أو تطبيق تسجيل).',
        instructions: [
          'أغلق أي برامج أخرى قد تستخدم الميكروفون في الخلفية ثم حاول مجدداً.',
        ],
      };
    }

    return {
      granted: false,
      error: 'other',
      title: 'تعذر تشغيل الميكروفون',
      message: err.message || 'حدث خطأ غير متوقع أثناء محاولة الوصول إلى الميكروفون.',
      instructions: [
        'تأكد من تحديث المتصفح إلى أحدث إصدار وإعادة تشغيل الصفحة.',
      ],
    };
  }
}
