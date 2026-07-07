import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ScanlineOverlay from "./components/ScanlineOverlay";
import LivingBackground from "./components/LivingBackground";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import CommandPalette from "./components/CommandPalette";
import ContactFooter from "./components/ContactFooter";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import { useI18n } from "./i18n/LanguageContext";

// Handles scroll on navigation: jump to a hash target when present,
// otherwise reset to the top of the new route.
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const { t } = useI18n();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div id="top" className="relative min-h-screen bg-void font-mono text-white">
      <a
        href="#main"
        className="sr-only font-mono text-xs text-neon focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80] focus:border focus:border-neon focus:bg-void focus:px-4 focus:py-2"
      >
        {t("nav.search") === "ΑΝΑΖΗΤΗΣΗ" ? "ΜΕΤΑΒΑΣΗ ΣΤΟ ΠΕΡΙΕΧΟΜΕΝΟ" : "SKIP TO CONTENT"}
      </a>
      <LivingBackground />
      <CustomCursor />
      <ScanlineOverlay />
      <ScrollProgress />
      <ScrollManager />
      <Navbar onOpenPalette={openPalette} />
      <main id="main" className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ops/:slug" element={<ProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ContactFooter />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
