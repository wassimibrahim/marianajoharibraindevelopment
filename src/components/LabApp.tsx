"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AchievementSystem } from "./AchievementSystem";
import { BasitaMeter } from "./BasitaMeter";
import { BirthdayCake } from "./BirthdayCake";
import { BirthdayIntro } from "./BirthdayIntro";
import { BirthdayLetter } from "./BirthdayLetter";
import { BirthdayPostcard } from "./BirthdayPostcard";
import { BottomNav } from "./BottomNav";
import { BrainCountdown } from "./BrainCountdown";
import { ConfidentialNotes } from "./ConfidentialNotes";
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
import { Section } from "./Section";
import { Toasts } from "./Toasts";
import { WelcomeHero } from "./WelcomeHero";
import { WishBouquet } from "./WishBouquet";
import { YearInBloom } from "./YearInBloom";

export function LabApp() {
  return (
    <MotionConfig reducedMotion="user">
      <LabProvider>
        <Birthday />
      </LabProvider>
    </MotionConfig>
  );
}

type Intro = "pending" | "open" | "closed";

function Birthday() {
  const { state, ready, update } = useLab();
  const [intro, setIntro] = useState<Intro>("pending");
  const [finalRequested, setFinalRequested] = useState(false);

  // First visit on this device: the envelope. Afterwards: straight to the page.
  useEffect(() => {
    if (!ready || intro !== "pending") return;
    // Decided once, after the saved state has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIntro(state.introSeen ? "closed" : "open");
  }, [ready, intro, state.introSeen]);

  useEffect(() => {
    document.documentElement.style.overflow = intro === "closed" ? "" : "hidden";
  }, [intro]);

  const closeIntro = useCallback(() => {
    setIntro("closed");
    window.scrollTo({ top: 0 });
    if (!state.introSeen)
      update((s) => {
        s.introSeen = true;
      });
  }, [state.introSeen, update]);

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
      <Toasts enabled={intro === "closed"} />

      <AnimatePresence>
        {intro === "pending" && (
          <motion.div key="cover" className="fixed inset-0 z-50 bg-ivory" exit={{ opacity: 0, transition: { duration: 0.4 } }} aria-hidden />
        )}
        {intro === "open" && <BirthdayIntro key="intro" onDone={closeIntro} />}
      </AnimatePresence>

      <main className="relative z-10" inert={intro !== "closed" ? true : undefined}>
        <WelcomeHero onReplay={() => setIntro("open")} />

        <Section id="letter" index="I" eyebrow="A letter" title={<>For <em className="text-rose">Mariana</em></>}>
          <BirthdayLetter />
        </Section>

        <Section id="wish" index="II" eyebrow="Birthday rituals" title={<>Make a <em className="text-iris">wish</em></>} plain>
          <BirthdayCake />
          <div className="mx-auto my-14 flex max-w-xs items-center gap-4" aria-hidden>
            <span className="h-px flex-1 bg-gold/40" />
            <span className="text-gold">✦</span>
            <span className="h-px flex-1 bg-gold/40" />
          </div>
          <p className="mb-6 text-center font-display text-[clamp(1.4rem,5.5vw,1.9rem)] text-ink">
            And a bouquet, <em className="text-rose">with extra wishes</em>
          </p>
          <WishBouquet />
        </Section>

        <Section id="postcard" index="III" eyebrow="Something to keep" title={<>A birthday <em className="text-rose">postcard</em></>} plain>
          <BirthdayPostcard />
        </Section>

        <section id="lab" className="relative z-10 overflow-x-clip px-4 pt-20 pb-6 sm:px-6">
          <LabHeader />
        </section>

        <Section id="countdown" index="V" eyebrow="Chronological monitoring" title={<>Time until Mariana’s <em className="iridescent">alleged final form</em></>} plain>
          <BrainCountdown onFinalExam={requestFinal} />
        </Section>

        <Section
          id="experiment"
          index="VI"
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

        <Section id="garden" index="VII" eyebrow="Keeps growing" title={<>Mariana’s year <em className="text-rose">in bloom</em></>} plain>
          <YearInBloom />
        </Section>

        <Section id="curve" index="VIII" eyebrow="Longitudinal data" title={<>The Mariana <em className="text-rose">Development Curve</em></>}>
          <DevelopmentChart />
        </Section>

        <Section id="widgets" index="IX" eyebrow="Field instruments" title={<>Ongoing <em className="text-iris">investigations</em></>} wide>
          <div className="grid gap-5 md:grid-cols-3">
            <EmploymentStatus />
            <PassportMissionControl />
            <BasitaMeter />
          </div>
        </Section>

        <Section id="achievements" index="X" eyebrow="Recognition" title={<>Achievements</>} wide>
          <AchievementSystem />
        </Section>

        <Section id="notes" index="XI" eyebrow="Restricted" title={<>Laboratory <em className="text-rose">notes</em></>}>
          <ConfidentialNotes />
        </Section>

        <Footer onReplay={() => setIntro("open")} />
      </main>

      {intro === "closed" && <BottomNav />}
    </>
  );
}
