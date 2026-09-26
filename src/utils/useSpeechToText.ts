import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeAudioWithGemini } from '../services/geminiService';

export interface UseSpeechToTextOptions {
  onTranscript: (newText: string) => void;
  lang?: string;
}

export interface UseSpeechToTextReturn {
  isListening: boolean;
  isTranscribing: boolean;
  recordingSeconds: number;
  interimTranscript: string;
  errorMessage: string | null;
  mode: 'web-speech' | 'gemini-ai' | null;
  toggleListening: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearError: () => void;
}

export const useSpeechToText = ({
  onTranscript,
  lang = 'id-ID',
}: UseSpeechToTextOptions): UseSpeechToTextReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'web-speech' | 'gemini-ai' | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const isStoppingIntentionallyRef = useRef<boolean>(false);

  // Stop recording timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRecordingSeconds(0);
  }, []);

  // Start recording timer
  const startTimer = useCallback(() => {
    stopTimer();
    setRecordingSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  // Clean stop of all media streams
  const stopMediaStream = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  // Fallback: Start MediaRecorder with Gemini AI STT
  const startGeminiAudioRecorder = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mengizinkan perekaman audio.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopMediaStream();
        stopTimer();
        setIsListening(false);

        const chunks = audioChunksRef.current;
        if (chunks.length === 0) return;

        const audioBlob = new Blob(chunks, { type: mimeType });
        if (audioBlob.size < 500) {
          // Empty or too short audio
          return;
        }

        setIsTranscribing(true);
        setErrorMessage(null);

        try {
          const transcript = await transcribeAudioWithGemini(audioBlob);
          if (transcript && transcript.trim()) {
            onTranscript(transcript.trim());
          }
        } catch (err: any) {
          console.error('Gemini STT error:', err);
          setErrorMessage(err?.message || 'Gagal mengubah suara menjadi teks. Coba kembali.');
        } finally {
          setIsTranscribing(false);
          setInterimTranscript('');
          setMode(null);
        }
      };

      recorder.start(250); // Slice data every 250ms
      setIsListening(true);
      setMode('gemini-ai');
      setErrorMessage(null);
      startTimer();
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      stopMediaStream();
      stopTimer();
      setIsListening(false);
      setMode(null);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Izin mikrofon ditolak oleh browser. Silakan klik ikon gembok / kamera di samping URL address bar untuk mengizinkan akses mikrofon.'
        );
      } else {
        setErrorMessage('Tidak dapat mengakses mikrofon: ' + (err.message || 'Periksa perangkat mic Anda.'));
      }
    }
  }, [onTranscript, startTimer, stopMediaStream, stopTimer]);

  // Stop active listening
  const stopListening = useCallback(() => {
    isStoppingIntentionallyRef.current = true;

    // Stop Web Speech API if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
      mediaRecorderRef.current = null;
    }

    stopTimer();
    stopMediaStream();
    setIsListening(false);
    setInterimTranscript('');
  }, [stopMediaStream, stopTimer]);

  // Start listening (tries Web Speech API first, falls back smoothly to Gemini AI)
  const startListening = useCallback(async () => {
    stopListening();
    setErrorMessage(null);
    setInterimTranscript('');
    isStoppingIntentionallyRef.current = false;

    // Check microphone permission before anything else
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release test stream
        testStream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Mic permission check failed:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage(
            'Izin mikrofon ditolak oleh browser. Silakan klik ikon gembok / setelan situs di samping address bar dan pilih "Izinkan" untuk Mikrofon.'
          );
          return;
        }
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // If browser doesn't have Web Speech API (Safari / Firefox / Brave / Arc) -> Use Gemini AI Audio
    if (!SpeechRecognition) {
      await startGeminiAudioRecorder();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setMode('web-speech');
        setErrorMessage(null);
        startTimer();
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalChunk += transcriptPiece;
          } else {
            interimChunk += transcriptPiece;
          }
        }

        if (finalChunk.trim()) {
          onTranscript(finalChunk.trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimChunk);
        }
      };

      recognition.onerror = async (event: any) => {
        console.warn('Web Speech API error:', event.error);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          stopListening();
          setErrorMessage(
            'Akses mikrofon ditolak atau diblokir oleh browser. Izinkan mikrofon di pengaturan browser Anda.'
          );
          return;
        }

        // On network error or speech recognition server failure, switch to Gemini AI recorder
        if (event.error === 'network' || event.error === 'language-not-supported') {
          stopListening();
          console.info('Switching to Gemini AI Audio Recording fallback...');
          await startGeminiAudioRecorder();
          return;
        }

        // For 'no-speech', do not immediately terminate if still intentional
        if (event.error === 'no-speech') {
          return;
        }

        // Fallback to Gemini AI if other failure
        stopListening();
        await startGeminiAudioRecorder();
      };

      recognition.onend = () => {
        if (!isStoppingIntentionallyRef.current) {
          // If stopped without user clicking stop, cleanly reset
          setIsListening(false);
          stopTimer();
          setMode(null);
        }
      };

      recognition.start();
    } catch (e: any) {
      console.warn('SpeechRecognition failed to start, falling back to Gemini AI:', e);
      await startGeminiAudioRecorder();
    }
  }, [lang, onTranscript, startGeminiAudioRecorder, startTimer, stopListening, stopTimer]);

  const toggleListening = useCallback(async () => {
    if (isListening || isTranscribing) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, isTranscribing, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isTranscribing,
    recordingSeconds,
    interimTranscript,
    errorMessage,
    mode,
    toggleListening,
    startListening,
    stopListening,
    clearError: () => setErrorMessage(null),
  };
};
