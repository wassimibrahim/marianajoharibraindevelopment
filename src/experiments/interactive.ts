import { clamp, median, speedScore } from "@/lib/scoring";
import type { ChallengeDef, SearchRound, SortCard, StroopColor, StroopTrial, SwitchTrial } from "./types";

/** Executive-function tasks with timers, taps and reaction times. */

const STROOP_COLORS: StroopColor[] = ["red", "blue", "green", "purple", "orange"];
const MEMORY_POOL = ["🌹", "🧠", "🍋", "🌙", "🐈", "🌷", "🛂", "☕", "🌼", "🪻", "💌", "🍉"];

export const interactiveChallenges: ChallengeDef[] = [
  {
    id: "impulse-button",
    title: "The Forbidden Button",
    kind: "executive",
    category: "impulse",
    weight: 1,
    interactive: true,
    instructions: "A very beautiful button will appear. Do not press it for 10 seconds.",
    generate: () => ({
      type: "impulse",
      seconds: 10,
      evaluate: ({ pressedAtMs }) => {
        if (pressedAtMs === null) {
          return { score: 100, verdict: "Disturbing levels of self-control detected." };
        }
        const s = pressedAtMs / 1000;
        if (s < 1.5) {
          return {
            score: 12,
            verdict: "Prefrontal cortex temporarily unavailable.",
            detail: `Button pressed after ${s.toFixed(2)} s. The button was not even fully loaded.`,
          };
        }
        return {
          score: Math.round(clamp(15 + (s / 10) * 80)),
          verdict: s > 7 ? "So close. The button won in the final act." : "Resistance was attempted. Briefly.",
          detail: `Held out for ${s.toFixed(1)} of 10 seconds.`,
        };
      },
    }),
  },
  {
    id: "stroop",
    title: "Stroop Interference",
    kind: "executive",
    category: "inhibition",
    weight: 1,
    interactive: true,
    instructions: "Tap the colour of the INK — not the word you read.",
    generate: (rng) => {
      const trials: StroopTrial[] = [];
      const count = rng.int(8, 10);
      for (let i = 0; i < count; i++) {
        const word = rng.pick(STROOP_COLORS);
        // ~80% incongruent: that is where the interference lives.
        const ink = rng.chance(0.2) ? word : rng.pick(STROOP_COLORS.filter((c) => c !== word));
        trials.push({ word, ink });
      }
      return {
        type: "stroop",
        trials,
        evaluate: ({ correct, total, medianRt }) => {
          const acc = correct / total;
          const score = Math.round(acc * 72 + (speedScore(medianRt, 850, 1700) / 100) * 28 * acc);
          return {
            score,
            reactionMs: Math.round(medianRt),
            verdict:
              acc === 1
                ? "The words tried to lie. Mariana did not listen."
                : acc >= 0.75
                  ? "Minor interference. The written word occasionally won."
                  : "Reading ability has overpowered inhibition. Impressive, in a way.",
            detail: `${correct}/${total} correct · median ${Math.round(medianRt)} ms`,
          };
        },
      };
    },
  },
  {
    id: "emoji-memory",
    title: "Emoji Sequence Recall",
    kind: "executive",
    category: "memory",
    weight: 1,
    interactive: true,
    instructions: "Memorise the sequence. It will disappear. Then rebuild it in order.",
    generate: (rng) => {
      const length = rng.int(5, 7);
      const sequence = rng.shuffle(MEMORY_POOL).slice(0, length);
      const decoys = rng.shuffle(MEMORY_POOL.filter((e) => !sequence.includes(e))).slice(0, 3);
      return {
        type: "memory",
        sequence,
        pool: rng.shuffle([...sequence, ...decoys]),
        showMs: 900 * length,
        evaluate: ({ answer }) => {
          const exact = sequence.filter((e, i) => answer[i] === e).length;
          // Partial credit for correct items in the right relative order.
          const lcs = longestCommonSubsequence(sequence, answer);
          const score = Math.round(clamp((exact / length) * 65 + (lcs / length) * 35));
          return {
            score,
            verdict:
              exact === length
                ? "Flawless recall. The lemon was remembered."
                : lcs >= length - 1
                  ? "Nearly perfect. One emoji wandered off."
                  : "Working memory is working. Just not today.",
            detail: `${exact}/${length} in the exact position`,
          };
        },
      };
    },
  },
  {
    id: "digit-span",
    title: "Backwards Digit Span",
    kind: "executive",
    category: "memory",
    weight: 1,
    interactive: true,
    instructions: "Digits will flash one at a time. Type them back in REVERSE order.",
    generate: (rng) => {
      const length = rng.int(4, 6);
      const digits = Array.from({ length }, () => rng.int(0, 9));
      return {
        type: "digits",
        digits,
        stepMs: 850,
        backwards: true,
        evaluate: ({ answer }) => {
          const target = [...digits].reverse();
          const exact = target.filter((d, i) => answer[i] === d).length;
          const perfect = exact === length && answer.length === length;
          return {
            score: Math.round(clamp(perfect ? 100 : (exact / length) * 85)),
            verdict: perfect
              ? `${length} digits, reversed, flawlessly. Suspiciously competent.`
              : "The digits were reversed, partially, with enthusiasm.",
            detail: `Target ${target.join("")} · answered ${answer.join("") || "—"}`,
          };
        },
      };
    },
  },
  {
    id: "bloom-reaction",
    title: "Bloom Reaction Time",
    kind: "executive",
    category: "attention",
    weight: 1,
    interactive: true,
    instructions: "Wait for the bud to bloom, then tap as fast as you can. Tapping early counts as a false start.",
    generate: (rng) => ({
      type: "reaction",
      delays: [rng.int(1400, 3600), rng.int(1400, 3600), rng.int(1400, 3600)],
      evaluate: ({ times, falseStarts }) => {
        const med = median(times);
        const score = Math.round(clamp(speedScore(med, 330, 650) - falseStarts * 12));
        return {
          score,
          reactionMs: Math.round(med),
          verdict:
            falseStarts >= 2
              ? "Anticipated the flower before it existed. Bold, but not attention."
              : med < 380
                ? "Reflexes of someone who has dodged many bureaucrats."
                : "Sustained attention confirmed at a relaxed, dignified pace.",
          detail: `Median ${Math.round(med)} ms · ${falseStarts} false start${falseStarts === 1 ? "" : "s"}`,
        };
      },
    }),
  },
  {
    id: "go-nogo",
    title: "Go / No-Go Garden",
    kind: "executive",
    category: "inhibition",
    weight: 1,
    interactive: true,
    instructions: "Tap for every 🌸. Do NOT tap for 🌵. Speed matters, restraint matters more.",
    generate: (rng) => {
      const n = 14;
      const nogoCount = rng.int(4, 5);
      const stimuli = rng.shuffle([
        ...Array<"go">(n - nogoCount).fill("go"),
        ...Array<"nogo">(nogoCount).fill("nogo"),
      ]);
      // Never start with a no-go: let the habit form first.
      if (stimuli[0] === "nogo") {
        const idx = stimuli.indexOf("go");
        [stimuli[0], stimuli[idx]] = [stimuli[idx], stimuli[0]];
      }
      return {
        type: "gonogo",
        stimuli,
        windowMs: 950,
        evaluate: ({ hits, misses, falseAlarms, correctRejections, medianRt }) => {
          const goTotal = hits + misses;
          const nogoTotal = falseAlarms + correctRejections;
          const inhibition = nogoTotal ? correctRejections / nogoTotal : 1;
          const goRate = goTotal ? hits / goTotal : 1;
          const score = Math.round(clamp(inhibition * 60 + goRate * 30 + (speedScore(medianRt, 450, 800) / 100) * 10));
          return {
            score,
            reactionMs: hits ? Math.round(medianRt) : undefined,
            verdict:
              falseAlarms === 0
                ? "Not a single cactus was touched. Remarkable restraint."
                : falseAlarms === 1
                  ? "One cactus was touched. It has been noted, and it hurt."
                  : "Mariana tapped the cactus repeatedly. The cactus has filed a complaint.",
            detail: `${hits}/${goTotal} flowers · ${falseAlarms} cactus tap${falseAlarms === 1 ? "" : "s"}`,
          };
        },
      };
    },
  },
  {
    id: "card-sort",
    title: "The Shifting Rule",
    kind: "executive",
    category: "flexibility",
    weight: 1,
    interactive: true,
    instructions: "Sort each card by the rule shown. Watch the feedback carefully.",
    generate: (rng) => {
      const firstRule = rng.pick(["color", "shape"] as const);
      const switchAt = rng.int(5, 7);
      const total = switchAt + 7;
      const incongruent: SortCard[] = [
        { shape: "star", color: "pink" },
        { shape: "circle", color: "blue" },
      ];
      const congruent: SortCard[] = [
        { shape: "circle", color: "pink" },
        { shape: "star", color: "blue" },
      ];
      const cards: SortCard[] = [];
      for (let i = 0; i < total; i++) {
        // After the switch only incongruent cards: they reveal perseveration.
        const pool = i >= switchAt || rng.chance(0.6) ? incongruent : congruent;
        cards.push(rng.pick(pool));
      }
      return {
        type: "sorting",
        cards,
        firstRule,
        switchAt,
        evaluate: ({ errorsBefore, errorsAfter, adapted }) => {
          // The first error after the silent switch is how you discover it — free.
          const perseveration = Math.max(0, errorsAfter - 1);
          const score = adapted ? Math.round(clamp(100 - perseveration * 14 - errorsBefore * 10)) : 22;
          return {
            score,
            verdict: !adapted
              ? "The rule changed. Mariana did not. Loyalty is a virtue, elsewhere."
              : perseveration <= 1
                ? "Rule change detected and adopted almost instantly. Flexible frontal lobe behaviour."
                : "Adapted eventually, after a respectful mourning period for the old rule.",
            detail: `${errorsAfter} error${errorsAfter === 1 ? "" : "s"} after the silent switch`,
          };
        },
      };
    },
  },
  {
    id: "task-switch",
    title: "Pink / Blue Task Switching",
    kind: "executive",
    category: "flexibility",
    weight: 1,
    interactive: true,
    instructions: "PINK card: is the number odd or even? BLUE card: is it lower or higher than 5?",
    generate: (rng) => {
      const trials: SwitchTrial[] = [];
      let rule: SwitchTrial["rule"] = rng.pick(["parity", "magnitude"] as const);
      for (let i = 0; i < 12; i++) {
        if (i > 0 && rng.chance(0.45)) rule = rule === "parity" ? "magnitude" : "parity";
        trials.push({ n: rng.pick([1, 2, 3, 4, 6, 7, 8, 9]), rule });
      }
      return {
        type: "taskswitch",
        trials,
        evaluate: ({ correct, total, medianRt, switchCost }) => {
          const acc = correct / total;
          const costPenalty = clamp((switchCost - 150) / 20, 0, 12);
          const score = Math.round(clamp(acc * 75 + (speedScore(medianRt, 900, 1800) / 100) * 25 * acc - costPenalty));
          return {
            score,
            reactionMs: Math.round(medianRt),
            verdict:
              acc >= 0.9
                ? "Switched between rules like switching between Arabic, Spanish and English mid-sentence."
                : acc >= 0.7
                  ? "Some rules were followed. Some were improvised."
                  : "Both rules were applied, just not to the right cards.",
            detail: `${correct}/${total} correct · switch cost ${Math.max(0, Math.round(switchCost))} ms`,
          };
        },
      };
    },
  },
  {
    id: "visual-search",
    title: "Find the Impostor Flower",
    kind: "executive",
    category: "attention",
    weight: 1,
    interactive: true,
    instructions: "One item in each garden is different. Find it and tap it.",
    generate: (rng) => {
      const pairs: [string, string][] = [
        ["🌹", "🌷"],
        ["🌸", "💮"],
        ["🌼", "🌻"],
        ["🍋", "🍊"],
        ["🌙", "🌜"],
        ["🐈", "🐱"],
        ["🌺", "🌸"],
      ];
      const chosen = rng.shuffle(pairs).slice(0, 3);
      const rounds: SearchRound[] = chosen.map(([d, t], i) => {
        const cols = i === 0 ? 4 : 5;
        const cells = i === 0 ? 16 : i === 1 ? 25 : 30;
        return { cols, cells, target: t, distractor: d, index: rng.int(0, cells - 1) };
      });
      return {
        type: "search",
        rounds,
        evaluate: ({ times, errors }) => {
          const med = median(times);
          const score = Math.round(clamp(speedScore(med, 1300, 3600) - errors * 12));
          return {
            score,
            reactionMs: Math.round(med),
            verdict:
              errors === 0 && med < 2000
                ? "Spotted the impostor instantly. Nobody lies to Mariana."
                : "The impostor was found. Eventually. Investigations take time.",
            detail: `Median ${(med / 1000).toFixed(2)} s · ${errors} wrong tap${errors === 1 ? "" : "s"}`,
          };
        },
      };
    },
  },
  {
    id: "marshmallow",
    title: "The Flower Marshmallow Test",
    kind: "executive",
    category: "delay",
    weight: 1,
    interactive: true,
    instructions: "A live delayed-gratification experiment. Take the reward now, or wait for more.",
    generate: (rng) => {
      const waitSec = rng.int(12, 20);
      const later = rng.pick([3, 4, 5]);
      return {
        type: "marshmallow",
        waitSec,
        now: 1,
        later,
        evaluate: ({ waited, tookAtMs }) => {
          if (waited) {
            return {
              score: 100,
              verdict: `Waited ${waitSec} seconds for ${later}× the flowers. A four-year-old at Stanford would be proud.`,
            };
          }
          const frac = tookAtMs / (waitSec * 1000);
          return {
            score: Math.round(clamp(10 + frac * 70)),
            verdict:
              frac < 0.15
                ? "One flower, immediately. Honestly? Relatable."
                : `Gave up ${Math.ceil(waitSec - tookAtMs / 1000)} seconds before the payout. Painful for everyone.`,
          };
        },
      };
    },
  },
  {
    id: "errand-planning",
    title: "The Errand Itinerary",
    kind: "executive",
    category: "planning",
    weight: 1,
    interactive: true,
    instructions: "Tap the errands in the order you'd do them.",
    generate: (rng) => {
      const scenario = rng.pick(ERRAND_SCENARIOS);
      return {
        type: "order",
        prompt: scenario.prompt,
        context: scenario.context,
        items: rng.shuffle(scenario.items),
        evaluate: (order) => {
          const broken = scenario.rules.filter((r) => !r.ok(order));
          const score = Math.round(clamp(100 - broken.length * 28));
          return {
            score,
            verdict:
              broken.length === 0
                ? "An itinerary so good it could be submitted to a consulate."
                : broken.length === 1
                  ? `Almost. ${broken[0].why}`
                  : `Several logistical casualties. ${broken[0].why}`,
            detail: `${scenario.rules.length - broken.length}/${scenario.rules.length} constraints respected`,
          };
        },
      };
    },
  },
  {
    id: "anchoring",
    title: "Anchored Estimation",
    kind: "executive",
    category: "decision",
    weight: 1,
    interactive: true,
    instructions: "A quick estimation. First, a comparison. Then, your best guess.",
    generate: (rng) => {
      const fact = rng.pick(ESTIMATION_FACTS);
      const anchor = rng.chance(0.5) ? fact.lowAnchor : fact.highAnchor;
      return {
        type: "estimate",
        anchorPrompt: fact.anchorPrompt.replace("{anchor}", anchor.toLocaleString("en-GB")),
        estimatePrompt: fact.estimatePrompt,
        min: fact.min,
        max: fact.max,
        step: fact.step,
        unit: fact.unit,
        evaluate: ({ estimate }) => {
          const err = Math.abs(estimate - fact.truth) / fact.truth;
          const score = Math.round(clamp(err <= 0.12 ? 100 : 100 - (err - 0.12) * 140, 20));
          const pulled = Math.abs(estimate - anchor) < Math.abs(fact.truth - anchor) * 0.5;
          return {
            score,
            verdict: pulled
              ? `Anchoring bias detected: the random number ${anchor.toLocaleString("en-GB")} dragged the estimate towards it.`
              : err <= 0.12
                ? "Unmoved by the anchor and close to the truth. Unsettling."
                : "The anchor was ignored. So, somewhat, was the truth.",
            detail: `Answer: ${fact.truth.toLocaleString("en-GB")} ${fact.unit}. Estimate: ${estimate.toLocaleString("en-GB")}.`,
          };
        },
      };
    },
  },
];

function longestCommonSubsequence(a: string[], b: string[]): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

interface ErrandScenario {
  prompt: string;
  context: string;
  items: { id: string; label: string; emoji: string }[];
  rules: { ok: (order: string[]) => boolean; why: string }[];
}

const before = (order: string[], a: string, b: string) => order.indexOf(a) < order.indexOf(b);

const ERRAND_SCENARIOS: ErrandScenario[] = [
  {
    prompt: "Saturday. You leave home at 10:00. Plan the route.",
    context: "Pharmacy closes at 12:00 · The cake melts in a warm car · The post office opens at 11:00 · You need cash for the flower market (cash only).",
    items: [
      { id: "atm", label: "ATM", emoji: "🏧" },
      { id: "flowers", label: "Flower market", emoji: "💐" },
      { id: "pharmacy", label: "Pharmacy", emoji: "💊" },
      { id: "post", label: "Post office", emoji: "📮" },
      { id: "cake", label: "Pick up cake", emoji: "🎂" },
    ],
    rules: [
      { ok: (o) => before(o, "atm", "flowers"), why: "The flower market does not accept vibes as payment." },
      { ok: (o) => o[o.length - 1] === "cake", why: "The cake has melted. Grief." },
      { ok: (o) => o.indexOf("pharmacy") <= 2, why: "The pharmacy closed while you were elsewhere." },
      { ok: (o) => o[0] !== "post", why: "The post office was not open yet at 10:00." },
    ],
  },
  {
    prompt: "Passport renewal day. Plan the sequence.",
    context: "The consulate needs printed photos and a paid fee receipt · The bank opens at 09:00 · The consulate stops taking appointments at 13:00 · Celebratory coffee is obviously last.",
    items: [
      { id: "photos", label: "Passport photos", emoji: "📸" },
      { id: "bank", label: "Pay fee at bank", emoji: "🏦" },
      { id: "consulate", label: "Consulate", emoji: "🛂" },
      { id: "copies", label: "Photocopy every document ever", emoji: "🖨️" },
      { id: "coffee", label: "Celebratory coffee", emoji: "☕" },
    ],
    rules: [
      { ok: (o) => before(o, "photos", "consulate"), why: "No photos, no passport. The consulate was unmoved by your face in person." },
      { ok: (o) => before(o, "bank", "consulate"), why: "The fee receipt was required. It was, naturally, at the bank." },
      { ok: (o) => before(o, "copies", "consulate"), why: "The copies were requested. They are always requested." },
      { ok: (o) => o[o.length - 1] === "coffee", why: "Celebrating before the consulate is tempting fate." },
    ],
  },
  {
    prompt: "Dinner party at 20:00 at your place. Plan the afternoon.",
    context: "The roast needs 2 hours in the oven · You can't cook without groceries · Shower after cleaning, not before · Flowers go on the table last so they look fresh.",
    items: [
      { id: "groceries", label: "Buy groceries", emoji: "🛒" },
      { id: "oven", label: "Roast in the oven", emoji: "🍗" },
      { id: "clean", label: "Clean the flat", emoji: "🧽" },
      { id: "shower", label: "Shower & get ready", emoji: "🛁" },
      { id: "flowers", label: "Arrange flowers", emoji: "🌷" },
    ],
    rules: [
      { ok: (o) => before(o, "groceries", "oven"), why: "The oven was on. There was nothing in it." },
      { ok: (o) => o.indexOf("oven") <= 2, why: "The roast went in too late. Guests ate bread." },
      { ok: (o) => before(o, "clean", "shower"), why: "Showered, then scrubbed the bathroom. Back to square one." },
      { ok: (o) => o.indexOf("flowers") >= 3, why: "The flowers wilted watching you clean." },
    ],
  },
];

interface EstimationFact {
  anchorPrompt: string;
  estimatePrompt: string;
  truth: number;
  lowAnchor: number;
  highAnchor: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const ESTIMATION_FACTS: EstimationFact[] = [
  {
    anchorPrompt: "Are there more or fewer than {anchor} countries in Africa?",
    estimatePrompt: "Your best estimate of the number of countries in Africa:",
    truth: 54,
    lowAnchor: 18,
    highAnchor: 95,
    min: 0,
    max: 120,
    step: 1,
    unit: "countries",
  },
  {
    anchorPrompt: "Does an adult human have more or fewer than {anchor} bones?",
    estimatePrompt: "Your best estimate of bones in the adult human body:",
    truth: 206,
    lowAnchor: 70,
    highAnchor: 380,
    min: 20,
    max: 450,
    step: 1,
    unit: "bones",
  },
  {
    anchorPrompt: "Is the Eiffel Tower taller or shorter than {anchor} metres?",
    estimatePrompt: "Your best estimate of the Eiffel Tower's height:",
    truth: 330,
    lowAnchor: 120,
    highAnchor: 600,
    min: 50,
    max: 700,
    step: 5,
    unit: "metres",
  },
  {
    anchorPrompt: "Is Venezuela's Caribbean coastline longer or shorter than {anchor} km?",
    estimatePrompt: "Your best estimate of Venezuela's coastline length:",
    truth: 2800,
    lowAnchor: 700,
    highAnchor: 6500,
    min: 200,
    max: 7000,
    step: 50,
    unit: "km",
  },
];
