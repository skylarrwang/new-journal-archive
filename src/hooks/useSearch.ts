import { useState } from 'react';
import { searchQdrant, SearchResult } from '../services/qdrantService';

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchQdrant(query);
      setResults(searchResults);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    search,
  };
}; 