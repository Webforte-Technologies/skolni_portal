import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/apiClient';

export interface UseRealTimeDataOptions<T> {
  endpoint: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  onDataUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
  transformData?: (rawData: any) => T;
  dependencies?: any[];
}

export interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  isAutoRefreshing: boolean;
  lastUpdated: Date | null;
  retryCount: number;
}

export function useRealTimeData<T = any>(options: UseRealTimeDataOptions<T>): UseRealTimeDataReturn<T> {
  const {
    endpoint,
    refreshInterval = 30000, // 30 seconds default
    autoRefresh = true,
    onDataUpdate,
    onError,
    transformData,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(endpoint, {
        signal: abortControllerRef.current.signal
      });

      const rawData = response.data?.data || response.data;
      const transformedData: T = transformData ? transformData(rawData) : (rawData as T);

      setData(transformedData);
      setLastUpdated(new Date());
      setRetryCount(0);

      if (onDataUpdate) {
        onDataUpdate(transformedData);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const error = err instanceof Error ? err : new Error(err?.message || 'Unknown error');
      setError(error);
      
      // Use functional update to avoid dependency issues
      setRetryCount(prev => {
        const newRetryCount = prev + 1;
        
        // Auto-retry on network errors (max 3 retries)
        if (isRetry && newRetryCount < 3 && (error.message.includes('network') || error.message.includes('timeout'))) {
          setTimeout(() => fetchData(true), 5000 * newRetryCount);
        }
        
        return newRetryCount;
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, transformData, onDataUpdate, onError, ...dependencies]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const setAutoRefresh = useCallback((enabled: boolean) => {
    setIsAutoRefreshing(enabled);
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefreshing && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoRefreshing, refreshInterval, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    setAutoRefresh,
    isAutoRefreshing,
    lastUpdated,
    retryCount
  };
}
