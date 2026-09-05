import { useState, useEffect, useCallback, useRef } from 'react';
import { requestMicrophoneAccess, MicPermissionResult } from '../utils/microphonePermission';

interface UseSpeechRecognitionProps {
  onTranscript?: (text: string) => void;
  lang?: string;
}

export function useSpeechRecognition({ onTranscript, lang = 'ar-DZ' }: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<MicPermissionResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang; // Arabic (e.g. ar-DZ for Algeria, ar-SA, ar)

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
        setStatusMessage('🎙️ جاري الاستماع بصوت واضح...');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => {
            const updated = (prev ? prev + ' ' : '') + currentFinal.trim();
            if (onTranscript) onTranscript(updated);
            return updated;
          });
          setStatusMessage('✓ تم تحويل الكلام إلى نص بنجاح');
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setPermissionError({
            granted: false,
            error: 'denied',
            title: 'إذن الميكروفون مطلوب',
            message: 'تم حظر الميكروفون من قبل المتصفح. يرجى تفعيل الإذن لتتمكن من استخدام الأوامر الصوتية.',
            instructions: [
              'انقر على أيقونة القفل أو الكاميرا بجانب شريط العنوان بالأعلى.',
              'اختر "السماح" (Allow) للميكروفون.',
              'أعد النقر على زر الميكروفون.',
            ],
          });
          setStatusMessage('يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح');
        } else if (event.error === 'no-speech') {
          setStatusMessage('لم يتم التقاط أي صوت، يرجى إعادة المحاولة');
        } else {
          setStatusMessage('حدث خطأ أثناء التقاط الصوت: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition initialization error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [lang, onTranscript]);

  const startListening = useCallback(async () => {
    // 1. Explicitly check and request microphone access via getUserMedia
    const perm = await requestMicrophoneAccess();
    if (!perm.granted) {
      setPermissionError(perm);
      setStatusMessage(perm.title + ': ' + perm.message);
      return false;
    }

    setPermissionError(null);

    if (!recognitionRef.current) {
      // Fallback for browsers without speech recognition
      const promptText = window.prompt('الكتابة الصوتية غير مدعومة في هذا المتصفح. يمكنك كتابة النص هنا:');
      if (promptText) {
        setTranscript((prev) => (prev ? prev + ' ' : '') + promptText);
        if (onTranscript) onTranscript(promptText);
        setStatusMessage('✓ تم إدخال النص بنجاح');
      }
      return false;
    }

    try {
      setInterimTranscript('');
      setStatusMessage('🎙️ جاري الاستماع بصوت واضح...');
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (err: any) {
      console.warn('Recognition start error:', err);
      // If already started, ignore or restart
      if (err.name === 'InvalidStateError') {
        setIsListening(true);
        return true;
      }
      return false;
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setStatusMessage('');
  }, []);

  const clearPermissionError = useCallback(() => {
    setPermissionError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    statusMessage,
    isSupported,
    permissionError,
    clearPermissionError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}

