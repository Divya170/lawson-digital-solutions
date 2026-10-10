'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useContent } from '@/components/ui/AppProviders';
import { FlowDiagram } from './home/HomeView';

export function ServicesView() {
  const content = useContent();
  const params = useSearchParams();
  const target = params.get('s');
  const services = content?.services || [];
  const [current, setCurrent] = useState(services[0]?.id || '');

  // Deep link: /services?s=web scrolls to that section.
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById('svc-' + target);
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: reduce ? 'auto' : 'smooth' }));
    }
  }, [target]);

  // Scroll-spy for the "On this page" list.
  useEffect(() => {
    const on = () => {
      let cur = services[0]?.id || '';
      document.querySelectorAll<HTMLElement>('[data-svc]').forEach((el) => {
        if (el.getBoundingClientRect().top < 200) cur = el.id.replace('svc-', '');
      });
      setCurrent(cur);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [services]);

  if (!content) return null;

  return (
    <>
      <section aria-labelledby="sv-h" className="dark" style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" className="grid-bg" style={{ maskImage: 'linear-gradient(90deg,transparent,#000)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000)' }} />
        <div className="container" style={{ position: 'relative', padding: 'clamp(56px,8vw,112px) var(--gutter)' }}>
          <p className="mono-label light up" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
            Services
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 64px', alignItems: 'flex-end' }}>
            <h1 id="sv-h" className="h-page up up-1" style={{ flex: '2 1 520px' }}>
              Technology services built around your needs.
            </h1>
            <div className="up up-2" style={{ flex: '1 1 300px' }}>
              <p style={{ margin: '0 0 24px', font: '400 17px/1.6 var(--sans)', color: '#C9CDDA', textWrap: 'pretty' }}>
                We help businesses evaluate, develop, and improve the software and IT systems they depend on. Scope is shaped by your requirements and agreed before work begins.
              </p>
              <Link href="/contact" className="lbtn lbtn-primary">
                Discuss a Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="svc-layout">
        <nav aria-label="Services on this page" className="svc-nav">
          <p className="mono-label" style={{ fontSize: 11, marginBottom: 16 }}>
            ON THIS PAGE
          </p>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <a href={`#svc-${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
                  <span>{s.n}</span>
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>
          {services.map((s) => (
            <section key={s.id} id={`svc-${s.id}`} data-svc aria-labelledby={`svh-${s.id}`} className="svc-sec">
              <p data-reveal style={{ font: '500 13px/1 var(--mono)', color: 'var(--blue)' }}>
                {s.n} / {s.tag}
              </p>
              <h2 id={`svh-${s.id}`} data-reveal style={{ margin: '14px 0 0', font: '600 clamp(32px,4vw,52px)/1.02 var(--display)', letterSpacing: '-.035em' }}>
                {s.name}
              </h2>
              <p data-reveal style={{ margin: '18px 0 0', maxWidth: '36em', font: '400 19px/1.6 var(--sans)', color: 'var(--body)', textWrap: 'pretty' }}>
                {s.purpose}
              </p>
              <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 40 }}>
                <div style={{ flex: '1 1 300px', minWidth: 0, display: 'grid', gap: 28, alignContent: 'start' }}>
                  <div>
                    <h3 className="list-h">Problems it addresses</h3>
                    <ul className="arrow-list">
                      {s.problems.map((x) => (
                        <li key={x}>
                          <span aria-hidden="true">→</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="list-h">Engagement considerations</h3>
                    <ul className="arrow-list violet">
                      {s.considerations.map((x) => (
                        <li key={x}>
                          <span aria-hidden="true">◆</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', minWidth: 0, display: 'grid', gap: 16, alignContent: 'start' }}>
                  <div aria-hidden="true" className="cap-card" style={{ padding: 24 }}>
                    <div className="grid-bg small" />
                    <div style={{ position: 'relative' }}>
                      <p style={{ margin: '0 0 18px', font: '500 10px/1 var(--mono)', letterSpacing: '.1em', color: '#A9AEBC' }}>APPROACH — SIMPLIFIED</p>
                      <FlowDiagram flow={s.flow} hoverable />
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 22, background: '#fff' }}>
                    <h3 style={{ margin: '0 0 4px', font: '600 17px/1.2 var(--display)' }}>Possible deliverables</h3>
                    <p style={{ margin: '0 0 12px', font: '400 13px/1.5 var(--sans)', color: 'var(--muted-2)' }}>Examples only. Agreed during discovery.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {s.deliverables.map((x) => (
                        <span key={x} className="chip-soft">
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/contact?service=${s.id}`} className="lbtn lbtn-primary deep" style={{ marginTop: 32 }}>
                Discuss This Service <span aria-hidden="true">→</span>
              </Link>
            </section>
          ))}
        </div>
      </div>

      <section className="blue-band" style={{ marginTop: 'clamp(56px,7vw,88px)' }}>
        <div className="container" style={{ padding: 'clamp(64px,8vw,112px) var(--gutter)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <div data-reveal style={{ maxWidth: 640 }}>
            <h2 style={{ font: '600 clamp(34px,4.8vw,64px)/1 var(--display)', letterSpacing: '-.04em' }}>Not sure which service fits?</h2>
            <p style={{ margin: '18px 0 0', font: '400 17px/1.6 var(--sans)', color: '#E6EBFB' }}>
              Choose “Not sure yet” on the enquiry form and describe the situation. We’ll work it out together.
            </p>
          </div>
          <Link href="/contact?service=unsure" className="lbtn lbtn-white lbtn-lg">
            Discuss a Project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
