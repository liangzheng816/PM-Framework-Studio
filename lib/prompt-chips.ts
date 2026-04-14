import type { SelectableSkillId } from "./coach-types";

export interface PromptChip {
  /** Short text shown on the chip button. */
  label: string;
  /** Full template populated in the input — includes a [placeholder] the user replaces with context. */
  template: string;
}

/** Build a chip with context-first template: [placeholder]. label */
function makePool(labels: string[], placeholder: string): PromptChip[] {
  return labels.map((label) => ({
    label,
    template: `[${placeholder}]. ${label}`,
  }));
}

// ---------------------------------------------------------------------------
// Chip pools by coach mode — high-level, end-user-oriented
// ---------------------------------------------------------------------------

const auto = makePool([
  "Help me think this through",
  "Turn this into a clear plan",
  "What should I do first?",
  "Compare these two options",
  "Help me make a decision",
  "What is the smartest next step?",
  "Break this down for me",
  "What matters most here?",
  "Pressure-test this idea",
  "Which approach makes the most sense?",
  "What are the tradeoffs?",
  "How would an expert approach this?",
  "What am I missing?",
  "Make this easier to think about",
  "Help me move from confusion to clarity",
  "How should I frame this?",
  "What would be a practical way forward?",
  "Simplify this complex situation",
  "Give me a structured way to think about this",
  "What is the core issue here?",
], "describe your situation or question");

const research = makePool([
  "Help me understand this topic",
  "What should I learn first?",
  "Give me a quick overview",
  "What are the key things to understand here?",
  "Summarize the big picture",
  "What questions should I ask?",
  "Help me explore this space",
  "What are the most important unknowns?",
  "What should I look into next?",
  "Turn this into a research plan",
  "Help me understand the context",
  "What should I compare?",
  "What patterns should I pay attention to?",
  "What would a smart review of this look like?",
  "What information do I still need?",
  "Help me get oriented quickly",
  "What should I investigate before deciding?",
  "What are the important perspectives here?",
  "Where should I focus my attention?",
  "What would make this easier to understand?",
], "describe what you want to understand");

const problems = makePool([
  "What is really going wrong here?",
  "Help me find the root issue",
  "What is causing this problem?",
  "Is this the real issue or just a symptom?",
  "What should I solve first?",
  "Help me define the problem clearly",
  "What is getting in the way?",
  "Why does this keep happening?",
  "Where is the biggest source of friction?",
  "What are we overlooking?",
  "What is making this harder than it should be?",
  "How should I frame this challenge?",
  "What is the main blocker?",
  "What is most likely driving this outcome?",
  "Which part of this problem matters most?",
  "Help me untangle this situation",
  "What assumptions may be causing the issue?",
  "What makes this problem difficult?",
  "Where should I start diagnosing this?",
  "What should I question first?",
], "describe the issue or challenge");

const ideas = makePool([
  "Give me better ways to approach this",
  "What are some strong alternatives?",
  "Help me improve this idea",
  "What other directions could I explore?",
  "How could I simplify this?",
  "Give me fresh ways to think about this",
  "What would a smarter version look like?",
  "How can I make this more compelling?",
  "What are some practical options?",
  "How else could this be solved?",
  "Give me a few strong concepts",
  "Make this idea stronger",
  "What are some creative but realistic options?",
  "How can I rethink this from first principles?",
  "What would an elegant solution look like?",
  "Help me generate better possibilities",
  "How can I make this clearer or more useful?",
  "What would a bold version look like?",
  "What is a simpler alternative?",
  "What options deserve serious consideration?",
], "describe what you're working on");

const validate = makePool([
  "How can I test this idea?",
  "What assumptions should I question?",
  "What would make this more believable?",
  "How risky is this approach?",
  "What should I confirm before moving ahead?",
  "Help me pressure-test this plan",
  "What evidence would I want to see?",
  "How can I check whether this makes sense?",
  "What could prove this wrong?",
  "What is the fastest way to learn?",
  "What should I verify first?",
  "What would increase confidence here?",
  "How do I know this is worth doing?",
  "What could I test before committing more time?",
  "What would a lightweight validation approach look like?",
  "How can I reduce uncertainty here?",
  "What signals should I look for?",
  "What are the biggest assumptions underneath this?",
  "What would change my mind?",
  "How should I sanity-check this?",
], "describe the idea or plan");

const ship = makePool([
  "Turn this into a step-by-step plan",
  "What should happen now, next, and later?",
  "Help me organize the work",
  "What is the clearest way to move forward?",
  "What should I do first?",
  "How can I make this more manageable?",
  "Help me sequence the next steps",
  "What can I simplify before starting?",
  "What should I focus on right now?",
  "How do I turn this into action?",
  "What is a realistic plan?",
  "Help me reduce overwhelm and get moving",
  "What can I leave out for now?",
  "How should I break this into phases?",
  "What are the key milestones?",
  "How can I keep this practical?",
  "What does a good execution plan look like?",
  "Help me go from idea to action",
  "What is the cleanest rollout path?",
  "How do I make progress without overcomplicating it?",
], "describe what you're trying to do");

const growth = makePool([
  "How can this gain more traction?",
  "What is the biggest opportunity to improve?",
  "How can I make this more appealing?",
  "What would help more people engage with this?",
  "What is holding this back?",
  "How can this become more effective?",
  "What should I improve first?",
  "How do I create more momentum?",
  "How can I make this more valuable to people?",
  "What would help this spread further?",
  "How can I strengthen the overall result?",
  "What changes would have the biggest payoff?",
  "How can I make this easier for people to adopt?",
  "What is limiting the impact?",
  "How do I move this from okay to strong?",
  "What would improve the experience most?",
  "How can I increase interest or response?",
  "What makes this easy or hard for people to embrace?",
  "Where is the clearest growth opportunity?",
  "What is the most promising lever for improvement?",
], "describe what you want to improve");

const systems = makePool([
  "Help me see the bigger picture",
  "How do these parts connect?",
  "What is influencing what?",
  "What are the hidden dependencies here?",
  "Where is the real constraint?",
  "What happens if one part changes?",
  "What second-order effects should I watch for?",
  "Help me think about this as a system",
  "What is the underlying structure here?",
  "What tradeoffs exist across the whole picture?",
  "What could break as this grows?",
  "Where is the pressure point?",
  "What is holding the whole system back?",
  "How should I think about the moving parts?",
  "What would make this more resilient?",
  "What is the long-term effect of this choice?",
  "What is the bottleneck in the bigger system?",
  "How can I reduce unintended consequences?",
  "What is the strongest leverage point?",
  "What should I optimize at the system level?",
], "describe the system or situation");

const debate = makePool([
  "Argue both sides of this decision",
  "What is the strongest case against this?",
  "Challenge my current thinking",
  "What tradeoffs am I ignoring?",
  "What would a skeptic say?",
  "Why might this fail?",
  "What is the smartest counterargument?",
  "What are the weaknesses in this plan?",
  "Stress-test this recommendation",
  "Where could this go wrong?",
  "What is the strongest alternative view?",
  "Help me question this idea honestly",
  "What risks am I underestimating?",
  "What uncomfortable truths should I face?",
  "How would someone disagree with this?",
  "What would a critic point out first?",
  "What assumptions deserve to be challenged?",
  "What are the downsides of this path?",
  "Why might a different approach be better?",
  "What should I reconsider before committing?",
], "describe the idea or decision");

// ---------------------------------------------------------------------------
// Pool index + selection logic
// ---------------------------------------------------------------------------

const CHIP_POOLS: Record<SelectableSkillId | "debate", readonly PromptChip[]> = {
  auto,
  "discover-users": research,
  "frame-problems": problems,
  "generate-ideas": ideas,
  "validate-bets": validate,
  "ship-decisions": ship,
  "grow-product": growth,
  "think-systems": systems,
  debate,
};

const DOMAIN_KEYS: (SelectableSkillId | "debate")[] = [
  "discover-users",
  "frame-problems",
  "generate-ideas",
  "validate-bets",
  "ship-decisions",
  "grow-product",
  "think-systems",
];

/** Fisher-Yates shuffle (returns a new array). */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick one random element from an array. */
function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns randomised prompt chips for the current mode.
 *
 * - **Auto**: one chip from each of `count` random domain pools for breadth.
 * - **Debate**: picks from the debate pool.
 * - **Specific coach**: picks from that coach's pool.
 */
export function getRandomChips(
  skill: SelectableSkillId,
  isDebate: boolean,
  count = 5,
): PromptChip[] {
  if (isDebate) {
    return shuffle(CHIP_POOLS.debate).slice(0, count);
  }

  if (skill === "auto") {
    const domains = shuffle(DOMAIN_KEYS).slice(0, count);
    return domains.map((d) => pickOne(CHIP_POOLS[d]));
  }

  return shuffle(CHIP_POOLS[skill]).slice(0, count);
}
