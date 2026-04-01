// src/components/interactive/shared/hooks.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Debounce a value by `delay` ms. Used for slider inputs in calculators
 * to avoid expensive re-renders on every pixel of slider movement.
 */
export function useDebouncedValue<T>(value: T, delay: number = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
