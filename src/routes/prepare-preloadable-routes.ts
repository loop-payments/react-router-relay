import type { IEnvironmentProvider } from "react-relay";
import type { RouteObject } from "react-router-dom";

import type { PreloaderContextProvider } from "./entry-point.types";
import { createEntryPointRoute } from "./create-entry-point-route";
import type {
  EntryPointIndexRouteObject,
  EntryPointNonIndexRouteObject,
  EntryPointRouteObject,
} from "./entry-point-route-object.types";

/**
 * Prepare a set of routes that that use entry points for use in react-router.
 * This transforms the entryPoint property into a Component and loader that
 * react-router can understand.
 * @param routes
 * @param environmentProvider a provider for the relay environment
 * @param preloaderContextProvider an optional provider for additional context data for your entrypoints
 * @returns a list of RouteObjects compatible with react-router's data routers
 */
export function preparePreloadableRoutes<PreloaderContext>(
  routes: Array<EntryPointRouteObject>,
  environmentProvider: IEnvironmentProvider<never>,
  preloaderContextProvider?: PreloaderContextProvider<PreloaderContext>,
): Array<RouteObject> {
  return routes.map((route) => {
    let newRoute;
    if (isEntryPoint(route)) {
      const { entryPoint, ...rest } = route;
      newRoute = {
        ...rest,
        ...createEntryPointRoute(
          entryPoint,
          environmentProvider,
          preloaderContextProvider,
        ),
      };
    } else {
      newRoute = route;
    }

    if (newRoute.children) {
      newRoute.children = preparePreloadableRoutes(
        newRoute.children,
        environmentProvider,
        preloaderContextProvider,
      );
    }

    return newRoute;
  });
}

function isEntryPoint(
  route: EntryPointRouteObject,
): route is EntryPointIndexRouteObject | EntryPointNonIndexRouteObject {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return route.entryPoint != null;
}
