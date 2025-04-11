import { useContext, useCallback } from "react";
import {
  type To,
  UNSAFE_DataRouterContext,
  matchRoutes,
  useResolvedPath,
} from "react-router-dom";

/**
 * Returns a handler for triggering data loading for a target. This is used
 * by Link to preload graphql data for entrypoints on mouse down events. You
 * can use this to build your own Link component if necessary.
 */
export function useLinkDataLoadHandler(to: To): () => void {
  const routes = useContext(UNSAFE_DataRouterContext)?.router.routes ?? [];

  // Trigger data fetching for any entrypoints
  const resolvedPath = useResolvedPath(to);
  const fetchData = useCallback(() => {
    const matches = matchRoutes([...routes], to);
    if (!matches) {
      return;
    }

    const url = new URL(
      resolvedPath.pathname + resolvedPath.search,
      window.location.origin,
    );
    const request = new Request(url);
    for (const match of matches) {
      const { loader } = match.route;
      if (typeof loader !== "function") {
        return;
      }

      try {
        loader?.({
          params: match.params,
          request,
          context: undefined,
        });
      } catch (e: unknown) {
        console.warn(
          `[react-router-relay] failed to preload ${
            match.pathname
          } data for route ${JSON.stringify(to)}`,
          e,
        );
      }
    }
  }, [routes, to, resolvedPath]);

  return fetchData;
}
