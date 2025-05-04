import React, { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import FilterOptions from '@/components/FilterOptions';
import DocumentList from '@/components/DocumentList';
import RAGResults from '@/components/RAGResults';
import PDFViewer from '@/components/PDFViewer';
import LoadingState from '@/components/LoadingState';
import { MagazineEntry, RAGResponse, SearchFilters } from '@/types/magazine';
import { generateRAGResponse, searchByFiltersNoQuery } from '@/services/magazineService';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<MagazineEntry[]>([]);
  const [ragResponse, setRagResponse] = useState<RAGResponse | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<MagazineEntry | null>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search with query (RAG)
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If query is empty, treat as filter-only search
      handleFilter(currentFilters);
      return;
    }

    setIsLoading(true);
    setRagResponse(null);
    setDocuments([]);
    setHasSearched(true);

    try {
      console.log('Generating RAG response for query:', query);
      const response = await generateRAGResponse(query, currentFilters);
      setRagResponse(response);
      
      // Select the first document from citations if available
      if (response.citations.length > 0) {
        setSelectedDocument(response.citations[0].source);
      }
    } catch (error) {
      console.error('Index.tsx: Error performing RAG search:', error);
      // Show error state to user
      setRagResponse({
        answer: "Sorry, there was an error processing your request. Please try again.",
        citations: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter-only search
  const handleFilter = async (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setIsLoading(true);
    setRagResponse(null);
    setDocuments([]);
    setHasSearched(true);

    try {
      const results = await searchByFiltersNoQuery(filters);
      // print the dates
      console.log("DATES: ", results.map(result => result.pub_date));
      setDocuments(results);
      
      // Select the first document if available
      if (results.length > 0) {
        setSelectedDocument(results[0]);
      } else {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Error searching by filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document selection
  const handleSelectDocument = (document: MagazineEntry) => {
    setSelectedDocument(document);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-16 pb-10 px-4 text-center">
        <h1 className="avant-heading mb-2">THE NEW JOURNAL ARCHIVE SEARCH</h1>
        <p className="avant-subheading text-avant-medium-gray max-w-xl mx-auto">
          Ask a question or search the archive of The New Journal
        </p>
      </header>

      {/* Search Interface */}
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <SearchBox onSearch={handleSearch} hasSearched={hasSearched} />
          <FilterOptions onFilter={handleFilter} />
        </div>

        <Separator className="my-8 bg-avant-black" />

        {/* Results Area */}
        {!hasSearched ? (
          <div className="text-center py-16">
            <p className="text-avant-medium-gray text-lg">
              Start by searching or applying filters to explore the magazine archive
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
            {/* Left Column: Results */}
            <div className="space-y-6">
              <h2 className="avant-subheading flex items-center">
                <span>Results</span>
                {isLoading && (
                  <span className="ml-2 inline-flex items-center text-avant-medium-gray animate-pulse-slow">
                    <span className="ml-2 text-sm">Generating response...</span>
                  </span>
                )}
              </h2>
              
              {isLoading ? (
                <div className="animate-fade-in">
                  <LoadingState />
                </div>
              ) : ragResponse ? (
                <div className="animate-fade-in">
                  <RAGResults response={ragResponse} onSelectDocument={handleSelectDocument} />
                </div>
              ) : documents.length > 0 ? (
                <div className="animate-fade-in">
                  <DocumentList documents={documents} onSelectDocument={handleSelectDocument} />
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <p className="text-avant-medium-gray">No results found</p>
                </div>
              )}
            </div>

            {/* Right Column: PDF Viewer */}
            <div className="space-y-6 h-[700px] lg:sticky lg:top-10">
              <h2 className="avant-subheading">Document Viewer</h2>
              <div className="h-[calc(100%-2.5rem)]">
                <PDFViewer document={selectedDocument} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
