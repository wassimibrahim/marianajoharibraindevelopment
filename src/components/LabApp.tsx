"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AchievementSystem } from "./AchievementSystem";
import { BasitaMeter } from "./BasitaMeter";
import { BirthdayHero } from "./BirthdayHero";
import { BirthdayLetter } from "./BirthdayLetter";
import { BottomNav } from "./BottomNav";
import { BrainCountdown } from "./BrainCountdown";
import { DevelopmentChart } from "./DevelopmentChart";
import { EmploymentStatus } from "./EmploymentStatus";
import { ExperimentEngine } from "./ExperimentEngine";
import { Fireworks } from "./Fireworks";
import { FlowerField } from "./FlowerField";
import { Footer } from "./Footer";
import { LabHeader } from "./LabHeader";
import { LabProvider, useLab } from "./LabProvider";
import { PassportMissionControl } from "./PassportMissionControl";
import { PetalTrail } from "./PetalTrail";
import { SecretResearchNotes } from "./SecretResearchNotes";
import { Section } from "./Section";
import { Toasts } from "./Toasts";

export function LabApp() {
  return (
    <LabProvider>
      <Laboratory />
    </LabProvider>
  );
}

function Laboratory() {
  const { notify } = useLab();
  const [introOpen, setIntroOpen] = useState(true);
  const [finalRequested, setFinalRequested] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = introOpen ? "hidden" : "";
  }, [introOpen]);

  const enter = () => {
    setIntroOpen(false);
    window.setTimeout(() => {
      document.getElementById("letter")?.scrollIntoView({ behavior: "smooth" });
      notify({
        icon: "📋",
        title: "Examination protocol",
        body: "The specimen must first read the consent form (a birthday card). The experiment follows.",
        tone: "lab",
      });
    }, 450);
  };

  const requestFinal = () => {
    setFinalRequested(true);
    document.getElementById("experiment")?.scrollIntoView({ behavior: "smooth" });
  };
  const onFinalStarted = useCallback(() => setFinalRequested(false), []);

  return (
    <>
      <FlowerField />
      <PetalTrail />
      <Fireworks />
      <Toasts enabled={!introOpen} />

      <AnimatePresence>{introOpen && <BirthdayHero key="hero" onEnter={enter} />}</AnimatePresence>

      <main className="relative z-10">
        <LabHeader />

        <Section id="letter" index="I" eyebrow="Birthday correspondence" title={<>A letter for the <em className="text-rose">specimen</em></>}>
          <BirthdayLetter />
        </Section>

        <Section id="countdown" index="II" eyebrow="Chronological monitoring" title={<>The <em className="text-iris">countdown</em></>}>
          <BrainCountdown onFinalExam={requestFinal} />
        </Section>

        <Section
          id="experiment"
          index="III"
          eyebrow="The actual experiment"
          title={
            <>
              The Mariana Executive <br className="hidden sm:block" />
              Function Index<sup className="text-[0.4em] text-gold">™</sup>
            </>
          }
        >
          <ExperimentEngine finalRequested={finalRequested} onFinalStarted={onFinalStarted} />
        </Section>

        <Section id="curve" index="IV" eyebrow="Longitudinal data" title={<>The Mariana <em className="text-rose">Development Curve</em></>}>
          <DevelopmentChart />
        </Section>

        <Section id="widgets" index="V" eyebrow="Field instruments" title={<>Ongoing <em className="text-iris">investigations</em></>} wide>
          <div className="grid gap-5 md:grid-cols-3">
            <EmploymentStatus />
            <PassportMissionControl />
            <BasitaMeter />
          </div>
        </Section>

        <Section id="achievements" index="VI" eyebrow="Recognition" title={<>Achievements</>} wide>
          <AchievementSystem />
        </Section>

        <Section id="notes" index="VII" eyebrow="Restricted" title={<>Laboratory <em className="text-rose">notes</em></>}>
          <SecretResearchNotes />
        </Section>

        <Footer />
      </main>

      {!introOpen && <BottomNav />}
    </>
  );
}
