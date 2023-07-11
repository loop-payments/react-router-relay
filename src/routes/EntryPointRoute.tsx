import { type ComponentType, useEffect } from "react";
import type { EntryPoint, EntryPointProps } from "react-relay";
import { useLoaderData } from "react-router-dom";
import type { OperationType } from "relay-runtime";

import type {
  BaseEntryPointComponent,
  LazyLoadable,
  SimpleEntryPoint,
} from "./entry-point.types";
import { InternalPreload } from "./internal-preload-symbol";

const preloadsToDispose = new Set();

export type PreloadableComponent = ComponentType & {
  [InternalPreload]?: {
    entryPoint: () => Promise<unknown>;
    resource: () => Promise<unknown>;
  };
};

export default function EntryPointRoute(
  entryPoint: LazyLoadable<SimpleEntryPoint<BaseEntryPointComponent, any>>
): ComponentType {
  let loadedEntryPoint: SimpleEntryPoint<BaseEntryPointComponent> | undefined;

  const loadEntryPoint = async () => {
    const loaded =
      typeof entryPoint === "function" ? await entryPoint() : await entryPoint;
    loadedEntryPoint = loaded;
    return loaded;
  };

  const Hoc: PreloadableComponent = () => {
    const data = useLoaderData() as EntryPointProps<
      Record<string, OperationType>,
      Record<string, EntryPoint<any, any> | undefined>,
      Record<string, never>,
      Record<string, never>
    >;

    // We need to dispose of preloaded queries when changing routes. React
    // router doesn't provide a mechanism for actually accomplishing this so
    // we have this effect which attempts to do a deferred cleanup. We use a
    // timeout to delay the cleanup to avoid issues when unmounting and re-
    // mounting the same component without a new call to the loader function.
    useEffect(() => {
      if (data.queries == null) {
        return;
      }

      Object.values(data.queries).forEach((preloadedQuery) => {
        preloadsToDispose.delete(preloadedQuery);
      });

      return () => {
        Object.values(data.queries).forEach((preloadedQuery) => {
          preloadsToDispose.add(preloadedQuery);
        });

        setTimeout(() => {
          Object.values(data.queries).forEach((preloadedQuery) => {
            if (preloadsToDispose.delete(preloadedQuery)) {
              preloadedQuery.dispose();
            }
          });
        }, 10);
      };
    }, [data.queries]);

    if (!loadedEntryPoint) throw loadEntryPoint();
    const resource = loadedEntryPoint.root;
    const Component = resource.getModuleIfRequired();
    if (Component) {
      return <Component {...data} />;
    }
    throw resource.load();
  };
  Hoc.displayName = `EntryPointRoute`;

  // This would be much better if it injected a modulepreload link. Unfortunately
  // we don't have a mechanism for getting the right bundle file name to put into
  // the href. We might be able to do it by building a rollup plugin.
  Hoc[InternalPreload] = {
    entryPoint: loadEntryPoint,
    resource: () =>
      loadEntryPoint().then((entryPoint) => entryPoint.root.load()),
  };

  return Hoc;
}
