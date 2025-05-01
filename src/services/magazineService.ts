
import { MagazineEntry, RAGResponse, SearchFilters } from "@/types/magazine";

// Mock data for development
const mockMagazineEntries: MagazineEntry[] = [
  {
    pub_date: "01/20",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 1,
    issue: 1,
    author: "Jane Smith",
    title: "The Future of Education",
    page: 12,
    id: "1"
  },
  {
    pub_date: "05/20",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 1,
    issue: 2,
    author: "John Doe",
    title: "Technology in Schools",
    page: 5,
    id: "2"
  },
  {
    pub_date: "09/20",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 1,
    issue: 3,
    author: "Alice Johnson",
    title: "Art Education",
    page: 23,
    id: "3"
  },
  {
    pub_date: "01/21",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 2,
    issue: 1,
    author: "Mark Williams",
    title: "Sports in Curriculum",
    page: 8,
    id: "4"
  },
  {
    pub_date: "05/21",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 2,
    issue: 2,
    author: "Sarah Brown",
    title: "Reading Habits",
    page: 15,
    id: "5"
  },
  {
    pub_date: "09/21",
    link_to_pdf: "https://drive.google.com/file/d/15iIvy4_WwmTmY3Cl1vOPaqPZjxqaBogH/view?usp=sharing",
    volume: 2,
    issue: 3,
    author: "James Wilson",
    title: "Digital Literacy",
    page: 32,
    id: "6"
  }
];

// Parse date string in MM/YY format into a Date object
const parseDate = (dateStr: string): Date => {
  const [month, year] = dateStr.split('/');
  return new Date(2000 + parseInt(year), parseInt(month) - 1);
};

// Filter entries based on search criteria
const filterEntries = (filters?: SearchFilters): MagazineEntry[] => {
  if (!filters) return mockMagazineEntries;
  
  return mockMagazineEntries.filter(entry => {
    // Filter by date range
    if (filters.dateRange) {
      const entryDate = parseDate(entry.pub_date);
      if (filters.dateRange.startDate) {
        const startDate = parseDate(filters.dateRange.startDate);
        if (entryDate < startDate) return false;
      }
      if (filters.dateRange.endDate) {
        const endDate = parseDate(filters.dateRange.endDate);
        if (entryDate > endDate) return false;
      }
    }
    
    // Filter by authors
    if (filters.authors && filters.authors.length > 0) {
      if (!filters.authors.includes(entry.author)) return false;
    }
    
    return true;
  });
};

// Mock RAG response
const mockRagResponse: RAGResponse = {
  answer: "The school magazine has covered various educational topics including technology integration in schools, digital literacy, and the future of education. There has been significant discussion about how technology is changing traditional learning environments and the importance of developing digital literacy skills for students. Authors have explored both the benefits and challenges of educational technology.",
  citations: [
    {
      text: "Technology is transforming education by providing new tools for interactive learning.",
      source: mockMagazineEntries[1]
    },
    {
      text: "Digital literacy has become an essential skill for students in the modern educational landscape.",
      source: mockMagazineEntries[5]
    },
    {
      text: "Future educational models will likely blend traditional methods with technology-enhanced approaches.",
      source: mockMagazineEntries[0]
    }
  ]
};

// Get all unique authors from the dataset
export const getAllAuthors = (): string[] => {
  const authors = new Set<string>();
  mockMagazineEntries.forEach(entry => authors.add(entry.author));
  return Array.from(authors);
};

// Get date range of the dataset
export const getDateRange = (): { earliest: string; latest: string } => {
  let earliestDate = parseDate(mockMagazineEntries[0].pub_date);
  let latestDate = parseDate(mockMagazineEntries[0].pub_date);
  
  mockMagazineEntries.forEach(entry => {
    const entryDate = parseDate(entry.pub_date);
    if (entryDate < earliestDate) earliestDate = entryDate;
    if (entryDate > latestDate) latestDate = entryDate;
  });
  
  return {
    earliest: `${String(earliestDate.getMonth() + 1).padStart(2, '0')}/${String(earliestDate.getFullYear() - 2000).padStart(2, '0')}`,
    latest: `${String(latestDate.getMonth() + 1).padStart(2, '0')}/${String(latestDate.getFullYear() - 2000).padStart(2, '0')}`
  };
};

// Simulates a search with filters only (no RAG)
export const searchByFilters = async (filters?: SearchFilters): Promise<MagazineEntry[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return filterEntries(filters);
};

// Simulates a RAG query
export const performRagSearch = async (query: string, filters?: SearchFilters): Promise<RAGResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real implementation, this would:
  // 1. Calculate embedding for query
  // 2. Query Qdrant Cloud with the embedding and filters
  // 3. Get relevant chunks
  // 4. Call Gemini API with these chunks
  // 5. Return formatted response with citations
  
  return mockRagResponse;
};

// Convert Google Drive link to embedded viewer URL
export const getEmbedUrl = (driveLink: string): string => {
  // Extract the file ID from a Google Drive link
  const fileIdMatch = driveLink.match(/\/d\/([^/]+)/);
  if (!fileIdMatch || !fileIdMatch[1]) return "";
  
  const fileId = fileIdMatch[1];
  return `https://drive.google.com/file/d/${fileId}/preview`;
};
