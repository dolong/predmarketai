// Core data types for the predictive markets dashboard

export type QuestionState =
  | 'draft'
  | 'awaiting_review'
  | 'published'
  | 'answering_closed'
  | 'awaiting_resolution'
  | 'resolved'
  | 'invalid'
  | 'paused';

export type ReviewStatus = 'pending' | 'approved' | 'revision_requested';

export type Outcome = 'YES' | 'NO' | 'INVALID';

// Sources removed - questions now only come from AI Agents

export type QuestionType = 'binary' | 'multi-option';

export interface ProposedQuestion {
  id: string;
  title: string;
  description: string;
  liveDate: Date;
  proposedAnswerEndAt: Date;
  proposedSettlementAt: Date;
  resolutionCriteria: string;
  agentId: string;
  aiScore: number;
  riskFlags: string[];
  createdAt: Date;
  categories: string[];
  type?: QuestionType;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  state: QuestionState;
  liveDate?: Date;
  answerEndAt: Date;
  settlementAt: Date;
  resolutionCriteria: string;
  categories: string[];
  topic?: string;
  agentId: string;
  reviewStatus?: ReviewStatus;
  outcome?: Outcome;
  outcomeEvidence?: string[];
  answerCount: number;
  createdAt: Date;
  updatedAt: Date;
  assignee?: string;
  type?: string;
  tags?: string[];
  poolSize?: {
    total: number;
    yes: number;
    no: number;
  };
  createdBy?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  questionTitle: string;
  userId: string;
  userName: string;
  choice: 'YES' | 'NO';
  confidence: number;
  placedAt: Date;
  channel: string;
}

export interface KPIStat {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

// ConnectorHealth removed - no longer needed without sources

export interface AuditEvent {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
}

// AI Agent Types
export type AgentSourceType = 
  | 'website' 
  | 'api' 
  | 'x' 
  | 'reddit' 
  | 'feed';

export type AgentFrequency = 
  | 'daily' 
  | 'on_update' 
  | 'weekly';

export interface AgentSource {
  type: AgentSourceType;
  config: {
    url?: string;
    subreddit?: string;
    apiEndpoint?: string;
    feedUrl?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  sources: AgentSource[];
  questionPrompt: string;
  resolutionPrompt: string;
  frequency: AgentFrequency;
  status: 'active' | 'paused' | 'error';
  questionsCreated: number;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
}