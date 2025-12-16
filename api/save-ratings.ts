import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RatingInput {
  questionId: string;
  rating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'S';
  ratingCategory?: string;
  confidence?: number;
  sparkline?: number[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ratings } = req.body as { ratings: RatingInput[] };

    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'Invalid ratings array' });
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const rating of ratings) {
      try {
        // Validate required fields
        if (!rating.questionId || !rating.rating) {
          failed++;
          errors.push(`Missing required fields for question ${rating.questionId}`);
          continue;
        }

        const now = new Date().toISOString();

        // Check if rating exists
        const { data: existing } = await supabase
          .from('nova_ratings')
          .select('id')
          .eq('question_id', rating.questionId)
          .single();

        if (existing) {
          // Update existing rating
          const { error } = await supabase
            .from('nova_ratings')
            .update({
              rating: rating.rating,
              rating_category: rating.ratingCategory,
              confidence: rating.confidence,
              sparkline: rating.sparkline || [],
              updated_at: now,
            })
            .eq('question_id', rating.questionId);

          if (error) {
            failed++;
            errors.push(`Error updating rating for ${rating.questionId}: ${error.message}`);
          } else {
            success++;
          }
        } else {
          // Create new rating
          const { error } = await supabase
            .from('nova_ratings')
            .insert({
              question_id: rating.questionId,
              rating: rating.rating,
              rating_category: rating.ratingCategory,
              confidence: rating.confidence,
              sparkline: rating.sparkline || [],
              created_at: now,
              updated_at: now,
            });

          if (error) {
            failed++;
            errors.push(`Error creating rating for ${rating.questionId}: ${error.message}`);
          } else {
            success++;
          }
        }
      } catch (error) {
        failed++;
        errors.push(`Exception processing ${rating.questionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.status(200).json({
      success,
      failed,
      total: ratings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error saving ratings:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
