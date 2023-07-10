import { type IEnvironmentProvider, loadQuery } from "react-relay";
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
  entryPoint: SimpleEntryPoint<Component, PreloaderContext>,
  environmentProvider: IEnvironmentProvider<never>,
  contextProvider?: PreloaderContextProvider<PreloaderContext>
): EntryPointRouteProperties {
  function loader(args: LoaderFunctionArgs): any {
    const { queries: queryArgs, ...props } = entryPoint.getPreloadProps({
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
    // The types around entrypoints are not super good in typescript.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Component: EntryPointRoute(entryPoint.root),
  };
}
