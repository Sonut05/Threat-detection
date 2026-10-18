"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { shell, pages, initFx } from './siteContent';
import { startGlobe } from './globeCore';
import '../app/_site/site.css';

const R = (path) => path;

export default function SitePage({ slug }) {
  const router = useRouter();
  const ref = useRef(null);
  const html = useMemo(() => shell(R, slug, pages[slug](R)), [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stop = initFx(ref.current, { startGlobe });

    const el = ref.current;
    const handleClick = (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !a.target &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        e.button === 0
      ) {
        e.preventDefault();
        router.push(href);
      }
    };

    if (el) {
      el.addEventListener('click', handleClick);
    }

    return () => {
      if (stop) stop();
      if (el) el.removeEventListener('click', handleClick);
    };
  }, [html, router]);

  return <div ref={ref} className="st-root" dangerouslySetInnerHTML={{ __html: html }} />;
}
