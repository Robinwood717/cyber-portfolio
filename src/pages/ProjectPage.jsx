import { lazy, Suspense, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { m, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";
import { useI18n } from "../i18n/LanguageContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getProject } from "../data/projects";
import ModelViewport from "../components/ModelViewport";
import { ACCENT_MATERIALS, IDLE_ROTATION_SECONDS } from "../lib/modelTheme";

// Behind the [ OPEN CASE FILE ] trigger — loads on first open.
const DossierModal = lazy(() => import("../components/DossierModal"));

// Only the DLP Scanner dossier gets the cipher-gate set piece (see the 3D
// placement proposal: a gate motif for the case study about gating what
// data is allowed to leave). Every other flagship page's header is
// unaffected by this file's layout changes.
const MODEL_BY_SLUG = {
  "dlp-scanner": {
    modelUrl: "/models/cipher-gate.glb",
    poster: "/models/posters/cipher-gate.webp",
  },
};

const STATUS_TONE = {
  red: "border-red-500/40 bg-red-500/10 text-red-400",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  neon: "border-neon/40 bg-neon/10 text-neon",
  neutral: "border-white/10 text-white/55",
};

function Block({ label, children }) {
  return (
    <m.section variants={fadeUp} className="border-t border-gridline pt-8">
      <p className="font-mono text-xs tracking-[0.35em] text-neon">{label}</p>
      <div className="mt-5">{children}</div>
    </m.section>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  const shouldReduce = useReducedMotion();
  const { t, tr } = useI18n();
  const [dossierOpen, setDossierOpen] = useState(false);
  // Mounted on first open, kept mounted afterwards for the exit animation.
  const [dossierMounted, setDossierMounted] = useState(false);

  // Hooks must run unconditionally — optional chaining keeps this safe when
  // the slug doesn't resolve to a flagship project.
  useDocumentMeta({ title: project?.title, description: project ? tr(project.summary) : undefined });

  // Only flagship projects have dedicated pages; anything else returns home.
  if (!project || !project.flagship) return <Navigate to="/" replace />;

  const model = MODEL_BY_SLUG[project.slug];

  return (
    <div
      className={`mx-auto px-6 pb-28 pt-28 md:pt-32 ${model ? "max-w-3xl lg:max-w-5xl" : "max-w-3xl"}`}
    >
      <Link
        to="/#operations"
        className="inline-flex min-h-[44px] items-center font-mono text-[11px] tracking-[0.25em] text-white/55 transition-colors duration-300 hover:text-neon"
      >
        {t("project.back")}
      </Link>

      <div className={model ? "lg:flex lg:items-start lg:gap-10" : undefined}>
        <m.div
          variants={stagger}
          initial={shouldReduce ? false : "hidden"}
          animate="visible"
          className={`mt-8 ${model ? "lg:min-w-0 lg:flex-1" : ""}`}
        >
          <m.div variants={fadeUp} className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            {project.statusTags?.map((tag) => (
              <span
                key={tag.text}
                className={`rounded border px-2 py-1 ${STATUS_TONE[tag.tone] ?? STATUS_TONE.neutral}`}
              >
                {tag.text}
              </span>
            ))}
          </m.div>

          <m.p variants={fadeUp} className="mt-6 font-mono text-[11px] tracking-[0.35em] text-neon">
            {project.codename}
          </m.p>
          <m.h1 variants={fadeUp} className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            {project.title}
          </m.h1>
          <m.p variants={fadeUp} className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-white/60 md:text-base">
            {tr(project.summary)}
          </m.p>

          <m.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.2em]">
            <button
              type="button"
              onClick={() => {
                setDossierMounted(true);
                setDossierOpen(true);
              }}
              className="border border-red-500/40 bg-red-500/[0.06] px-4 py-2.5 text-red-300 transition-all duration-200 hover:bg-red-500/15 active:scale-[0.97]"
            >
              {t("project.openCaseFile")}
            </button>
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="border border-white/15 px-4 py-2.5 text-white/55 transition-[color,border-color,transform] duration-300 hover:border-neon/40 hover:text-neon active:scale-[0.97] active:duration-100"
            >
              {t("project.viewOnGithub")}
            </a>
          </m.div>
        </m.div>

        {model && (
          <div className="mt-8 lg:mt-8 lg:w-[300px] lg:shrink-0">
            {/* Below lg: a plain lazy-loaded poster, no JS/WebGL cost at all —
                the case-file header is already tight above the mobile fold,
                so the set piece here is decorative-when-affordable only.
                Above lg: the full idle-rotating viewport, beside the header
                text, calm/procedural (rotation only, no parallax). Both nodes
                are always in the DOM; only Tailwind's `lg:` breakpoint picks
                which one paints, so there's no client-side layout flash. */}
            <img
              src={model.poster}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-2xl border border-white/10 object-cover lg:hidden"
            />
            <div className="relative hidden aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 lg:block">
              <ModelViewport
                modelUrl={model.modelUrl}
                poster={model.poster}
                accentMaterials={ACCENT_MATERIALS}
                rotationSeconds={IDLE_ROTATION_SECONDS}
                className="absolute inset-0"
              />
            </div>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.25em] text-white/50 lg:text-left">
              {t("project.modelCaption")}
            </p>
          </div>
        )}
      </div>

      {project.authorized && (
        <m.p
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 rounded-lg border border-amber-400/25 bg-amber-400/[0.04] p-4 font-mono text-xs leading-relaxed text-amber-200/70"
        >
          ⚠ {tr(project.authorized)}
        </m.p>
      )}

      <m.div
        variants={stagger}
        initial={shouldReduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mt-14 space-y-12"
      >
        <Block label={t("project.sections.overview")}>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-white/60">
            {tr(project.overview)}
          </p>
        </Block>

        <Block label={t("project.sections.architecture")}>
          <dl className="space-y-3 font-mono text-xs md:text-sm">
            {project.architecture?.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
                <dt className="text-neon/80">{k}</dt>
                <dd className="text-white/60">{tr(v)}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block label={t("project.sections.methodology")}>
          <ul className="space-y-2.5 font-mono text-xs leading-relaxed text-white/60 md:text-sm">
            {project.methodology?.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-neon">▸</span>
                {tr(line)}
              </li>
            ))}
          </ul>
        </Block>

        <Block label={t("project.sections.outcome")}>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-neon/90">
            {tr(project.outcome)}
          </p>
        </Block>
      </m.div>

      {dossierMounted && (
        <Suspense fallback={null}>
          <DossierModal
            open={dossierOpen}
            onClose={() => setDossierOpen(false)}
            project={project}
          />
        </Suspense>
      )}
    </div>
  );
}
