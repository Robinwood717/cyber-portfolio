import TerminalHero from "../components/TerminalHero";
import SkillsMarquee from "../components/SkillsMarquee";
import Methodology from "../components/Methodology";
import Experience from "../components/Experience";
import CommandCenter from "../components/CommandCenter";
import KillChain from "../components/KillChain";
import ProjectsBento from "../components/ProjectsBento";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Home() {
  useDocumentMeta();

  return (
    <>
      <TerminalHero />
      <SkillsMarquee />
      <Methodology />
      <Experience />
      <ProjectsBento />
      <CommandCenter />
      <KillChain />
    </>
  );
}
