
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-[200px]" />
      <div className="space-y-2">
        <Skeleton className="w-1/2 h-4" />
        <div className="space-y-3">
          <div>
            <Skeleton className="w-full h-[100px]" />
          </div>
          <div>
            <Skeleton className="w-full h-[100px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
