/**
 * useDebounce Hook
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * A generic debounce hook that delays updating a value until after
 * a specified delay period has passed without the value changing.
 * 
 * Useful for search inputs, resize handlers, and other high-frequency updates.
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
