import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsData } from '../types/analytics';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await analyticsService.getAllAnalytics();
      setData(analyticsData);
    } catch (err) {
      console.error('Error in useAnalytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
}
