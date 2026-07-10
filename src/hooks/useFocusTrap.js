import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared modal-surface behavior: body scroll lock, Escape to close, Tab /
// Shift+Tab cycling within the panel, and focus restore on close. Pass
// `initialFocusRef` to move focus into the panel when it opens.
export function useFocusTrap(panelRef, { open, onClose, initialFocusRef }) {
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    initialFocusRef?.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose, panelRef, initialFocusRef]);
}
