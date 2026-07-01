import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Work from './components/Work';
import Pricing from './components/Pricing';
import Infrastructure from './components/Infrastructure';
import FAQ from './components/FAQ';
import VapiWidget from './components/VapiWidget';
import Footer from './components/Footer';
import Checkout from './components/Checkout';

function parseRoute() {
  const hash = window.location.hash;
  const path = window.location.pathname;
  
  if (hash.startsWith('#/checkout/')) {
    const slug = hash.replace('#/checkout/', '');
    return { path: 'checkout' as const, slug };
  } else if (path.startsWith('/checkout/')) {
    const slug = path.replace('/checkout/', '');
    return { path: 'checkout' as const, slug };
  }
  return { path: 'home' as const };
}

export default function App() {
  const [voiceWidgetOpen, setVoiceWidgetOpen] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<{ path: 'home' | 'checkout'; slug?: string }>(() => parseRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(parseRoute());
    };
    
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handleOpenVoice = () => {
    setVoiceWidgetOpen(true);
    // Smooth scroll to launcher view to guide user attention
    const widget = document.getElementById('vapi-launcher');
    if (widget) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleToggleVoice = () => {
    setVoiceWidgetOpen(prev => !prev);
  };

  const handleCloseVoice = () => {
    setVoiceWidgetOpen(false);
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    // If the path was used, fallback history
    if (window.location.pathname.startsWith('/checkout')) {
      window.history.pushState({}, '', '/');
    }
    setCurrentRoute({ path: 'home' });
    
    // Smooth scroll to pricing after layout renders
    setTimeout(() => {
      const pricingSec = document.getElementById('pricing');
      if (pricingSec) {
        pricingSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200" id="top">
      {/* Dynamic Header / Navbar */}
      <Navbar onOpenVoice={handleOpenVoice} />

      {/* Conditionally Render Checkout Page or Main Single Page Sections */}
      {currentRoute.path === 'checkout' ? (
        <Checkout 
          slug={currentRoute.slug || 'launch'} 
          onBack={handleBackToHome} 
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero onOpenVoice={handleOpenVoice} />

          {/* Selected Builds Section */}
          <Work />

          {/* Core Capabilities Section */}
          <Services />

          {/* Scoping and Pricing Section (Includes Dynamic Estimator) */}
          <Pricing />

          {/* Dedicated DevOps Cloud Infrastructure Section */}
          <Infrastructure />

          {/* In-Page AI-Native Assistant Banner */}
          <section className="py-20 md:py-24 border-b border-border bg-background transition-colors duration-200" id="support">
            <div className="max-w-[1180px] mx-auto px-6 md:px-8">
              <div className="max-w-[600px] mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider uppercase border border-border bg-secondary text-secondary-foreground px-2 py-0.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  talk to us
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-4 mb-3.5">
                  Not a product. Just how you reach us.
                </h2>
                <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-relaxed">
                  Before you email, just ask. The voice in the corner is our front-line support and sales rep — answering questions and routing you to the right person, instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 border border-border bg-card divide-y lg:divide-y-0 lg:divide-x divide-border select-none overflow-hidden">
                {/* Copy Side */}
                <div className="p-8 md:p-10 flex flex-col justify-center gap-6">
                  <h3 className="text-[20px] font-extrabold text-foreground leading-snug">
                    Always picks up
                  </h3>
                  <p className="text-muted-foreground text-[13.5px] leading-relaxed">
                    It knows what we build, what things cost, and when to hand you off to a real person on the team.
                  </p>
                  <ul className="flex flex-col gap-3">
                    {[
                      'Answers questions about our work, process, and pricing',
                      'Qualifies new project inquiries on the spot',
                      'Hands off to a human the moment it should'
                    ].map((feat) => (
                      <li key={feat} className="flex gap-2.5 items-start text-[13px] font-medium leading-relaxed text-foreground">
                        <ShieldCheck className="w-4.5 h-4.5 text-primary flex-none mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call Trigger Side */}
                <div className="p-8 md:p-10 bg-secondary flex items-center justify-center">
                  <button
                    onClick={handleOpenVoice}
                    className="inline-flex items-center gap-2.5 font-bold text-xs bg-primary text-primary-foreground hover:opacity-90 active:translate-y-[1px] px-6 py-4.5 border border-transparent transition-all select-none"
                  >
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                    Ask support a question
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Accordion FAQ Section */}
          <FAQ />

          {/* Contact CTA Section */}
          <section className="py-20 md:py-24 bg-background transition-colors duration-200" id="contact">
            <div className="max-w-[560px] mx-auto px-6 text-center">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wider uppercase border border-border bg-secondary text-secondary-foreground px-2 py-0.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                start a build
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-[1.1] mt-4 mb-3">
                Tell us what you're building
              </h2>
              <p className="text-muted-foreground text-[13.5px] leading-relaxed mb-8">
                One inbox, one team, one person reading it. We usually respond within a single business day.
              </p>
              <a
                href="mailto:hello@suprbuild.com"
                className="inline-flex items-center gap-2.5 font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 active:translate-y-[1px] px-8 py-4 border border-transparent transition-all"
              >
                <Mail className="w-4 h-4" />
                hello@suprbuild.com
              </a>
            </div>
          </section>
        </main>
      )}

      {/* Global Interactive Floating voice widget */}
      <VapiWidget
        isOpen={voiceWidgetOpen}
        onClose={handleCloseVoice}
        onToggleOpen={handleToggleVoice}
      />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
