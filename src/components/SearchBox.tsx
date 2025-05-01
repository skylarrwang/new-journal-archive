
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <div className="relative flex-grow">
          <Input
            className="avant-input w-full h-14 text-lg pl-12 font-sans"
            placeholder="Search the school magazine archive..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-avant-medium-gray" />
          </div>
        </div>
        <Button 
          type="submit"
          className="avant-btn h-14 px-6 ml-[-1px]"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBox;
