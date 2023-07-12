import type { JSResourceReference, EntryPointComponent } from "react-relay";
import type {
  IndexRouteObject,
  NonIndexRouteObject,
  RouteObject,
} from "react-router-dom";
import type { EntryPointParams } from "./entry-point.types";

type BadEntryPointType = {
  readonly root: JSResourceReference<EntryPointComponent<any, any, any, any>>;
  readonly getPreloadProps: (entryPointParams: EntryPointParams<any>) => any;
};

export interface EntryPointIndexRouteObject
  extends Omit<
    IndexRouteObject,
    "loader" | "action" | "element" | "Component" | "lazy"
  > {
  entryPoint: BadEntryPointType | JSResourceReference<BadEntryPointType>;
}

export interface EntryPointNonIndexRouteObject
  extends Omit<
    NonIndexRouteObject,
    "loader" | "action" | "element" | "Component" | "lazy"
  > {
  entryPoint: BadEntryPointType | JSResourceReference<BadEntryPointType>;
  children?: Array<EntryPointRouteObject>;
}

export type EntryPointRouteObject =
  | EntryPointIndexRouteObject
  | EntryPointNonIndexRouteObject
  | RouteObject;
