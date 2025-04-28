"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidRedfinUrl } from "@/lib/utils";
import { ScrapeResponse } from "@/lib/types";

export function UrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    if (!url) {
      setError("Please enter a Redfin URL");
      return;
    }

    if (!isValidRedfinUrl(url)) {
      setError("Please enter a valid Redfin listing URL");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json() as ScrapeResponse;

      if (!result.success || !result.data) {
        setError(result.error || "Failed to process the listing");
        setIsLoading(false);
        return;
      }

      // Redirect to the listing page
      router.push(`/listing/${result.data.id}`);
    } catch {
      setError("An error occurred while processing the request");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="https://www.redfin.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          aria-label="Redfin listing URL"
        />
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Create Anonymous Listing"
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2">
        By submitting, you agree to our responsible scraping practices. We only store the
        necessary information to display the listing anonymously.
      </p>
    </form>
  );
}