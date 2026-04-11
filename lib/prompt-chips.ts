import type { SelectableSkillId } from "./coach-types";

export interface PromptChip {
  /** Short text shown on the chip button. */
  label: string;
  /** Full template populated in the input — includes a [placeholder] the user replaces. */
  template: string;
}

// ---------------------------------------------------------------------------
// Chip pools by coach mode
// ---------------------------------------------------------------------------

const auto: PromptChip[] = [
  { label: "Help me think through this decision", template: "Help me think through this: [describe your decision or situation]" },
  { label: "Turn this messy situation into a plan", template: "Turn this into a clear plan: [describe your situation]" },
  { label: "Compare these two options", template: "Compare these options: [Option A] vs [Option B]" },
  { label: "Pressure-test this idea", template: "Pressure-test this idea: [describe your idea briefly]" },
  { label: "What should I do first?", template: "What should I do first? Context: [describe your situation]" },
  { label: "What problem should we solve first?", template: "What problem should we solve first? We're dealing with: [list the problems]" },
  { label: "What is the smartest next step?", template: "What is the smartest next step? Here's where we are: [describe current state]" },
  { label: "Which framework fits this best?", template: "Which PM framework fits this best? Situation: [describe your challenge]" },
  { label: "What are we not seeing yet?", template: "What are we not seeing yet? Here's our current thinking: [describe your plan or analysis]" },
  { label: "Break this into manageable parts", template: "Break this challenge into manageable parts: [describe the challenge]" },
  { label: "What are the tradeoffs here?", template: "What are the tradeoffs I should consider? Decision: [describe the decision]" },
  { label: "How can I frame this problem better?", template: "How can I frame this problem better? Right now it looks like: [describe the problem]" },
];

const research: PromptChip[] = [
  { label: "Summarize this market quickly", template: "Summarize this market quickly: [name or describe the market]" },
  { label: "Map the competitors", template: "Map the competitors in this space: [describe the product or market]" },
  { label: "What are the key user needs?", template: "What are the key user needs for: [describe the product or audience]" },
  { label: "Find the biggest unknowns", template: "Find the biggest unknowns in this idea: [describe the idea]" },
  { label: "Turn this into a research plan", template: "Turn this into a research plan: [describe what you want to learn]" },
  { label: "What assumptions need evidence?", template: "What assumptions need evidence? Our plan: [describe your plan or hypothesis]" },
  { label: "What questions should we ask users?", template: "What questions should we ask users about: [describe the topic or feature]" },
  { label: "What should we learn before deciding?", template: "What should we learn before deciding on: [describe the decision]" },
  { label: "What user segments matter most?", template: "What user segments matter most for: [describe the product or feature]" },
  { label: "What are the top risks worth researching?", template: "What are the top risks worth researching? Context: [describe the initiative]" },
  { label: "What signals should we look for?", template: "What signals should we look for to validate: [describe what you're testing]" },
  { label: "How should we narrow the scope?", template: "How should we narrow the research scope for: [describe the broad topic]" },
];

const problems: PromptChip[] = [
  { label: "Why are users dropping off?", template: "Why are users dropping off at: [describe where in the journey]" },
  { label: "What is the root cause?", template: "What is the root cause of: [describe the symptom or issue]" },
  { label: "Are we solving the right problem?", template: "Are we solving the right problem? We're focused on: [describe current focus]" },
  { label: "Where is the biggest bottleneck?", template: "Where is the biggest bottleneck in: [describe the workflow or process]" },
  { label: "Is this a symptom or the real issue?", template: "Is this a symptom or the real issue? We're seeing: [describe what's happening]" },
  { label: "How should we frame this problem?", template: "How should we frame this problem? Current understanding: [describe the problem]" },
  { label: "What is actually driving this behavior?", template: "What is actually driving this behavior? We observe: [describe the behavior]" },
  { label: "What pain point matters most?", template: "What pain point matters most? Our users are frustrated by: [list pain points]" },
  { label: "What is the real job to be done?", template: "What is the real job to be done for: [describe the user or scenario]" },
  { label: "What hidden assumptions are distorting this?", template: "What hidden assumptions are distorting this? Our current belief: [describe your assumption]" },
  { label: "Why is this workflow breaking down?", template: "Why is this workflow breaking down? Steps involved: [describe the workflow]" },
  { label: "Which issue is most urgent to fix?", template: "Which issue is most urgent to fix? We're dealing with: [list the issues]" },
];

const ideas: PromptChip[] = [
  { label: "Give me 3 better ways to solve this", template: "Give me 3 better ways to solve: [describe the problem]" },
  { label: "How else could we approach this?", template: "How else could we approach this? Current approach: [describe what you're doing]" },
  { label: "Make this idea stronger", template: "Make this idea stronger: [describe your idea]" },
  { label: "Generate lower-cost alternatives", template: "Generate lower-cost alternatives to: [describe the current solution]" },
  { label: "How can we simplify this concept?", template: "How can we simplify this? Current concept: [describe the concept]" },
  { label: "What would a breakthrough version look like?", template: "What would a breakthrough version look like for: [describe the product or feature]" },
  { label: "What ideas fit this constraint?", template: "What ideas fit this constraint? We're limited by: [describe the constraint]" },
  { label: "What are the best solution directions?", template: "What are the best solution directions for: [describe the problem]" },
  { label: "How can we make this more differentiated?", template: "How can we make this more differentiated? Current offering: [describe your product]" },
  { label: "What is the boldest viable option?", template: "What is the boldest viable option for: [describe the opportunity]" },
  { label: "What could we eliminate without hurting value?", template: "What could we eliminate without hurting value? Current scope: [describe what's included]" },
  { label: "What adjacent ideas are worth borrowing?", template: "What adjacent ideas are worth borrowing for: [describe your domain or problem]" },
];

const validate: PromptChip[] = [
  { label: "Pressure-test this idea", template: "Pressure-test this idea before we invest: [describe the idea]" },
  { label: "How can we validate this cheaply?", template: "How can we validate this cheaply? Idea: [describe what you want to test]" },
  { label: "What assumptions should we test first?", template: "What assumptions should we test first? Our plan: [describe the plan]" },
  { label: "How risky is this idea?", template: "How risky is this idea? Here's what we're considering: [describe the idea]" },
  { label: "What should the MVP include?", template: "What should the MVP include for: [describe the product concept]" },
  { label: "What would make us change our mind?", template: "What would make us change our mind about: [describe the bet or decision]" },
  { label: "What is the riskiest assumption?", template: "What is the riskiest assumption in: [describe the plan or strategy]" },
  { label: "What result would count as validation?", template: "What result would count as validation for: [describe the hypothesis]" },
  { label: "How can we de-risk before launch?", template: "How can we de-risk before launch? We're planning to: [describe the launch]" },
  { label: "What experiments should we run next?", template: "What experiments should we run next? We've learned: [describe what you know so far]" },
  { label: "What proof do stakeholders need?", template: "What proof do stakeholders need to approve: [describe what needs approval]" },
  { label: "How do we separate signal from noise?", template: "How do we separate signal from noise? We're seeing: [describe the mixed data]" },
];

const ship: PromptChip[] = [
  { label: "Create a practical launch plan", template: "Create a practical launch plan for: [describe what you're launching]" },
  { label: "How should we sequence delivery?", template: "How should we sequence delivery of: [describe the features or workstreams]" },
  { label: "What can we cut without losing value?", template: "What can we cut without losing value? Current scope: [describe the scope]" },
  { label: "How should we prioritize the roadmap?", template: "How should we prioritize the roadmap? Items: [list the initiatives]" },
  { label: "What should happen now vs later?", template: "What should happen now vs later? We need to: [list the work items]" },
  { label: "How do we turn this into milestones?", template: "How do we turn this into milestones? Goal: [describe the goal]" },
  { label: "What is the clearest rollout plan?", template: "What is the clearest rollout plan for: [describe the feature or product]" },
  { label: "What dependencies could delay delivery?", template: "What dependencies could delay delivery of: [describe the project]" },
  { label: "What is the minimum viable launch?", template: "What is the minimum viable launch for: [describe the product]" },
  { label: "How do we avoid overbuilding?", template: "How do we avoid overbuilding? We're planning: [describe what you're building]" },
  { label: "What work belongs in phase one?", template: "What work belongs in phase one? Full vision: [describe the end state]" },
  { label: "How do we move from idea to execution?", template: "How do we move from idea to execution? Idea: [describe the idea]" },
];

const growth: PromptChip[] = [
  { label: "Why is this not converting?", template: "Why is this not converting? Context: [describe the page, flow, or offer]" },
  { label: "How can we improve activation?", template: "How can we improve activation for: [describe the product or onboarding]" },
  { label: "Where is the funnel leaking?", template: "Where is the funnel leaking? Funnel: [describe the steps]" },
  { label: "Which audience should we target first?", template: "Which audience should we target first? Product: [describe your product]" },
  { label: "How do we improve retention?", template: "How do we improve retention for: [describe the product and current retention]" },
  { label: "What is the strongest growth lever?", template: "What is the strongest growth lever for: [describe the product and stage]" },
  { label: "How should we position this?", template: "How should we position this? Product: [describe what you offer and for whom]" },
  { label: "What messaging would land better?", template: "What messaging would land better? Current pitch: [describe your current messaging]" },
  { label: "Which segment has the most upside?", template: "Which user segment has the most upside? We serve: [describe your user segments]" },
  { label: "How do we sharpen the value prop?", template: "How do we sharpen the value proposition for: [describe the product]" },
  { label: "How can we create a stronger flywheel?", template: "How can we create a stronger flywheel? Current model: [describe your growth model]" },
  { label: "What growth strategy fits this best?", template: "What growth strategy fits this product best? Product: [describe your product and stage]" },
];

const systems: PromptChip[] = [
  { label: "What are the hidden dependencies?", template: "What are the hidden dependencies in: [describe the system or project]" },
  { label: "What breaks if we scale this?", template: "What breaks if we scale this? Current design: [describe the system]" },
  { label: "What second-order effects are we missing?", template: "What second-order effects are we missing? We're planning to: [describe the change]" },
  { label: "Should we build, buy, or partner?", template: "Should we build, buy, or partner for: [describe the capability you need]" },
  { label: "What is the long-term tradeoff?", template: "What is the long-term tradeoff of: [describe the decision]" },
  { label: "How does this fit the bigger system?", template: "How does this fit the bigger system? Component: [describe the part and the whole]" },
  { label: "What would a more resilient design look like?", template: "What would a more resilient design look like for: [describe the system]" },
  { label: "Where are we optimizing locally but losing globally?", template: "Where are we optimizing locally but losing globally? Context: [describe the system]" },
  { label: "What happens if this succeeds at scale?", template: "What happens if this succeeds at scale? Plan: [describe what you're building]" },
  { label: "Where is complexity accumulating?", template: "Where is complexity accumulating in: [describe the system or product]" },
  { label: "What would first-principles thinking suggest?", template: "What would first-principles thinking suggest for: [describe the challenge]" },
  { label: "Which constraints should we embrace or remove?", template: "Which constraints should we embrace or remove? Constraints: [list them]" },
];

const debate: PromptChip[] = [
  { label: "Argue both sides of this decision", template: "Argue both sides of this decision: [describe the decision]" },
  { label: "What is the strongest case against this?", template: "What is the strongest case against: [describe the plan or idea]" },
  { label: "Challenge this strategy", template: "Challenge this strategy: [describe the strategy]" },
  { label: "What tradeoffs are we missing?", template: "What tradeoffs are we missing in: [describe the plan]" },
  { label: "Why might this fail?", template: "Why might this fail? Plan: [describe what you're proposing]" },
  { label: "Stress-test this recommendation", template: "Stress-test this recommendation: [describe the recommendation]" },
  { label: "What if our current plan is wrong?", template: "What if our current plan is wrong? Plan: [describe your plan]" },
  { label: "Where could this backfire?", template: "Where could this backfire? We're planning to: [describe the action]" },
  { label: "What assumptions deserve pushback?", template: "What assumptions deserve pushback in: [describe the proposal]" },
  { label: "What are we overconfident about?", template: "What are we overconfident about? Our belief: [describe your conviction]" },
  { label: "What is the strongest competing strategy?", template: "What is the strongest competing strategy to: [describe your current strategy]" },
  { label: "What could invalidate this thinking?", template: "What could invalidate this thinking? Thesis: [describe your thesis]" },
];

// ---------------------------------------------------------------------------
// Pool index + selection logic
// ---------------------------------------------------------------------------

/** All chip pools keyed by UI skill ID + "debate". */
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

/** Domain skill keys (everything except auto and debate). */
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
 * Returns a set of randomised prompt chips appropriate for the current mode.
 *
 * - **Auto**: picks chips from different random domains for breadth.
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
    // One chip from each of `count` randomly chosen domain pools → maximum diversity
    const domains = shuffle(DOMAIN_KEYS).slice(0, count);
    return domains.map((d) => pickOne(CHIP_POOLS[d]));
  }

  return shuffle(CHIP_POOLS[skill]).slice(0, count);
}
