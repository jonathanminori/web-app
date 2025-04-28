import { ListingData } from "./types";
import { generateId } from "./utils";

// Enable debugging
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log("[STORAGE]", ...args);
}

// In-memory storage for listings
// In a production app, you would use a database or persistent storage
const listings = new Map<string, ListingData>();

// For debugging - persist the listings to a global object that's accessible everywhere
if (typeof globalThis !== "undefined") {
  // @ts-expect-error - Adding custom property to global object for debugging purposes
  if (!globalThis.__LISTINGS_STORAGE) {
    // @ts-expect-error - Initializing global storage with our listings Map
    globalThis.__LISTINGS_STORAGE = listings;
    log("Initialized global listings storage");
  } else {
    // @ts-expect-error - Accessing our custom global storage property
    const existingListings = globalThis.__LISTINGS_STORAGE;
    log(`Using existing global storage with ${existingListings.size} listings`);
    // Copy any existing listings to our Map
    existingListings.forEach((value: ListingData, key: string) => {
      listings.set(key, value);
    });
  }
}

export function saveListing(data: Omit<ListingData, "id" | "createdAt">): ListingData {
  const id = generateId();
  const createdAt = new Date().toISOString();

  const listing: ListingData = {
    ...data,
    id,
    createdAt,
  };

  listings.set(id, listing);
  log(`Saved listing with ID: ${id}, total listings: ${listings.size}`);

  // Set expiry (7 days) for the listing
  setTimeout(() => {
    listings.delete(id);
    log(`Expired listing with ID: ${id}`);
  }, 7 * 24 * 60 * 60 * 1000); // 7 days instead of 30

  return listing;
}

export function getListing(id: string): ListingData | undefined {
  const listing = listings.get(id);
  log(`Get listing with ID: ${id}, found: ${!!listing}`);
  if (listing) {
    log(`Listing details: ${listing.id}, ${listing.photos.length} photos`);
  } else {
    log(`Available listings: ${Array.from(listings.keys()).join(", ") || "none"}`);
  }
  return listing;
}

// For development/debugging only
export function getAllListings(): ListingData[] {
  const allListings = Array.from(listings.values());
  log(`Getting all listings, count: ${allListings.length}`);
  return allListings;
}