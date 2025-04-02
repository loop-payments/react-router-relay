import {
  type IEnvironmentProvider,
  loadQuery,
  JSResourceReference,
  PreloadOptions,
  GraphQLTaggedNode,
  EnvironmentProviderOptions,
} from "react-relay";
import type { PreloadableConcreteRequest } from "relay-runtime";
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
  handle?: unknown;
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
        Object.entries(queryArgs).map(
          ([
            key,
            { parameters, variables, options, environmentProviderOptions },
          ]: [
            string,
            {
              parameters: GraphQLTaggedNode | PreloadableConcreteRequest<any>;
              variables: any;
              options: PreloadOptions | null | undefined;
              environmentProviderOptions:
                | EnvironmentProviderOptions
                | null
                | undefined;
            },
          ]) => [
            key,
            // This can leak if we fail to mount the EntryPointRoute HOC. Not
            // sure if we can handle this better without improved support in
            // react-router.
            loadQuery(
              environmentProvider.getEnvironment(null),
              parameters,
              variables,
              options ?? undefined,
              environmentProviderOptions ?? undefined
            ),
          ]
        )
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
    // Entrypoints that are JSResourceReferences cannot have a handle.
    handle: "load" in entryPoint ? undefined : entryPoint.handle,
  };
}
