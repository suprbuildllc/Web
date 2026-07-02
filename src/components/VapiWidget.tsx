import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, X, Mic, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Vapi from '@vapi-ai/web';

// Helper to dynamically read configuration values from environment variables
const getEnvVal = (key: string, defaultValue: string): string => {
  try {
    const paddleEnv = (globalThis as any).__PADDLE_ENV__;
    if (paddleEnv && paddleEnv[key]) {
      return String(paddleEnv[key]).trim();
    }
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return (process.env[key] as string).trim();
    }
  } catch (e) {}

  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) {
      return (metaEnv[key] as string).trim();
    }
  } catch (e) {}

  return defaultValue;
};

const getVapiToken = (): string => {
  return getEnvVal('VAPI_PUBLIC_API_KEY', '') || 
         getEnvVal('VITE_VAPI_PUBLIC_API_KEY', '') || 
         getEnvVal('VAPI_PUBLIC_API_KRY', '') || 
         getEnvVal('VITE_VAPI_PUBLIC_API_KRY', '') || 
         '94d82d33-fa09-4819-b0cf-4d61edfa4a9f';
};

const getVapiAssistantId = (): string => {
  return getEnvVal('VAPI_ASSISTANT_ID', '') || 
         getEnvVal('VITE_VAPI_ASSISTANT_ID', '') || 
         '';
};

interface VapiWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleOpen: () => void;
  isChatOpen?: boolean;
}

interface ChatMessage {
  who: 'agent' | 'user' | 'system';
  text: string;
  time: string;
}

export default function VapiWidget({ isOpen, onClose, onToggleOpen, isChatOpen = false }: VapiWidgetProps) {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [vapiStatus, setVapiStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vapi client instance reference
  const vapiRef = useRef<Vapi | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // Initialize Vapi SDK Client on Mount
  useEffect(() => {
    try {
      const token = getVapiToken();
      const vapi = new Vapi(token);
      vapiRef.current = vapi;

      // SDK Call Event Listeners
      vapi.on('call-start', () => {
        setCallActive(true);
        setVapiStatus('live');
        setErrorMessage(null);
        addMessage('agent', "Hi, you've connected to SuprBuild. Ask me anything about our studio, work, or pricing!", "Connected");
      });

      vapi.on('call-end', () => {
        setCallActive(false);
        setVapiStatus('idle');
        setVolumeLevel(0);
      });

      vapi.on('volume-level', (vol: number) => {
        setVolumeLevel(vol * 100);
      });

      vapi.on('message', (message: any) => {
        if (message.type === 'transcript') {
          const who = message.role === 'user' ? 'user' : 'agent';
          if (message.transcriptType === 'final') {
            addMessage(who, message.text, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      });

      vapi.on('error', (err: any) => {
        console.error('Vapi SDK Error:', err);
        setVapiStatus('error');
        setErrorMessage(err?.message || 'Call failed. Make sure your browser has microphone permissions allowed.');
        setCallActive(false);
        setVolumeLevel(0);
      });
    } catch (e: any) {
      console.error('Error instantiating Vapi SDK client:', e);
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll messages container
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, vapiStatus]);

  const addMessage = (who: 'agent' | 'user' | 'system', text: string, subtitle?: string) => {
    const time = subtitle || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { who, text, time }]);
  };

  // Start Call Handler
  const handleStartCall = async () => {
    setErrorMessage(null);
    setMessages([]);

    if (!vapiRef.current) {
      setVapiStatus('error');
      setErrorMessage('Vapi client not initialized.');
      return;
    }
    try {
      setVapiStatus('connecting');
      // Start call using the public key / configured assistant
      const assistantId = getVapiAssistantId();
      if (assistantId) {
        await vapiRef.current.start(assistantId);
      } else {
        await vapiRef.current.start();
      }
    } catch (err: any) {
      setVapiStatus('error');
      setErrorMessage(err?.message || 'Could not initiate microphone access stream.');
    }
  };

  // End Call Handler
  const handleEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const handleToggleCall = () => {
    if (callActive || vapiStatus === 'connecting') {
      handleEndCall();
    } else {
      handleStartCall();
    }
  };

  return (
    <>
      {/* Pulse button bottom right launcher */}
      <button
        onClick={onToggleOpen}
        id="vapi-launcher"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 bg-primary text-primary-foreground border border-border flex items-center justify-center shadow-lg hover:scale-[1.06] active:translate-y-[1px] transition-all duration-300 ${isChatOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 pointer-events-auto'}`}
        aria-label="Open support chat voice assistant"
      >
        <span className={`absolute inset-[-6px] rounded-full border-2 border-primary opacity-0 ${callActive ? 'animate-ping opacity-60' : ''}`} />
        {callActive ? <Volume2 className="w-4.5 h-4.5 animate-pulse" /> : <Phone className="w-4.5 h-4.5" />}
      </button>

      {/* Main expanded panel widget container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            id="vapi-panel"
            className="fixed bottom-[80px] right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                {/* Visual Avatar */}
                <div className="w-[34px] h-[34px] bg-primary text-primary-foreground flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-foreground">SuprBuild Assistant</div>
                  
                  {/* Call Substatus */}
                  <div className="flex items-center gap-1.5 mt-0.5 select-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      vapiStatus === 'live' ? 'bg-emerald-500 animate-pulse' :
                      vapiStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                      vapiStatus === 'error' ? 'bg-rose-500' : 'bg-muted-foreground'
                    }`} />
                    <span className="font-mono text-[10.5px] text-muted-foreground capitalize">
                      {vapiStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right close */}
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-none text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Body (conversations & visualizer) */}
            <div
              ref={bodyRef}
              className="p-4 flex flex-col gap-3 min-h-[250px] max-h-[350px] overflow-y-auto bg-card"
            >
              {messages.length === 0 && !callActive && vapiStatus !== 'connecting' && (
                <div className="my-auto text-center p-4">
                  <Sparkles className="w-6 h-6 text-primary/40 mx-auto mb-2" />
                  <div className="text-xs font-medium text-foreground">AI-Native Sales & Scoping</div>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-1">
                    Ask us about capabilities, costs, timelines, or schedule scoping calls instantly.
                  </p>
                </div>
              )}

              {/* Connecting Loading spinner */}
              {vapiStatus === 'connecting' && (
                <div className="my-auto text-center p-4 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="text-[11.5px] text-muted-foreground font-mono">Initializing mic stream…</div>
                </div>
              )}

              {/* Error block if any */}
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Active Audio Wave Visualizer */}
              {callActive && messages.length === 0 && (
                <div className="my-auto flex flex-col items-center justify-center gap-3 py-6">
                  <div className="flex items-center gap-1.5 h-8">
                    {[...Array(15)].map((_, i) => {
                      const heightFactor = Math.sin((i / 14) * Math.PI);
                      const computedHeight = callActive ? Math.max(5, (volumeLevel * 0.45 * heightFactor) + (Math.random() * 4)) : 5;
                      return (
                        <div
                          key={i}
                          style={{ height: `${computedHeight}px` }}
                          className="w-[3px] bg-primary rounded-full transition-all duration-100"
                        />
                      );
                    })}
                  </div>
                  <span className="font-mono text-[10.5px] text-muted-foreground animate-pulse">
                    Voice Agent Listening…
                  </span>
                </div>
              )}

              {/* Render Message List */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] ${
                    msg.who === 'user' ? 'self-end items-end' : 
                    msg.who === 'system' ? 'self-center items-center max-w-[100%]' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`text-[12.5px] leading-relaxed px-3 py-2 border ${
                      msg.who === 'user'
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : msg.who === 'system'
                        ? 'bg-secondary text-muted-foreground border-border text-[11px] font-mono py-1'
                        : 'bg-accent text-foreground border-border'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.who !== 'system' && (
                    <span className="text-[9.5px] text-muted-foreground mt-1 px-1 font-mono">
                      {msg.time}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Panel Call Action controls */}
            <div className="p-4 border-t border-border bg-card flex flex-col gap-2">
              <button
                onClick={handleToggleCall}
                className={`w-full py-3 font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  callActive || vapiStatus === 'connecting'
                    ? 'bg-destructive hover:bg-destructive/90 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {callActive || vapiStatus === 'connecting' ? (
                  <>
                    <PhoneOff className="w-4 h-4" />
                    End scoping call
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Start scoping call
                  </>
                )}
              </button>
            </div>

            {/* Foot note subtitle indication */}
            <div className="font-mono text-[9px] text-center text-muted-foreground pb-3 px-4">
              Live Vapi Web RTC Stream Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
