# Product

## Register

brand

## Users

Two audiences, weighted equally:
- **Recruiters / hiring managers** scanning fast for role, credibility, and a way to make contact. They need the headline (name + "Security & Information Systems Engineer") and a clear channel within seconds.
- **Technical peers** (security community, engineers) who dig deeper into the case files, kill-chain reconstruction, and source repos. They reward real depth over marketing gloss.

Context: desktop and mobile, often a quick first-impression visit from a CV link, LinkedIn, or GitHub. Greek and international viewers both (site is bilingual EN/ΕΛ).

## Product Purpose

A personal portfolio for Anastasios Soumpakis (University of the Aegean, MEng ICS). It presents his security engineering work — an incident-response eradication (IR-2506-RUNNER), a DLP scanner, an authorized MITM lab, and other repos — as a "security operations console." Success = a recruiter grasps who he is and reaches out, and a technical peer trusts the depth. The design itself is the argument for his craft.

## Brand Personality

Precise, vigilant, understated-confident. Voice reads like clean terminal output and case-file documentation, not marketing copy. Three words: **operator, exact, composed.** It should feel like being granted access to a secure session — earned, not loud. Emotional goal: credibility and quiet authority.

## Anti-references

- Generic dark "SaaS-cyber" template (neon-purple gradients, glowing hero-metric cards, three identical feature cards).
- Bootcamp-grad portfolios (rainbow skill bars, emoji, stock "coding" photos, "Hi I'm X 👋").
- Over-animated Awwwards demo with no substance behind the motion.
- Fake-precise dashboard slop presented as if it were real telemetry without disclosure.

## Design Principles

- **Show the work, redacted like real ops.** Case files, kill-chains, and TLP tags demonstrate competence; redaction spans signal real operational-security instinct, not decoration.
- **Substance under the style.** Every visual flourish sits on top of verifiable work (real repos, a real IR engagement); the console aesthetic is a frame, never a substitute for content.
- **Legible authority.** Dim is a mood, not an excuse — meaningful text stays readable (WCAG AA), targets stay tappable. Confidence reads clearly.
- **Earn the motion.** Animation communicates state or hierarchy (kill-chain flow, boot sequence, scroll reveals); it is guarded for reduced-motion and never blocks reading.
- **Bilingual by right.** Full EN/ΕΛ parity for a Greek engineer targeting both local and international roles; acronyms and CLI tokens stay English in both.

## Accessibility & Inclusion

Target WCAG 2.1 AA. Meaningful text ≥4.5:1 on the void background (neon accent = 8:1). Global `:focus-visible` ring. Full `prefers-reduced-motion` support (living background, cursor, marquee, kill-chain packet, all reveals collapse to static). Touch targets ≥44px. Color never the sole signal (kill-chain and timeline pair color with text labels). Custom cursor is fine-pointer + non-reduced-motion only, and tears down on touch.
