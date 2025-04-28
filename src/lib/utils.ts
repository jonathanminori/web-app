import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random ID for listings (8 characters)
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
export function generateId(): string {
  return nanoid();
}

// Validate Redfin URL
export function isValidRedfinUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('redfin.com') && 
           parsedUrl.pathname.length > 1 && 
           !parsedUrl.pathname.startsWith('/api');
  } catch (e) {
    return false;
  }
}

// Format date in a human-readable way
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
}
