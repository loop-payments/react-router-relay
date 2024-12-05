import {
  type MouseEvent,
  type FocusEvent,
  useCallback,
  useEffect,
} from "react";
import { Link as RouterLink, type LinkProps } from "react-router";
import { useLinkResourceLoadHandler } from "./useLinkResourceLoadHandler";
import { useLinkDataLoadHandler } from "./useLinkDataLoadHandler";
import { useLinkEntryPointLoadHandler } from "./useLinkEntryPointLoadHandler";

type Props = LinkProps;

/**
 * A wrapper around react-router-dom's Link to preload the target routes.
 * This will load the target JSResources on hover or focus, and will trigger
 * the loader, which will start requesting graphql data, on mouse down.
 */
export default function Link({
  onMouseEnter,
  onFocus,
  onMouseDown,
  ...props
}: Props) {
  const fetchEntryPoint = useLinkEntryPointLoadHandler(props.to);
  const fetchResources = useLinkResourceLoadHandler(props.to);
  const fetchData = useLinkDataLoadHandler(props.to);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(fetchEntryPoint);
      return () => cancelIdleCallback(id);
    } else {
      const id = requestAnimationFrame(fetchEntryPoint);
      return () => cancelAnimationFrame(id);
    }
  }, [fetchEntryPoint]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      fetchResources();
      onMouseEnter?.(e);
    },
    [onMouseEnter, fetchResources],
  );
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLAnchorElement>) => {
      fetchResources();
      onFocus?.(e);
    },
    [onFocus, fetchResources],
  );
  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      fetchResources();
      fetchData();
      onMouseDown?.(e);
    },
    [onMouseDown, fetchResources, fetchData],
  );

  return (
    <RouterLink
      {...props}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
    />
  );
}
