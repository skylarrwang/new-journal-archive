
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse-slow">
      <div className="flex items-center space-x-2">
        <div className="h-12 w-12 rounded-full bg-avant-light-gray animate-pulse"></div>
        <div className="space-y-2 flex-1">
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
      
      <div className="border-l-4 border-avant-black pl-4 py-3">
        <Skeleton className="w-full h-[120px]" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="w-3/4 h-5" />
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
      </div>
      
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-1/3 h-5" />
          <Skeleton className="w-1/4 h-5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="w-full h-[80px]" />
          <Skeleton className="w-full h-[80px]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
