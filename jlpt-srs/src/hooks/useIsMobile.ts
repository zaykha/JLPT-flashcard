import { useEffect, useState } from 'react';

/**
 * Hook: Detects if viewport width is <= breakpoint
 * @param breakpoint number (default 520px)
 * @returns boolean true if viewport <= breakpoint
 */
export function useIsMobile(breakpoint: number = 520): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const update = () => setIsMobile(m.matches);

    update(); // run once at mount

    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}
