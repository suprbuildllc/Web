import { motion } from 'motion/react';
import { ArrowRight, MessageSquare, ChevronRight } from 'lucide-react';

interface HeroProps {
  onOpenVoice: () => void;
}

export default function Hero({ onOpenVoice }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border py-20 md:py-28 transition-colors duration-200">
      {/* Visual background ambient gradient */}
      <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)] pointer-events-none" />

      <div className="max-w-[760px] mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] md:text-[11.5px] font-medium tracking-wider uppercase border border-border bg-secondary text-secondary-foreground px-2.5 py-1 select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          shadcn/ui · preset b3vYhu8VQR
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mt-5 mb-6"
        >
          Software studio with an <span className="text-primary relative inline-block">AI-native</span> front door.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[15px] sm:text-[16.5px] leading-relaxed text-muted-foreground max-w-[580px] mx-auto mb-8"
        >
          SuprBuild is a software studio and AI-native cloud infrastructure provider. We design, build, and ship products. Got a question? Our AI front door is on call 24/7.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3.5 mb-14"
        >
          <a
            href="#work"
            className="inline-flex items-center gap-2 font-medium text-[14px] bg-primary text-primary-foreground hover:opacity-90 active:translate-y-[1px] px-6 py-3 border border-transparent transition-all select-none"
          >
            View our work
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenVoice}
            className="inline-flex items-center gap-2 font-medium text-[14px] bg-background border border-border text-foreground hover:bg-accent hover:border-ring active:translate-y-[1px] px-6 py-3 transition-all select-none"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            Ask a question
          </button>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 border border-border divide-x divide-border bg-card/50 backdrop-blur-sm select-none"
        >
          <div className="py-4 px-3 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">12+</div>
            <div className="font-mono text-[9px] sm:text-[10.5px] text-muted-foreground uppercase tracking-widest mt-1">Products shipped</div>
          </div>
          <div className="py-4 px-3 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">24/7</div>
            <div className="font-mono text-[9px] sm:text-[10.5px] text-muted-foreground uppercase tracking-widest mt-1">On call</div>
          </div>
          <div className="py-4 px-3 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">1</div>
            <div className="font-mono text-[9px] sm:text-[10.5px] text-muted-foreground uppercase tracking-widest mt-1">Team, every layer</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
