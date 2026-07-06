import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 16, className = "" }: LoadingSpinnerProps) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-zinc-200 rounded-lg mb-4" />
      <div className="h-4 bg-zinc-200 rounded mb-2" />
      <div className="h-4 bg-zinc-200 rounded w-3/4" />
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="p-6 border border-zinc-200 rounded-2xl bg-white animate-pulse space-y-3">
      <div className="h-4 bg-zinc-200 rounded w-1/4" />
      <div className="h-4 bg-zinc-200 rounded w-1/2" />
      <div className="h-16 bg-zinc-100 rounded w-full" />
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-32 w-32 bg-zinc-200 rounded-lg mb-4" />
        <div className="h-6 w-48 bg-zinc-200 rounded mb-2" />
        <div className="h-4 w-32 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}
