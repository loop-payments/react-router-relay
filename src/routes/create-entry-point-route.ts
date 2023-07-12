import {
  type IEnvironmentProvider,
  loadQuery,
  JSResourceReference,
} from "react-relay";
import type { LoaderFunction, LoaderFunctionArgs } from "react-router-dom";
import type { ComponentType } from "react";

import type {
  BaseEntryPointComponent,
  PreloaderContextProvider,
  SimpleEntryPoint,
} from "./entry-point.types";
import EntryPointRoute from "./EntryPointRoute";

type EntryPointRouteProperties = {
  loader: LoaderFunction;
  Component: ComponentType<Record<string, never>>;
};

export function createEntryPointRoute<
  Component extends BaseEntryPointComponent,
  PreloaderContext = undefined,
>(
  entryPoint:
    | SimpleEntryPoint<Component, PreloaderContext>
    | JSResourceReference<SimpleEntryPoint<Component, PreloaderContext>>,
  environmentProvider: IEnvironmentProvider<never>,
  contextProvider?: PreloaderContextProvider<PreloaderContext>
): EntryPointRouteProperties {
  async function loader(args: LoaderFunctionArgs): Promise<any> {
    const loadedEntryPoint =
      "load" in entryPoint ? await entryPoint.load() : entryPoint;
    const { queries: queryArgs, ...props } = loadedEntryPoint.getPreloadProps({
      ...args,
      preloaderContext: contextProvider?.getPreloaderContext() as any,
    });
    let queries = undefined;
    if (queryArgs) {
      queries = Object.fromEntries(
        Object.entries(queryArgs).map(([key, { parameters, variables }]) => [
          key,
          // This can leak if we fail to mount the EntryPointRoute HOC. Not
          // sure if we can handle this better without improved support in
          // react-router.
          loadQuery(
            environmentProvider.getEnvironment(null),
            parameters,
            variables
          ),
        ])
      );
    }

    return {
      ...props,
      queries,
    };
  }

  return {
    loader,
    Component: EntryPointRoute(entryPoint),
  };
}
