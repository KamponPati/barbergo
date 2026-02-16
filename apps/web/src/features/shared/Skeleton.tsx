export function SkeletonRows({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="skeleton-wrap" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-row" />
      ))}
    </div>
  );
}
