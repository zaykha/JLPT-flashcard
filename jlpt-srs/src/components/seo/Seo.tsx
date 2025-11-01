import { useEffect } from 'react';

type Props = {
  title: string;
  description?: string;
};

export function Seo({ title, description }: Props) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const ensureMeta = (name: string, content: string) => {
      let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const ensureOG = (property: string, content: string) => {
      let el = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      ensureMeta('description', description);
      ensureOG('og:description', description);
    }
    ensureOG('og:title', title);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]);

  return null;
}

