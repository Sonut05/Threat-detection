"use client";

import { useEffect, useRef } from 'react';
import { startGlobe } from './globeCore';

// Always-on animated background (dot-matrix globe + starfield). Sits under the video.
export default function GlobeCanvas({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return startGlobe(ref.current, still);
  }, []);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
