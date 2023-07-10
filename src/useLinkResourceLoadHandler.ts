import { useContext, useCallback, isValidElement } from "react";
import {
  type To,
  UNSAFE_DataRouterContext,
  matchRoutes,
} from "react-router-dom";
import { InternalPreload } from "./routes/internal-preload-symbol";

/**
 * Returns a handler for triggering resource loading for a target. This is used
 * by Link to preload JSResources for entrypoints on hover or focus events. You
 * can use this to build your own Link component if necessary.
 */
export function useLinkResourceLoadHandler(to: To): () => void {
  const routes = useContext(UNSAFE_DataRouterContext)?.router.routes ?? [];

  // Fetch the static JS resources of any entrypoints
  const fetchResources = useCallback(() => {
    const matches = matchRoutes([...routes], to);
    if (!matches) {
      return;
    }
    for (const match of matches) {
      const route: any = match.route;
      const { Component, element } = route;
      let maybePreloadableComponent;
      if (Component) {
        maybePreloadableComponent = Component;
      } else if (isValidElement(element) && typeof element.type !== "string") {
        maybePreloadableComponent = element.type;
      }

      if (maybePreloadableComponent) {
        try {
          maybePreloadableComponent[InternalPreload]?.().catch((e: unknown) => {
            console.warn(
              `[react-router-relay] failed to preload ${
                match.pathname
              } for route ${JSON.stringify(to)}`,
              e
            );
          });
        } catch (e: unknown) {
          console.warn(
            `[react-router-relay] failed to call preloader ${
              match.pathname
            } for route ${JSON.stringify(to)}`,
            e
          );
        }
      }
    }
  }, [routes, to]);

  return fetchResources;
}
