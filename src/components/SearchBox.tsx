import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  hasSearched?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, hasSearched = false }) => {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [currentExample, setCurrentExample] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);
  const isDeleting = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const examples = [
    "What have Yale students protested?",
    "Show me articles about the Urban Debate League.",
    "Tell me about some plays and performances at Yale.",
    "What's been written about the Yale Dramatic Association?"
  ];

  // Type and delete animation
  useEffect(() => {
    // Don't run if we've searched or input is focused
    if (hasSearched || isFocused) {
      isTyping.current = false;
      setPlaceholder('');
      return;
    }

    const currentText = examples[currentExample];
    
    const animatePlaceholder = () => {
      // Don't continue if we've searched or input is focused
      if (hasSearched || isFocused) return;

      if (!isDeleting.current) {
        // Typing animation - make it extremely fast
        if (placeholder.length < currentText.length) {
          setPlaceholder(currentText.slice(0, placeholder.length + 1));
          timeoutRef.current = setTimeout(animatePlaceholder, 5); // Super fast typing (from 30ms to 10ms)
        } else {
          // Shorter pause at full text
          timeoutRef.current = setTimeout(() => {
            if (!hasSearched && !isFocused) {
              isDeleting.current = true;
              animatePlaceholder();
            }
          }, 800); // Shorter pause at full text (from 1500ms to 800ms)
        }
      } else {
        // Deleting animation - also very fast
        if (placeholder.length > 0) {
          setPlaceholder(prev => prev.slice(0, prev.length - 1));
          timeoutRef.current = setTimeout(animatePlaceholder, 2); // Super fast deleting (from 50ms to 10ms)
        } else {
          // Quick transition to next example
          isDeleting.current = false;
          setCurrentExample(prev => (prev + 1) % examples.length);
          timeoutRef.current = setTimeout(animatePlaceholder, 100); // Quick pause between examples (from 300ms to 100ms)
        }
      }
    };

    // Almost immediate start
    timeoutRef.current = setTimeout(animatePlaceholder, 100); // Quick initial start (from 200ms to 100ms)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentExample, examples.length, hasSearched, placeholder, isFocused]);

  // Start animation when component mounts
  useEffect(() => {
    if (hasSearched || isFocused) {
      isTyping.current = false;
      setPlaceholder('');
      return;
    }

    // Start with empty placeholder
    setPlaceholder('');
    isTyping.current = true;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasSearched, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    isTyping.current = false;
    isDeleting.current = false;
    setPlaceholder('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleBlur = () => {
    if (!hasSearched) {
      setIsFocused(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isTyping.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex group">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            className="avant-input w-full h-14 text-lg pl-12 font-['EB_Garamond',serif] pr-24 transition-all duration-300 focus:shadow-[0_0_0_2px_rgba(0,0,0,0.8)] focus:border-avant-black rounded-r-none"
            placeholder={placeholder || "Search the school magazine archive..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-avant-medium-gray" />
          </div>
        </div>
        <Button 
          type="submit"
          className="avant-btn h-14 px-6 transition-all duration-300 rounded-l-none group-focus-within:border-avant-black group-focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.8)]"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBox;
