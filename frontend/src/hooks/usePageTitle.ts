import { useEffect } from 'react';

const BASE_TITLE = 'Flux Explorer';

/** Sets the document title for the page, restoring the base title on unmount. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
