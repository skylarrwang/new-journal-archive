import { MagazineEntry, SearchFilters } from '../types/magazine.ts';

const API_URL = '/api';

export interface SearchResult {
  score: number;
  payload: MagazineEntry & {
    text: string;
  };
}

function isValidPayload(payload: any): payload is SearchResult['payload'] {
  return (
    typeof payload === 'object' &&
    typeof payload.pub_date === 'string' &&
    typeof payload.link_to_pdf === 'string' &&
    typeof payload.volume === 'string' &&
    typeof payload.issue === 'string' &&
    typeof payload.author === 'string' &&
    typeof payload.title === 'string' &&
    typeof payload.page === 'string' &&
    (!('id' in payload) || typeof payload.id === 'number') &&
    typeof payload.text === 'string'
  );
}

// Update these interfaces to match the ones in search.ts
interface MatchCondition {
  key: string;
  match: {
    any?: string[];
    value?: string | number;
  };
}

interface RangeCondition {
  key: string;
  range: {
    gt?: string | number;
    gte?: string | number;
    lt?: string | number;
    lte?: string | number;
  };
}

interface Filter {
  must?: (MatchCondition | RangeCondition)[];
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${API_URL}/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`Embedding error! status: ${response.status}`);
  }

  const { embedding } = await response.json();
  return embedding;
}

export const searchQdrant = async (query: string, filters?: SearchFilters, limit: number = 50): Promise<SearchResult[]> => {
  try {
    console.log('Starting search with query:', query);
    
    // Get embedding from backend
    const queryEmbedding = await getEmbedding(query);
    console.log('Query embedding received from backend');

    console.log('Fetching search results');
    const built_filter = buildFilter(filters);
    console.log("AFTER BUILDING FILTERS: ", built_filter)

    const requestBody: any = {
      vector: queryEmbedding,
      limit,
      ...(built_filter ? { filter: built_filter } : {})
    };

    console.log("REQUEST BODY: ", requestBody)
    const response = await fetch(`${API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const searchResults = await response.json();
    
    console.log("SEARCH RESULTS SCORE AND PAYLOAD: ", searchResults[0].score, searchResults[0].payload);
    return searchResults
      .filter(result => isValidPayload(result.payload))
      .map(result => ({
        score: result.score,
        payload: result.payload as unknown as MagazineEntry & { text: string }
      }));
  } catch (error) {
    //console.log("REACHING HERE!!!")
    console.error('Error searching:', error);
    throw error;
  }
};

function buildFilter(filters: SearchFilters): Filter | undefined {
  if (!filters) return undefined;
  
  const must: (MatchCondition | RangeCondition)[] = [];

  // Handle date range
  if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
    const rangeCondition: RangeCondition = {
      key: "pub_date",
      range: {}
    };
    
    if (filters.dateRange.startDate) {
      rangeCondition.range.gte = toShortYear(filters.dateRange.startDate);
      console.log("START DATE AFTER CONVERTING: ", rangeCondition.range.gte)
    }
    if (filters.dateRange.endDate) {
      rangeCondition.range.lte = toShortYear(filters.dateRange.endDate);
      console.log("END DATE AFTER CONVERTING: ", rangeCondition.range.lte)
    }
    
    must.push(rangeCondition);
  }

  // Handle authors
  if (filters.authors && filters.authors.length > 0) {
    const matchCondition: MatchCondition = {
      key: "author",
      match: {
        any: filters.authors
      }
    };
    must.push(matchCondition);
  }
  console.log("RETURNED FILTERS: ", must)
  return must.length > 0 ? { must } : undefined;
}

function toShortYear(dateStr: string): string {
  // Expects MM/YY or MM/YYYY, returns YYYY-MM-DD with zero-padded month
  const [month, yearRaw] = dateStr.split('/');
  if (!month || !yearRaw) return dateStr;

  let year = yearRaw;
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    if (yearNum > 25) {
      year = `19${year}`;
    } else {
      year = `20${year.padStart(2, '0')}`;
    }
  }
  return `${year}-${month.padStart(2, '0')}-01`;
}