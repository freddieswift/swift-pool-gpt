import { useCallback, useEffect, useState } from "react";

export function useApi(loader, dependencies = [], options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(options.enabled !== false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (options.enabled === false) return null;

    setLoading(true);
    setError(null);
    try {
      const value = await loader();
      setData(value);
      return value;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (options.enabled !== false) {
      reload().catch(() => {});
    }
  }, [reload, options.enabled]);

  return { data, setData, loading, error, reload };
}
