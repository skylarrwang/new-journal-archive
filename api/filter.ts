import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for backend
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dateRange, authors } = req.body;

  let query = supabase.from('articles').select('*');

  // Date range filter
  if (dateRange?.startDate) {
    query = query.gte('publication_date', dateRange.startDate);
  }
  if (dateRange?.endDate) {
    query = query.lte('publication_date', dateRange.endDate);
  }

  // Author filter
  if (authors && authors.length > 0) {
    query = query.in('author', authors);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ articles: data });
}
