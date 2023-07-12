import { useContext, useCallback, isValidElement, ComponentType } from "react";
import {
  type To,
  UNSAFE_DataRouterContext,
  matchRoutes,
} from "react-router-dom";
import { InternalPreload } from "./routes/internal-preload-symbol";
import { PreloadableComponent } from "./routes/EntryPointRoute";

/**
 * Returns a handler for triggering entrypoint loading for a target. This is used
 * by Link to preload entrypoints on render. You
 * can use this to build your own Link component if necessary.
 */
export function useLinkEntryPointLoadHandler(to: To): () => void {
  const routes = useContext(UNSAFE_DataRouterContext)?.router.routes ?? [];

  // Fetch the entrypoint
  const fetchEntrypoint = useCallback(() => {
    const matches = matchRoutes([...routes], to);
    if (!matches) {
      return;
    }
    for (const match of matches) {
      const route: any = match.route;
      const { Component, element } = route;
      let maybePreloadableComponent:
        | ComponentType
        | PreloadableComponent
        | undefined;
      if (Component) {
        maybePreloadableComponent = Component;
      } else if (isValidElement(element) && typeof element.type !== "string") {
        maybePreloadableComponent = element.type;
      }

      if (maybePreloadableComponent) {
        try {
          if (InternalPreload in maybePreloadableComponent) {
            maybePreloadableComponent[InternalPreload]?.entryPoint().catch(
              (e: unknown) => {
                console.warn(
                  `[react-router-relay] failed to preload ${
                    match.pathname
                  } entrypoint for route ${JSON.stringify(to)}`,
                  e
                );
              }
            );
          }
        } catch (e: unknown) {
          console.warn(
            `[react-router-relay] failed to call entrypoint preloader ${
              match.pathname
            } for route ${JSON.stringify(to)}`,
            e
          );
        }
      }
    }
  }, [routes, to]);

  return fetchEntrypoint;
}
