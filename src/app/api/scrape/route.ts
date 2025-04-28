import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { isValidRedfinUrl, generateId } from "@/lib/utils";
import { saveListing } from "@/lib/storage";
import { saveListingToFile } from "@/lib/server-storage";
import { ListingData } from "@/lib/types";

// Enable logging for debugging
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log("[API]", ...args);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    log("Received request for URL:", url);

    if (!url || !isValidRedfinUrl(url)) {
      log("Invalid URL:", url);
      return NextResponse.json(
        { success: false, error: "Invalid Redfin URL" },
        { status: 400 }
      );
    }

    log("Fetching URL:", url);
    // Fetch the Redfin page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      log("Fetch failed:", response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch listing: ${response.status} ${response.statusText}` 
        },
        { status: 500 }
      );
    }

    log("Successfully fetched page, parsing HTML");
    const html = await response.text();
    const $ = cheerio.load(html);

    // For debugging, dump some of the HTML structure
    log("HTML structure sample:", $("title").text());
    log("Body classes:", $("body").attr("class"));

    // Parse the data from the HTML
    const photos: string[] = [];
    $(".InlinePhotoPreview img").each((_, el) => {
      const src = $(el).attr("src");
      if (src) photos.push(src);
    });
    log("Found photos:", photos.length);

    // In case we don't find photos with the original selector, try alternative selectors
    if (photos.length === 0) {
      log("Trying alternative photo selectors");
      $("img").each((_, el) => {
        const src = $(el).attr("src");
        if (src && (src.includes("ssl-images") || src.includes("redfin"))) {
          if (!src.includes("icon") && !src.includes("logo")) {
            photos.push(src);
          }
        }
      });
      log("Found photos with alternative selector:", photos.length);
    }

    // Extract description - try multiple selectors
    let description = $(".home-description .text-base").text().trim();
    if (!description) {
      description = $("[data-rf-test-id='listingDescription']").text().trim();
    }
    if (!description) {
      description = $(".remarks").text().trim();
    }
    log("Description length:", description.length);

    // Extract specs (beds, baths, sqft, etc) - try multiple selectors
    let beds = extractNumber($(".home-main-stats .stats-count").eq(0).text());
    let baths = extractNumber($(".home-main-stats .stats-count").eq(1).text());
    let squareFeet = extractNumber($(".home-main-stats .stats-count").eq(2).text());
    
    // Fallback selectors for common stats
    if (beds === null) {
      beds = extractNumber($("[data-rf-test-id='abp-beds']").text());
    }
    if (baths === null) {
      baths = extractNumber($("[data-rf-test-id='abp-baths']").text());
    }
    if (squareFeet === null) {
      squareFeet = extractNumber($("[data-rf-test-id='abp-sqFt']").text());
    }
    
    log("Extracted specs:", { beds, baths, squareFeet });
    
    // Extract additional specs
    let yearBuilt: number | null = null;
    let lotSize: string | null = null;
    let propertyType: string | null = null;

    // Try multiple selectors for additional specs
    $(".table-row, .keyDetail").each((_, row) => {
      const label = $(row).find(".table-label, .header").text().trim().toLowerCase();
      const value = $(row).find(".table-value, .content").text().trim();
      
      if (label.includes("year built")) yearBuilt = extractNumber(value);
      if (label.includes("lot size")) lotSize = value;
      if (label.includes("property type") || label.includes("style")) propertyType = value;
    });
    
    log("Additional specs:", { yearBuilt, lotSize, propertyType });

    // Extract features
    const features: { title: string; items: string[] }[] = [];
    $(".amenity-group").each((_, group) => {
      const title = $(group).find(".amenity-group-title").text().trim();
      const items: string[] = [];
      
      $(group).find(".amenity-container").each((_, item) => {
        items.push($(item).text().trim());
      });
      
      if (title && items.length > 0) {
        features.push({ title, items });
      }
    });
    
    log("Features groups found:", features.length);

    // If we didn't find any features with the primary selector, try alternatives
    if (features.length === 0) {
      // Try to find features in other sections
      $("h2, h3").each((_, header) => {
        const title = $(header).text().trim();
        if (title.includes("Feature") || title.includes("Amenities") || title.includes("Detail")) {
          const items: string[] = [];
          $(header).next("ul").find("li").each((_, item) => {
            items.push($(item).text().trim());
          });
          
          if (items.length > 0) {
            features.push({ title, items });
          }
        }
      });
    }

    // Create a mock listing if we couldn't extract anything useful
    if (photos.length === 0 && !description) {
      log("Could not extract real data - creating mock listing for debugging");
      photos.push("https://ssl.cdn-redfin.com/photo/1/mbphoto/297/genMid.82838297_0.jpg");
      description = "This is a mock listing for debugging purposes. We couldn't extract real data from the page.";
    }

    // Create the listing
    log("Creating listing");
    const id = generateId();
    const createdAt = new Date().toISOString();
    
    const listing: ListingData = {
      id,
      createdAt,
      photos,
      description,
      specs: {
        beds,
        baths,
        squareFeet,
        lotSize,
        yearBuilt,
        propertyType,
      },
      features,
      url,
    };
    
    // Save to both in-memory storage and file storage for redundancy
    try {
      // Save to in-memory storage (for current process)
      saveListing({
        photos,
        description,
        specs: {
          beds,
          baths,
          squareFeet,
          lotSize,
          yearBuilt,
          propertyType,
        },
        features,
        url,
      });
      
      // Also save to file storage (for persistence across requests)
      await saveListingToFile(listing);
      log("Listing saved with ID:", listing.id);
    } catch (error) {
      log("Error saving listing:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save listing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: listing 
    });
  } catch (error) {
    console.error("Error processing Redfin listing:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

// Helper function to extract numbers from strings
function extractNumber(text: string): number | null {
  if (!text) return null;
  
  const match = text.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return null;
}