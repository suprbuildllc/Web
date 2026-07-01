import { useState, FormEvent } from 'react';
import { Mail, Check, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const getSignupWebhookUrl = (): string => {
    let url = getEnvVal('VITE_N8N_SIGNUP_WEBHOOK_URL', '') || getEnvVal('N8N_SIGNUP_WEBHOOK_URL', '');
    if (url) {
      if (url.startsWith('ttps://')) {
        url = 'h' + url;
      }
      return url;
    }
    return 'https://n8n-m1if.muhaimin.dev/webhook-test/b2f25206-1aa4-42e7-9812-8ca26a2e84b9/subscriber';
  };

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const webhookUrl = getSignupWebhookUrl();
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          timestamp: new Date().toISOString(),
          source: 'footer_newsletter'
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      setStatus('success');
      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to submit subscription. Please try again.');
    }
  };

  return (
    <footer className="border-t border-border bg-background py-16 transition-colors duration-200">
      <div className="max-w-[1180px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-border/60">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <a href="#top" className="flex items-center gap-2.5 font-extrabold text-[15.5px] tracking-tight text-foreground select-none">
              <span className="w-[26px] h-[26px] bg-primary relative flex-none">
                <span className="absolute inset-[7px] bg-primary-foreground" />
              </span>
              SuprBuild
            </a>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[320px]">
              AI-native custom software, robust backends, and dedicated high-performance cloud infrastructure.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2" />

          {/* Newsletter Col */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Subscribe to updates
              </h3>
              <p className="text-muted-foreground text-[12.5px] leading-relaxed">
                Stay informed about new launch builds, open-source templates, and cloud architecture insights.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full max-w-[400px]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    disabled={status === 'loading'}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-card text-foreground border border-border px-9 py-2.5 text-xs focus:outline-none focus:border-primary disabled:opacity-60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-semibold hover:bg-primary/95 disabled:opacity-60 transition-all flex items-center gap-1.5 whitespace-nowrap active:translate-y-[1px]"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Subscribing
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-emerald-500 font-medium text-[12px] mt-1.5 animate-fade-in">
                  <Check className="w-4 h-4 flex-none" />
                  <span>Success! Check your inbox for updates.</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-start gap-2 text-destructive font-medium text-[12px] mt-1.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="font-mono text-[11px] text-muted-foreground text-center sm:text-left">
            © {currentYear} SuprBuild LLC. AI-native software & infrastructure.
          </p>

          <p className="font-mono text-[11px] text-muted-foreground text-center sm:text-right">
            Questions? Dynamic scoping assistant is bottom-right.
          </p>
        </div>
      </div>
    </footer>
  );
}
