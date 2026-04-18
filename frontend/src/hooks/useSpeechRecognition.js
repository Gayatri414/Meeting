import { useMemo, useRef, useState } from 'react';

const useSpeechRecognition = () => {
  const SpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const clearMicError = () => setError('');

  const startListening = ({ onTranscript }) => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setError('');
        setIsListening(true);
      };

      recognition.onerror = (event) => {
        const code = event.error || 'Failed to capture audio';
        // Common when user is silent — not fatal; keep listening until they speak
        if (code === 'no-speech') {
          setError('no-speech');
          return;
        }
        if (code === 'aborted' || code === 'not-allowed') {
          setIsListening(false);
        }
        setError(code);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const value = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += `${value} `;
          } else {
            interimTranscript += value;
          }
        }

        if (finalTranscript || interimTranscript) {
          setError('');
        }

        onTranscript?.({
          finalText: finalTranscript,
          interimText: interimTranscript
        });
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setError('');
  };

  return {
    isListening,
    error,
    isSupported: Boolean(SpeechRecognition),
    startListening,
    stopListening,
    clearMicError
  };
};

export default useSpeechRecognition;
