import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, onError, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'cs-CZ'; // Czech language
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onError(`Chyba rozpoznávání řeči: ${event.error}`);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          onTranscript(transcript.trim());
          setTranscript('');
        }
      };
      
      setRecognition(recognitionInstance);
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [onTranscript, onError, transcript]);

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        onError('Nepodařilo se spustit rozpoznávání řeči');
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesis || isSpeaking) return;

    // Stop any current speech
    if (currentUtterance) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'cs-CZ';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentUtterance(utterance);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentUtterance(null);
      onError('Chyba při přehrávání řeči');
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // Speak the last transcript or a sample text
      const textToSpeak = transcript || 'Rozpoznaný text bude přehrán zde';
      speakText(textToSpeak);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-muted-foreground text-center p-2">
        Hlasové ovládání není podporováno ve vašem prohlížeči
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted dark:bg-neutral-800 rounded-lg">
      {/* Voice Input Button */}
      <Button
        variant={isListening ? "danger" : "secondary"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Zastavit nahrávání" : "Začít nahrávání hlasu"}
        className="relative"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Text-to-Speech Button */}
      <Button
        variant={isSpeaking ? "danger" : "outline"}
        size="icon"
        onClick={toggleSpeaking}
        disabled={disabled || !transcript}
        title={isSpeaking ? "Zastavit přehrávání" : "Přehrát rozpoznaný text"}
        className="relative"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </>
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {/* Transcript Display */}
      {transcript && (
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">Rozpoznaný text:</div>
          <div className="text-sm bg-background dark:bg-neutral-900 p-2 rounded border max-h-20 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="text-xs text-muted-foreground text-center min-w-[60px]">
        {isListening ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Nahrávám...</span>
          </div>
        ) : isSpeaking ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Přehrávám...</span>
          </div>
        ) : (
          <span>Připraveno</span>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
