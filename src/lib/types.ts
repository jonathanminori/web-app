export interface ListingData {
  id: string;
  photos: string[];
  description: string;
  specs: {
    beds: number | null;
    baths: number | null;
    squareFeet: number | null;
    lotSize: string | null;
    yearBuilt: number | null;
    propertyType: string | null;
  };
  features: {
    title: string;
    items: string[];
  }[];
  createdAt: string;
  url: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: ListingData;
  error?: string;
}