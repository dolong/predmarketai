import { createClient } from '@supabase/supabase-js';
import { Agent, Question } from './types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to convert database agent to our Agent type
function convertDbAgent(dbAgent: any): Agent {
  return {
    id: dbAgent.id,
    name: dbAgent.name,
    description: dbAgent.description || '',
    categories: dbAgent.categories || [],
    sources: dbAgent.agent_sources?.map((source: any) => ({
      type: source.type,
      config: {
        url: source.config_url,
        subreddit: source.config_subreddit,
        apiEndpoint: source.config_api_endpoint,
        feedUrl: source.config_feed_url,
      },
    })) || [],
    questionPrompt: dbAgent.question_prompt,
    resolutionPrompt: dbAgent.resolution_prompt,
    baseModel: dbAgent.base_model,
    frequency: dbAgent.frequency,
    status: dbAgent.status,
    questionsCreated: dbAgent.questions_created,
    lastRun: dbAgent.last_run ? new Date(dbAgent.last_run) : undefined,
    nextRun: dbAgent.next_run ? new Date(dbAgent.next_run) : undefined,
    createdAt: new Date(dbAgent.created_at),
    updatedAt: new Date(dbAgent.updated_at),
  };
}

// Helper function to convert database question to our Question type
function convertDbQuestion(dbQuestion: any): Question {
  return {
    id: dbQuestion.id,
    title: dbQuestion.title,
    description: dbQuestion.description || '',
    state: dbQuestion.state,
    liveDate: dbQuestion.live_date ? new Date(dbQuestion.live_date) : undefined,
    answerEndAt: new Date(dbQuestion.answer_end_at),
    settlementAt: new Date(dbQuestion.settlement_at),
    resolutionCriteria: dbQuestion.resolution_criteria,
    agentId: dbQuestion.agent_id,
    reviewStatus: dbQuestion.review_status,
    outcome: dbQuestion.outcome,
    aiScore: dbQuestion.ai_score ? parseFloat(dbQuestion.ai_score) : undefined,
    riskFlags: [],
    categories: [],
    type: dbQuestion.type || 'binary',
    poolTotal: dbQuestion.pool_total ? parseFloat(dbQuestion.pool_total) : 0,
    poolYes: dbQuestion.pool_yes ? parseFloat(dbQuestion.pool_yes) : 0,
    poolNo: dbQuestion.pool_no ? parseFloat(dbQuestion.pool_no) : 0,
    answerCount: dbQuestion.answer_count || 0,
    createdAt: new Date(dbQuestion.created_at),
    updatedAt: new Date(dbQuestion.updated_at),
  };
}

export const agentsApi = {
  async getAgents(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          agent_sources (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return (data || []).map(convertDbAgent);
    } catch (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
  },

  async getAgent(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          agent_sources (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agent:', error);
        return null;
      }

      return data ? convertDbAgent(data) : null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  },
};

export const questionsApi = {
  async createQuestion(question: Partial<Question>): Promise<Question | null> {
    try {
      // Generate a unique ID for the question
      const questionId = question.id || crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('questions')
        .insert({
          id: questionId,
          title: question.title,
          description: question.description,
          state: question.state || 'pending',
          live_date: question.liveDate?.toISOString(),
          answer_end_at: question.answerEndAt?.toISOString(),
          settlement_at: question.settlementAt?.toISOString(),
          resolution_criteria: question.resolutionCriteria,
          agent_id: question.agentId,
          ai_score: question.aiScore,
          type: question.type || 'binary',
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating question:', error);
        return null;
      }

      return data ? convertDbQuestion(data) : null;
    } catch (error) {
      console.error('Error creating question:', error);
      return null;
    }
  },

  async getQuestions(): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      return (data || []).map(convertDbQuestion);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  async getQuestionsByAgent(agentId: string): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions by agent:', error);
        return [];
      }

      return (data || []).map(convertDbQuestion);
    } catch (error) {
      console.error('Error fetching questions by agent:', error);
      return [];
    }
  },

  async getQuestion(id: string): Promise<Question | null> {
    try {
      const { data, error} = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching question:', error);
        return null;
      }

      return data ? convertDbQuestion(data) : null;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  },
};
