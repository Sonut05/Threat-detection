"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobeCanvas from '../components/GlobeCanvas';
import './_hero/hero.css';

const VIDEO = '/globe.mp4';
const POSTER = '/globe-poster.webp';

const NAV = [['Features', '/features'], ['Detection', '/detection'], ['How it works', '/how-it-works'], ['Security', '/security']];

const Arrow = () => (
  <svg className="hp-arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
    <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const heroRef = useRef(null);
  const videoA = useRef(null);
  const videoB = useRef(null);
  const bgRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const menuRef = useRef(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.replace('/admin');
      else router.replace('/dashboard');
    }
  }, [user, router]);

  // lock page scroll only while the hero is mounted
  useEffect(() => {
    document.documentElement.classList.add('hp-lock');
    return () => document.documentElement.classList.remove('hp-lock');
  }, []);

  // entrance sequence: runs once, then removes its own classes
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.remove('hp-anim');
      return;
    }
    let started = false, bootT, safeT;
    const clean = () => {
      clearTimeout(safeT);
      el.removeEventListener('animationend', onEnd, true);
      el.classList.remove('hp-anim', 'hp-go');
    };
    const onEnd = (e) => {
      if (e.animationName === 'pillIn' && (e.target.classList.contains('hp-btn-primary') || e.target.classList.contains('hp-btn-ghost'))) clean();
    };
    const start = () => {
      if (started) return;
      started = true;
      clearTimeout(bootT);
      el.addEventListener('animationend', onEnd, true);
      safeT = setTimeout(clean, 2600);
      el.classList.add('hp-go');
    };
    bootT = setTimeout(start, 900);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start);
    else start();
    return () => { clearTimeout(bootT); clearTimeout(safeT); el.removeEventListener('animationend', onEnd, true); };
  }, []);

  // burger menu behaviour
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current?.contains(e.target) || burgerRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); burgerRef.current?.focus(); }
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  // looping background video with cross-fade at the loop point
  useEffect(() => {
    const A = videoA.current, B = videoB.current;
    if (!A || !B) return;
    const play = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      A.removeAttribute('autoplay');
      A.pause(); B.pause();
      try { A.currentTime = 0; } catch (e) {}
      return;
    }
    // if the clip can't play (blocked / offline), hide it so the built-in globe shows
    const bg = bgRef.current;
    const failT = setTimeout(() => { if (bg && (A.paused || A.readyState < 3)) bg.classList.add('hp-no-video'); }, 3500);
    const onErr = () => bg && bg.classList.add('hp-no-video');
    const onOk = () => bg && bg.classList.remove('hp-no-video');
    A.addEventListener('error', onErr, true);
    A.addEventListener('playing', onOk);
    const FADE = 0.9;
    let cur = A, nxt = B, swapping = false, timer;
    play(A);
    const tick = () => {
      if (swapping || !cur.duration) return;
      if (cur.duration - cur.currentTime > FADE) return;
      swapping = true;
      const out = cur;
      nxt.currentTime = 0; play(nxt);
      nxt.classList.add('hp-is-active'); out.classList.remove('hp-is-active');
      cur = nxt; nxt = out;
      timer = setTimeout(() => { out.pause(); out.currentTime = 0; swapping = false; }, FADE * 1000 + 100);
    };
    A.addEventListener('timeupdate', tick);
    B.addEventListener('timeupdate', tick);
    return () => { clearTimeout(timer); clearTimeout(failT); A.removeEventListener('error', onErr, true); A.removeEventListener('playing', onOk); A.removeEventListener('timeupdate', tick); B.removeEventListener('timeupdate', tick); };
  }, []);

  if (user) {
    return <div style={{ minHeight: '100vh', background: '#000' }} />;
  }

  return (
    <main ref={heroRef} className="hp-hero hp-anim">
      <div ref={bgRef} className="hp-bg" role="img" aria-label="Stylised globe of Earth rendered as a purple dot matrix against a starfield, slowly rotating">
        <GlobeCanvas className="hp-bg-canvas" />
        <video ref={videoA} className="hp-bg-video hp-is-active" autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true" poster={POSTER}>
          <source src={VIDEO} type="video/mp4" />
        </video>
        <video ref={videoB} className="hp-bg-video" muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true" poster={POSTER}>
          <source src={VIDEO} type="video/mp4" />
        </video>
      </div>

      <header className="hp-nav">
        <a className="hp-logo" href="#">Spam Shield</a>
        <nav className="hp-nav-links" aria-label="Primary">
          {NAV.map(([n, h]) => <Link key={n} href={h}>{n}</Link>)}
        </nav>
        <div className="hp-nav-actions">
          <Link href="/login" className="hp-btn hp-btn-nav-start">Get Started <Arrow /></Link>
        </div>
        <button
          ref={burgerRef}
          className="hp-burger"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="menu"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        ><span></span></button>
      </header>

      <nav ref={menuRef} className={`hp-menu${menuOpen ? ' hp-open' : ''}`} id="menu" aria-label="Mobile" onClick={(e) => { if (e.target.closest('a')) setMenuOpen(false); }}>
        {NAV.map(([n, h]) => <Link key={n} href={h}>{n}</Link>)}
        <div className="hp-divider"></div>
        <Link className="hp-m-start" href="/login">Get Started <Arrow /></Link>
      </nav>

      <div className="hp-hero-inner">
        <h1>
          <span className="hp-ln"><span className="hp-ln-i">Threat-proof</span></span>
          <span className="hp-ln"><span className="hp-ln-i">messaging</span></span>
        </h1>
        <p className="hp-sub">
          Paste an SMS or email and get an instant Spam or Safe verdict<br />{' '}
          from a trained machine-learning model,<br />{' '}
          with a saved history and alerts for every scan.
        </p>
        <div className="hp-ctas">
          <Link href="/login" className="hp-btn hp-btn-lg hp-btn-primary">Get Started <Arrow /></Link>
        </div>
      </div>

    </main>
  );
}
