import { cn } from "@/lib/utils";

interface ListingSpecs {
  beds: number | null;
  baths: number | null;
  squareFeet: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  propertyType: string | null;
}

interface ListingCardProps {
  specs: ListingSpecs;
  className?: string;
}

export function ListingCard({ specs, className }: ListingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {specs.beds !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Beds</span>
            <span className="text-2xl font-semibold">{specs.beds}</span>
          </div>
        )}

        {specs.baths !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Baths</span>
            <span className="text-2xl font-semibold">{specs.baths}</span>
          </div>
        )}

        {specs.squareFeet !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Sq Ft</span>
            <span className="text-2xl font-semibold">
              {specs.squareFeet.toLocaleString()}
            </span>
          </div>
        )}

        {specs.lotSize !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Lot Size</span>
            <span className="text-2xl font-semibold">{specs.lotSize}</span>
          </div>
        )}

        {specs.yearBuilt !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Year Built
            </span>
            <span className="text-2xl font-semibold">{specs.yearBuilt}</span>
          </div>
        )}

        {specs.propertyType !== null && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Property Type
            </span>
            <span className="text-2xl font-semibold">{specs.propertyType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
