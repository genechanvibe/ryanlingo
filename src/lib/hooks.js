import { useCallback, useEffect, useRef, useState } from 'react';

// setTimeout that is cleared automatically when the component unmounts.
export function useLater() {
  const ids = useRef(new Set());
  useEffect(() => {
    const set = ids.current;
    return () => {
      set.forEach(clearTimeout);
      set.clear();
    };
  }, []);
  return useCallback((fn, ms) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, ms);
    ids.current.add(id);
    return id;
  }, []);
}

// Drives the `.shake` CSS animation.
export function useShake(ms = 450) {
  const later = useLater();
  const [shaking, setShaking] = useState(false);
  const shake = useCallback(() => {
    setShaking(true);
    later(() => setShaking(false), ms);
  }, [later, ms]);
  return [shaking, shake];
}
