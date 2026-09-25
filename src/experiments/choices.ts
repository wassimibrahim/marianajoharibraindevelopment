import { clamp } from "@/lib/scoring";
import type { Rng } from "@/lib/rng";
import type { ChallengeDef, Evaluation, Opt } from "./types";

/**
 * Executive-function decision problems. Most are generated from parameters so
 * the numbers change every session, and many are scored on the *reasoning*
 * rather than on a single "mature" answer.
 */

const eur = (n: number) => `€${n.toLocaleString("en-GB")}`;
const pct = (p: number) => `${Math.round(p * 100)}%`;

function table(scores: Record<string, Evaluation>, fallback: Evaluation) {
  return (choice: string) => scores[choice] ?? fallback;
}

export const choiceChallenges: ChallengeDef[] = [
  {
    id: "delayed-gratification",
    title: "Delayed Gratification",
    kind: "executive",
    category: "delay",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const nowAmt = rng.pick([500, 800, 1000, 1200, 2000]);
      const months = rng.pick([6, 12, 12, 18, 24]);
      const factor = rng.pick([1.04, 1.08, 1.15, 1.25, 1.35, 1.5]);
      const later = Math.round((nowAmt * factor) / 10) * 10;
      const annual = Math.pow(later / nowAmt, 12 / months) - 1;
      const reasons: Opt[] = [
        { id: "rate", label: `That's roughly ${pct(annual)} a year. That's the maths.` },
        { id: "need", label: "I genuinely need the money now (rent, emergencies, life)." },
        { id: "invest", label: "I can invest it and beat that return." },
        { id: "trust", label: "Nobody pays me what they promise. (See: employer.)" },
        { id: "yolo", label: "Future Mariana can deal with future Mariana." },
      ];
      return {
        type: "choice",
        prompt: `You receive ${eur(nowAmt)} today, or ${eur(later)} ${months} months from now. Which do you take?`,
        options: [
          { id: "now", label: `${eur(nowAmt)} today`, emoji: "💸" },
          { id: "later", label: `${eur(later)} in ${months} months`, emoji: "⏳" },
        ],
        followUp: { prompt: "Scientifically important follow-up: why?", options: reasons },
        evaluate: (choice, why) => {
          const good = annual >= 0.07;
          const rateNote = `Implied return: ~${pct(annual)} per year.`;
          if (choice === "later") {
            if (why === "rate")
              return good
                ? { score: 97, verdict: "Waited, and knew exactly why. Financially literate frontal lobe.", detail: rateNote }
                : { score: 62, verdict: "Patient, but that return barely beats inflation. The wait isn't paying much.", detail: rateNote };
            if (why === "need") return { score: 45, verdict: "Needs the money now… and chose to wait? Researchers are confused.", detail: rateNote };
            if (why === "invest") return { score: 50, verdict: "Chose to wait because she can invest it? The two halves of the brain disagree.", detail: rateNote };
            if (why === "trust") return { score: 55, verdict: "Distrusts promised payments, yet chose the promised payment. Bold.", detail: rateNote };
            return { score: good ? 70 : 55, verdict: "Right-ish answer, chaotic reasoning. Classic.", detail: rateNote };
          }
          if (why === "need") return { score: 90, verdict: "Liquidity matters. Taking it now is a perfectly adult decision.", detail: rateNote };
          if (why === "trust")
            return { score: 84, verdict: "Counterparty risk correctly priced. Given recent employer behaviour, fair.", detail: rateNote };
          if (why === "invest")
            return good
              ? { score: 48, verdict: `Beating ${pct(annual)} a year reliably would make you a legendary fund manager.`, detail: rateNote }
              : { score: 88, verdict: "Correct: the reward for waiting is small enough to beat elsewhere.", detail: rateNote };
          if (why === "rate") return { score: good ? 40 : 80, verdict: good ? "Cited the maths, then ignored the maths." : "The maths genuinely says the wait isn't worth much.", detail: rateNote };
          return { score: 28, verdict: "Future Mariana has been informed and is not pleased.", detail: rateNote };
        },
      };
    },
  },
  {
    id: "sunk-cost-event",
    title: "The €70 Event",
    kind: "executive",
    category: "decision",
    weight: 1,
    interactive: false,
    generate: () => ({
      type: "choice",
      prompt:
        "You paid €70 for an event. The day arrives. You're exhausted, the weather is horrible and you genuinely don't want to go. Do you:",
      options: [
        { id: "a", label: "Go, because I already paid €70", emoji: "🎟️" },
        { id: "b", label: "Stay home — the €70 is gone either way", emoji: "🛋️" },
        { id: "c", label: "Sell the ticket", emoji: "💱" },
        { id: "d", label: "Complain for 45 minutes and then decide", emoji: "🗣️" },
      ],
      evaluate: table(
        {
          a: { score: 30, verdict: "Classic sunk-cost fallacy: the €70 is spent whether you suffer or not." },
          b: { score: 88, verdict: "Sunk cost correctly recognised. The €70 is emotionally mourned, rationally ignored." },
          c: { score: 100, verdict: "Optimal: recover some value, stay home, stay dry. Terrifyingly sensible." },
          d: { score: 55, verdict: "Emotionally honest. Economically: 45 minutes of complaining has an opportunity cost too." },
        },
        { score: 50, verdict: "Undetermined." },
      ),
    }),
  },
  {
    id: "sunk-cost-variants",
    title: "Sunk Cost, Revisited",
    kind: "executive",
    category: "decision",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const variant = rng.int(0, 2);
      if (variant === 0) {
        const mins = rng.pick([35, 50, 70]);
        return {
          type: "choice",
          prompt: `You're ${mins} minutes into a film at the cinema. It is objectively terrible. There's an hour left.`,
          options: [
            { id: "stay", label: "Stay. I paid for the ticket.", emoji: "🍿" },
            { id: "leave", label: "Leave and do something enjoyable.", emoji: "🚶‍♀️" },
            { id: "sleep", label: "Stay and sleep. Free nap.", emoji: "😴" },
            { id: "commentary", label: "Stay for the hate-watching. That's the fun now.", emoji: "😈" },
          ],
          evaluate: table(
            {
              stay: { score: 30, verdict: "The ticket money was already gone. Now the hour is too." },
              leave: { score: 95, verdict: "Sunk cost ignored. Remaining hour reallocated to joy." },
              sleep: { score: 70, verdict: "Technically a new source of value was found. Creative." },
              commentary: { score: 85, verdict: "Valid! Staying for a *new* reason isn't a sunk-cost fallacy." },
            },
            { score: 50, verdict: "…" },
          ),
        };
      }
      if (variant === 1) {
        const waited = rng.pick([2, 3, 4]);
        const remaining = rng.pick([20, 40]);
        return {
          type: "choice",
          prompt: `You've waited ${waited} hours at the consulate. A clerk says you're next-but-one — about ${remaining} more minutes. Your appointment is essential.`,
          options: [
            { id: "stay", label: "Stay — the document still matters", emoji: "🛂" },
            { id: "leave", label: `Leave. I've wasted ${waited} hours already, I refuse to waste more.`, emoji: "😤" },
            { id: "sunk", label: `Stay, because otherwise the ${waited} hours were for nothing`, emoji: "🕰️" },
          ],
          evaluate: table(
            {
              stay: { score: 100, verdict: "Correct — and for the right reason. Future value, not past pain." },
              leave: { score: 25, verdict: "Reverse sunk cost: the past wait shouldn't decide the next 20 minutes either." },
              sunk: { score: 62, verdict: "Right decision, wrong reason. The hours are gone regardless." },
            },
            { score: 50, verdict: "…" },
          ),
        };
      }
      const price = rng.pick([45, 60, 85]);
      return {
        type: "choice",
        prompt: `You ordered a ${eur(price)} tasting menu. You're completely full with three courses left.`,
        options: [
          { id: "force", label: "Finish everything. I paid for it.", emoji: "🍽️" },
          { id: "box", label: "Ask to take the rest home", emoji: "🥡" },
          { id: "stop", label: "Stop eating. Enjoy the company.", emoji: "🥂" },
          { id: "wassim", label: "Feed it to Wassim", emoji: "🧑" },
        ],
        evaluate: table(
          {
            force: { score: 25, verdict: "Paying with money *and* discomfort. Double sunk cost." },
            box: { score: 100, verdict: "Value recovered. Tomorrow's lunch secured. Optimal." },
            stop: { score: 88, verdict: "Money gone, comfort preserved. Mature." },
            wassim: { score: 92, verdict: "Resource reallocated to a willing recipient. Economically efficient." },
          },
          { score: 50, verdict: "…" },
        ),
      };
    },
  },
  {
    id: "airport-planning",
    title: "The Early Flight",
    kind: "executive",
    category: "planning",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const flightMin = rng.pick([6 * 60 + 30, 7 * 60, 7 * 60 + 15, 8 * 60]);
      const travel = rng.pick([25, 35, 45]);
      const dropBefore = rng.pick([40, 45, 60]);
      const getReady = rng.pick([20, 25, 30]);
      const dropClose = flightMin - dropBefore;
      const ideal = dropClose - travel - 25;
      const offsets = rng.shuffle([-45, -25, 0, 20, 40]).slice(0, 4);
      if (!offsets.includes(0)) offsets[0] = 0;
      const leaveTimes = [...new Set(offsets.map((o) => ideal + o))].sort((a, b) => a - b);
      const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      return {
        type: "choice",
        prompt: "When are you leaving home?",
        context: [
          `✈️ Flight at ${fmt(flightMin)}`,
          `🚕 Airport is ${travel} minutes away`,
          `🧳 Baggage drop closes at ${fmt(dropClose)}`,
          `🪥 You need about ${getReady} minutes after waking up`,
        ].join("\n"),
        options: leaveTimes.map((t) => ({ id: String(t), label: `Leave at ${fmt(t)}`, emoji: "🚪" })),
        evaluate: (choice) => {
          const leave = Number(choice);
          const buffer = dropClose - (leave + travel);
          const detail = `Arrival at bag drop with ${buffer} min to spare (wake-up at ${fmt(leave - getReady)}).`;
          if (buffer < 0) return { score: 5, verdict: "Bag drop closed before you arrived. Enjoy the city you were trying to leave.", detail };
          if (buffer < 12) return { score: 45, verdict: "Technically possible. Spiritually a panic attack.", detail };
          if (buffer <= 40) return { score: 100, verdict: "A sensible buffer for traffic, queues and forgotten chargers.", detail };
          if (buffer <= 60) return { score: 82, verdict: "Cautious. You will see the airport Pret at its most intimate hours.", detail };
          return { score: 64, verdict: "Over-planned. You traded an hour of sleep for airport carpet.", detail };
        },
      };
    },
  },
  {
    id: "risk-gain",
    title: "Risk Calibration: Gains",
    kind: "executive",
    category: "risk",
    weight: 1,
    interactive: false,
    generate: (rng) => gainGamble(rng),
  },
  {
    id: "risk-mixed",
    title: "Risk Calibration: The Coin Offer",
    kind: "executive",
    category: "risk",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const loss = rng.pick([20, 30, 50]);
      const ratio = rng.pick([0.8, 1.2, 1.6, 2.2, 3]);
      const win = Math.round((loss * ratio) / 5) * 5;
      const ev = 0.5 * win - 0.5 * loss;
      return {
        type: "choice",
        prompt: `A friend offers a coin flip: heads you win ${eur(win)}, tails you lose ${eur(loss)}. You can afford either outcome. Accept?`,
        options: [
          { id: "accept", label: "Accept the flip", emoji: "🪙" },
          { id: "decline", label: "Decline politely", emoji: "🙅‍♀️" },
        ],
        evaluate: (choice) => {
          const detail = `Expected value: ${ev >= 0 ? "+" : "−"}${eur(Math.abs(ev))} per flip.`;
          if (choice === "accept") {
            if (ev < 0) return { score: 30, verdict: "Accepted a bet that loses money on average. The casino thanks you.", detail };
            return { score: ev / loss > 0.25 ? 98 : 88, verdict: "Positive expected value, affordable stakes: accepting is well calibrated.", detail };
          }
          if (ev < 0) return { score: 98, verdict: "Declined a bad bet. Correct.", detail };
          if (ratio < 2)
            return { score: 80, verdict: "Mild loss aversion — completely human, and the edge here was small.", detail };
          return { score: 52, verdict: "Loss aversion detected: winning 2–3× the loss on a fair coin is a good deal.", detail };
        },
      };
    },
  },
  {
    id: "gamblers-fallacy",
    title: "The Streak",
    kind: "executive",
    category: "risk",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const n = rng.int(5, 9);
      const side = rng.pick(["heads", "tails"]);
      const other = side === "heads" ? "tails" : "heads";
      return {
        type: "choice",
        prompt: `An ordinary-looking coin has landed ${side} ${n} times in a row. What's most accurate about the next flip?`,
        options: [
          { id: "due", label: `${cap(other)} is due. It has to balance out.`, emoji: "⚖️" },
          { id: "fair", label: "Still 50/50. Coins have no memory.", emoji: "🪙" },
          { id: "biased", label: `Slightly favour ${side} — maybe the coin is biased.`, emoji: "🧐" },
          { id: "bureaucracy", label: "The coin is Venezuelan bureaucracy. It will do what it wants.", emoji: "🇻🇪" },
        ],
        evaluate: table(
          {
            due: { score: 18, verdict: "Gambler's fallacy. The coin does not know it owes you anything." },
            fair: { score: 95, verdict: "Correct for a fair coin. Independence respected." },
            biased: { score: 92, verdict: `Sophisticated: after ${n} in a row, a Bayesian would indeed suspect the coin a little.` },
            bureaucracy: { score: 60, verdict: "Not wrong, spiritually. Statistically incomplete." },
          },
          { score: 50, verdict: "…" },
        ),
      };
    },
  },
  {
    id: "review-sample",
    title: "Decision Under Uncertainty",
    kind: "executive",
    category: "decision",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const few = rng.int(6, 14);
      const many = rng.pick([1800, 2400, 3100]);
      const highR = rng.pick([4.9, 5.0]);
      const lowR = rng.pick([4.5, 4.6]);
      return {
        type: "choice",
        prompt: `Two restaurants for your birthday dinner. Which is the safer bet?`,
        options: [
          { id: "few", label: `★ ${highR.toFixed(1)} from ${few} reviews`, emoji: "🍝" },
          { id: "many", label: `★ ${lowR.toFixed(1)} from ${many.toLocaleString("en-GB")} reviews`, emoji: "🥘" },
          { id: "read", label: "Read the actual reviews before deciding", emoji: "📖" },
          { id: "photos", label: "Whichever has better photos of dessert", emoji: "🍰" },
        ],
        evaluate: table(
          {
            few: { score: 45, verdict: `${few} reviews could be the owner's cousins. Small samples are noisy.` },
            many: { score: 95, verdict: "Correct: a slightly lower average from a huge sample is far more reliable." },
            read: { score: 100, verdict: "Gathering better evidence before deciding. Irritatingly mature." },
            photos: { score: 55, verdict: "Dessert-weighted decision-making. Understandable, not optimal." },
          },
          { score: 50, verdict: "…" },
        ),
      };
    },
  },
  {
    id: "conjunction",
    title: "The Probability Trap",
    kind: "executive",
    category: "reasoning",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const trait = rng.pick([
        "sends seven-minute voice notes",
        "owns more tote bags than plates",
        "speaks three languages in one sentence",
      ]);
      const extra = rng.pick([
        "and has no employment contract",
        "and has been told 'the contract is coming next month'",
        "and is waiting on a passport",
      ]);
      return {
        type: "choice",
        prompt: `A 24-year-old Syrian-Venezuelan woman loves flowers and ${trait}. Which is more probable?`,
        options: [
          { id: "a", label: "She works in an office.", emoji: "🏢" },
          { id: "b", label: `She works in an office ${extra}.`, emoji: "📄" },
        ],
        evaluate: table(
          {
            a: { score: 100, verdict: "Correct. A + B can never be more likely than A alone. Conjunction fallacy avoided." },
            b: { score: 25, verdict: "Conjunction fallacy! Though empirically… researchers understand how you got here." },
          },
          { score: 50, verdict: "…" },
        ),
      };
    },
  },
  {
    id: "number-pattern",
    title: "Pattern Recognition",
    kind: "executive",
    category: "reasoning",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const { seq, answer } = makeSequence(rng);
      const distractors = new Set<number>();
      while (distractors.size < 3) {
        const d = answer + rng.pick([-3, -2, -1, 1, 2, 3, 4, -4]) * rng.int(1, Math.max(1, Math.round(Math.abs(answer) / 8)));
        if (d !== answer) distractors.add(d);
      }
      const opts = rng.shuffle([answer, ...distractors]);
      return {
        type: "choice",
        prompt: "What comes next?",
        visual: `${seq.join("  ·  ")}  ·  ?`,
        options: opts.map((n) => ({ id: String(n), label: String(n) })),
        evaluate: (choice) =>
          Number(choice) === answer
            ? { score: 100, verdict: "Pattern detected. The neurons are, in fact, firing." }
            : { score: 25, verdict: `The answer was ${answer}. The pattern has been reported missing.` },
      };
    },
  },
  {
    id: "syllogism",
    title: "Short Logic Problem",
    kind: "executive",
    category: "reasoning",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const [a, b, c] = rng.shuffle(["consulates", "bureaucrats", "flower shops", "cats", "managers", "lemons", "tote bags", "voice notes"]).slice(0, 3);
      const form = rng.int(0, 3);
      const forms = [
        { premises: [`All ${a} are ${b}.`, `All ${b} are ${c}.`], claim: `All ${a} are ${c}.`, truth: "true" },
        { premises: [`All ${a} are ${b}.`, `Some ${b} are ${c}.`], claim: `Some ${a} are ${c}.`, truth: "unknown" },
        { premises: [`No ${a} are ${b}.`, `All ${c} are ${b}.`], claim: `Some ${c} are ${a}.`, truth: "false" },
        { premises: [`All ${a} are ${b}.`, `No ${b} are ${c}.`], claim: `No ${a} are ${c}.`, truth: "true" },
      ];
      const f = forms[form];
      return {
        type: "choice",
        prompt: `In a fictional universe: ${f.premises.join(" ")} Therefore: “${f.claim}”`,
        context: "Judge only by the premises, however absurd.",
        options: [
          { id: "true", label: "Definitely true", emoji: "✅" },
          { id: "false", label: "Definitely false", emoji: "❌" },
          { id: "unknown", label: "Cannot be determined", emoji: "🤷‍♀️" },
        ],
        evaluate: (choice) =>
          choice === f.truth
            ? { score: 100, verdict: "Logically airtight. Aristotle nods from beyond." }
            : {
                score: 20,
                verdict:
                  f.truth === "unknown"
                    ? "It can't be determined: 'some' doesn't guarantee overlap."
                    : `It was ${f.truth === "true" ? "definitely true" : "definitely false"}. The premises were absurd, but binding.`,
              },
      };
    },
  },
  {
    id: "emotion-k",
    title: "The ‘k’ Incident",
    kind: "executive",
    category: "emotion",
    weight: 1,
    interactive: false,
    generate: () => ({
      type: "choice",
      prompt: "Someone replies ‘k’ after you sent them three paragraphs. Your first move?",
      options: [
        { id: "pause", label: "Assume they're busy. Revisit later.", emoji: "🫖" },
        { id: "ask", label: "Calmly ask if everything's okay", emoji: "💬" },
        { id: "k", label: "Reply ‘k.’ — with a full stop", emoji: "🧊" },
        { id: "screenshot", label: "Screenshot to the group chat for forensic analysis", emoji: "🔍" },
        { id: "block", label: "Block, delete, move countries", emoji: "✈️" },
      ],
      evaluate: table(
        {
          pause: { score: 96, verdict: "Emotion noticed, not obeyed. Textbook regulation." },
          ask: { score: 92, verdict: "Direct, kind, low drama. Suspiciously well-adjusted." },
          k: { score: 40, verdict: "Retaliatory punctuation deployed. Effective, not regulated." },
          screenshot: { score: 58, verdict: "Co-regulation via group chat. Scientifically recognised, legally questionable." },
          block: { score: 12, verdict: "An emigration-level response to a single letter." },
        },
        { score: 50, verdict: "…" },
      ),
    }),
  },
  {
    id: "emotion-boss",
    title: "Friday, 18:04",
    kind: "executive",
    category: "emotion",
    weight: 1,
    interactive: false,
    generate: () => ({
      type: "choice",
      prompt: "Friday, 18:04. Your boss messages: “Can we talk on Monday?” No other context.",
      options: [
        { id: "weekend", label: "Note it, enjoy the weekend, deal with it Monday", emoji: "🌿" },
        { id: "ask", label: "Reply asking what it's about", emoji: "📩" },
        { id: "spiral", label: "Spend the weekend drafting a resignation, defence and memoir", emoji: "📚" },
        { id: "contract", label: "Assume it's finally about the contract", emoji: "📄" },
      ],
      evaluate: table(
        {
          weekend: { score: 95, verdict: "Uncertainty tolerated. The weekend survived. Remarkable." },
          ask: { score: 85, verdict: "Reducing uncertainty directly. Very reasonable." },
          spiral: { score: 25, verdict: "Catastrophising detected. The memoir is, admittedly, very good." },
          contract: { score: 65, verdict: "Optimism detected. Researchers admire it but cannot endorse it." },
        },
        { score: 50, verdict: "…" },
      ),
    }),
  },
  {
    id: "emotion-late",
    title: "The Late Friend",
    kind: "executive",
    category: "emotion",
    weight: 1,
    interactive: false,
    generate: (rng) => {
      const mins = rng.pick([25, 40, 55]);
      return {
        type: "choice",
        prompt: `A friend is ${mins} minutes late to brunch and hasn't texted.`,
        options: [
          { id: "order", label: "Order a coffee, text them, relax", emoji: "☕" },
          { id: "worry", label: "Check they're okay — maybe something happened", emoji: "📱" },
          { id: "cold", label: "Be icy for the entire brunch", emoji: "🥶" },
          { id: "leave", label: "Leave dramatically, eat alone, post about it", emoji: "🥞" },
        ],
        evaluate: table(
          {
            order: { score: 95, verdict: "Self-soothing with caffeine. Clinically elegant." },
            worry: { score: 90, verdict: "Empathy before annoyance. Genuinely mature." },
            cold: { score: 35, verdict: "Passive-aggression: a timeless, unregulated classic." },
            leave: { score: 20, verdict: "The pancakes were good. The regulation was not." },
          },
          { score: 50, verdict: "…" },
        ),
      };
    },
  },
  {
    id: "emotion-consulate",
    title: "Appointment Cancelled",
    kind: "executive",
    category: "emotion",
    weight: 1,
    interactive: false,
    generate: () => ({
      type: "choice",
      prompt: "The consulate cancels your appointment — which took three months to get — by email, the night before.",
      options: [
        { id: "rebook", label: "Take a breath, rebook, ask about priority slots", emoji: "📅" },
        { id: "vent", label: "Vent to a friend for 20 minutes, then rebook", emoji: "🗣️" },
        { id: "cry", label: "Cry, then rebook", emoji: "😭" },
        { id: "war", label: "Declare personal war on the Venezuelan state", emoji: "⚔️" },
      ],
      evaluate: table(
        {
          rebook: { score: 95, verdict: "Problem-focused coping. Honestly, frightening." },
          vent: { score: 92, verdict: "Feel it, then fix it: the gold standard." },
          cry: { score: 86, verdict: "Emotion expressed, action taken. Healthy — and completely justified." },
          war: { score: 30, verdict: "Understandable. Unfortunately, the Venezuelan state has more lawyers." },
        },
        { score: 50, verdict: "…" },
      ),
    }),
  },
];

function gainGamble(rng: Rng) {
  const sure = rng.pick([40, 50, 60, 75, 90]);
  const p = rng.pick([0.25, 0.4, 0.5, 0.6, 0.75, 0.8]);
  const ratio = rng.pick([0.7, 0.85, 1, 1.15, 1.35, 1.6]);
  const prize = Math.round((sure * ratio) / p / 5) * 5;
  const ev = p * prize;
  const r = ev / sure;
  return {
    type: "choice" as const,
    prompt: "Choose one:",
    options: [
      { id: "sure", label: `A guaranteed ${eur(sure)}`, emoji: "🔒" },
      { id: "gamble", label: `A ${pct(p)} chance of ${eur(prize)}, otherwise €0`, emoji: "🎲" },
    ],
    evaluate: (choice: string): Evaluation => {
      const detail = `Expected value of the gamble: ${eur(Math.round(ev))} vs ${eur(sure)} guaranteed.`;
      if (r >= 0.9 && r <= 1.1)
        return { score: 92, verdict: "Near-equal expected values: this is pure preference territory. No wrong answer.", detail };
      if (r > 1.1) {
        if (choice === "gamble") return { score: 97, verdict: "Took the better expected value. Calibrated risk-taking.", detail };
        return {
          score: Math.round(clamp(92 - (r - 1.1) * 110, 48)),
          verdict: "Risk-averse. Legitimate preference — but some expected value was left on the table.",
          detail,
        };
      }
      if (choice === "sure") return { score: 97, verdict: "The gamble was worse on average. Correctly declined.", detail };
      return {
        score: Math.round(clamp(88 - (0.9 - r) * 170, 30)),
        verdict: "Paid a premium for adrenaline. Fun, not calibrated.",
        detail,
      };
    },
  };
}

function makeSequence(rng: Rng): { seq: number[]; answer: number } {
  const kind = rng.int(0, 4);
  if (kind === 0) {
    const start = rng.int(2, 20);
    const step = rng.int(3, 9);
    const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    return { seq, answer: start + 5 * step };
  }
  if (kind === 1) {
    const start = rng.int(1, 4);
    const mult = rng.pick([2, 3]);
    const seq = Array.from({ length: 5 }, (_, i) => start * mult ** i);
    return { seq, answer: start * mult ** 5 };
  }
  if (kind === 2) {
    const a = rng.int(1, 5);
    const b = rng.int(2, 6);
    const seq = [a, b];
    for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return { seq, answer: seq[4] + seq[5] };
  }
  if (kind === 3) {
    const start = rng.int(1, 10);
    const up = rng.int(4, 9);
    const down = rng.int(1, 3);
    const seq = [start];
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? up : -down));
    return { seq, answer: seq[5] + (6 % 2 ? up : -down) };
  }
  const start = rng.int(1, 6);
  const seq = Array.from({ length: 5 }, (_, i) => (start + i) ** 2);
  return { seq, answer: (start + 5) ** 2 };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
