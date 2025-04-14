import {
  useContext,
  useCallback,
  isValidElement,
  type ComponentType,
} from "react";
import {
  type To,
  UNSAFE_DataRouterContext,
  matchRoutes,
} from "react-router-dom";
import { InternalPreload } from "./routes/internal-preload-symbol.ts";
import type { PreloadableComponent } from "./routes/EntryPointRoute.ts";

/**
 * Returns a handler for triggering entrypoint loading for a target. This is used
 * by Link to preload entrypoints on render. You
 * can use this to build your own Link component if necessary.
 */
export function useLinkEntryPointLoadHandler(): (to: To) => void;
/** @deprecated move the `to` argument to the callback */
export function useLinkEntryPointLoadHandler(to: To): () => void;
export function useLinkEntryPointLoadHandler(
  deprecatedTo?: To,
): (to?: To) => void {
  const routes = useContext(UNSAFE_DataRouterContext)?.router.routes ?? [];

  // Fetch the entrypoint
  const fetchEntrypoint = useCallback(
    (to: To | undefined) => {
      to ??= deprecatedTo;
      // This shouldn't happen, at least one of to or deprecatedTo should be
      // defined.
      if (to == null) {
        return;
      }
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
        } else if (
          isValidElement(element) &&
          typeof element.type !== "string"
        ) {
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
                    e,
                  );
                },
              );
            }
          } catch (e: unknown) {
            console.warn(
              `[react-router-relay] failed to call entrypoint preloader ${
                match.pathname
              } for route ${JSON.stringify(to)}`,
              e,
            );
          }
        }
      }
    },
    [routes, deprecatedTo],
  );

  return fetchEntrypoint;
}
