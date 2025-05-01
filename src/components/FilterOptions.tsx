
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllAuthors, getDateRange } from '@/services/magazineService';
import { SearchFilters } from '@/types/magazine';

interface FilterOptionsProps {
  onFilter: (filters: SearchFilters) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ onFilter }) => {
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({
    startDate: null,
    endDate: null
  });
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<string[]>([]);
  const [availableDateRange, setAvailableDateRange] = useState<{ earliest: string, latest: string }>({
    earliest: '01/20',
    latest: '12/22'
  });

  useEffect(() => {
    // Load available authors and date range
    setAllAuthors(getAllAuthors());
    setAvailableDateRange(getDateRange());
  }, []);

  const handleApplyFilters = () => {
    const filters: SearchFilters = {};
    
    if (dateRange.startDate || dateRange.endDate) {
      filters.dateRange = dateRange;
    }
    
    if (selectedAuthors.length > 0) {
      filters.authors = selectedAuthors;
    }
    
    onFilter(filters);
  };

  const handleAuthorToggle = (author: string) => {
    setSelectedAuthors(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author) 
        : [...prev, author]
    );
  };

  const handleClearFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedAuthors([]);
    onFilter({});
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-4">
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
                Format: MM/YY (e.g., 01/20)
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    className="avant-input"
                    placeholder={availableDateRange.earliest}
                    value={dateRange.startDate || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value || null }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    className="avant-input"
                    placeholder={availableDateRange.latest}
                    value={dateRange.endDate || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value || null }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-avant-black">
            Authors
          </Button>
        </PopoverTrigger>
        <PopoverContent className="avant-card w-80 max-h-[300px] overflow-y-auto">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Select Authors</h4>
            </div>
            <div className="grid gap-2">
              {allAuthors.map(author => (
                <div key={author} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`author-${author}`} 
                    checked={selectedAuthors.includes(author)}
                    onCheckedChange={() => handleAuthorToggle(author)}
                  />
                  <Label htmlFor={`author-${author}`}>{author}</Label>
                </div>
              ))}
            </div>
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
