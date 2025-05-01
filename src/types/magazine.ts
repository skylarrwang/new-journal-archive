
export interface MagazineEntry {
  pub_date: string; // "MM/YY" format
  link_to_pdf: string;
  volume: number;
  issue: number;
  author: string;
  title: string;
  page: number;
  id?: string; // Unique identifier for each entry
}

export interface RAGChunk {
  text: string;
  metadata: {
    source: MagazineEntry;
  };
}

export interface RAGResponse {
  answer: string;
  citations: Array<{
    text: string;
    source: MagazineEntry;
  }>;
}

export interface SearchFilters {
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  authors?: string[];
}
