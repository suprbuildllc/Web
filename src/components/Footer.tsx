export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-8 transition-colors duration-200 select-none">
      <div className="max-w-[1180px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Copyright notice */}
        <p className="font-mono text-[11px] text-muted-foreground text-center sm:text-left">
          © {currentYear} SuprBuild LLC. AI-native software & infrastructure.
        </p>

        {/* Support hint */}
        <p className="font-mono text-[11px] text-muted-foreground text-center sm:text-right">
          Questions? Scoping is bottom-right.
        </p>
      </div>
    </footer>
  );
}
