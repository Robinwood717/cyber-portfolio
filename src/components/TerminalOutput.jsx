import { useRef } from "react";
import { m } from "framer-motion";
import { useI18n } from "../i18n/LanguageContext";
import LogoMark from "./LogoMark";
import CopyButton from "./CopyButton";

// Renders the descriptor objects produced by lib/terminalCommands.js as
// React nodes. Everything is built from React elements and plain strings —
// no dangerouslySetInnerHTML anywhere; typed input only ever renders as a
// text child, so React escapes it.
//
// Latency-as-texture: the first run of a command staggers its rows in
// (~90ms per row, opacity/transform only, so layout never shifts); repeat
// runs and reduced-motion render instantly via `instant`.

const ERROR_RED = "text-[#ff5f57]";

const TONES = {
  default: "text-white/70",
  neon: "text-neon",
  dim: "text-white/50",
  faint: "text-white/50",
  link: "text-neon underline underline-offset-4 decoration-neon/40 hover:decoration-neon",
};

function Reveal({ seq, instant, children, className }) {
  if (instant) return <div className={className}>{children}</div>;
  const idx = seq.i;
  seq.i += 1;
  return (
    <m.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.09, 1.2), duration: 0.18 }}
      className={className}
    >
      {children}
    </m.div>
  );
}

// Values in descriptors are either plain strings, { key } dictionary refs,
// or { en, el } pairs from the data files.
function useResolve() {
  const { t, tr } = useI18n();
  return (value) => {
    if (value && typeof value === "object" && "key" in value) return t(value.key);
    return tr(value);
  };
}

function RunButton({ label, onRun, command, className }) {
  return (
    <button
      type="button"
      onClick={() => onRun(command)}
      className={
        className ??
        "font-mono text-neon underline-offset-4 hover:underline focus-visible:underline"
      }
    >
      {label}
    </button>
  );
}

function Chip({ children, tone = "dim" }) {
  const cls =
    tone === "neon"
      ? "border-neon/25 bg-neon/[0.06] text-neon/90"
      : "border-white/15 text-white/60";
  return (
    <span className={`inline-block border px-2 py-0.5 text-[10px] tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function Lines({ d, seq, instant, resolve, t }) {
  return d.lines.map((line, i) => {
    const text = line.key ? t(line.key) : resolve(line.text);
    const tone = TONES[line.tone] ?? TONES.default;
    return (
      <Reveal key={i} seq={seq} instant={instant}>
        {line.href ? (
          <a
            href={line.href}
            {...(line.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className={tone}
          >
            {text}
          </a>
        ) : (
          <p className={tone}>
            {text}
            {line.suffix ? <span className="text-white/85">{line.suffix}</span> : null}
          </p>
        )}
      </Reveal>
    );
  });
}

function Help({ d, seq, instant, t, onRun, onInsert }) {
  return d.commands.map((c) => (
    <Reveal
      key={c.name}
      seq={seq}
      instant={instant}
      className="grid grid-cols-[7.5rem_1fr] gap-x-3"
    >
      <span>
        <RunButton
          label={c.name}
          command={c.name}
          onRun={c.arg ? () => onInsert(`${c.name} `) : onRun}
        />
        {c.arg ? <span className="text-white/50"> {c.arg}</span> : null}
      </span>
      <span className="text-white/50">{t(`terminal.desc.${c.name}`)}</span>
    </Reveal>
  ));
}

function Whoami({ d, seq, instant, resolve, t }) {
  return (
    <>
      {d.fields.map(([label, value]) => (
        <Reveal
          key={label}
          seq={seq}
          instant={instant}
          className="grid grid-cols-[7.5rem_1fr] gap-x-3"
        >
          <span className="text-white/50 tracking-wider">{label}</span>
          <span className="text-white/85">{resolve(value)}</span>
        </Reveal>
      ))}
      <Reveal seq={seq} instant={instant}>
        <p className="mt-1 text-neon/80">{t(d.assessmentKey)}</p>
      </Reveal>
    </>
  );
}

function DossierCard({ item, resolve, t, onRun }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[10px] tracking-[0.25em] text-neon">{item.codename}</span>
        <span className="text-[10px] tracking-wider text-white/50">{resolve(item.eyebrow)}</span>
      </div>
      <p className="mt-1 font-display text-sm font-medium text-white">{item.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/55">{resolve(item.summary)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Chip tone={item.flagship ? "neon" : "dim"}>
          {item.flagship ? t("operations.flagshipEyebrow") : item.lang}
        </Chip>
        <RunButton
          label={item.flagship ? `open ${item.slug}` : `cat ${item.slug}`}
          command={item.flagship ? `open ${item.slug}` : `cat ${item.slug}`}
          onRun={onRun}
          className="min-h-11 px-1 font-mono text-[11px] text-neon/90 underline-offset-4 hover:underline focus-visible:underline sm:min-h-0"
        />
      </div>
    </div>
  );
}

function Projects({ d, seq, instant, resolve, t, onRun }) {
  return d.items.map((item) => (
    <Reveal key={item.slug} seq={seq} instant={instant}>
      <DossierCard item={item} resolve={resolve} t={t} onRun={onRun} />
    </Reveal>
  ));
}

function Skills({ d, seq, instant, t }) {
  return d.groups.map((g) => (
    <Reveal key={g.label} seq={seq} instant={instant}>
      <p className="text-[10px] tracking-[0.25em] text-white/50">{g.label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {(g.chipsKey ? t(g.chipsKey) : g.chips).map((chip) => (
          <Chip key={chip} tone={g.tone}>
            {chip}
          </Chip>
        ))}
      </div>
    </Reveal>
  ));
}

function Experience({ d, seq, instant, resolve }) {
  return d.rows.map((row, i) => (
    <Reveal key={i} seq={seq} instant={instant} className="flex flex-wrap gap-x-3 gap-y-0.5">
      <span className="shrink-0 text-neon/70">[{resolve(row.period)}]</span>
      <span className="text-white/85">{resolve(row.role)}</span>
      <span className="text-white/55">· {resolve(row.org)}</span>
    </Reveal>
  ));
}

const CONTACT_COPY_ARIA = {
  EMAIL: "contact.copy.copyEmail",
  GITHUB: "contact.copy.copyGithub",
  LINKEDIN: "contact.copy.copyLinkedin",
};

// One contact row: link plus a compact [ COPY ] chip copying the visible
// value (same rule as the footer: what you see is what you paste).
function ContactLine({ link, seq, instant, t }) {
  const valueRef = useRef(null);
  return (
    <Reveal seq={seq} instant={instant} className="grid grid-cols-[7.5rem_1fr] gap-x-3">
      <span className="text-white/50 tracking-wider">{link.label}</span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          ref={valueRef}
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="inline-flex min-h-11 items-center break-all text-white/85 underline-offset-4 hover:text-neon hover:underline sm:min-h-0"
        >
          {link.value}
        </a>
        <CopyButton
          compact
          value={link.value}
          ariaLabel={t(CONTACT_COPY_ARIA[link.label] ?? "contact.copy.copy")}
          selectTargetRef={valueRef}
        />
      </span>
    </Reveal>
  );
}

function Contact({ d, seq, instant, t }) {
  return (
    <>
      {d.links.map((link) => (
        <ContactLine key={link.label} link={link} seq={seq} instant={instant} t={t} />
      ))}
      <Reveal seq={seq} instant={instant}>
        <p className="text-white/50">{t(d.outroKey)}</p>
      </Reveal>
    </>
  );
}

function Ls({ d, seq, instant, t }) {
  return (
    <>
      <Reveal seq={seq} instant={instant} className="flex flex-wrap gap-x-6 gap-y-1">
        {d.items.map((item) => (
          <span key={item.slug} className={item.flagship ? "text-neon" : "text-white/70"}>
            {item.slug}/
          </span>
        ))}
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        <p className="text-white/50">{t("terminal.lsLegend")}</p>
      </Reveal>
    </>
  );
}

function Cat({ d, seq, instant, resolve, t, onRun }) {
  const p = d.project;
  return (
    <>
      <Reveal seq={seq} instant={instant}>
        <DossierCard item={p} resolve={resolve} t={t} onRun={onRun} />
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        <div className="flex flex-wrap gap-1.5">
          {(p.tags ?? []).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        <a
          href={p.repo}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-white/50 underline-offset-4 hover:text-neon hover:underline sm:min-h-0"
        >
          {t("operations.viewSource")} ↗
        </a>
      </Reveal>
    </>
  );
}

function Man({ d, seq, instant, resolve, t, onRun }) {
  const p = d.project;
  const section = (label) => (
    <p className="mt-2 text-[10px] tracking-[0.25em] text-neon/80">{label}</p>
  );
  return (
    <>
      <Reveal seq={seq} instant={instant}>
        <p>
          <span className="text-[10px] tracking-[0.25em] text-neon">{p.codename}</span>
          <span className="ml-3 text-white">{p.title}</span>
        </p>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        {section(t("project.sections.overview"))}
        <p className="mt-1 text-xs leading-relaxed text-white/60">{resolve(p.overview)}</p>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        {section(t("project.sections.architecture"))}
        <div className="mt-1 space-y-0.5">
          {(p.architecture ?? []).map(([name, desc]) => (
            <p key={name} className="text-xs leading-relaxed">
              <span className="text-white/85">{name}</span>
              <span className="text-white/50"> : {resolve(desc)}</span>
            </p>
          ))}
        </div>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        {section(t("project.sections.methodology"))}
        <div className="mt-1 space-y-0.5">
          {(p.methodology ?? []).map((step, i) => (
            <p key={i} className="text-xs leading-relaxed text-white/60">
              <span className="text-neon/60">▸ </span>
              {resolve(step)}
            </p>
          ))}
        </div>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        {section(t("project.sections.outcome"))}
        <p className="mt-1 text-xs leading-relaxed text-white/60">{resolve(p.outcome)}</p>
      </Reveal>
      <Reveal seq={seq} instant={instant}>
        <RunButton
          label={`open ${p.slug}`}
          command={`open ${p.slug}`}
          onRun={onRun}
          className="mt-1 inline-flex min-h-11 items-center font-mono text-[11px] text-neon/90 underline-offset-4 hover:underline sm:min-h-0"
        />
      </Reveal>
    </>
  );
}

function Usage({ d, seq, instant, t, onRun }) {
  return (
    <>
      <Reveal seq={seq} instant={instant}>
        <p className="text-white/50">
          {t("terminal.usageLabel")} <span className="text-white/85">{d.usage}</span>
        </p>
      </Reveal>
      <Reveal seq={seq} instant={instant} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-white/50">{t("terminal.filesLabel")}</span>
        {d.slugs.map((slug) => (
          <RunButton key={slug} label={slug} command={`${d.command} ${slug}`} onRun={onRun} />
        ))}
      </Reveal>
    </>
  );
}

function ErrorOut({ d, seq, instant, t, onRun }) {
  const notFoundKey = d.variant === "slug" ? "terminal.slugNotFound" : "terminal.notFound";
  return (
    <>
      <Reveal seq={seq} instant={instant}>
        <p className={ERROR_RED}>
          {t(notFoundKey)} <span className="text-white/85">{d.input}</span>
        </p>
      </Reveal>
      {d.suggestion && (
        <Reveal seq={seq} instant={instant}>
          <p className="text-white/50">
            {t("terminal.didYouMean")}{" "}
            <RunButton
              label={d.suggestion}
              command={d.variant === "slug" ? `${d.command} ${d.suggestion}` : d.suggestion}
              onRun={onRun}
            />
            ?
          </p>
        </Reveal>
      )}
      <Reveal seq={seq} instant={instant}>
        <p className="text-white/50">{t("terminal.helpHint")}</p>
      </Reveal>
    </>
  );
}

function Denied({ instant, t }) {
  return (
    <>
      <m.p
        initial={instant ? false : { opacity: 0 }}
        animate={instant ? { opacity: 1 } : { opacity: [0, 1, 0.15, 1] }}
        transition={{ duration: 0.5, times: [0, 0.3, 0.55, 1] }}
        className={`font-bold tracking-[0.3em] ${ERROR_RED}`}
      >
        {t("terminal.sudoDenied")}
      </m.p>
      <m.p
        initial={instant ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: instant ? 0 : 0.6, duration: 0.2 }}
        className="text-white/50"
      >
        {t("terminal.sudoLine")}
      </m.p>
    </>
  );
}

function Banner({ seq, instant, t }) {
  return (
    <Reveal seq={seq} instant={instant}>
      <div className="flex items-center gap-3 py-1">
        <LogoMark className="h-8 w-8 shrink-0 text-neon" />
        <div>
          <p className="font-display text-base font-bold tracking-tight text-white">
            {t("hero.name")}
          </p>
          <p className="text-[11px] text-white/50">{t("hero.role")}</p>
          <p className="mt-0.5 text-[10px] tracking-wider text-white/50">
            {t("terminal.bannerVersion")}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

const RENDERERS = {
  lines: Lines,
  help: Help,
  whoami: Whoami,
  projects: Projects,
  skills: Skills,
  experience: Experience,
  contact: Contact,
  ls: Ls,
  cat: Cat,
  man: Man,
  usage: Usage,
  error: ErrorOut,
  denied: Denied,
  banner: Banner,
};

// One submitted command: the echoed prompt line plus its rendered output.
// `instant` skips the staggered reveal (repeat runs, reduced motion).
export default function TerminalEntry({ entry, onRun, onInsert }) {
  const { t } = useI18n();
  const resolve = useResolve();
  const seq = { i: 0 }; // reveal order counter, reset every render pass

  return (
    <div className="space-y-1.5">
      <p className="text-white/85">
        <span className="text-neon">{">"}</span> {entry.input}
      </p>
      {entry.descriptors.map((d, i) => {
        const Renderer = RENDERERS[d.kind];
        if (!Renderer) return null;
        return (
          <Renderer
            key={i}
            d={d}
            seq={seq}
            instant={entry.instant}
            resolve={resolve}
            t={t}
            onRun={onRun}
            onInsert={onInsert}
          />
        );
      })}
    </div>
  );
}
