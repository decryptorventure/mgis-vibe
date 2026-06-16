import { useState, useEffect } from 'react';

export function useMockQuery<T>(mockData: T, delayMs: number = 800) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (isMounted) {
        setData(mockData);
        setIsLoading(false);
      }
    }, delayMs);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mockData, delayMs]);

  return { data, isLoading, error };
}
