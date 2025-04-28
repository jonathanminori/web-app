import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ListingCard } from "@/components/ListingCard";
import { ShareButton } from "@/components/ShareButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getListing } from "@/lib/storage";
import { getListingFromFile } from "@/lib/server-storage";
import { formatDate } from "@/lib/utils";

// Enable debugging
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log("[PAGE]", ...args);
}

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  log("generateMetadata for ID:", id);

  // Try to get listing from in-memory storage first
  let listing = getListing(id);

  // If not found in memory, try file storage (only in development)
  if (!listing && process.env.NODE_ENV === 'development') {
    log("Listing not found in memory, trying file storage");
    try {
      const fileBasedListing = await getListingFromFile(id);
      
      if (fileBasedListing) {
        listing = fileBasedListing;
        log("Found listing in file storage:", listing.id);
      }
    } catch (error) {
      log("Error reading from file storage:", error);
    }
  }
  
  // If not found in either storage, return generic metadata
  if (!listing) {
    log("Listing not found for metadata");
    return {
      title: "Listing Not Found",
    };
  }

  log("Metadata generated successfully for listing:", listing.id);
  return {
    title: `Anonymous Listing | ${listing.specs.beds || '?'} Bed, ${listing.specs.baths || '?'} Bath Home`,
    description: listing.description.substring(0, 160),
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  log("Rendering page for ID:", id);

  // Try to get listing from in-memory storage first
  let listing = getListing(id);

  // If not found in memory, try file storage (only in development)
  if (!listing && process.env.NODE_ENV === 'development') {
    log("Listing not found in memory, trying file storage");
    try {
      const fileBasedListing = await getListingFromFile(id);
      
      if (fileBasedListing) {
        listing = fileBasedListing;
        log("Found listing in file storage:", listing.id);
      }
    } catch (error) {
      log("Error reading from file storage:", error);
    }
  }
  
  // If still not found, return 404
  if (!listing) {
    log("Listing not found");
    notFound();
  }

  log("Successfully found listing:", listing.id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <ShareButton id={id} />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Photo Gallery */}
          <PhotoGallery photos={listing.photos} />

          {/* Listing Specs */}
          <ListingCard specs={listing.specs} />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Home</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{listing.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {listing.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {listing.features.map((feature, index) => (
                    <div key={index}>
                      <h3 className="font-medium mb-2">{feature.title}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {feature.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Created on {formatDate(listing.createdAt)}</p>
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              View on Redfin
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

