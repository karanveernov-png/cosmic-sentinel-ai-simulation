import { useCallback, useEffect, useState } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads data from a service call on mount (and whenever `deps` change),
 * exposing a `reload` function for manual refreshes. Used by pages that
 * read from the data providers but don't need their state shared globally
 * the way incidents/activity are (see AppDataContext).
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, loading: true, error: null });

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loader()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch(() => setState((prev) => ({ ...prev, loading: false, error: 'Unable to load this data.' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
