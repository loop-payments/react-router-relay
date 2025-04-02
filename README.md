# @loop-payments/react-router-relay

Utilities and components to take advantage of Relay's preloaded queries when using react-router's data routers. This follows Relay's entrypoint pattern.

## Usage

Entrypoints work by defining the component, generally using a preloaded query, and a corresponding entrypoint.

### MyPage.tsx

```typescript
import type { SimpleEntryPointProps } from '@loop-payments/react-router-relay';
import { usePreloadedQuery, graphql } from 'react-relay';

import type MyPageQuery from './__generated__/MyPageQuery.graphql';

type Props = SimpleEntryPointProps<{
  query: MyPageQuery,
}>;

export default MyPage({ queries }: Props) {
  const data = usePreloadedQuery(graphql`
    query MyPageQuery($someId: ID!) @preloadable {
      node(id: $someId) {
        __typename
      }
    }
  `, queries.query);

  return <>You found a {data.node?.__typename ?? 'nothing'}</>;
}
```

### MyPage.entrypoint.ts

```typescript
import {
  type SimpleEntryPoint,
  JSResource,
} from "@loop-payments/react-router-relay";
import nullthrows from "nullthrows";

import type MyPage from "./MyPage";
import MyPageQueryParameters from "./__generated__/MyPageQuery$parameters";

const entryPoint: SimpleEntryPoint<typeof MyPage> = {
  root: JSResource("MyPage", () => import("./MyPage")),
  getPreloadProps({ params }) {
    return {
      queries: {
        query: {
          parameters: MyPageQueryParameters,
          variables: {
            someId: nullthrows(params.someId),
          },
        },
      },
    };
  },
};

export default entryPoint;
```

#### Note for Relay < 16.2

If you're using relay prior to 16.2.0 you won't be able to use the `@preloadable` annotation and thus won't be able to generate `$parameters` files. You can still use entry points, but they'll need to import concrete request objects from the `.graphql` files instead.

```ts
import MyPageQuery from "./__generated__/MyPageQuery.graphql";

const entryPoint: SimpleEntryPoint<typeof MyPage> = {
  root: JSResource("MyPage", () => import("./MyPage")),
  getPreloadProps({ params }) {
    return {
      queries: {
        query: {
          parameters: MyPageQuery,
          variables: {
            someId: nullthrows(params.someId),
          },
        },
      },
    };
  },
};
```

### MyRouter.tsx

You need to use one of react-router's data routers and pre-process the routes via `preparePreloadableRoutes` before passing them into the router.

```typescript
import {
  type EntryPointRouteObject,
  preparePreloadableRoutes,
} from "@loop-payments/react-router-relay";
import { useMemo, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRelayEnvironment } from "react-relay";

import MyPageEntryPoint from "./MyPage.entrypoint";

const MY_ROUTES: EntryPointRouteObject[] = [
  {
    path: ":someId",
    entryPoint: MyPageEntryPoint,
  },
];

export default function MyRouter() {
  const environment = useRelayEnvironment();
  // Potentially unnecessary if you never change your environment
  const environmentRef = useRef(environment);
  environmentRef.current = environment;

  const router = useMemo(() => {
    const routes = preparePreloadableRoutes(MY_ROUTES, {
      getEnvironment() {
        return environmentRef.current;
      },
    });

    return createBrowserRouter(routes);
  }, []);

  return <RouterProvider router={router} />;
}
```

## Link

This package includes a wrapper around `react-router-dom`'s `Link` component. Using this component is optional. This adds a basic pre-fetch to the link that will load the JSResources for the destination on hover or focus events, and start fetching data on mouse down.

## A note on JSResource

Loading data for entrypoints depends on having a JSResource implementation to coordinate and cache loads of the same resource. This package does not depend on using the internal JSResource implementation if you wish to use a different one in your entrypoints.
