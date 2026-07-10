import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import CopyButton from "./CopyButton";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { SITE } from "../data/site";

const GLYPHS = "!<>-_\\/[]{}=+*^?#@$%&01";

function ScrambleLink({ prefix, label, href, valueRef }) {
  const [display, setDisplay] = useState(label);
  const timer = useRef(null);
  const external = href.startsWith("http");

  useEffect(() => () => clearInterval(timer.current), []);

  const scramble = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearInterval(timer.current);
    let frame = 0;
    timer.current = setInterval(() => {
      frame += 1;
      const locked = Math.floor(frame * 0.6);
      setDisplay(
        label
          .split("")
          .map((ch, i) =>
            i < locked || ch === " "
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      if (locked >= label.length) {
        clearInterval(timer.current);
        setDisplay(label);
      }
    }, 28);
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={`${prefix}: ${label}`}
      onMouseEnter={scramble}
      onFocus={scramble}
      className="group flex w-fit flex-wrap items-baseline gap-x-5 gap-y-1 py-1"
    >
      <span className="w-24 font-mono text-[10px] tracking-[0.35em] text-white/50 transition-colors duration-300 group-hover:text-neon">
        {prefix}
      </span>
      <span
        ref={valueRef}
        aria-hidden="true"
        className="break-all font-mono text-lg text-white transition-all duration-300 group-hover:text-neon group-hover:[text-shadow:0_0_16px_rgba(16,185,129,0.45)] md:text-2xl"
      >
        {display}
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-sm text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1 group-hover:text-neon"
      >
        ↗
      </span>
    </a>
  );
}

// One contact row: the scramble link plus its [ COPY ] chip. The chip
// copies exactly the text the row displays, so the two can never drift.
function ContactRow({ prefix, label, href, copyAriaKey }) {
  const { t } = useI18n();
  const valueRef = useRef(null);
  return (
    <m.div
      variants={fadeUp}
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <ScrambleLink prefix={prefix} label={label} href={href} valueRef={valueRef} />
      <CopyButton
        value={label}
        ariaLabel={t(copyAriaKey)}
        selectTargetRef={valueRef}
      />
    </m.div>
  );
}

export default function ContactFooter() {
  const shouldReduce = useReducedMotion();
  const { t } = useI18n();

  return (
    <footer id="contact" className="relative z-10 border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="07" label={t("contact.label")} title={t("contact.title")} />

        <m.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <m.p
            variants={fadeUp}
            className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/50"
          >
            {t("contact.intro")}
          </m.p>

          <div className="mt-14 flex flex-col gap-6">
            <ContactRow
              prefix="EMAIL"
              label={SITE.email}
              href={`mailto:${SITE.email}`}
              copyAriaKey="contact.copy.copyEmail"
            />
            <ContactRow
              prefix="GITHUB"
              label={SITE.githubHandle}
              href={SITE.github}
              copyAriaKey="contact.copy.copyGithub"
            />
            <ContactRow
              prefix="LINKEDIN"
              label={SITE.linkedinHandle}
              href={SITE.linkedin}
              copyAriaKey="contact.copy.copyLinkedin"
            />
          </div>
        </m.div>

        <div className="mt-20 flex flex-col gap-3 border-t border-gridline pt-6 font-mono text-[11px] tracking-[0.15em] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{t("contact.copyright")}</p>
          <p>{t("contact.warning")}</p>
        </div>
      </div>
    </footer>
  );
}
