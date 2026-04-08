export type SkillId =
  | "auto"
  | "advise-frameworks"
  | "discover-users"
  | "frame-problems"
  | "generate-ideas"
  | "validate-bets"
  | "ship-decisions"
  | "grow-product"
  | "think-systems";

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
