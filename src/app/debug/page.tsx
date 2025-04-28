"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ListingSpecs {
  beds?: number;
  baths?: number;
  sqft?: number;
  [key: string]: any;
}

interface ListingData {
  id: string;
  url: string;
  photos: string[];
  specs: ListingSpecs;
  description: string;
  features: Array<{
    title: string;
    items: string[];
  }>;
  createdAt: string;
}

interface RawData {
  status: number;
  statusText: string;
  contentType: string;
  text: string;
}

interface DisplayData {
  type: "listing" | "raw";
  data: ListingData | RawData;
}

function isListingData(data: ListingData | RawData): data is ListingData {
  return 'photos' in data && 'specs' in data && 'description' in data;
}

export default function DebugPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setDisplayData(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setResult(data);

        if (data.success && data.data) {
          // Success - display the data
          setDisplayData({
            type: "listing",
            data: data.data,
          });
        } else {
          // Error from API
          setError(data.error || "An error occurred");
        }
      } else {
        // Not a JSON response
        const text = await response.text();
        setError(`Unexpected response: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
        setDisplayData({
          type: "raw",
          data: {
            status: response.status,
            statusText: response.statusText,
            contentType: contentType || "none",
            text: text.substring(0, 2000),
          },
        });
      }
    } catch (err) {
      setError(`Fetch error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">API Debug Tool</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Scrape API</CardTitle>
          <CardDescription>
            Enter a Redfin URL to test the scraping API directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="https://www.redfin.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Test API"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[400px] text-sm">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md overflow-auto max-h-[400px] text-sm">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {displayData?.type === "listing" && isListingData(displayData.data) && (
        <Card>
          <CardHeader>
            <CardTitle>Listing Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {displayData.data.photos.slice(0, 6).map((photo: string, i: number) => (
                    <div key={i} className="aspect-square relative bg-muted rounded-md overflow-hidden">
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L70 60 M70 40 L30 60' stroke='%23aaa' stroke-width='2'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  ))}
                </div>
                {displayData.data.photos.length > 6 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    +{displayData.data.photos.length - 6} more photos
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Specs</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(displayData.data.specs).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <span className="text-sm text-muted-foreground block">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="whitespace-pre-line text-sm">
                  {displayData.data.description.length > 300
                    ? `${displayData.data.description.substring(0, 300)}...`
                    : displayData.data.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {displayData?.type === "raw" && !isListingData(displayData.data) && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <p>
                  {displayData.data.status} {displayData.data.statusText}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Content Type</h3>
                <p>{displayData.data.contentType}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Response Body</h3>
                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[400px] text-sm">
                  {displayData.data.text}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}