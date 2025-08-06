import { useQuery } from '@tanstack/react-query';

interface SensitiveKeyword {
  _id: string;
  word: string;
  action: string;
  severity: string;
  createdAt: string;
}

export const useKeywords = () => {
  return useQuery<SensitiveKeyword[]>({
    queryKey: ['sensitive-keywords'],
    queryFn: async () => {
      try {
        const response = await fetch('https://stories-be.onrender.com/api/home/keywords');
        if (!response.ok) {
          throw new Error('Failed to fetch keywords');
        }
        return response.json();
      } catch (error) {
        console.warn('Failed to fetch keywords, using empty array:', error);
        return []; // Return empty array as fallback
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
}; 