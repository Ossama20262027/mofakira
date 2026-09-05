import { useState, useEffect, useCallback, useRef } from 'react';

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
        setStatusMessage('🎙️ جاري الاستماع...');
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
          setStatusMessage('✓ تم تحويل الكلام إلى نص');
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusMessage('يرجى السماح بالوصول إلى الميكروفون لاستخدام الإملاء الصوتي');
        } else if (event.error === 'no-speech') {
          setStatusMessage('لم يتم التقاط أي صوت، يرجى المحاولة مرة أخرى');
        } else {
          setStatusMessage('حدث خطأ أثناء التقاط الصوت');
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

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      // Fallback for browsers without speech recognition
      const promptText = window.prompt('الكتابة الصوتية غير مدعومة في هذا المتصفح. يمكنك كتابة النص هنا:');
      if (promptText) {
        setTranscript((prev) => (prev ? prev + ' ' : '') + promptText);
        if (onTranscript) onTranscript(promptText);
        setStatusMessage('✓ تم إدخال النص بنجاح');
      }
      return;
    }

    try {
      setInterimTranscript('');
      setStatusMessage('🎙️ جاري الاستماع...');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Recognition already started or error:', err);
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

  return {
    isListening,
    transcript,
    interimTranscript,
    statusMessage,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
