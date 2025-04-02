import {
  type MouseEvent,
  type FocusEvent,
  useCallback,
  useEffect,
} from "react";
import { Link as RouterLink, type LinkProps } from "react-router-dom";
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
  const fetchEntryPoint = useLinkEntryPointLoadHandler();
  const fetchResources = useLinkResourceLoadHandler();
  const fetchData = useLinkDataLoadHandler(props.to);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => fetchEntryPoint(props.to));
      return () => cancelIdleCallback(id);
    } else {
      const id = requestAnimationFrame(() => fetchEntryPoint(props.to));
      return () => cancelAnimationFrame(id);
    }
  }, [fetchEntryPoint, props.to]);

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      fetchResources(props.to);
      onMouseEnter?.(e);
    },
    [onMouseEnter, fetchResources, props.to]
  );
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLAnchorElement>) => {
      fetchResources(props.to);
      onFocus?.(e);
    },
    [onFocus, fetchResources, props.to]
  );
  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      fetchResources(props.to);
      fetchData();
      onMouseDown?.(e);
    },
    [onMouseDown, fetchResources, fetchData, props.to]
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
