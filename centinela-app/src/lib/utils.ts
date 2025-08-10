import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Retry utility function
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}