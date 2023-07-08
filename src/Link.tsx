import { type MouseEvent, type FocusEvent, useCallback, useContext, isValidElement } from 'react';
import { UNSAFE_DataRouterContext } from 'react-router-dom';
import { Link as RouterLink, type LinkProps, matchRoutes } from 'react-router-dom';
import { InternalPreload } from './routes/internal-preload-symbol';

type Props = LinkProps;

/**
 * A wrapper around react-router-dom's Link to preload the target JSResources
 * on hover or focus.
 */
export default function Link({ onMouseEnter, onFocus, ...props }: Props) {
  const routes = useContext(UNSAFE_DataRouterContext)?.router.routes ?? [];

  // Preflight the route by fetching the static JS resources of any entrypoints
  const preflightRoute = useCallback(() => {
    const matches = matchRoutes([...routes], props.to);
    if (!matches) {
      return;
    }
    for (const match of matches) {
      const route: any = match.route;
      const {Component, element} = route;
      let maybePreloadableComponent;
      if (Component) {
        maybePreloadableComponent = Component;
      } else if (isValidElement(element) && typeof element.type !== 'string') {
        maybePreloadableComponent = element.type;
      }

      if (maybePreloadableComponent) {
        try {
          maybePreloadableComponent[InternalPreload]?.().catch((e: unknown) => {
            console.warn(`[react-router-relay] failed to preload ${match.pathname} for route ${JSON.stringify(props.to)}`, e);
          });
        } catch (e: unknown) {
          console.warn(`[react-router-relay] failed to call preloader ${match.pathname} for route ${JSON.stringify(props.to)}`, e);
        }
      }
    }
  }, [routes, props.to]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      preflightRoute();
      onMouseEnter?.(e);
    },
    [onMouseEnter, preflightRoute],
  );
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLAnchorElement>) => {
      preflightRoute();
      onFocus?.(e);
    },
    [onFocus, preflightRoute],
  );

  return (
    <RouterLink
      {...props}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    />
  );
}
