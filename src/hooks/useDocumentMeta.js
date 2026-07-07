import { useEffect } from "react";

const DEFAULT_TITLE = "Anastasios Soumpakis // Security Engineer";
const DEFAULT_DESC =
  "Anastasios Soumpakis: Security & Information Systems Engineer. Incident response, system hardening, privacy engineering. University of the Aegean.";

// Sets document.title and the meta description for a route, restoring the
// site defaults on unmount so single-page navigation stays consistent.
export function useDocumentMeta({ title, description } = {}) {
  useEffect(() => {
    const nextTitle = title ? `${title} // Anastasios Soumpakis` : DEFAULT_TITLE;
    document.title = nextTitle;

    const meta = document.querySelector('meta[name="description"]');
    const prev = meta ? meta.getAttribute("content") : null;
    if (meta && description) meta.setAttribute("content", description);

    return () => {
      document.title = DEFAULT_TITLE;
      if (meta) meta.setAttribute("content", prev ?? DEFAULT_DESC);
    };
  }, [title, description]);
}
