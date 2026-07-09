import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { SPRING } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import MagneticButton from "./MagneticButton";
import LogoMark from "./LogoMark";
import MobileNav from "./MobileNav";

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex min-h-[44px] items-center py-2 text-white/60 transition-colors duration-300 hover:text-neon"
    >
      {children}
    </Link>
  );
}

export default function Navbar({ onOpenPalette }) {
  const shouldReduce = useReducedMotion();
  const { t, lang, toggle } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={shouldReduce ? false : { y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.2 }}
        style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-void/70 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 font-mono sm:px-6"
        >
          <Link to="/" className="flex min-h-[44px] items-center gap-2.5 text-xs text-white sm:text-sm">
            <LogoMark className="h-[22px] w-[22px] shrink-0 text-neon" />
            <span>
              soumpakis<span className="text-neon">@sec</span>
              <span className="text-white/55">:~$</span>
            </span>
          </Link>

          {/* Desktop controls */}
          <div className="hidden items-center gap-x-5 text-xs tracking-[0.22em] sm:flex">
            <NavLink to="/#doctrine">{t("nav.doctrine")}</NavLink>
            <NavLink to="/#experience">{t("nav.experience")}</NavLink>
            <NavLink to="/#operations">{t("nav.operations")}</NavLink>

            <button
              type="button"
              onClick={onOpenPalette}
              aria-label={t("palette.placeholder")}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded border border-white/10 px-2.5 py-1.5 text-white/60 transition-colors duration-300 hover:border-neon/40 hover:text-neon"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
              <span>⌘K</span>
            </button>

            <button
              type="button"
              onClick={toggle}
              aria-label={t("palette.actions.toggleLang")}
              className="inline-flex min-h-[44px] items-center rounded border border-white/10 px-2 py-1.5 tracking-[0.15em] text-white/60 transition-colors duration-300 hover:border-neon/40 hover:text-neon"
            >
              <span className={lang === "en" ? "text-neon" : ""}>EN</span>
              <span className="mx-1 text-white/20">/</span>
              <span className={lang === "el" ? "text-neon" : ""}>ΕΛ</span>
            </button>

            <MagneticButton strength={0.3}>
              <Link
                to="/#contact"
                className="flex min-h-[44px] items-center border border-neon/40 px-3 text-neon transition-all duration-200 hover:bg-neon/10 hover:shadow-glow-sm active:scale-[0.97]"
              >
                {t("nav.connect")}
              </Link>
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.openMenu")}
            aria-expanded={menuOpen}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-white/10 text-white/70 transition-colors duration-300 hover:border-neon/40 hover:text-neon sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </motion.header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenPalette={onOpenPalette}
      />
    </>
  );
}
