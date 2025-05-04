import React from 'react';
import { RAGResponse, MagazineEntry } from '@/types/magazine';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText, User } from "lucide-react";

interface RAGResultsProps {
  response: RAGResponse;
  onSelectDocument: (document: MagazineEntry) => void;
}

const RAGResults: React.FC<RAGResultsProps> = ({ response, onSelectDocument }) => {
  // Function to process the answer text with citation markers
  const processAnswerText = () => {
    let text = response.answer;
    
    // For this simple mock implementation, we're not marking specific citations in the text
    // In a real implementation, you'd want to insert citation markers and link them
    return text;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="avant-card">
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed">{processAnswerText()}</p>
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Citations</h3>
        <div className="space-y-3">
          {response.citations.map((citation, index) => (
            <div key={index} className="border-l-2 border-avant-black pl-4 py-1">
              <blockquote className="italic text-avant-medium-gray mb-2">
                "{citation.text}"
              </blockquote>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left py-2 h-auto border-avant-black hover:bg-secondary"
                onClick={() => onSelectDocument(citation.source)}
              >
                <div className="flex flex-wrap items-center w-full gap-x-2">
                  <FileText className="h-3 w-2 flex-shrink-0" />
                  <span className="break-words whitespace-normal">
                    {citation.source.title?.trim() ? citation.source.title : "None!"}
                  </span>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <span className="break-words whitespace-normal">
                      {citation.source.author?.trim() ? citation.source.author : "None!"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="break-words whitespace-normal">
                      {citation.source.pub_date?.trim()
                        ? (() => {
                            const [year, month] = citation.source.pub_date.split('-');
                            return (month && year) ? `${month}/${year}` : "None";
                          })()
                        : "none"}
                    </span>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RAGResults;
