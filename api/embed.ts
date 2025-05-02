import type { VercelRequest, VercelResponse } from '@vercel/node';

let embedder: any = null;

async function initializeEmbedder() {
  if (!embedder) {
    console.log('Initializing embedder on server');
    const { pipeline } = await import('@xenova/transformers');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedder initialized on server');
  }
  return embedder;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid input: text is required' });
    }

    console.log('Initializing embedder...');
    const embedder = await initializeEmbedder();
    console.log('Embedder initialized, generating embedding...');
    
    const output = await embedder(text, {
      pooling: 'mean',
      normalize: true
    });

    console.log('Embedding generated');
    const embedding = Array.from(output.data);
    res.json({ embedding });
  } catch (error) {
    console.error('Detailed embedding error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
