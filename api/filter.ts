import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for backend
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function toDateString(date: string): string | null {
  // Accepts 'YYYY-MM-DD', 'YYYY-MM', 'MM/YYYY', etc. and returns 'YYYY-MM-DD' or null
  if (!date) return null;
  // If already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // If in MM/YYYY
  if (/^\d{2}\/\d{4}$/.test(date)) {
    const [mm, yyyy] = date.split('/');
    return `${yyyy}-${mm}-01`;
  }
  // If in YYYY-MM
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`;
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dateRange, authors } = req.body;

  let query = supabase.from('articles').select('*');

  console.log('In filter.ts, dateRange:', dateRange);
  // Date range filter
  if (dateRange?.startDate) {
    const startDate = toDateString(dateRange.startDate);
    if (startDate) query = query.gte('publication_date', startDate);
  }
  if (dateRange?.endDate) {
    const endDate = toDateString(dateRange.endDate);
    if (endDate) query = query.lte('publication_date', endDate);
  }

  // Author filter
  if (authors && authors.length > 0) {
    query = query.in('author', authors);
  }

  console.log('In filter.ts, query:', query);
  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ articles: data });
}
