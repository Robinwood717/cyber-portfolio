import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";

// [ COPY ] chip for the contact rows. Copies `value` (always the visible
// text of the row, never a URL) and reports the outcome in place:
// idle -> copied (neon, 2s) -> idle, or the fallback state when the
// clipboard API is unavailable, in which case the visible text is
// programmatically selected so a manual Ctrl-C still works.
export default function CopyButton({ value, ariaLabel, selectTargetRef, compact = false }) {
  const { t } = useI18n();
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (next) => {
    clearTimeout(timer.current);
    setState(next);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  const selectValueText = () => {
    const node = selectTargetRef?.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      flash("copied");
    } catch {
      selectValueText();
      flash("fallback");
    }
  };

  const tone =
    state === "copied"
      ? "border-neon/60 text-neon"
      : state === "fallback"
        ? "border-[#febc2e]/60 text-[#febc2e]"
        : "border-white/15 text-white/50 hover:border-neon/50 hover:text-neon";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={ariaLabel}
        className={`shrink-0 border font-mono tracking-[0.2em] transition-all duration-200 active:scale-[0.97] active:duration-100 ${
          compact
            ? "min-h-11 px-2 text-[9px] sm:min-h-0 sm:py-0.5"
            : "min-h-11 px-3 text-[10px]"
        } ${tone}`}
      >
        [ {state === "copied" ? t("contact.copy.copied") : state === "fallback" ? t("contact.copy.fallback") : t("contact.copy.copy")} ]
      </button>
      {/* Button text changes alone are unreliable for screen readers. */}
      <span role="status" className="sr-only">
        {state === "copied" ? `${ariaLabel}: ${t("contact.copy.copied")}` : ""}
      </span>
    </>
  );
}
