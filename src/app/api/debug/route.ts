import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { getAllListings } from "@/lib/storage";
import { ListingData } from "@/lib/types";

// Storage directory
const STORAGE_DIR = path.join(process.cwd(), '.listing-cache');

export async function GET(request: NextRequest) {
  // Get memory listings
  const memoryListings = getAllListings();
  
  // Get file listings
  let fileListings: ListingData[] = [];
  try {
    const files = await readdir(STORAGE_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(STORAGE_DIR, file);
          const data = await readFile(filePath, 'utf8');
          const listing = JSON.parse(data) as ListingData;
          fileListings.push(listing);
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error reading storage directory:', error);
    // Directory might not exist yet, that's ok
  }
  
  return NextResponse.json({
    memory: {
      count: memoryListings.length,
      ids: memoryListings.map(l => l.id),
      listings: memoryListings,
    },
    file: {
      count: fileListings.length,
      ids: fileListings.map(l => l.id),
      listings: fileListings,
    }
  });
}