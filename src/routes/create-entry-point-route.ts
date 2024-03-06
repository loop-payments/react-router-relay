import {
  type IEnvironmentProvider,
  loadQuery,
  JSResourceReference,
  PreloadedQuery,
  GraphQLTaggedNode,
  PreloadableConcreteRequest,
  PreloadOptions,
  EnvironmentProviderOptions,
} from 'react-relay';
import type { LoaderFunction, LoaderFunctionArgs, ShouldRevalidateFunction, ShouldRevalidateFunctionArgs } from "react-router-dom";
import type { ComponentType } from "react";

import type {
  BaseEntryPointComponent,
  PreloaderContextProvider,
  SimpleEntryPoint,
} from "./entry-point.types";
import EntryPointRoute from "./EntryPointRoute";
import type {EntryPointRouteObject} from './entry-point-route-object.types';
import {OperationType} from 'relay-runtime';

type EntryPointRouteProperties = {
  loader: LoaderFunction;
  shouldRevalidate: ShouldRevalidateFunction;
  Component: ComponentType<Record<string, never>>;
};

export function createEntryPointRoute<
  Component extends BaseEntryPointComponent,
  PreloaderContext = undefined,
>(
  entryPoint:
    | SimpleEntryPoint<Component, PreloaderContext>
    | JSResourceReference<SimpleEntryPoint<Component, PreloaderContext>>,
  rest: Omit<EntryPointRouteObject, 'entryPoint'>,
  environmentProvider: IEnvironmentProvider<never>,
  contextProvider?: PreloaderContextProvider<PreloaderContext>,
): EntryPointRouteProperties {
  let queries: {[p: string]: PreloadedQuery<OperationType, any>} | undefined = undefined;

  async function loader(args: LoaderFunctionArgs): Promise<any> {
    const loadedEntryPoint =
      "load" in entryPoint ? await entryPoint.load() : entryPoint;
    const { queries: queryArgs, ...props } = loadedEntryPoint.getPreloadProps({
      ...args,
      preloaderContext: contextProvider?.getPreloaderContext() as any,
    });
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

  // This is needed to avoid cases where the query has been disposed of but the
  // router would not normally revalidate and rerun the loader which is needed
  // to reload the query.
  // See https://github.com/loop-payments/react-router-relay/issues/15.
  function shouldRevalidate(args: ShouldRevalidateFunctionArgs): boolean {
    if (rest.shouldRevalidate && rest.shouldRevalidate(args)) {
      return true;
    }
    for (let key in queries) {
      const query = queries[key]
      if (query.isDisposed) {
        return true;
      }
    }
    return false;
  }

  return {
    loader,
    shouldRevalidate,
    Component: EntryPointRoute(entryPoint),
  };
}
