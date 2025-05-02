export interface MagazineEntry {
  pub_date: string;      // "MM/YY" format
  link_to_pdf: string;   // PDF link
  volume: number;        // number
  issue: number;         // number
  author: string;
  title: string;
  page: number;         // number
  id?: string;          // optional
  text: string;
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
