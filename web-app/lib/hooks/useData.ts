import { useState, useEffect } from 'react';
import { useYear } from '@/contexts/YearContext';

interface ErrorState {
  hasError: boolean;
  message?: string;
  isServiceUnavailable?: boolean;
}

export function useData<T>(apiPath: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState>({ hasError: false });
  const { selectedYear } = useYear();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError({ hasError: false });
      
      try {
        const response = await fetch(`/api/${apiPath}?year=${selectedYear}`, { 
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const isServiceUnavailable = response.status === 503;
          
          throw new Error(
            errorData.error || 
            (isServiceUnavailable ? 'External service unavailable' : 'Network response was not ok')
          );
        }
        
        const result = await response.json();
        setData(result);
        setError({ hasError: false });
      } catch (error) {
        console.error(`Could not fetch from ${apiPath}:`, error);
        
        const errorMessage = (error as Error).message;
        const isServiceUnavailable = errorMessage.includes('service unavailable') || 
                                   errorMessage.includes('503') ||
                                   errorMessage.includes('external-scraper');
        
        setError({
          hasError: true,
          message: errorMessage,
          isServiceUnavailable
        });
        setData(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedYear, apiPath]);

  return { data, loading, error };
}
