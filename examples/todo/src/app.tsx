import 'todomvc-common';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {RelayEnvironmentProvider} from 'react-relay';
import type {GraphQLResponse, RequestParameters, Variables} from 'relay-runtime';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {ErrorBoundary} from 'react-error-boundary';
import TodoAppEntryPoint from './entrypoints/TodoApp.entrypoint';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {EntryPointRouteObject, preparePreloadableRoutes} from '@loop-payments/react-router-relay';

async function fetchQuery(params: RequestParameters, variables: Variables): Promise<GraphQLResponse> {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queryId: params.id,
      variables,
    }),
  });
  return response.json();
}

const modernEnvironment: Environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

const rootElement = document.getElementById('root')!;

const appEntryPoint: EntryPointRouteObject = {
  path: '/',
  entryPoint: TodoAppEntryPoint,
};

const routes = preparePreloadableRoutes([appEntryPoint], {
  getEnvironment() {
    return modernEnvironment;
  },
});

const router = createBrowserRouter(routes);

ReactDOM.render(
  <RelayEnvironmentProvider environment={modernEnvironment}>
    <React.Suspense fallback={<div>Loading</div>}>
      <ErrorBoundary fallbackRender={({error}) => <div>{error.message}</div>}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </React.Suspense>
  </RelayEnvironmentProvider>,
  rootElement);