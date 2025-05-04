import { MagazineEntry, RAGResponse, SearchFilters } from "../types/magazine.ts";
import { searchQdrant } from './qdrantService.ts';

// Mock data for development
const mockMagazineEntries: MagazineEntry[] = [
  {
    pub_date: "09/1990",
    link_to_pdf: "https://drive.google.com/file/d/1wBYZbK0w6qnJuTS5itZ_oYx9B6-qRDO6/view?usp=sharing",
    volume: 23,
    issue: 1,
    author: "Motoko Rich",
    title: "High Stakes in a House Divided",
    page: 10,
    id: "1",
    text: ""
  },
  {
    pub_date: "02/1975",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 8,
    issue: 4,
    author: "Jem Winer",
    title: "The Experience of Directing",
    page: 12,
    id: "2",
    text: ""
  },
  {
    pub_date: "09/2020",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 1,
    issue: 3,
    author: "Alice Johnson",
    title: "Art Education",
    page: 23,
    id: "3",
    text: "This is a test text"
  },
  {
    pub_date: "01/1987",
    link_to_pdf: "https://drive.google.com/file/d/1pjA-UMHkbtwgwjAaOdKk4b_B3w65V7hH/view?usp=sharing",
    volume: 19,
    issue: 4,
    author: "Jennifer Fleissner",
    title: "Not For Women Only",
    page: 12,
    id: "4",
    text: ""
  },
  {
    pub_date: "01/2012",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 44,
    issue: 3,
    author: "Aaron Gertler",
    title: "Secrets Are No Fun",
    page: 12,
    id: "5",
    text: ""
  },
  {
    pub_date: "12/1981",
    link_to_pdf: "https://drive.google.com/file/d/1wKC2wzhekwsboL5c-Hgw1RVcnb4Ht7zB/view?usp=sharing",
    volume: 14,
    issue: 3,
    author: "Timothy B. Safford",
    title: "Confessions of a divinity student",
    page: 12,
    id: "6",
    text: ""
  },
  {
    pub_date: "03/24",
    link_to_pdf: "https://drive.google.com/file/d/1oKAZ0rIWsdiP5OM0vGMsRA5d7XbfUYyb/view?usp=sharing",
    volume: 56,
    issue: 4,
    author: "Ai-Li Hollander",
    title: "Tax Break",
    page: 43,
    id: "7",
    text: ""
  }
];

// search by filters with NO QUERY
export const searchByFiltersNoQuery = async (filters?: SearchFilters): Promise<MagazineEntry[]> => {
  console.log('In searchByFiltersNoQuery, filters:', filters);
  // check if filters are empty
  if (!filters || Object.keys(filters).length === 0) return mockMagazineEntries;
  try {
    const response = await fetch('/api/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {})
    });

    if (!response.ok) {
      console.error('Error searching articles:', await response.text());
      return [];
    }

    const { articles } = await response.json();
    // convert YYYY-MM-01 to MM/YYYY
    const formattedArticles = articles.map(article => {
      // Ensure publication_date is a string and in the expected format
      const [year, month] = article.publication_date.split('-');
      return {
        ...article,
        publication_date: `${month}/${year}`,
      };
    });
    return formattedArticles.map(article => ({
      pub_date: article.publication_date,
      link_to_pdf: article.pdf_link,
      volume: article.volume,
      issue: article.issue,
      author: article.author,
      title: article.title,
      page: article.page ?? 0,
      id: article.id ?? "",
      text: ""
    }));
  } catch (error) {
    console.error('Error in searchByFiltersNoQuery:', error);
    return [];
  }
};

export const generateRAGResponse = async (query: string, filters?: SearchFilters): Promise<RAGResponse> => {
  try {
    console.log('Starting generateRAGResponse with query:', query);
    
    const searchResults = await searchQdrant(query, filters);
    console.log('Search results received:', searchResults);
    
    if (searchResults.length === 0) {
      return {
        answer: "No relevant content found in the archive for your query.",
        citations: []
      };
    }

    const context = searchResults.map((result, index) => {
      return `[${index + 1}] From "${result.payload.title}" (${result.payload.pub_date}): ${result.payload.text}`;
    }).join('\n\n');

    const prompt = `
    Question: ${query}
    
    Context from The New Journal Archive:
    ${context}

    Instructions:
    1. You can draw from both the provided context and your general knowledge to provide comprehensive answers.
    2. When discussing specific information from The New Journal Archive, you MUST cite the sources using [1], [2], etc., corresponding to the numbered context passages above.
    3. You may incorporate general knowledge or broader context, but clearly distinguish between what comes from The New Journal Archive (with citations) and what is general knowledge.
    4. Be specific about which parts of your answer come from the archive versus general knowledge.
    5. IMPORTANT: Respond with ONLY raw JSON, no markdown formatting, no code blocks. The response must be a valid JSON object in this exact structure:
    {
      "answer": "Your detailed answer that uses citations [1], [2] etc. when referencing archive content, clearly indicates general context, and weaves together archive citations and general knowledge naturally",
      "citations": [
        {
          "citation_number": 1,
          "text": "The exact quote from the archive that supports your point",
          "source_index": 0
        }
      ]
    }`;

    // Call backend API instead of Gemini directly
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const { text } = await response.json();
    const parsedResponse = JSON.parse(text);

    return {
      answer: parsedResponse.answer,
      citations: parsedResponse.citations.map(citation => ({
        text: citation.text,
        source: searchResults[citation.source_index].payload
      }))
    };
  } catch (error) {
    console.error('Error in generateRAGResponse:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate response');
  }
};

// Convert Google Drive link to embedded viewer URL
export const getEmbedUrl = (driveLink: string): string => {
  // Extract the file ID from a Google Drive link
  const fileIdMatch = driveLink.match(/\/d\/([^/]+)/);
  if (!fileIdMatch || !fileIdMatch[1]) return "";
  
  const fileId = fileIdMatch[1];
  return `https://drive.google.com/file/d/${fileId}/preview`;
};
