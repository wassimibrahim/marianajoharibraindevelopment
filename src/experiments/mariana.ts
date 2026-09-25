import type { ChallengeDef, Evaluation, Opt } from "./types";

/**
 * 🌸 Mariana research questions: completely unserious, lightly weighted, and
 * scored mostly for comedic accuracy rather than cognition.
 */

const W = 0.15;

function research(
  id: string,
  title: string,
  prompt: string,
  options: (Opt & { score: number | null; verdict: string })[],
): ChallengeDef {
  return {
    id,
    title,
    kind: "mariana",
    category: "emotion",
    weight: W,
    interactive: false,
    generate: (rng) => {
      const shuffled = rng.shuffle(options);
      return {
        type: "choice",
        prompt,
        options: shuffled.map(({ id, label, emoji }) => ({ id, label, emoji })),
        evaluate: (choice): Evaluation => {
          const o = options.find((x) => x.id === choice);
          return o ? { score: o.score, verdict: o.verdict } : { score: null, verdict: "Answer lost in transit." };
        },
      };
    },
  };
}

export const marianaChallenges: ChallengeDef[] = [
  research(
    "passport-immigration",
    "The Passport Test",
    "You arrive at Venezuelan immigration. Someone says: “There appears to be a small issue with your passport.” What do you do?",
    [
      { id: "a", label: "Calmly ask what documentation is missing", emoji: "🗂️", score: 95, verdict: "Composure at a border. Rarer than a valid passport." },
      { id: "b", label: "Call everyone I've ever met", emoji: "📞", score: 60, verdict: "Activating the network. Every aunt is now involved." },
      { id: "c", label: "Become Venezuelan by sheer force of personality", emoji: "💃", score: 70, verdict: "Not legally recognised. Frankly, should be." },
      { id: "d", label: "Cry", emoji: "😭", score: 55, verdict: "Valid. The officer is now also crying." },
      { id: "e", label: "Begin a diplomatic incident", emoji: "🚨", score: 30, verdict: "Two governments have issued statements. Wassim has been called." },
    ],
  ),
  research(
    "where-from",
    "Origin Story",
    "A stranger at a party asks: “So where are you from?”",
    [
      { id: "syria", label: "Syria 🇸🇾", emoji: "🌿", score: null, verdict: "Correct. Incomplete, but correct." },
      { id: "venezuela", label: "Venezuela 🇻🇪", emoji: "☀️", score: null, verdict: "Correct, according to one passport, on a good day." },
      { id: "complicated", label: "It's complicated", emoji: "🌀", score: null, verdict: "The most accurate answer ever given at a party." },
      { id: "time", label: "How much time do you have?", emoji: "⏳", score: null, verdict: "The stranger has cancelled their evening plans." },
    ],
  ),
  research(
    "contract-credibility",
    "Employer Credibility Assessment",
    "Your boss says: “The contract is coming next month.” Estimated probability?",
    [
      { id: "zero", label: "0%", emoji: "🫠", score: 90, verdict: "Bayesian updating on prior evidence. Painfully rational." },
      { id: "five", label: "5%, generously", emoji: "🤏", score: 95, verdict: "Well calibrated. Hope preserved, expectations managed." },
      { id: "calendar", label: "Next month in which calendar?", emoji: "📆", score: 85, verdict: "Asking the important clarifying question." },
      { id: "sure", label: "100%, I believe in him", emoji: "🥹", score: 30, verdict: "Optimism of this purity should be studied." },
    ],
  ),
  research(
    "3am-meme",
    "Nocturnal Stimulus Response",
    "03:12. Wassim sends a meme. You are in bed. You:",
    [
      { id: "sleep", label: "Ignore it. Sleep is sacred.", emoji: "😴", score: 90, verdict: "Sleep hygiene prioritised. The meme will survive." },
      { id: "react", label: "React with 😂 and go back to sleep", emoji: "😂", score: 75, verdict: "Minimum viable friendship. Efficient." },
      { id: "reply", label: "Reply with four memes. Now it's 04:30.", emoji: "📱", score: 35, verdict: "The frontal lobe was offline between 03:12 and 04:30." },
      { id: "voice", label: "Send a 6-minute voice note", emoji: "🎙️", score: 45, verdict: "Wassim has been sentenced to 6 minutes of listening." },
    ],
  ),
  research(
    "mature-breakfast",
    "Breakfast Maturity Index",
    "Select the most adult breakfast.",
    [
      { id: "oats", label: "Overnight oats, prepared yesterday", emoji: "🥣", score: 95, verdict: "Planning ahead for breakfast. Terrifying." },
      { id: "labneh", label: "Labneh, za'atar, olive oil, bread", emoji: "🫒", score: 100, verdict: "Correct. Culturally and nutritionally unimpeachable." },
      { id: "arepa", label: "An arepa", emoji: "🫓", score: 100, verdict: "Also correct. The Venezuelan delegation approves." },
      { id: "coffee", label: "Coffee. Only coffee. Forever.", emoji: "☕", score: 40, verdict: "A liquid diet of anxiety. Very 24." },
    ],
  ),
  research(
    "lobe-emoji",
    "Self-Assessment",
    "Describe your frontal lobe in one emoji.",
    [
      { id: "brain", label: "Fully operational", emoji: "🧠", score: null, verdict: "Claim recorded. Evidence pending." },
      { id: "construction", label: "Under construction", emoji: "🚧", score: null, verdict: "Honest. The site foreman is Wassim." },
      { id: "fire", label: "On fire (derogatory)", emoji: "🔥", score: null, verdict: "Fire department has been notified." },
      { id: "flower", label: "Blooming", emoji: "🌸", score: null, verdict: "Researchers find this adorable and scientifically meaningless." },
    ],
  ),
  research(
    "mercury",
    "Astrological Governance",
    "You have to make a big decision. Mercury is in retrograde.",
    [
      { id: "decide", label: "Decide anyway — planets don't read emails", emoji: "🪐", score: 90, verdict: "Astronomy respected; astrology overruled." },
      { id: "wait", label: "Wait three weeks, obviously", emoji: "🌘", score: 45, verdict: "Delegating executive function to a planet." },
      { id: "chart", label: "Consult my chart, then decide", emoji: "✨", score: 65, verdict: "Rational process, questionable data source." },
      { id: "ask", label: "Ask Wassim, then do the opposite", emoji: "🙃", score: 70, verdict: "A consistent strategy, which is technically a strategy." },
    ],
  ),
];
