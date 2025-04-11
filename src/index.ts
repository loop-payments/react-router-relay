export { preparePreloadableRoutes } from "./routes/prepare-preloadable-routes.ts";
export { useLinkDataLoadHandler } from "./useLinkDataLoadHandler.ts";
export { useLinkResourceLoadHandler } from "./useLinkResourceLoadHandler.ts";

export type * from "./routes/entry-point.types.ts";
export type * from "./routes/entry-point-route-object.types.ts";

import Link from "./Link.tsx";
import JSResource from "./JSResource.ts";

export { Link, JSResource };
