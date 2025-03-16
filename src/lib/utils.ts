import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility functions used throughout the application for common operations

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
