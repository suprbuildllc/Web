import { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenVoice: () => void;
}

const navLinks = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#infra', label: 'Infrastructure' },
  { href: '#support', label: 'Ask Us' },
  { href: '#faq', label: 'FAQ' },
];

const drawerVariants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 220,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const linkVariants = {
  closed: { opacity: 0, x: 20 },
  open: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function Navbar({ onOpenVoice }: NavbarProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Sync dark mode class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={`w-full sticky top-0 ${isOpen ? 'z-50' : 'z-40'} border-b border-border transition-colors duration-200`} style={{ backgroundColor: 'color-mix(in oklch, var(--background) 95%, transparent)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 font-extrabold text-[15.5px] tracking-tight text-foreground select-none">
          <span className="w-[26px] h-[26px] bg-primary relative flex-none">
            <span className="absolute inset-[7px] bg-primary-foreground" />
          </span>
          SuprBuild
        </a>

        {/* Desktop Links with Premium sliding highlight */}
        <nav 
          onMouseLeave={() => setHoveredIndex(null)}
          className="hidden md:flex items-center gap-2 text-[13.5px] font-medium text-muted-foreground relative"
        >
          {navLinks.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(idx)}
              className="relative px-3 py-1.5 transition-colors duration-300 z-10 hover:text-foreground"
            >
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 bg-accent border border-border/40 z-[-1]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 flex-none">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-[34px] h-[34px] border border-border bg-background rounded-none flex items-center justify-center text-muted-foreground hover:border-ring hover:text-foreground transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Start a build CTA button */}
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 font-medium text-[12.5px] bg-primary text-primary-foreground hover:opacity-90 active:translate-y-[1px] px-4 py-2 border border-transparent transition-all"
          >
            Start a build
          </a>

          {/* Voice Assistant Launcher inside Navbar */}
          <button
            onClick={onOpenVoice}
            className="hidden md:inline-flex items-center gap-1.5 border border-border hover:bg-accent text-foreground text-[12.5px] px-3 py-2 font-medium transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Talk with Support
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden w-[34px] h-[34px] flex items-center justify-center border border-border bg-background text-foreground hover:border-ring transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with sliding animations */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Menu Drawer */}
            <motion.nav
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-[78%] max-w-[300px] bg-background border-l border-border p-6 pt-24 z-50 flex flex-col gap-4 overflow-y-auto shadow-2xl md:hidden"
            >
              <button
                onClick={toggleMenu}
                className="self-end w-8 h-8 flex items-center justify-center border border-border rounded-none text-muted-foreground hover:bg-accent hover:text-foreground mb-4 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>

              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  variants={linkVariants}
                  onClick={toggleMenu}
                  className="py-2.5 border-b border-border text-[14.5px] font-medium text-muted-foreground hover:text-foreground transition-colors block"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.a
                variants={linkVariants}
                href="#contact"
                onClick={toggleMenu}
                className="py-2.5 border-b border-border text-[14.5px] font-medium text-muted-foreground hover:text-foreground transition-colors block"
              >
                Contact
              </motion.a>

              <motion.a
                variants={linkVariants}
                href="#contact"
                onClick={toggleMenu}
                className="btn-primary w-full py-3 mt-6 text-center text-sm font-semibold border border-transparent flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90"
              >
                Start a build
              </motion.a>

              <motion.button
                variants={linkVariants}
                onClick={() => {
                  toggleMenu();
                  onOpenVoice();
                }}
                className="w-full py-3 mt-3 text-center text-sm font-semibold border border-border hover:bg-accent text-foreground flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Voice Assistant
              </motion.button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
