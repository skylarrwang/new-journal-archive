
import React from 'react';
import { MagazineEntry } from '@/types/magazine';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DocumentListProps {
  documents: MagazineEntry[];
  onSelectDocument: (document: MagazineEntry) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelectDocument }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-avant-medium-gray">No documents match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {documents.map((doc) => (
        <Button 
          key={doc.id} 
          variant="outline" 
          className="w-full justify-start text-left py-4 h-auto border-avant-black hover:bg-secondary transition-colors group"
          onClick={() => onSelectDocument(doc)}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-2">
            <div className="flex items-center text-avant-medium-gray">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{doc.pub_date}</span>
            </div>
            <div className="hidden sm:block mx-2 text-avant-medium-gray">•</div>
            <div className="text-sm text-avant-medium-gray">
              Vol. {doc.volume}, Issue {doc.issue}
            </div>
            <div className="hidden sm:block mx-2 text-avant-medium-gray">•</div>
            <div className="font-medium group-hover:underline truncate">
              {doc.title}
            </div>
          </div>
          <div className="mt-1 text-sm text-avant-medium-gray">
            by {doc.author} • Page {doc.page}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default DocumentList;
