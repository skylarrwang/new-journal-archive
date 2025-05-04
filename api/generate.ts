import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini in the backend
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Use the correct model name
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function to clean markdown JSON
function cleanJsonString(text: string): string {
  try {
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    return text.trim();
  } catch (error) {
    console.error('Error cleaning JSON string:', error);
    throw new Error('Failed to clean JSON string');
  }
}

// Helper function to validate response format
function validateResponseFormat(parsedJson: any): boolean {
  return (
    typeof parsedJson === 'object' &&
    'answer' in parsedJson &&
    typeof parsedJson.answer === 'string' &&
    'citations' in parsedJson &&
    Array.isArray(parsedJson.citations) &&
    parsedJson.citations.every((citation: any) =>
      typeof citation === 'object' &&
      'citation_number' in citation &&
      'text' in citation &&
      'source_index' in citation
    )
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // console.log('Generating content with prompt:', prompt.substring(0, 100) + '...');

    // Add safety settings if needed
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const response = await result.response;
    const rawText = response.text();
    //console.log('Raw response from Gemini:', rawText);

    // Clean the response text
    const cleanedJson = cleanJsonString(rawText);
    // console.log('Cleaned JSON string:', cleanedJson);

    try {
      const parsedJson = JSON.parse(cleanedJson);
      
      // Validate the response format
      if (!validateResponseFormat(parsedJson)) {
        console.error('Invalid response format:', parsedJson);
        return res.status(500).json({
          error: 'Invalid response format',
          message: 'The model response did not match the expected format',
          rawResponse: rawText
        });
      }

      res.json({ text: cleanedJson });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed to parse text:', cleanedJson);
      return res.status(500).json({
        error: 'JSON parsing error',
        message: 'Failed to parse model response as JSON',
        rawResponse: rawText,
        cleanedResponse: cleanedJson
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    console.error('Full error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
  }
}
