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

- `?now=2027-09-24T23:59:50` shows the countdown hitting zero, with fireworks
- `?now=2027-09-25T10:00` shows "THE MOMENT HAS ARRIVED", the final examination and the certificate

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
    mariana.ts       🌸 Mariana research questions (weighted at 15%)
    bank.ts          seeded session selection, final exam, scoring
  components/        one component per section and widget; experiments/ holds the test UIs
  lib/               dates, seeded RNG, scoring helpers, storage, achievements, celebrations
  content/lab.ts     joke copy: news toasts, passport oracle, lab notes, hypotheses
```

**Adding an experiment:** add a `ChallengeDef` to one of the bank files. If it needs a new
interaction type, add a variant to `ChallengeSpec` and a component in `components/experiments/`,
then route it in `QuestionCard.tsx`.

**Session selection:** the seed is `date + session number`. Refreshing the page gives the same
experiment, and the next session is a new one. Challenges from the last two sessions are
down-weighted, never-seen ones are boosted, categories are spread out, and an identical
consecutive combination is rerolled.

**Scoring:** preference questions are scored on reasoning and calibration. For example, the risk
questions compute expected value, and either answer scores well when EVs are close. Reaction-time
scores use generous bands plus a touchscreen allowance, and accuracy always outweighs speed.

*Not a medical or diagnostic instrument. It's a birthday present with a scoring system.*
