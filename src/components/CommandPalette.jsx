import { useEffect, useMemo, useRef, useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/LanguageContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { SITE } from "../data/site";
import { PROJECTS } from "../data/projects";
import { SPRING_MODAL } from "../lib/motion";

export default function CommandPalette({ open, onClose }) {
  const shouldReduce = useReducedMotion();
  const { t, toggle } = useI18n();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState(null);

  const actions = useMemo(() => {
    const go = (hash) => () => {
      navigate(hash);
      onClose();
    };
    const nav = [
      ["home", "/", "home start top"],
      ["doctrine", "/#doctrine", "education doctrine"],
      ["experience", "/#experience", "engagements track record work"],
      ["commandcenter", "/#commandcenter", "command center soc dashboard live ops telemetry"],
      ["killchain", "/#killchain", "kill chain incident ir case"],
      ["operations", "/#operations", "projects operations case files"],
      ["contact", "/#contact", "contact email connect channel"],
    ].map(([key, hash, keywords]) => ({
      group: "navigate",
      label: t(`palette.actions.${key}`),
      keywords,
      run: go(hash),
    }));

    const ops = PROJECTS.filter((p) => p.flagship).map((p) => ({
      group: "operations",
      label: `${t("operations.openDossier")}: ${p.title}`,
      keywords: `${p.title} ${p.slug} ${p.tags.join(" ")}`.toLowerCase(),
      run: () => {
        navigate(`/ops/${p.slug}`);
        onClose();
      },
    }));

    const misc = [
      {
        group: "actions",
        label: t("palette.actions.toggleLang"),
        keywords: "language greek english ελ en toggle",
        run: () => {
          toggle();
          onClose();
        },
      },
      {
        group: "actions",
        label: t("palette.actions.copyEmail"),
        keywords: "copy email mail address",
        run: async () => {
          try {
            await navigator.clipboard.writeText(SITE.email);
            setFlash(t("palette.actions.copiedEmail"));
          } catch {
            setFlash(SITE.email);
          }
        },
      },
      {
        group: "actions",
        label: t("palette.actions.github"),
        keywords: "github source code repos",
        run: () => {
          window.open(SITE.github, "_blank", "noreferrer");
          onClose();
        },
      },
      {
        group: "actions",
        label: t("palette.actions.linkedin"),
        keywords: "linkedin profile network",
        run: () => {
          window.open(SITE.linkedin, "_blank", "noreferrer");
          onClose();
        },
      },
    ];

    return [...nav, ...ops, ...misc];
  }, [t, toggle, navigate, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.keywords.includes(q)
    );
  }, [query, actions]);

  // Scroll lock, focus trap, Escape, focus restore — shared modal contract.
  useFocusTrap(panelRef, { open, onClose, initialFocusRef: inputRef });

  // Reset transient state each time the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setFlash(null);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  const groupLabel = (g) => t(`palette.groups.${g}`);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <button
            type="button"
            aria-label={t("project.dossier.close")}
            onClick={onClose}
            className="fixed inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("palette.placeholder")}
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_MODAL }}
            exit={
              shouldReduce
                ? { opacity: 0, transition: { duration: 0.12 } }
                : {
                    opacity: 0,
                    y: -12,
                    scale: 0.98,
                    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
                  }
            }
            onKeyDown={onKeyDown}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/95 shadow-terminal backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span className="font-mono text-neon">{">"}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("palette.placeholder")}
                aria-label={t("palette.placeholder")}
                className="w-full rounded-sm bg-transparent font-mono text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/50"
              />
            </div>

            <ul className="max-h-[46vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center font-mono text-xs text-white/55">
                  {t("palette.empty")}
                </li>
              )}
              {filtered.map((item, i) => {
                const showGroup = i === 0 || filtered[i - 1].group !== item.group;
                return (
                  <li key={`${item.group}-${item.label}`}>
                    {showGroup && (
                      <p className="px-4 pb-1 pt-3 font-mono text-[9px] tracking-[0.25em] text-white/50">
                        {groupLabel(item.group)}
                      </p>
                    )}
                    <button
                      type="button"
                      onMouseMove={() => setActive(i)}
                      onClick={() => item.run()}
                      className={`flex min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left font-mono text-sm transition-colors duration-150 ${
                        active === i ? "bg-neon/10 text-neon" : "text-white/70"
                      }`}
                    >
                      {item.label}
                      {active === i && <span aria-hidden="true">↵</span>}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-white/50">
              <span>{flash ?? t("palette.hint")}</span>
              <span className="text-neon/60">⌘K</span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
