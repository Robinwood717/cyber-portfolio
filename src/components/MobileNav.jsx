import { useRef } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/LanguageContext";
import { useFocusTrap } from "../hooks/useFocusTrap";

// Full-screen mobile menu in the terminal aesthetic: staggered command-style
// links, focus-trapped, Esc/close to dismiss, body-scroll locked.
//
// It is ALWAYS mounted and its open/closed state is driven by plain state, not
// by an exit animation — when closed it is `opacity-0 pointer-events-none inert`
// so it can never block the page even if a transition is interrupted. The fade
// uses a CSS transition (off main-thread, no rAF dependency). Only exists below
// `md`; the desktop nav renders its own horizontal controls.
export default function MobileNav({ open, onClose, onOpenPalette }) {
  const { t, lang, toggle } = useI18n();
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useFocusTrap(panelRef, { open, onClose, initialFocusRef: closeRef });

  const items = [
    { to: "/#doctrine", label: t("nav.doctrine") },
    { to: "/#experience", label: t("nav.experience") },
    { to: "/#operations", label: t("nav.operations") },
    { to: "/#contact", label: t("nav.connect"), primary: true },
  ];

  const revealBase =
    "transition duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none";
  const revealState = open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={t("nav.openMenu")}
      {...(open ? {} : { inert: "" })}
      className={`fixed inset-0 z-[60] flex flex-col bg-void/95 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] transition-opacity duration-200 md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <span className="font-mono text-xs text-white/50">
          soumpakis<span className="text-neon">@sec</span>
          <span className="text-white/40">:~$</span>
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("nav.closeMenu")}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-white/10 text-white/70 transition-colors duration-300 hover:border-neon/40 hover:text-neon"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1 px-6 pb-24">
        {items.map((it, i) => (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClose}
            tabIndex={open ? undefined : -1}
            style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
            className={`flex min-h-[56px] items-center gap-4 font-display text-3xl font-semibold tracking-tight ${revealBase} ${revealState} ${
              it.primary ? "text-neon" : "text-white hover:text-neon"
            }`}
          >
            <span aria-hidden="true" className="font-mono text-sm text-neon/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            {it.label}
          </Link>
        ))}

        <div
          style={{ transitionDelay: open ? `${80 + items.length * 60}ms` : "0ms" }}
          className={`mt-10 flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.2em] ${revealBase} ${revealState}`}
        >
          <button
            type="button"
            onClick={toggle}
            tabIndex={open ? undefined : -1}
            aria-label={t("palette.actions.toggleLang")}
            className="inline-flex min-h-[44px] items-center rounded border border-white/10 px-3 text-white/70 transition-colors duration-300 hover:border-neon/40 hover:text-neon"
          >
            <span className={lang === "en" ? "text-neon" : ""}>EN</span>
            <span className="mx-1 text-white/20">/</span>
            <span className={lang === "el" ? "text-neon" : ""}>ΕΛ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPalette();
            }}
            tabIndex={open ? undefined : -1}
            aria-label={t("palette.placeholder")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded border border-white/10 px-3 text-white/70 transition-colors duration-300 hover:border-neon/40 hover:text-neon"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            {t("nav.search")}
          </button>
        </div>
      </nav>
    </div>
  );
}
