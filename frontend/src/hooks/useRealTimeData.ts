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
    transformData
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoRefreshingRef = useRef(autoRefresh);
  
  // Store callbacks in refs to prevent unnecessary re-renders
  const onDataUpdateRef = useRef(onDataUpdate);
  const onErrorRef = useRef(onError);
  const transformDataRef = useRef(transformData);

  // Update refs when callbacks change
  useEffect(() => {
    onDataUpdateRef.current = onDataUpdate;
    onErrorRef.current = onError;
    transformDataRef.current = transformData;
    if (isAutoRefreshingRef.current !== autoRefresh) {
      isAutoRefreshingRef.current = autoRefresh;
      setIsAutoRefreshing(autoRefresh);
    }
  }, [onDataUpdate, onError, transformData, autoRefresh]);

  const fetchData = useCallback(async (isRetry = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(prev => {
        // Only update if the loading state actually changed
        if (!prev) {
          return true;
        }
        return prev;
      });
      setError(prev => {
        // Only update if the error state actually changed
        if (prev !== null) {
          return null;
        }
        return prev;
      });

      const response = await api.get(endpoint, {
        signal: abortControllerRef.current.signal
      });

      const rawData = response.data?.data || response.data;
      const transformedData: T = transformDataRef.current ? transformDataRef.current(rawData) : (rawData as T);

      setData(prev => {
        // Only update if the data actually changed
        if (JSON.stringify(prev) !== JSON.stringify(transformedData)) {
          return transformedData;
        }
        return prev;
      });
      
      // Only update lastUpdated if the data actually changed to prevent unnecessary re-renders
      setLastUpdated(prev => {
        const newTime = new Date();
        // Only update if more than 1 second has passed or if this is the first update
        if (!prev || newTime.getTime() - prev.getTime() > 1000) {
          return newTime;
        }
        return prev;
      });
      
      setRetryCount(prev => {
        // Only update if the retry count actually changed
        if (prev !== 0) {
          return 0;
        }
        return prev;
      });

      if (onDataUpdateRef.current) {
        onDataUpdateRef.current(transformedData);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const error = err instanceof Error ? err : new Error(err?.message || 'Unknown error');
      setError(prev => {
        // Only update if the error actually changed
        if (!prev || prev.message !== error.message) {
          return error;
        }
        return prev;
      });
      
      // Update retry count
      retryCountRef.current += 1;
      setRetryCount(prev => {
        // Only update if the retry count actually changed
        if (prev !== retryCountRef.current) {
          return retryCountRef.current;
        }
        return prev;
      });
      
      // Auto-retry on network errors (max 3 retries)
      if (!isRetry && retryCountRef.current < 3 && (error.message.includes('network') || error.message.includes('timeout'))) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          fetchData(true);
        }, 5000 * retryCountRef.current);
      }

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      setLoading(prev => {
        // Only update if the loading state actually changed
        if (prev) {
          return false;
        }
        return prev;
      });
    }
  }, [endpoint]);

  const refresh = useCallback(fetchData, [fetchData]);

  const setAutoRefresh = useCallback((enabled: boolean) => {
    if (isAutoRefreshingRef.current !== enabled) {
      isAutoRefreshingRef.current = enabled;
      setIsAutoRefreshing(enabled);
    }
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefreshingRef.current && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchData]);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
