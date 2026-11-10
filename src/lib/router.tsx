import { useCallback, useEffect, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

/** Minimal hash router: works on any static host, no dependency, no server rewrites. */
export function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.length > 0 ? hash : '/';
}

export function navigate(path: string): void {
  if (currentPath() === path) return;
  window.location.hash = path;
}

export function goBack(): void {
  if (window.history.length > 1) window.history.back();
  else navigate('/');
}

export function useRoute(): string {
  const [path, setPath] = useState<string>(() => currentPath());
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export interface RouteInfo {
  path: string;
  segments: string[];
  section: string;
  id?: string;
  query: URLSearchParams;
}

export function parseRoute(path: string): RouteInfo {
  const [pathname, search] = path.split('?');
  const segments = pathname.split('/').filter(Boolean);
  return {
    path,
    segments,
    section: segments[0] ?? 'home',
    id: segments[1],
    query: new URLSearchParams(search ?? ''),
  };
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      event.preventDefault();
      navigate(to);
    },
    [onClick, to]
  );
  return (
    <a href={`#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
