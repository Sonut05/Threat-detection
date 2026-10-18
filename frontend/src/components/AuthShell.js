"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import GlobeCanvas from './GlobeCanvas';
import '../app/_auth/auth.css';

const VIDEO = '/globe.mp4';
const POSTER = '/globe-poster.webp';

// Only things the app genuinely does.
const POINTS = [
  ['Scan SMS and email', 'Choose the message type, paste the text and scan it.'],
  ['Spam or Safe verdict', 'A trained classifier labels the message and shows its confidence.'],
  ['History and alerts', 'Every scan is saved to your account, and spam raises an alert.'],
];

export const Arrow = () => (
  <svg width="14" height="12" viewBox="0 0 12 10" fill="none" aria-hidden="true">
    <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AuthShell({ eyebrow, title, lead, children }) {
  useEffect(() => {
    document.documentElement.style.background = '#09090b';
    return () => { document.documentElement.style.background = ''; };
  }, []);
  return (
    <div className="au-root">
      <section className="au-side">
        <div className="au-wrap">
          <div className="au-top">
            <Link href="/" className="au-logo">Spam Shield</Link>
            <Link href="/" className="au-back">← Back to home</Link>
          </div>
          <div className="au-main">
            <p className="au-eyebrow au-rise" style={{ '--i': 0 }}>{eyebrow}</p>
            <h1 className="au-h au-rise" style={{ '--i': 1 }}>{title}</h1>
            <p className="au-p au-rise" style={{ '--i': 2 }}>{lead}</p>
            {children}
          </div>
          <div className="au-foot">© {new Date().getFullYear()} Spam Shield</div>
        </div>
      </section>

      <aside className="au-vis" aria-hidden="true">
        <GlobeCanvas className="au-canvas" />
        <video autoPlay muted loop playsInline preload="auto" poster={POSTER} onError={(e) => { e.currentTarget.style.display = 'none'; }}>
          <source src={VIDEO} type="video/mp4" />
        </video>
        <div className="au-cap"><span>Spam detection</span><span>SMS · Email</span></div>
        <div className="au-feed">
          <p className="au-quote">Know what is spam<br /><span>before you act on it.</span></p>
          <ul className="au-points">
            {POINTS.map(([t, d]) => (
              <li key={t}><i /><div><b>{t}</b><span>{d}</span></div></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
