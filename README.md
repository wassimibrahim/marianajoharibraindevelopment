# The Mariana Johari Prefrontal Cortex Laboratory™

A longitudinal scientific investigation into whether Mariana is finally capable of making good decisions.
A birthday website for Mariana's 24th (25 September 2026) that she can keep reopening until her 25th.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

No backend. All history lives in `localStorage` (`mariana-pfc-lab:v1`), so it's per device and browser.

### Time travel (for testing)

Append `?now=<ISO date>` to the URL to start the clock at another moment (it keeps ticking in real time):

- `?now=2027-09-24T23:59:50%2B02:00` shows the countdown reaching zero, with fireworks
- `?now=2027-09-25T10:00%2B02:00` shows "25 unlocked. Certification still under review.", the final examination and the certificate

## The experience

1. **Envelope opening** (first visit on a device): tap to open, flowers bloom, the birthday line, a short fireworks burst, then the page. It can be skipped, has a reduced-motion version, and can be replayed from the hero or footer.
2. **Hero → letter → cake → bouquet → postcard.** The birthday content comes before any laboratory content, and nothing is gated behind a quiz.
3. **The laboratory:** a countdown to 25 September 2027, 00:00 in Europe/Madrid (set in `src/config.ts`); a ~3-minute session (the same core task every time, plus rotating games and one reflection question); a report; the "year in bloom" garden; the development chart; the widgets; achievements; and optional confidential notes.

## Honesty rules the code enforces

- Only tasks with a defensible correct answer are scored (`scored: true` in the bank). Risk appetite, emotional scenarios and 🌸 questions are reflections: the engine forces their score to `null`.
- The overall number is a **game score** (the mean of scored games). The dramatic verdicts are labelled as jokes.
- Only the **core task** (Flower Stroop, same format every session) is compared across sessions. Different random sets are never presented as development or regression.
- Categories a session didn't test show as "Not measured this session". Nothing is ever invented.
- Timed tasks restart cleanly if the app is backgrounded mid-task. The unfamiliar timed tasks offer an unscored practice round.
- The confidential notes never affect scores, achievements or access.
- The postcard contains only her first name, "24" and two affectionate lines.

## Data

History is saved in `localStorage` (`mariana-pfc-lab:v1`) in this browser, on this device. **Export history / Import history** (under the development chart) moves it to a new phone. Import merges by session id and never overwrites anything.

## How it's organised

```
src/
  experiments/       question bank, kept separate from the UI
    types.ts         ChallengeDef / ChallengeSpec (discriminated union by `type`)
    interactive.ts   timed/tap tasks: impulse button, Stroop, memory, digit span, reaction,
                     go/no-go, rule-switch card sort, task switching, visual search,
                     marshmallow test, errand planning, anchoring
    choices.ts       generated decision problems: delayed gratification, sunk cost, risk,
                     gambler's fallacy, sample size, conjunction fallacy, patterns, logic, emotion
    mariana.ts       🌸 Mariana research questions (never scored)
    bank.ts          seeded session selection, final exam, scoring
  components/        one component per section and widget; experiments/ holds the test UIs
  lib/               dates, seeded RNG, scoring helpers, storage, achievements, celebrations
  content/lab.ts     joke copy: news toasts, passport oracle, lab notes, hypotheses
```

**Adding an experiment:** add a `ChallengeDef` to one of the bank files. If it needs a new
interaction type, add a variant to `ChallengeSpec` and a component in `components/experiments/`,
then route it in `QuestionCard.tsx`.

**Session selection:** the seed is `date + session number`, so refreshing never rerolls the questions.
A session is the core task plus rotating scored games plus one reflection. Short sessions have 5
challenges and full ones 8. Recently seen challenges are down-weighted, never-seen ones are boosted,
and an identical consecutive combination is rerolled.

**Scoring:** each challenge carries a one-line `scoring` explanation that is shown to her. Reaction-time
scores use generous bands plus a touchscreen allowance, and accuracy always outweighs speed.

*Not a medical or diagnostic instrument. It's a birthday present with a scoring system.*
