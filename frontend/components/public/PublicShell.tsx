'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useContent, useSite, useSiteData } from '@/components/ui/AppProviders';

const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
const isCurrent = (path: string, href: string) => path === href || path.startsWith(href + '/');
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Brand() {
  return (
    <Link href="/" aria-label="Lawson Digital Solutions — home" className="lbrand">
      <span aria-hidden="true" className="lmark" />
      <span className="words">
        <span className="w1">Lawson</span>
        <span className="w2">Digital Solutions</span>
      </span>
    </Link>
  );
}

function Header() {
  const path = usePathname() || '/';
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenu(false), [path]);

  // Reading-progress bar + header shadow once the page scrolls.
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      setScrolled(window.scrollY > 8);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [path]);

  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [menu]);

  return (
    <header className={`lheader${scrolled ? ' scrolled' : ''}`}>
      <div className="bar">
        <Brand />
        <nav aria-label="Primary" className="lnav">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isCurrent(path, n.href) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="lbtn lbtn-primary cta">
            Discuss a Project <span aria-hidden="true">→</span>
          </Link>
        </nav>
        <button ref={menuBtn} type="button" className="lmenu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu">
          <span>{menu ? 'Close' : 'Menu'}</span>
          <span aria-hidden="true" className="bars">
            <span />
            <span />
          </span>
        </button>
      </div>
      <div aria-hidden="true" className="lprogress">
        <div ref={progress} />
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="Primary" className="lmobile">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isCurrent(path, n.href) ? 'page' : undefined}>
                  <span>{n.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="lbtn lbtn-primary" style={{ display: 'flex', minHeight: 52 }}>
            Discuss a Project
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const site = useSite();
  const content = useContent();
  return (
    <footer className="lfooter">
      <div className="inner">
        <div className="cols">
          <div style={{ minWidth: 0 }}>
            <Link href="/" className="lbrand" style={{ textDecoration: 'none' }}>
              <span aria-hidden="true" className="lmark" />
              <span style={{ font: '700 20px/1.1 var(--display)', letterSpacing: '-.02em' }}>{site.businessName}</span>
            </Link>
            <p style={{ margin: '18px 0 0', maxWidth: '22em', font: '400 15px/1.6 var(--sans)', color: '#A9AEBC' }}>
              Software and IT services for businesses, based in {site.locationLabel.replace(/, ?TX$/, ', Texas')}.
            </p>
          </div>
          <nav aria-labelledby="ft-pages">
            <h2 id="ft-pages">PAGES</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="ft-services">
            <h2 id="ft-services">SERVICES</h2>
            <ul>
              {(content?.services || []).map((s) => (
                <li key={s.id}>
                  <Link href={`/services?s=${s.id}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>CONTACT</h2>
            <address>
              {site.email && (
                <a href={site.mailto} style={{ wordBreak: 'break-all' }}>
                  {site.email}
                </a>
              )}
              {site.phone && <a href={site.tel}>{site.phone}</a>}
              {site.street && (
                <span>
                  {site.street}
                  <br />
                  {site.locality}
                </span>
              )}
            </address>
          </div>
        </div>
        <p aria-hidden="true" className="wordmark">
          Lawson.
        </p>
        <div className="legal">
          <span>
            © {new Date().getFullYear()} {site.businessName}
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 13 }}>
              Privacy Policy
            </Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' })}>
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Fades sections in as they scroll into view (prototype's data-reveal behaviour). */
function useReveal(path: string, root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (reduced() || typeof IntersectionObserver === 'undefined' || !root.current) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.remove('rv-hide');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    const scan = () =>
      root.current?.querySelectorAll<HTMLElement>('[data-reveal]:not([data-rv])').forEach((el) => {
        el.setAttribute('data-rv', '1');
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add('rv-hide', 'rv-anim');
        io.observe(el);
      });
    let raf = requestAnimationFrame(scan);
    // Content that renders after data loads (e.g. published case studies) gets picked up too.
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(root.current, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, [path, root]);
}

export function PublicShell({ children }: { children: ReactNode }) {
  const path = usePathname() || '/';
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);
  const { failed, loading, reload } = useSiteData();
  useReveal(path, mainRef);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [path]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <a
        href="#main"
        className="lskip"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} ref={mainRef} className="main" style={{ flex: 1 }}>
        {failed ? (
          <div role="alert" className="lstate">
            <p className="mono-label" style={{ marginBottom: 20 }}>
              Connection problem
            </p>
            <h1 style={{ font: '600 clamp(36px,5vw,64px)/1 var(--display)', letterSpacing: '-.04em' }}>We couldn’t load this page.</h1>
            <p className="lede" style={{ marginTop: 20 }}>
              The site’s content service didn’t respond. Please try again in a moment.
            </p>
            <button type="button" className="lbtn lbtn-primary" style={{ marginTop: 32 }} onClick={reload} disabled={loading}>
              {loading ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}
