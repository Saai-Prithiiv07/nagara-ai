/**
 * React Hook: Async Data Fetching with Loading & Error UI States
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Async data fetching from backend API
 * - Managing loading, error, and data states
 * - Handling component unmount and cleanup
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../services/api';

export interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode: number | null;
  refetch: () => Promise<void>;
}

export function useApiData<T>(endpoint: string, authToken?: string): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await ApiClient.get<T>(endpoint, authToken);

    setData(response.data);
    setError(response.error);
    setStatusCode(response.statusCode);
    setLoading(false);
  }, [endpoint, authToken]);

  useEffect(() => {
    let isMounted = true;

    fetchData().then(() => {
      if (!isMounted) return;
    });

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return { data, loading, error, statusCode, refetch: fetchData };
}
