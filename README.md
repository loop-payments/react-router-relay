# @kejistan/react-router-relay

Utilities and components to take advantage of Relay's preloaded queries when using react-router's data routers. This follows Relay's entrypoint pattern.

## Usage

Entrypoints work by defining the component, generally using a preloaded query, and a corresponding entrypoint.

### MyPage.tsx

```typescript
import type { SimpleEntryPointProps } from '@kejistan/react-router-relay';
import { usePreloadedQuery, graphql } from 'react-relay';

import type MyPageQuery from './__generated__/MyPageQuery.graphql';

type Props = SimpleEntryPointProps<{
  query: MyPageQuery,
}>;

export default MyPage({ queries }: Props) {
  const data = usePreloadedQuery(graphql`
    query MyPageQuery($someId: ID!) {
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
} from "@kejistan/react-router-relay";
import nullthrows from "nullthrows";

import type MyPage from "./MyPage";
import MyPageQuery from "./__generated__/MyPageQuery.graphql";

const entryPoint: SimpleEntryPoint<typeof MyPage> = {
	root: JSResource("MyPage", () => import("./MyPage")),
	getPreloadedProps({ params }) {
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

export default entryPoint;
```

### MyRouter.tsx

You need to use one of react-router's data routers and pre-process the routes via `preparePreloadableRoutes` before passing them into the router.

```typescript
import { useMemo, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRelayEnvironment } from "react-relay";
import {
	type EntryPointRouteObject,
	preparePreloadableRoutes,
} from "@kejistan/react-router-relay";

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

## JSResource

Loading data for entrypoints depends on having a JSResource implementation to coordinate and cache loads of the same resource. This package does not depend on using the internal JSResource implementation if you wish to use a different one in your entrypoints.
