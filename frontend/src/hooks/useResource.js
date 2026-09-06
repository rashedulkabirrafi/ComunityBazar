import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
export default function useResource(path) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted)
        setState((s) => ({ ...s, error: "", loading: true }));
    });
    if (!path) return () => controller.abort();
    api(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, error: "", loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [path, version]);
  return { ...state, reload };
}
