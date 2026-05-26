interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = "h-32 w-full" }: LoadingSkeletonProps) {
  return (
    <div className={`skeleton-shimmer rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="aspect-[3/4] max-w-[300px] w-full skeleton-shimmer rounded-lg border border-zinc-800" />
  );
}
