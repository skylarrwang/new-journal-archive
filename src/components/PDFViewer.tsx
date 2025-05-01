
import React from 'react';
import { MagazineEntry } from '@/types/magazine';
import { getEmbedUrl } from '@/services/magazineService';

interface PDFViewerProps {
  document: MagazineEntry | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ document }) => {
  if (!document) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-secondary border border-avant-black">
        <p className="text-avant-medium-gray">Select a document to view</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(document.link_to_pdf);

  return (
    <div className="h-full w-full border border-avant-black relative">
      <div className="absolute top-0 left-0 right-0 p-2 bg-white border-b border-avant-black flex justify-between items-center z-10">
        <div className="truncate">
          <span className="font-medium">{document.title}</span>
          <span className="text-avant-medium-gray ml-2">
            ({document.pub_date} • Vol. {document.volume}, Issue {document.issue})
          </span>
        </div>
      </div>
      <div className="pt-10 h-full">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={document.title}
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
};

export default PDFViewer;
