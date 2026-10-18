// Marketing-site content for Spam Shield. Pure strings + one tiny behaviour module (initFx),
// so the same source drives the Next.js pages and the standalone preview.
// R(path) turns a site path into a link ('/features' in Next, '#/features' in the preview).

const ARW = '<svg width="14" height="12" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NAV = [
  ['features', 'Features'], ['detection', 'Detection'], ['how-it-works', 'How it works'],
  ['security', 'Security'],
];

const head = (eyebrow, title, lead) => `
  <header class="st-hero">
    <p class="st-eyebrow st-rv">${eyebrow}</p>
    <h1 class="st-h1 st-rv" style="--d:1">${title}</h1>
    <p class="st-lead st-rv" style="--d:2">${lead}</p>
  </header>`;

const cta = (R, title, text) => `
  <section class="st-cta st-rv">
    <h2>${title}</h2><p>${text}</p>
    <a class="st-btn" href="${R('/login')}">Get Started ${ARW}</a>
  </section>`;

export function shell(R, active, body) {
  const links = NAV.map(([s, l]) => `<a href="${R('/' + s)}"${s === active ? ' class="on"' : ''}>${l}</a>`).join('');
  return `
  <canvas class="st-gl" data-gl aria-hidden="true"></canvas>
  <div class="st-veil"></div>
  <header class="st-nav">
    <a class="st-logo" href="${R('/')}">Spam Shield</a>
    <nav class="st-links" aria-label="Primary">${links}</nav>
    <a class="st-btn st-btn-sm st-nav-cta" href="${R('/login')}">Get Started ${ARW}</a>
    <button class="st-burger" aria-label="Open menu" aria-expanded="false"><span></span></button>
  </header>
  <nav class="st-menu" aria-label="Mobile">${links}<a class="st-m-cta" href="${R('/login')}">Get Started ${ARW}</a></nav>
  <main class="st-main">${body}</main>
  <footer class="st-foot">
    <div class="st-foot-grid">
      <div><a class="st-logo" href="${R('/')}">Spam Shield</a>
        <p>Machine-learning spam detection for SMS and email.</p></div>
      <div><h4>Product</h4><a href="${R('/features')}">Features</a><a href="${R('/detection')}">Detection</a><a href="${R('/how-it-works')}">How it works</a></div>
      <div><h4>Company</h4><a href="${R('/security')}">Security</a></div>
      <div><h4>Account</h4><a href="${R('/login')}">Sign in</a><a href="${R('/register')}">Create account</a></div>
    </div>
    <div class="st-foot-bar"><span>© ${new Date().getFullYear()} Spam Shield</span><span>SMS &amp; email spam detection</span></div>
  </footer>`;
}

const I = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const pages = {
  /* ---------------------------------------------------------------- FEATURES */
  features: (R) => head('Features', 'What Spam Shield<br> does for you.',
    'Paste an SMS or an email, get a Spam or Safe verdict with a confidence score, and keep a record of every scan.') + `
  <section class="st-rows">
    ${[
      ['01', 'SMS &amp; email scanning', 'Choose SMS or Email, paste the message and scan it. If the text looks like the other type, the dashboard warns you before it runs.', I('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>')],
      ['02', 'Spam or Safe verdict', 'A trained machine-learning classifier labels each message Spam or Safe and shows the confidence behind its decision.', I('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>')],
      ['03', 'Scan history', 'Every scan is saved to your account with its type, verdict and confidence, so you can look back at what you checked.', I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')],
      ['04', 'Spam alerts', 'A warning appears when spam is detected, and the Alerts page lists every message that was flagged as Spam.', I('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>')],
      ['05', 'Security overview', 'Your dashboard shows total messages analysed, spam detected, safe messages, an accuracy rate and a spam-to-safe ratio.', I('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>')],
      ['06', 'You control your records', 'Delete any scan from your history whenever you like.', I('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')],
      ['07', 'Admin console', 'Administrators sign in separately to see platform totals, recent activity and per-user SMS and email scan counts, and to activate, deactivate or delete accounts.', I('<path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6z"/>')],
      ['08', 'Simple sign-in', 'Create an account with your email, or continue with Google.', I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')],
    ].map(([n, t, d, ic]) => `
    <article class="st-row st-rv">
      <span class="st-num">${n}</span>
      <div class="st-ico">${ic}</div>
      <h3>${t}</h3><p>${d}</p>
    </article>`).join('')}
  </section>` + cta(R, 'Scan your first message.', 'Create an account, paste an SMS or email and see the verdict.'),

  /* --------------------------------------------------------------- DETECTION */
  detection: (R) => head('Detection', 'How spam is<br> detected.',
    'Spam Shield classifies the text of a message with a machine-learning model trained on spam and legitimate messages.') + `
  <section class="st-explain st-rv">
    <p>The model does not follow a fixed checklist. Your message is cleaned and turned into TF-IDF weights — common words count for less, distinctive words count for more. A pre-trained classifier then returns a probability, and based on its confidence thresholds the message is labelled <b>Spam</b> or <b>Safe</b>.</p>
  </section>

  <h2 class="st-sec-title st-rv">Signs of spam you will recognise</h2>
  <section class="st-signals">
    ${[
      ['Pressure &amp; urgency', '“Act now”, “within 24 hours”, “final notice”. Manufactured deadlines are a common social-engineering lever.'],
      ['Too-good-to-be-true offers', 'Prizes, lotteries, free gadgets and guaranteed returns — rewards you never signed up for.'],
      ['Suspicious links', 'URL shorteners, odd domains and links that do not match the sender they claim to be.'],
      ['Credential &amp; KYC requests', 'Requests for OTPs, passwords, PINs or “KYC verification” — legitimate services do not ask for these over SMS.'],
      ['Impersonation', 'Fake couriers, banks, tax offices and support desks borrowing a trusted name.'],
      ['Unusual wording', 'Awkward phrasing, heavy punctuation and capital letters are common in mass-produced spam.'],
    ].map(([t, d], i) => `<div class="st-sig st-rv" style="--d:${i % 3}"><i></i><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </section>

  <section class="st-demo st-rv">
    <div class="st-demo-head">
      <h2>Spot the signs yourself</h2>
      <p>This highlights wording that often appears in spam. It does not classify your message — the trained model does that when you scan inside the app. Nothing you type here leaves your browser.</p>
    </div>
    <div class="st-demo-body">
      <div class="st-demo-in">
        <div class="st-chips">
          <span>Try an example:</span>
          <button type="button" data-sample="URGENT: your account is locked. Verify your KYC within 24 hours at http://bit.ly/kyc-now or it will be suspended.">Account lock</button>
          <button type="button" data-sample="Congratulations! You won a free iPhone 15. Claim your prize today: www.claim-gift.xyz">Prize</button>
          <button type="button" data-sample="Your parcel is held at customs. Pay a delivery fee of ₹49 at tinyurl.com/x9 to release it.">Parcel fee</button>
        </div>
        <textarea id="dm-in" placeholder="Paste or type a message…" spellcheck="false" aria-label="Message to highlight"></textarea>
        <div class="st-hl" id="dm-hl" aria-live="polite"></div>
      </div>
      <div class="st-demo-out">
        <h3>Signs found</h3>
        <ul class="st-found" id="dm-found"></ul>
      </div>
    </div>
  </section>` + cta(R, 'Run the real classifier.', 'Sign in to scan an SMS or email with the trained model.'),

  /* ------------------------------------------------------------ HOW IT WORKS */
  'how-it-works': (R) => head('How it works', 'From message to verdict<br> in four steps.',
    'Watch a message travel through the detection pipeline. Move your pointer over the scene to tilt it.') + `
  <section class="st-stage st-rv">
    <div class="st-scene" id="scene">
      <div class="st-stack">
        <div class="st-plate" style="--z:0px"><em>04</em></div>
        <div class="st-plate" style="--z:90px"><em>03</em></div>
        <div class="st-plate" style="--z:180px"><em>02</em></div>
        <div class="st-plate" style="--z:270px"><em>01</em></div>
        <div class="st-beam"></div>
        <div class="st-pkt"><i></i></div>
      </div>
      <div class="st-tag st-tag-safe">SAFE</div>
      <div class="st-tag st-tag-spam">SPAM</div>
    </div>
    <ol class="st-steps">
      <li class="s1"><b>01</b><div><h3>Clean the text</h3><p>Special characters are removed, the text is lower-cased and split into tokens.</p></div></li>
      <li class="s2"><b>02</b><div><h3>Vectorise with TF-IDF</h3><p>Common words are scaled down and distinctive ones emphasised, turning the text into numbers.</p></div></li>
      <li class="s3"><b>03</b><div><h3>Classify</h3><p>A classifier pre-trained on thousands of spam and legitimate messages scores the result.</p></div></li>
      <li class="s4"><b>04</b><div><h3>Verdict</h3><p>The probability score decides Safe or Spam. The result is saved, and spam raises an alert.</p></div></li>
    </ol>
  </section>

  <section class="st-detail">
    ${[
      ['Verdict + confidence', 'Each scan returns Spam or Safe along with the model’s confidence.'],
      ['History', 'Scans are stored with their type, verdict and confidence. You can delete them.'],
      ['Alerts', 'Messages flagged as Spam are collected on the Alerts page.'],
      ['Dashboard', 'Totals, spam and safe counts, accuracy rate and a spam ratio — updated after each scan.'],
    ].map(([t, d], i) => `<div class="st-rv" style="--d:${i}"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </section>

  <section class="st-faq st-rv">
    <h2>Common questions</h2>
    ${[
      ['What can I scan?', 'SMS messages and emails. Pick the type first — the dashboard warns you if the text looks like the other type.'],
      ['What does the confidence score mean?', 'It is the model’s probability for its verdict. A higher value means the model is more certain, not that the result is guaranteed.'],
      ['Can a verdict be wrong?', 'Yes. No classifier is perfect, so treat the result as a signal and never share OTPs or passwords either way.'],
      ['Can I delete a scan?', 'Yes. You can delete any message from your history.'],
    ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
  </section>` + cta(R, 'Try it on a real message.', 'Create an account and run your first scan.'),

  /* ---------------------------------------------------------------- SECURITY */
  security: (R) => head('Security', 'How your account<br> and data are handled.',
    'A plain description of how access works in Spam Shield.') + `
  <section class="st-rows st-rows-2">
    ${[
      ['Sign-in required', 'The dashboard, history and alerts are only available once you are signed in, and show your own scans.'],
      ['Separate admin sign-in', 'Administrators use a distinct admin sign-in and console. Regular accounts do not have access to it.'],
      ['Sign in with Google', 'You can use your Google account instead of a password. Google handles that sign-in, so your Google password is never entered into Spam Shield.'],
      ['Your scan history', 'Scanned messages are stored in your history so you can review them. You can delete any of them at any time.'],
      ['What administrators can see', 'The admin console shows platform totals, recent activity logs and each user’s SMS and email scan counts. Admins can activate, deactivate or permanently delete accounts.'],
      ['Be careful what you paste', 'Avoid pasting passwords, OTPs or card details into any scanner — including this one. The text of a message is enough.'],
    ].map(([t, d], i) => `<article class="st-row st-rv" style="--d:${i % 2}"><span class="st-num">0${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}
  </section>
  <section class="st-note st-rv"><b>Staying safe from spam</b>
    <ul><li>Never share an OTP — not even with someone claiming to be from your bank.</li><li>Do not tap links in unexpected messages. Type the address yourself.</li><li>Banks, couriers and tax offices do not ask for fees over SMS.</li><li>When in doubt, scan the message first.</li></ul>
  </section>` + cta(R, 'Check before you click.', 'Create an account and scan a suspicious message.'),

};

/* ------------------------------------------------------------------ behaviour */
export function initFx(root, opts = {}) {
  const $ = (s, c = root) => c.querySelector(s), $$ = (s, c = root) => [...c.querySelectorAll(s)];
  const off = [];
  const on = (el, ev, fn, o) => { if (el) { el.addEventListener(ev, fn, o); off.push(() => el.removeEventListener(ev, fn, o)); } };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveal
  const rv = $$('.st-rv');
  if (reduced || !('IntersectionObserver' in window)) rv.forEach((e) => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach((e) => io.observe(e)); off.push(() => io.disconnect());
  }

  // mobile menu
  const burger = $('.st-burger'), menu = $('.st-menu');
  const set = (o) => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
  on(burger, 'click', (e) => { e.stopPropagation(); set(!menu.classList.contains('open')); });
  on(document, 'click', (e) => { if (menu.classList.contains('open') && !menu.contains(e.target)) set(false); });
  on(menu, 'click', (e) => { if (e.target.closest('a')) set(false); });

  // background globe
  if (opts.startGlobe) { const c = $('[data-gl]'); if (c) off.push(opts.startGlobe(c, reduced)); }

  // 3D scene tilt
  const scene = $('#scene');
  if (scene && !reduced) {
    on(scene, 'pointermove', (e) => {
      const r = scene.getBoundingClientRect();
      scene.style.setProperty('--ry', (((e.clientY - r.top) / r.height - 0.5) * -14).toFixed(2) + 'deg');
      scene.style.setProperty('--rx', (((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(2) + 'deg');
    });
    on(scene, 'pointerleave', () => { scene.style.setProperty('--ry', '0deg'); scene.style.setProperty('--rx', '0deg'); });
  }

  // sign-spotter (highlight only; no scoring and no verdict)
  const inp = $('#dm-in');
  if (inp) {
    const RULES = [
      ['Pressure & urgency', /\b(urgent|immediately|act now|within \d+ ?(hours?|hrs?|minutes?)|last chance|final notice|expires?|suspended?|blocked)\b/gi],
      ['Prize or reward bait', /\b(won|winner|prize|lottery|free (iphone|gift|cash)|congratulations|reward|claim)\b/gi],
      ['Suspicious link', /(https?:\/\/\S+|www\.\S+|\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl)\/\S*|\b\S+\.(xyz|top|click|gq|tk)\b)/gi],
      ['Credential or KYC request', /\b(otp|password|pin|kyc|cvv|verify (your )?(account|identity|kyc)|account (is )?locked)\b/gi],
      ['Payment demand', /(delivery fee|customs|pay (a )?(fee|now)|₹\s?\d+|rs\.? ?\d+|\$\s?\d+)/gi],
    ];
    const found = $('#dm-found'), hl = $('#dm-hl');
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const run = () => {
      const t = inp.value, marks = [], list = [];
      RULES.forEach(([name, re]) => {
        const m = [...t.matchAll(re)]; if (!m.length) return;
        list.push([name, m.length]); m.forEach((x) => marks.push([x.index, x.index + x[0].length]));
      });
      marks.sort((a, b) => a[0] - b[0]);
      let out = '', p = 0; marks.forEach(([s, e]) => { if (s < p) return; out += esc(t.slice(p, s)) + '<mark>' + esc(t.slice(s, e)) + '</mark>'; p = e; });
      hl.innerHTML = t ? out + esc(t.slice(p)) : '<span class="ph">Highlighted phrases will appear here.</span>';
      found.innerHTML = list.length ? list.map(([n, c]) => `<li><i></i>${n}<b>×${c}</b></li>`).join('') : `<li class="none">${t.trim() ? 'No common signs found in this text.' : 'Add some text to begin.'}</li>`;
    };
    on(inp, 'input', run);
    $$('[data-sample]').forEach((b) => on(b, 'click', () => { inp.value = b.dataset.sample; run(); }));
    run();
  }


  return () => off.forEach((f) => f());
}
