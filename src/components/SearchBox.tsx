
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [currentExample, setCurrentExample] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);
  const isDeleting = useRef(false);

  const examples = [
    "What articles discuss climate change?",
    "Find pieces written by Sarah Johnson",
    "Show me articles about the debate team",
    "When was the first school play documented?"
  ];

  // Type and delete animation
  useEffect(() => {
    if (!isTyping.current) return;

    const currentText = examples[currentExample];
    const animatePlaceholder = () => {
      if (!isDeleting.current) {
        // Typing animation
        if (placeholder.length < currentText.length) {
          setPlaceholder(currentText.slice(0, placeholder.length + 1));
          setTimeout(animatePlaceholder, 100 + Math.random() * 50);
        } else {
          // Pause at full text
          setTimeout(() => {
            isDeleting.current = true;
            animatePlaceholder();
          }, 2000);
        }
      } else {
        // Deleting animation
        if (placeholder.length > 0) {
          setPlaceholder(placeholder.slice(0, placeholder.length - 1));
          setTimeout(animatePlaceholder, 50 + Math.random() * 30);
        } else {
          // Move to next example
          isDeleting.current = false;
          setCurrentExample((prev) => (prev + 1) % examples.length);
          setTimeout(animatePlaceholder, 500);
        }
      }
    };

    animatePlaceholder();
  }, [placeholder, currentExample, examples]);

  // Start animation when component mounts
  useEffect(() => {
    // Delay before starting animation
    const timer = setTimeout(() => {
      isTyping.current = true;
      setPlaceholder('');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Stop animation when user focuses the input
  const handleFocus = () => {
    isTyping.current = false;
    setPlaceholder('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
