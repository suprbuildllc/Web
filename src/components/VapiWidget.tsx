import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Phone, PhoneOff, X, Mic, Volume2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Vapi from '@vapi-ai/web';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

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
}

interface ChatMessage {
  who: 'agent' | 'user' | 'system';
  text: string;
  time: string;
}

export default function VapiWidget({ isOpen, onClose, onToggleOpen }: VapiWidgetProps) {
  // Mode selection: 'chat' or 'live'
  const [vapiMode, setVapiMode] = useState<'chat' | 'live'>('chat');
  const [callActive, setCallActive] = useState<boolean>(false);
  const [vapiStatus, setVapiStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // n8n Chat Interactive Demo States
  const [showDemoChat, setShowDemoChat] = useState<boolean>(false);
  const [demoInputValue, setDemoInputValue] = useState<string>('');
  const [demoMessages, setDemoMessages] = useState<ChatMessage[]>([
    {
      who: 'agent',
      text: "Hi! I am the SuprBuild virtual assistant. Since VITE_N8N_CHAT_WEBHOOK_URL is not configured yet, you can test this interactive chat mode preview!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const demoScrollRef = useRef<HTMLDivElement | null>(null);
  const n8nWebhookUrl = getEnvVal('VITE_N8N_CHAT_WEBHOOK_URL', '') || getEnvVal('N8N_CHAT_WEBHOOK_URL', '');

  // Vapi client instance reference
  const vapiRef = useRef<Vapi | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const simIntervalRef = useRef<any>(null);
  const volumeIntervalRef = useRef<any>(null);

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
      clearInterval(simIntervalRef.current);
      clearInterval(volumeIntervalRef.current);
    };
  }, []);

  // Initialize and mount n8n Chat Widget
  useEffect(() => {
    if (isOpen && vapiMode === 'chat' && n8nWebhookUrl) {
      const timer = setTimeout(() => {
        const container = document.getElementById('n8n-chat-container');
        if (container) {
          container.innerHTML = ''; // clear any stale elements
          try {
            createChat({
              target: '#n8n-chat-container',
              mode: 'fullscreen',
              webhookUrl: n8nWebhookUrl,
              showWelcomeScreen: false,
              initialMessages: [
                'Hi there! 👋',
                'I am the SuprBuild AI assistant. How can I assist you with your project today?'
              ],
              i18n: {
                en: {
                  title: 'Hi there! 👋',
                  subtitle: "Start a chat. We're here to help you 24/7.",
                  footer: '',
                  getStarted: 'New Conversation',
                  inputPlaceholder: 'Type your question..',
                  closeButtonTooltip: 'Close',
                },
              },
            });
          } catch (e) {
            console.error('Error initializing n8n chat:', e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, vapiMode, n8nWebhookUrl]);

  // Auto-scroll messages container
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, vapiStatus]);

  // Auto-scroll demo chat container
  useEffect(() => {
    if (demoScrollRef.current) {
      demoScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [demoMessages, showDemoChat]);

  const addMessage = (who: 'agent' | 'user' | 'system', text: string, subtitle?: string) => {
    const time = subtitle || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { who, text, time }]);
  };

  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInputValue.trim()) return;

    const userText = demoInputValue;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDemoMessages(prev => [...prev, { who: 'user', text: userText, time: timeStr }]);
    setDemoInputValue('');

    setTimeout(() => {
      let reply = "I'm ready to assist you. Once you connect your n8n webhook via `VITE_N8N_CHAT_WEBHOOK_URL`, this chat will send real-time requests to your n8n workflow!";
      const lowerText = userText.toLowerCase();
      if (lowerText.includes('price') || lowerText.includes('pricing') || lowerText.includes('cost')) {
        reply = "Our custom dashboard and web app builds typically start from $60,000 to $180,000 depending on complexity. We also have Launch ($5k), Build ($15k/mo) and Team ($30k/mo) plans. Check our Pricing section!";
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        reply = "Hello there! I am the SuprBuild virtual scoping assistant. Let me know if you want to learn about our pricing, studio, or services!";
      } else if (lowerText.includes('scoping') || lowerText.includes('schedule') || lowerText.includes('call') || lowerText.includes('meeting')) {
        reply = "You can schedule a scoping call with our team right now! Or switch to the 'Live Web Call' tab above to speak directly with an AI assistant.";
      } else if (lowerText.includes('work') || lowerText.includes('portfolio') || lowerText.includes('project')) {
        reply = "We design and build bespoke software, dynamic dashboards, e-commerce stores, and custom mobile apps. Our work is fully optimized, polished, and ready to scale.";
      }

      setDemoMessages(prev => [...prev, { who: 'agent', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  // Start Call Handler
  const handleStartCall = async () => {
    setErrorMessage(null);
    setMessages([]);

    if (vapiMode === 'live') {
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
    }
  };

  // End Call Handler
  const handleEndCall = () => {
    if (vapiMode === 'live') {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground border border-border flex items-center justify-center shadow-lg hover:scale-[1.06] active:translate-y-[1px] transition-all"
        aria-label="Open support chat voice assistant"
      >
        <span className={`absolute inset-[-6px] rounded-full border-2 border-primary opacity-0 ${callActive ? 'animate-ping opacity-60' : ''}`} />
        {callActive ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
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
            className="fixed bottom-[88px] right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                {/* Visual Avatar */}
                <div className="w-[34px] h-[34px] bg-primary text-primary-foreground flex items-center justify-center">
                  <Mic className="w-4 h-4" />
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

            {/* Mode Switcher Banner (Live vs chat) */}
            <div className="flex bg-secondary border-b border-border p-1.5">
              <button
                onClick={() => {
                  if (!callActive) setVapiMode('chat');
                }}
                disabled={callActive}
                className={`flex-1 text-center py-1.5 text-[10px] font-bold select-none transition-all ${
                  vapiMode === 'chat'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground disabled:opacity-50'
                }`}
              >
                Chat Mode
              </button>
              <button
                onClick={() => {
                  if (!callActive) setVapiMode('live');
                }}
                disabled={callActive}
                className={`flex-1 text-center py-1.5 text-[10px] font-bold select-none transition-all ${
                  vapiMode === 'live'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground disabled:opacity-50'
                }`}
              >
                Live Web Call
              </button>
            </div>

            {/* Panel Content (n8n Chat or Vapi Call UI) */}
            {vapiMode === 'chat' ? (
              <div className="flex-1 flex flex-col min-h-[380px] max-h-[420px] bg-card overflow-hidden">
                {n8nWebhookUrl ? (
                  <div id="n8n-chat-container" className="w-full h-full flex-1" />
                ) : (
                  <div className="p-4 flex flex-col justify-between h-full bg-card overflow-y-auto">
                    {showDemoChat ? (
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 mb-3 max-h-[290px] min-h-[240px]">
                          {demoMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex flex-col max-w-[85%] ${
                                msg.who === 'user' ? 'self-end items-end' : 'self-start items-start'
                              }`}
                            >
                              <div
                                className={`text-[12px] leading-relaxed px-3 py-2 border ${
                                  msg.who === 'user'
                                    ? 'bg-primary text-primary-foreground border-transparent'
                                    : 'bg-accent text-foreground border-border'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-muted-foreground mt-1 px-1 font-mono">
                                {msg.time}
                              </span>
                            </div>
                          ))}
                          <div ref={demoScrollRef} />
                        </div>
                        <form onSubmit={handleSendDemoMessage} className="flex gap-2 border-t border-border pt-2 bg-card">
                          <input
                            type="text"
                            value={demoInputValue}
                            onChange={(e) => setDemoInputValue(e.target.value)}
                            placeholder="Type a preview message..."
                            className="flex-1 bg-card text-foreground border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/95 transition-all"
                          >
                            Send
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2 text-primary">
                          <MessageSquare className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">n8n Chat Mode Setup</h4>
                        </div>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                          Integrate your <strong>n8n AI agent workflows</strong> into the support widget instantly.
                        </p>
                        
                        <div className="space-y-2.5 bg-accent/50 p-3 border border-border">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] bg-secondary text-foreground w-4 h-4 flex items-center justify-center border border-border">1</span>
                            <p className="text-[11px] text-foreground leading-normal">
                              Create an n8n workflow with a <strong>Chat Trigger</strong> node.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] bg-secondary text-foreground w-4 h-4 flex items-center justify-center border border-border">2</span>
                            <p className="text-[11px] text-foreground leading-normal">
                              Activate the workflow and copy its <strong>Production Webhook URL</strong>.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] bg-secondary text-foreground w-4 h-4 flex items-center justify-center border border-border">3</span>
                            <p className="text-[11px] text-foreground leading-normal">
                              Add the URL to your <code>.env.local</code> file as:<br />
                              <code className="text-primary font-mono text-[9.5px] break-all">VITE_N8N_CHAT_WEBHOOK_URL=your_url</code>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          <button
                            onClick={() => setShowDemoChat(true)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2.5 transition-all"
                          >
                            Try Interactive Preview
                          </button>
                          <div className="text-[9.5px] text-center text-muted-foreground">
                            Preview active styling using local simulated answers.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Panel Body (conversations & visualizer) */}
                <div
                  ref={bodyRef}
                  className="p-4 flex flex-col gap-3 min-h-[190px] max-h-[280px] overflow-y-auto bg-card"
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
              </>
            )}

            {/* Foot note subtitle indication */}
            <div className="font-mono text-[9px] text-center text-muted-foreground pb-3 px-4">
              {vapiMode === 'live' ? 'Live Vapi Web RTC Stream Active' : 'n8n Chat Embed Mode'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
