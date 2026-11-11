import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService.js';

/**
 * Custom hook to execute and manage backend API health status
 */
export const useHealthCheck = (autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthService.getHealth();
      setData(response.data);
      setLastChecked(new Date());
    } catch (err) {
      setError(err);
      setData(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchHealth();
    }
  }, [autoFetch, fetchHealth]);

  return {
    data,
    loading,
    error,
    lastChecked,
    refetch: fetchHealth
  };
};

export default useHealthCheck;
