import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { ListingData } from './types';

// Enable debugging
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log("[SERVER-STORAGE]", ...args);
}

// Storage directory (relative to project root)
const STORAGE_DIR = path.join(process.cwd(), '.listing-cache');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
  }
}

// Save a listing to a file
export async function saveListingToFile(listing: ListingData): Promise<void> {
  await ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${listing.id}.json`);
  
  try {
    await writeFile(filePath, JSON.stringify(listing, null, 2), 'utf8');
    log(`Saved listing to file: ${filePath}`);
  } catch (error) {
    console.error(`Failed to save listing ${listing.id}:`, error);
    throw new Error(`Failed to save listing: ${(error as Error).message}`);
  }
}

// Get a listing from a file
export async function getListingFromFile(id: string): Promise<ListingData | null> {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  
  try {
    const data = await readFile(filePath, 'utf8');
    const listing = JSON.parse(data) as ListingData;
    log(`Retrieved listing from file: ${filePath}`);
    return listing;
  } catch (error) {
    log(`Failed to read listing ${id}:`, error);
    return null;
  }
}