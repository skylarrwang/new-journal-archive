import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchFilters } from '@/types/magazine';

interface AuthorObj {
  display_name: string;
  name_variations: string[];
}

interface FilterOptionsProps {
  onFilter: (filters: SearchFilters) => void;
}

function formatDateInput(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits; // Just month
  if (digits.length <= 6) {
    // Insert slash after month
    return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
  }
  // Limit to MM/YYYY
  return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
}

function isValidDateInput(value: string): boolean {
  // Must match MM/YYYY
  if (!/^\d{2}\/\d{4}$/.test(value)) return false;
  const [month, year] = value.split('/').map(Number);
  return month >= 1 && month <= 12 && year > 1000;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ onFilter }) => {
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<AuthorObj[]>([]);
  const [authorSearchQuery, setAuthorSearchQuery] = useState<string>('');
  const [filteredAuthors, setFilteredAuthors] = useState<AuthorObj[]>([]);

  useEffect(() => {
    fetch('/authors.json')
      .then(res => res.json())
      .then((data) => {
        setAllAuthors(data); // data is an array of { display_name, name_variations }
      });
  }, []);

  useEffect(() => {
    if (authorSearchQuery.trim() === '') {
      setFilteredAuthors(allAuthors);
    } else {
      const query = authorSearchQuery.toLowerCase();
      setFilteredAuthors(
        allAuthors.filter(authorObj =>
          authorObj.display_name.toLowerCase().includes(query)
        )
      );
    }
  }, [authorSearchQuery, allAuthors]);

  const handleApplyFilters = () => {
    const filters: SearchFilters = {};
    
    if (dateRange.startDate || dateRange.endDate) {
      filters.dateRange = dateRange;
    }
    
    if (selectedAuthors.length > 0) {
      const selectedVariations = allAuthors
        .filter(authorObj => selectedAuthors.includes(authorObj.display_name))
        .flatMap(authorObj => authorObj.name_variations);
      filters.authors = selectedVariations;
    }
    
    console.log('Selected Authors:', selectedAuthors);
    console.log('Filters to send:', filters);
    
    onFilter(filters);
  };

  const handleAuthorToggle = (displayName: string) => {
    setSelectedAuthors(prev =>
      prev.includes(displayName)
        ? prev.filter(a => a !== displayName)
        : [...prev, displayName]
    );
  };

  const handleClearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedAuthors([]);
    setAuthorSearchQuery('');
    onFilter({});
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-4">
      {/* Date range popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-avant-black">
            Date Range
          </Button>
        </PopoverTrigger>
        <PopoverContent className="avant-card w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Select Date Range</h4>
              <p className="text-sm text-avant-medium-gray">
                Format: MM/YYYY (e.g., 03/2020)
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    className="avant-input"
                    placeholder="MM/YYYY"
                    value={dateRange.startDate || ''}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setDateRange(prev => ({ ...prev, startDate: formatted || null }));
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !isValidDateInput(e.target.value)) {
                        setDateRange(prev => ({ ...prev, startDate: null }));
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    className="avant-input"
                    placeholder="MM/YYYY"
                    value={dateRange.endDate || ''}
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      setDateRange(prev => ({ ...prev, endDate: formatted || null }));
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !isValidDateInput(e.target.value)) {
                        setDateRange(prev => ({ ...prev, endDate: null }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Authors popover - modified for better handling of many authors */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-avant-black">
            Authors
          </Button>
        </PopoverTrigger>
        <PopoverContent className="avant-card w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Select Authors</h4>
              <div className="relative">
                <Input
                  placeholder="Search authors..."
                  value={authorSearchQuery}
                  onChange={(e) => setAuthorSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-avant-medium-gray" />
                </div>
              </div>
              {filteredAuthors.length > 0 && (
                <p className="text-xs text-avant-medium-gray">
                  Showing {filteredAuthors.length} of {allAuthors.length} authors
                </p>
              )}
            </div>
            
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="grid gap-2 pr-3">
                {filteredAuthors.slice(0, 50).map(authorObj => (
                  <div key={authorObj.display_name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`author-${authorObj.display_name}`} 
                      checked={selectedAuthors.includes(authorObj.display_name)}
                      onCheckedChange={() => handleAuthorToggle(authorObj.display_name)}
                    />
                    <Label htmlFor={`author-${authorObj.display_name}`} className="truncate w-full cursor-pointer">
                      {authorObj.display_name}
                    </Label>
                  </div>
                ))}
                {filteredAuthors.length > 50 && (
                  <div className="text-center py-2 text-avant-medium-gray">
                    Showing first 50 of {filteredAuthors.length} authors. Refine your search.
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedAuthors.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-avant-medium-gray">
                  {selectedAuthors.length} author{selectedAuthors.length !== 1 ? 's' : ''} selected
                </span>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 text-xs hover:text-avant-black" 
                  onClick={() => setSelectedAuthors([])}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleApplyFilters} className="avant-btn">
        Apply Filters
      </Button>

      <Button 
        variant="outline" 
        className="border-avant-black" 
        onClick={handleClearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default FilterOptions;
