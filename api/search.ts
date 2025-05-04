import type { VercelRequest, VercelResponse } from '@vercel/node';
import { QdrantClient } from '@qdrant/js-client-rest';

// Constants
const COLLECTION_NAME = "new_journal_chunks";

// Validate environment variables
const QDRANT_URL = process.env.QDRANT_CLOUD_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

if (!QDRANT_URL || !QDRANT_API_KEY) {
  console.error('Missing required environment variables:');
  console.error('QDRANT_CLOUD_URL:', QDRANT_URL ? '✓' : '✗');
  console.error('QDRANT_API_KEY:', QDRANT_API_KEY ? '✓' : '✗');
  throw new Error('Missing required environment variables');
}

// Ensure the URL is properly formatted
if (!QDRANT_URL.startsWith('http://') && !QDRANT_URL.startsWith('https://')) {
  throw new Error('QDRANT_CLOUD_URL must start with http:// or https://');
}

console.log('Initializing Qdrant client with URL:', QDRANT_URL);

// Initialize Qdrant client
const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

// Test the connection
async function testQdrantConnection() {
  try {
    const collections = await qdrant.getCollections();
    console.log('Successfully connected to Qdrant. Available collections:', collections);
    return true;
  } catch (error) {
    console.error('Failed to connect to Qdrant:', error);
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Test connection when handling first request
  const isConnected = await testQdrantConnection();
  if (!isConnected) {
    return res.status(500).json({ 
      error: 'Failed to connect to Qdrant',
      message: 'Could not establish connection to Qdrant service'
    });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vector, limit = 10, filter } = req.body;

    if (!vector || !Array.isArray(vector)) {
      return res.status(400).json({ error: 'Invalid vector format' });
    }

    const searchParams = {
      vector,
      limit,
      with_payload: true,
      with_vector: false,
      ...(filter ? { filter } : {})
    };

    console.log('Search params:', JSON.stringify(searchParams["filter"], null, 2));
    const searchResults = await qdrant.search(COLLECTION_NAME, searchParams);

    console.log(`Search successful. Found ${searchResults.length} results`);
    // console.log('SEARCH RESULTS: ', searchResults)
    res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Error && 'data' in error) {
      console.error('Detailed error data:', (error as any).data);
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error && 'data' in error ? (error as any).data : undefined,
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    });
  }
}
