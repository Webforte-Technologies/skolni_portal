import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/apiClient';

/**
 * Global request deduplication to prevent multiple simultaneous requests to the same endpoint.
 * This fixes the issue where multiple widgets were making requests to the same endpoint
 * simultaneously, causing API spam and performance issues.
 */
const globalRequestMap = new Map<string, Promise<any>>();

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

  // Validate endpoint at the beginning
  if (!endpoint || typeof endpoint !== 'string' || endpoint.trim().length === 0) {
    console.error(`[useRealTimeData] Invalid endpoint provided:`, endpoint);
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }

  // Add a static flag to prevent multiple instances of the same endpoint
  const hookInstanceId = useRef(`${endpoint}-${Math.random()}`);

  // Console logging disabled to reduce spam
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[useRealTimeData] Hook initialized for ${endpoint}`, { 
  //     refreshInterval, 
  //     autoRefresh,
  //     timestamp: new Date().toISOString()
  //   });
  // }

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
  const isFetchingRef = useRef(false); // Prevent multiple simultaneous requests
  const fetchDataRef = useRef<() => Promise<void>>();
  
  // Store callbacks in refs to prevent unnecessary re-renders
  const onDataUpdateRef = useRef(onDataUpdate);
  const onErrorRef = useRef(onError);
  const transformDataRef = useRef(transformData);
  const dependenciesRef = useRef(options.dependencies);

  // Update refs when callbacks change
  useEffect(() => {
    // Debug logging for dependency changes
    if (process.env.NODE_ENV === 'development' && options.dependencies) {
      console.log(`[useRealTimeData] Dependencies changed for ${endpoint}:`, {
        old: dependenciesRef.current,
        new: options.dependencies,
        timestamp: new Date().toISOString()
      });
    }
    
    onDataUpdateRef.current = onDataUpdate;
    onErrorRef.current = onError;
    transformDataRef.current = transformData;
    dependenciesRef.current = options.dependencies;
    if (isAutoRefreshingRef.current !== autoRefresh) {
      isAutoRefreshingRef.current = autoRefresh;
      setIsAutoRefreshing(autoRefresh);
    }
  }, [onDataUpdate, onError, transformData, autoRefresh, options.dependencies, endpoint]);

  const fetchData = useCallback(async (isRetry = false) => {
    // Prevent multiple simultaneous requests to the same endpoint
    if (isFetchingRef.current) {
      // Console logging disabled to reduce spam
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[useRealTimeData] Request already in progress for ${endpoint}, skipping`);
      // }
      return;
    }
    
    // Construct the full endpoint URL with dependencies
    let fullEndpoint = endpoint;
    if (dependenciesRef.current && dependenciesRef.current.length > 0) {
      // Validate dependencies first
      const validDependencies = dependenciesRef.current.filter(dep => 
        dep !== null && 
        dep !== undefined && 
        typeof dep === 'string' && 
        (dep as string).trim().length > 0
      );
      
      if (validDependencies.length !== dependenciesRef.current.length) {
        console.warn(`[useRealTimeData] Invalid dependencies detected:`, dependenciesRef.current);
      }
      
      // For now, handle timeRange dependency specifically
      const timeRangeDep = validDependencies.find(dep => ['1h', '6h', '24h', '7d', '30d'].includes(dep as string));
      if (timeRangeDep) {
        try {
          // Debug logging to identify corruption
          if (process.env.NODE_ENV === 'development') {
            console.log(`[useRealTimeData] Processing timeRange dependency:`, {
              original: timeRangeDep,
              type: typeof timeRangeDep,
              length: (timeRangeDep as string).length,
              charCodes: Array.from(timeRangeDep as string).map(c => c.charCodeAt(0))
            });
          }
          
          const days = timeRangeDep === '1h' ? 0.04 : timeRangeDep === '6h' ? 0.25 : timeRangeDep === '24h' ? 1 : timeRangeDep === '7d' ? 7 : 30;
          const timeRangeObj = { days };
          const separator = endpoint.includes('?') ? '&' : '?';
          fullEndpoint = `${endpoint}${separator}timeRange=${encodeURIComponent(JSON.stringify(timeRangeObj))}`;
          
          // Debug logging for constructed endpoint
          if (process.env.NODE_ENV === 'development') {
            console.log(`[useRealTimeData] Constructed endpoint:`, {
              original: endpoint,
              constructed: fullEndpoint,
              timeRangeObj,
              encoded: encodeURIComponent(JSON.stringify(timeRangeObj))
            });
          }
          
          // Validate the constructed URL - check for valid admin or API endpoints
          if (!fullEndpoint.startsWith('/admin/') && !fullEndpoint.startsWith('/api/')) {
            console.error(`[useRealTimeData] Invalid endpoint constructed: ${fullEndpoint}`);
            setError(new Error(`Invalid endpoint: ${fullEndpoint}`));
            return;
          }
          
          // Additional validation to ensure the timeRange parameter is properly encoded
          if (fullEndpoint.includes('timeRange=')) {
            const timeRangeParam = fullEndpoint.split('timeRange=')[1];
            try {
              const decoded = decodeURIComponent(timeRangeParam);
              JSON.parse(decoded); // Validate JSON format
            } catch (parseError) {
              console.error(`[useRealTimeData] Invalid timeRange parameter: ${timeRangeParam}`, parseError);
              setError(new Error(`Invalid timeRange parameter: ${timeRangeParam}`));
              return;
            }
          }
        } catch (error) {
          console.error(`[useRealTimeData] Error constructing endpoint:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          setError(new Error(`Failed to construct endpoint: ${errorMessage}`));
          return;
        }
      }
    }

    // Check if there's already a request in progress for this endpoint globally
    if (globalRequestMap.has(fullEndpoint)) {
      // Console logging disabled to reduce spam
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[useRealTimeData] Global request already in progress for ${fullEndpoint}, waiting for result`);
      // }
      try {
        const result = await globalRequestMap.get(fullEndpoint);
        // Process the result as if we made the request
        const transformedData = transformDataRef.current ? transformDataRef.current(result) : result;
        setData(transformedData);
        setLastUpdated(new Date());
        setError(null);
        setRetryCount(0);
        if (onDataUpdateRef.current) {
          onDataUpdateRef.current(transformedData);
        }
        return;
      } catch (error) {
        // If the global request failed, we'll make our own
        // Console logging disabled to reduce spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`[useRealTimeData] Global request failed for ${fullEndpoint}, making new request`);
        // }
      }
    }
    
    isFetchingRef.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    // Console logging disabled to reduce spam
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`[useRealTimeData] Fetching data from ${fullEndpoint}`, { 
    //     originalEndpoint: endpoint,
    //     fullEndpoint,
    //     isRetry, 
    //     retryCount: retryCountRef.current,
    //     timestamp: new Date().toISOString()
    //   });
    // }
    
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

      // Create a promise for this request and store it globally
      const requestPromise = api.get(fullEndpoint, {
        signal: abortControllerRef.current.signal
      });
      
      // Store the promise globally to prevent duplicate requests
      globalRequestMap.set(fullEndpoint, requestPromise);
      
      const response = await requestPromise;
      
      // Remove the promise from global map after completion
      globalRequestMap.delete(fullEndpoint);

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
      // Remove the promise from global map on error
      globalRequestMap.delete(fullEndpoint);
      
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
          return prev;
        }
        return prev;
      });
      
      // Auto-retry on network errors (max 3 retries)
      // Don't retry on 404 errors as they indicate malformed URLs
      if (!isRetry && retryCountRef.current < 3 && 
          (error.message.includes('network') || error.message.includes('timeout')) &&
          !error.message.includes('404') && !error.message.includes('Not Found')) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          // Use fetchData for retry
          fetchData();
        }, 5000 * retryCountRef.current);
      }

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      // Ensure the promise is removed from global map
      globalRequestMap.delete(fullEndpoint);
      
      setLoading(prev => {
        // Only update if the loading state actually changed
        if (prev) {
          return false;
        }
        return prev;
      });
      
      // Reset the fetching flag
      isFetchingRef.current = false;
    }
  }, [endpoint]); // Remove options.dependencies from dependency array to prevent unnecessary re-renders

  // Store the fetchData function in a ref for the interval
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const setAutoRefresh = useCallback((enabled: boolean) => {
    if (isAutoRefreshingRef.current !== enabled) {
      isAutoRefreshingRef.current = enabled;
      setIsAutoRefreshing(enabled);
    }
  }, []);

    // Set up auto-refresh interval
  useEffect(() => {
    if (isAutoRefreshingRef.current && refreshInterval > 0) {
      // Console logging disabled to reduce spam
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[useRealTimeData] Setting up interval for ${endpoint} (${hookInstanceId.current})`, { 
      //     refreshInterval, 
      //     timestamp: new Date().toISOString()
      //   });
      // }
      
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Add a small initial delay to prevent all widgets from making requests simultaneously
      const initialDelay = Math.random() * 5000; // Reduced from 10s to 5s
      
      const initialTimeout = setTimeout(() => {
        if (isAutoRefreshingRef.current && !intervalRef.current) {
          fetchDataRef.current?.(); // Initial fetch after delay
        }
      }, initialDelay);
      
      intervalRef.current = setInterval(() => {
        // Use the current fetchData function from ref to avoid dependency issues
        if (isAutoRefreshingRef.current) {
          // Console logging disabled to reduce spam
          // if (process.env.NODE_ENV === 'development') {
          //   console.log(`[useRealTimeData] Interval triggered for ${endpoint} (${hookInstanceId.current})`);
          // }
          fetchDataRef.current?.();
        }
      }, refreshInterval);

      return () => {
        // Console logging disabled to reduce spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`[useRealTimeData] Cleaning up interval for ${endpoint}`);
        // }
        if (initialTimeout) {
          clearTimeout(initialTimeout);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [refreshInterval, endpoint]); // Removed fetchData dependency since we use ref

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    // Console logging disabled to reduce spam
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`[useRealTimeData] Hook cleanup for ${endpoint}`);
    // }
    
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
      isFetchingRef.current = false;
    };
  }, [endpoint]); // Added missing dependency

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    setAutoRefresh,
    isAutoRefreshing,
    lastUpdated,
    retryCount
  };
}
