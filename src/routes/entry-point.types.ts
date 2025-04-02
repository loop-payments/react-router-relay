import type {
  EntryPoint,
  EntryPointComponent,
  EntryPointProps,
} from "react-relay";
import type { LoaderFunctionArgs, Params } from "react-router-dom";
import type { OperationType } from "relay-runtime";

export type BaseEntryPointComponent = EntryPointComponent<
  Record<string, OperationType>,
  Record<string, EntryPoint<any, any> | undefined>
>;

export interface EntryPointParams<PreloaderContext> extends LoaderFunctionArgs {
  request: Request;
  params: Params;
  preloaderContext: PreloaderContext;
}

export interface SimpleEntryPoint<
  Component = BaseEntryPointComponent,
  PreloaderContext = undefined,
> extends EntryPoint<Component, EntryPointParams<PreloaderContext>> {
  // If you define a handle on your entrypoint we will propagate it to the
  // corresponding route.
  handle?: unknown;
}

export type SimpleEntryPointProps<
  Queries extends Record<string, OperationType>,
  ExtraProps = Record<string, never>,
> = EntryPointProps<
  Queries,
  Record<string, EntryPoint<any, any> | undefined>,
  any,
  ExtraProps
>;

export interface PreloaderContextProvider<T> {
  getPreloaderContext(): T;
}
