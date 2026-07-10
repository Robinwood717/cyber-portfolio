import { m, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { bentoCard, glareSweep, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { PROJECTS } from "../data/projects";

const STATUS_TONE = {
  red: "border-red-500/40 bg-red-500/10 text-red-400",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  neon: "border-neon/40 bg-neon/10 text-neon",
  neutral: "border-white/10 text-white/55",
};

function Tag({ children }) {
  return (
    <span className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-white/55 transition-colors duration-300 group-hover:border-neon/30 group-hover:text-neon">
      {children}
    </span>
  );
}

function CardShell({ index, className = "", children }) {
  return (
    <m.article
      variants={bentoCard}
      whileHover="hover"
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)] md:p-8 ${className}`}
    >
      <span className="pointer-events-none absolute right-5 top-5 font-mono text-[10px] tracking-[0.3em] text-white/40">
        [{index}]
      </span>
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-glow ring-1 ring-neon/60 transition-opacity duration-500 group-hover:opacity-100" />
      <m.div
        aria-hidden="true"
        variants={glareSweep}
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-3/5"
      >
        <div className="h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </m.div>
    </m.article>
  );
}

function FlagshipCard({ project, index, t, tr }) {
  return (
    <CardShell index={index} className="lg:col-span-2">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
        <span className="rounded border border-neon/40 bg-neon/10 px-2 py-1 text-neon">
          {t("operations.flagshipEyebrow")}
        </span>
        {project.statusTags?.map((tag) => (
          <span
            key={tag.text}
            className={`rounded border px-2 py-1 ${STATUS_TONE[tag.tone] ?? STATUS_TONE.neutral}`}
          >
            {tag.text}
          </span>
        ))}
      </div>

      <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-neon">
        {tr(project.eyebrow)}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
        {project.title}
      </h3>
      <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-white/55 md:text-sm">
        {tr(project.summary)}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.2em]">
        <Link
          to={`/ops/${project.slug}`}
          className="flex min-h-[44px] items-center gap-2 border border-neon/40 bg-neon/[0.06] px-4 py-2.5 text-neon transition-all duration-200 hover:bg-neon/15 hover:shadow-glow-sm active:scale-[0.97]"
        >
          {t("operations.openDossier")} <span aria-hidden="true">→</span>
        </Link>
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[44px] items-center gap-2 border border-white/15 px-4 py-2.5 text-white/55 transition-[color,border-color,transform] duration-300 hover:border-white/40 hover:text-white active:scale-[0.97] active:duration-100"
        >
          {t("operations.viewSource")} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </CardShell>
  );
}

function RepoCard({ project, index, t, tr }) {
  return (
    <CardShell index={index}>
      <p className="font-mono text-[10px] tracking-[0.3em] text-neon">{tr(project.eyebrow)}</p>
      <h3 className="mt-3 font-display text-xl font-semibold md:text-2xl">
        {project.title}
      </h3>
      <p className="mt-4 font-mono text-xs leading-relaxed text-white/55 md:text-sm">
        {tr(project.summary)}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <a
        href={project.repo}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/55 transition-colors duration-300 hover:text-neon"
      >
        {t("operations.viewSource")} <span aria-hidden="true">↗</span>
      </a>
    </CardShell>
  );
}

function TelemetryCard({ index, t }) {
  const telemetry = t("operations.telemetry");
  return (
    // Pinned to the first row's free column so the two flagship dossiers
    // stay adjacent in DOM (and single-column) order.
    <CardShell index={index} className="lg:col-start-3 lg:row-start-1">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
        </span>
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon">
          {t("operations.telemetryTitle")}
        </p>
      </div>
      <div className="mt-6 space-y-3 font-mono text-xs md:text-sm">
        {telemetry.map(([key, value, hot]) => (
          <p
            key={key}
            className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2"
          >
            <span className="text-white/55">{key}</span>
            <span className={hot ? "text-neon" : "text-white/80"}>{value}</span>
          </p>
        ))}
      </div>
    </CardShell>
  );
}

export default function ProjectsBento() {
  const shouldReduce = useReducedMotion();
  const { t, tr } = useI18n();

  const flagships = PROJECTS.filter((p) => p.flagship);
  const repos = PROJECTS.filter((p) => !p.flagship);

  return (
    <section id="operations" className="relative border-t border-gridline scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeader index="04" label={t("operations.label")} title={t("operations.title")} />

        <m.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
        >
          {flagships[0] && <FlagshipCard project={flagships[0]} index="01" t={t} tr={tr} />}
          {flagships[1] && <FlagshipCard project={flagships[1]} index="02" t={t} tr={tr} />}
          <TelemetryCard index="03" t={t} />
          {repos.map((project, i) => (
            <RepoCard key={project.slug} project={project} index={`0${i + 4}`} t={t} tr={tr} />
          ))}
        </m.div>
      </div>
    </section>
  );
}
