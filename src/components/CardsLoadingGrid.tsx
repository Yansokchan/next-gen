import CardSkeleton from "./CardSkeleton";

interface CardsLoadingGridProps {
  count?: number;
}

export default function CardsLoadingGrid({ count = 6 }: CardsLoadingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
