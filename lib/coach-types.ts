export type SkillId =
  | "auto"
  | "advise-frameworks"
  | "discover-users"
  | "frame-problems"
  | "generate-ideas"
  | "validate-bets"
  | "ship-decisions"
  | "grow-product"
  | "think-systems"
  | "pm-debate";

export interface SkillMeta {
  label: string;
  description: string;
  placeholder: string;
  color: string;
}

/** Skill IDs that appear in the selector UI (excludes backend-only skills). */
export type SelectableSkillId = Exclude<SkillId, "advise-frameworks" | "pm-debate">;

/** Display-order list of selectable skills. */
export const SELECTABLE_SKILLS: SelectableSkillId[] = [
  "auto",
  "discover-users",
  "frame-problems",
  "generate-ideas",
  "validate-bets",
  "ship-decisions",
  "grow-product",
  "think-systems",
];

export const SKILL_META: Record<SelectableSkillId, SkillMeta> = {
  auto: {
    label: "Auto",
    description: "Routes to the right domain expert",
    placeholder: "Describe your idea, challenge, or decision...",
    color: "var(--color-accent)",
  },
  "discover-users": {
    label: "Research",
    description: "User Insights & Research (12 frameworks)",
    placeholder: "What topic, market, or user problem should we research?",
    color: "var(--color-cat-user-insights)",
  },
  "frame-problems": {
    label: "Problems",
    description: "Problem Framing & Definition (17 frameworks)",
    placeholder: "Describe the issue, friction, or drop-off you're seeing...",
    color: "var(--color-cat-problem-framing)",
  },
  "generate-ideas": {
    label: "Ideas",
    description: "Ideation & Concept Design (14 frameworks)",
    placeholder: "What are you trying to improve, create, or redesign?",
    color: "var(--color-cat-ideation)",
  },
  "validate-bets": {
    label: "Validate",
    description: "Validation & Testing (14 frameworks)",
    placeholder: "What idea or assumption would you like to test?",
    color: "var(--color-cat-validation)",
  },
  "ship-decisions": {
    label: "Ship",
    description: "Execution, Prioritization & Delivery (15 frameworks)",
    placeholder: "What are you planning, launching, or delivering?",
    color: "var(--color-cat-execution)",
  },
  "grow-product": {
    label: "Growth",
    description: "Growth, Positioning & Market Strategy (15 frameworks)",
    placeholder: "What funnel, audience, or adoption problem are you facing?",
    color: "var(--color-cat-growth)",
  },
  "think-systems": {
    label: "Systems",
    description: "Systems Thinking & Strategic Architecture (12 frameworks)",
    placeholder: "What system, constraint, or tradeoff are you thinking through?",
    color: "var(--color-cat-systems-thinking)",
  },
};

/** The 7 domain expert skills (no "auto", no "advise-frameworks"). */
export const DOMAIN_SKILLS: SelectableSkillId[] = SELECTABLE_SKILLS.filter(
  (s) => s !== "auto"
);

/** Maps UI skill selection to the API skill identifier. */
export function resolveSkillForApi(skillId: SelectableSkillId): string {
  if (skillId === "auto") return "advise-frameworks";
  return skillId;
}

/** Builds the message text with --skills/--versus prefix for debate mode. */
export function buildDebateMessage(
  text: string,
  skills: SelectableSkillId[]
): string {
  if (skills.length === 0) return text;
  if (skills.length === 2) return `--versus ${skills.join(",")} ${text}`;
  return `--skills ${skills.join(",")} ${text}`;
}

export type CoachMode = "single" | "debate";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  skill?: SkillId;
  isDebate?: boolean;
  timestamp: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  sizeBytes: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: CoachMode;
  selectedSkills: SkillId[];
  createdAt: number;
  updatedAt: number;
}
