import { useCallback, useEffect, useState } from "react";

const KEY = "sv-favorites";

export const useFavorites = () => {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const toggle = useCallback(
    (id: string) => {
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      persist(next);
    },
    [ids],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has };
};
