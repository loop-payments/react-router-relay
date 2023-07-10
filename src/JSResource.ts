/*
 * Sourced from:
 * https://github.com/relayjs/relay-examples/blob/2e9a42d808f1ac52ac51282ea7c5e1c33144c031/issue-tracker/src/JSResource.js
 * with some modifications to add types and conform to the current
 * JSResourceReference interface in react-relay.
 */

import { JSResourceReference } from "react-relay";

/**
 * A cache of resources to avoid loading the same module twice. This is important
 * because Webpack dynamic imports only expose an asynchronous API for loading
 * modules, so to be able to access already-loaded modules synchronously we
 * must have stored the previous result somewhere.
 */
const resourceMap = new Map<string, Resource<any>>();

type Loader<TModule> = () => Promise<TModule | { readonly default: TModule }>;

/**
 * A generic resource: given some method to asynchronously load a value - the loader()
 * argument - it allows accessing the state of the resource.
 */
class Resource<TModule> implements JSResourceReference<TModule> {
  #error: Error | null = null;
  #promise: Promise<TModule> | null = null;
  #result: TModule | null = null;
  #moduleId: string;
  #loader: Loader<TModule>;

  constructor(moduleId: string, loader: Loader<TModule>) {
    this.#moduleId = moduleId;
    this.#loader = loader;
  }

  /**
   * Loads the resource if necessary.
   */
  load(): Promise<TModule> {
    let promise = this.#promise;
    if (promise == null) {
      promise = this.#loader()
        .then((result) => {
          // This is a hack to support both modules with default exports (the
          // common case) and loaders that need to export something directly.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (result.default) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.#result = result.default as TModule;
          } else {
            this.#result = result as TModule;
          }
          return this.#result;
        })
        .catch((error) => {
          this.#error = error;
          throw error;
        });
      this.#promise = promise;
    }
    return promise;
  }

  /**
   * Returns the result, if available. This can be useful to check if the value
   * is resolved yet.
   */
  getModuleIfRequired(): TModule | null {
    return this.#result;
  }

  /**
   * This is the key method for integrating with React Suspense. Read will:
   * - "Suspend" if the resource is still pending (currently implemented as
   *   throwing a Promise, though this is subject to change in future
   *   versions of React)
   * - Throw an error if the resource failed to load.
   * - Return the data of the resource if available.
   */
  read() {
    if (this.#result != null) {
      return this.#result;
    } else if (this.#error != null) {
      throw this.#error;
    } else {
      throw this.load();
    }
  }

  /**
   *
   */
  getModuleId(): string {
    return this.#moduleId;
  }
}

/**
 * A helper method to create a resource, intended for dynamically loading code.
 *
 * Example:
 * ```
 *    // Before rendering, ie in an event handler:
 *    const resource = JSResource('Foo', () => import('./Foo.js));
 *    resource.load();
 *
 *    // in a React component:
 *    const Foo = resource.read();
 *    return <Foo ... />;
 * ```
 *
 * @param {*} moduleId A globally unique identifier for the resource used for caching
 * @param {*} loader A method to load the resource's data if necessary
 */
export default function JSResource<TModule>(
  moduleId: string,
  loader: Loader<TModule>
): Resource<TModule> {
  let resource = resourceMap.get(moduleId);
  if (resource == null) {
    resource = new Resource(moduleId, loader);
    resourceMap.set(moduleId, resource);
  }
  return resource;
}
