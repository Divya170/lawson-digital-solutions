'use client';

import Link from 'next/link';
import { MouseEvent, useRef, useState } from 'react';
import { useContent, useSite } from '@/components/ui/AppProviders';
import { pad } from '@/lib/format';
import { useClock, useReducedMotion } from '@/lib/hooks';
import type { Content, Service } from '@/lib/types';
import { Hero } from './Hero';

export function FlowDiagram({ flow, hoverable = false }: { flow: string[]; hoverable?: boolean }) {
  return (
    <div>
      {flow.map((label, j) => (
        <div key={label + j}>
          <div className={`flow-step${j === 1 ? ' mid' : ''}${hoverable ? ' hoverable' : ''}`}>
            <span>{pad(j)}</span>
            <span>{label}</span>
          </div>
          {j < flow.length - 1 && (
            <div className="flow-link">
              <span />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  return (
    <div aria-label="Services offered" className="marquee">
      <div className="track">
        {[0, 1].flatMap((k) =>
          items.map((l) => (
            <span key={k + l} aria-hidden={k ? true : undefined} className="item">
              {l}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function Capabilities({ services }: { services: Service[] }) {
  const [cap, setCap] = useState(0);
  return (
    <section aria-labelledby="cap-h">
      <div className="container section">
        <div data-reveal className="sec-head">
          <div>
            <p className="mono-label" style={{ marginBottom: 20 }}>
              01 — Capabilities
            </p>
            <h2 id="cap-h" className="h-section">
              Four ways we can help.
            </h2>
          </div>
          <Link href="/services" className="ulink">
            Explore All Services <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="caps">
          <ul className="cap-list">
            {services.map((s, i) => (
              <li key={s.id} data-reveal>
                <Link
                  href={`/services?s=${s.id}`}
                  className={`cap-row${i === cap ? ' on' : ''}`}
                  onMouseEnter={() => setCap(i)}
                  onFocus={() => setCap(i)}
                >
                  <span aria-hidden="true" className="line" />
                  <span className="num">{s.n}</span>
                  <span style={{ display: 'block' }}>
                    <span className="name">{s.name}</span>
                    <span className="short">{s.short}</span>
                  </span>
                  <span aria-hidden="true" className="arrow">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="cap-preview stack">
            {services.map((s, i) => (
              <div key={s.id} data-on={i === cap} className="cap-card">
                <div className="grid-bg small" />
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="big">{s.n}</span>
                    <span className="tag-box">{s.tag}</span>
                  </div>
                  <p style={{ margin: '40px 0 20px', font: '500 12px/1.5 var(--mono)', color: 'var(--violet-light)' }}>→ {s.outcome}</p>
                  <FlowDiagram flow={s.flow} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Challenges({ content }: { content: Content }) {
  const [ch, setCh] = useState(0);
  const names = Object.fromEntries(content.services.map((s) => [s.id, s.name]));
  return (
    <section aria-labelledby="ch-h" style={{ background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="container section">
        <div data-reveal style={{ maxWidth: 760, marginBottom: 40 }}>
          <p className="mono-label" style={{ marginBottom: 20 }}>
            02 — Challenges
          </p>
          <h2 id="ch-h" className="h-section">
            What’s slowing you down?
          </h2>
          <p style={{ margin: '18px 0 0', font: '400 17px/1.6 var(--sans)', color: 'var(--body)' }}>Pick the situation that sounds most familiar.</p>
        </div>
        <div className="tabs-split">
          <div role="group" aria-label="Common challenges" data-reveal className="tab-col">
            {content.challenges.map((c, i) => (
              <button key={c.problem} type="button" className="ch-tab" aria-pressed={i === ch} aria-controls="ch-panel" onClick={() => setCh(i)}>
                <span aria-hidden="true" className="dotn">
                  {pad(i)}
                </span>
                <span>{c.problem}</span>
              </button>
            ))}
          </div>
          <div id="ch-panel" aria-live="polite" className="stack" style={{ flex: '1 1 400px', minWidth: 0, display: 'grid' }}>
            {content.challenges.map((c, i) => (
              <div key={c.problem} data-on={i === ch} className="ch-panel">
                <div aria-hidden="true" className="ring r1" />
                <div aria-hidden="true" className="ring r2" />
                <div style={{ position: 'relative' }}>
                  <p style={{ margin: '0 0 18px', font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: 'var(--violet-light)' }}>AN APPROACH THAT MAY HELP</p>
                  <p style={{ font: '500 clamp(22px,2.4vw,30px)/1.3 var(--display)', letterSpacing: '-.015em', textWrap: 'pretty' }}>{c.approach}</p>
                </div>
                <div className="foot">
                  <span style={{ font: '400 14px/1.4 var(--sans)', color: '#C9CDDA' }}>
                    Related: <strong style={{ color: '#fff', fontWeight: 600 }}>{names[c.service]}</strong>
                  </span>
                  <Link href={`/contact?service=${c.service}`} tabIndex={i === ch ? 0 : -1} className="lbtn lbtn-primary" style={{ minHeight: 46, padding: '0 18px', fontSize: 15 }}>
                    Tell Us About Your Challenge →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p data-reveal style={{ margin: '24px 0 0', font: '400 14px/1.5 var(--sans)', color: 'var(--muted-2)' }}>
          Examples of problems we can help explore. The right approach depends on your systems, users, and constraints.
        </p>
      </div>
    </section>
  );
}

function Process({ steps }: { steps: Content['process'] }) {
  const [proc, setProc] = useState(0);
  const last = steps.length - 1;
  return (
    <section aria-labelledby="proc-h">
      <div className="container section">
        <div data-reveal className="sec-head">
          <div style={{ maxWidth: 680 }}>
            <p className="mono-label" style={{ marginBottom: 20 }}>
              03 — Process
            </p>
            <h2 id="proc-h" className="h-section">
              From first conversation to delivered solution.
            </h2>
          </div>
        </div>
        <div data-reveal style={{ position: 'relative' }}>
          <div aria-hidden="true" className="proc-track">
            <div style={{ width: `${last ? (proc / last) * 100 : 0}%` }} />
          </div>
          <ol className="proc-steps">
            {steps.map((p, i) => (
              <li key={p.name}>
                <button type="button" className={`proc-btn${i < proc ? ' done' : ''}`} aria-pressed={i === proc} aria-controls="proc-panel" onClick={() => setProc(i)}>
                  <span className="c">{pad(i)}</span>
                  <span className="n">{p.name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div id="proc-panel" aria-live="polite" className="stack" style={{ display: 'grid', marginTop: 40 }}>
          {steps.map((p, i) => (
            <div key={p.name} data-on={i === proc} className="proc-panel">
              <div>
                <p style={{ margin: '0 0 10px', font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: 'var(--blue)' }}>
                  STAGE {pad(i)} / {pad(last)}
                </p>
                <h3 style={{ font: '600 clamp(36px,4.4vw,60px)/1 var(--display)', letterSpacing: '-.04em' }}>{p.name}</h3>
              </div>
              <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
                <p style={{ font: '400 19px/1.55 var(--sans)', color: 'var(--ink)' }}>{p.text}</p>
                <p style={{ paddingTop: 16, borderTop: '1px solid var(--line)', font: '400 15px/1.6 var(--sans)', color: 'var(--body)' }}>
                  <span style={{ font: '500 12px/1 var(--mono)', letterSpacing: '.08em', color: 'var(--muted-2)', marginRight: 8 }}>YOUR PART</span>
                  {p.you}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="round-btn" onClick={() => setProc((p) => Math.max(0, p - 1))} disabled={proc === 0} aria-label="Previous stage">
              ←
            </button>
            <button type="button" className="round-btn" onClick={() => setProc((p) => Math.min(last, p + 1))} disabled={proc === last} aria-label="Next stage">
              →
            </button>
          </div>
          <Link href="/contact" className="lbtn lbtn-line">
            Start a Conversation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function WorkBrief({ brief }: { brief: Content['scopeExample'] }) {
  const [scope, setScope] = useState(() => brief.items.map((x) => x.checked));
  const done = scope.filter(Boolean).length;
  return (
    <section aria-labelledby="work-h" className="dark" style={{ overflow: 'hidden' }}>
      <div className="container section" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(40px,6vw,88px)' }}>
        <div data-reveal style={{ flex: '1 1 340px', minWidth: 0 }}>
          <p className="mono-label light" style={{ marginBottom: 20 }}>
            04 — Work
          </p>
          <h2 id="work-h" className="h-section">
            How a project takes shape.
          </h2>
          <p style={{ margin: '20px 0 0', maxWidth: '30em', font: '400 17px/1.6 var(--sans)', color: '#C9CDDA', textWrap: 'pretty' }}>
            Approved case studies are published once clients agree to what can be shared. This is the kind of working brief every project starts from. Tick the scope items to
            see how it builds up.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href="/contact" className="lbtn lbtn-primary">
              Discuss Your Project
            </Link>
            <Link href="/projects" className="lbtn lbtn-ghost">
              Projects page
            </Link>
          </div>
        </div>
        <figure data-reveal style={{ flex: '1.2 1 440px', minWidth: 0, margin: 0 }}>
          <div className="brief">
            <div className="bh">
              <span>Project brief · draft</span>
              <span style={{ color: 'var(--violet-dark)' }}>Illustrative concept</span>
            </div>
            <div style={{ padding: 'clamp(20px,3vw,32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 24 }}>
              <div>
                <p className="mono-label" style={{ fontSize: 11, marginBottom: 8 }}>
                  GOAL
                </p>
                <p style={{ font: '500 18px/1.35 var(--display)' }}>{brief.goal}</p>
              </div>
              <div>
                <p className="mono-label" style={{ fontSize: 11, marginBottom: 8 }}>
                  USERS
                </p>
                <p style={{ font: '400 15px/1.55 var(--sans)', color: 'var(--body)' }}>{brief.users}</p>
              </div>
              <fieldset style={{ gridColumn: '1/-1', border: 0, borderTop: '1px solid var(--line)', margin: 0, padding: '20px 0 0' }}>
                <legend className="mono-label" style={{ float: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', padding: 0, margin: '0 0 14px', fontSize: 11 }}>
                  <span>SCOPE</span>
                  <span style={{ color: 'var(--blue)' }}>
                    {done} / {brief.items.length} AGREED
                  </span>
                </legend>
                <div className="bar-track" style={{ clear: 'both', marginBottom: 14 }}>
                  <div style={{ width: `${brief.items.length ? (done / brief.items.length) * 100 : 0}%` }} />
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {brief.items.map((s, i) => (
                    <label key={s.label} className={`scope-item${scope[i] ? ' on' : ''}`}>
                      <input type="checkbox" checked={!!scope[i]} onChange={() => setScope((sc) => sc.map((v, j) => (j === i ? !v : v)))} />
                      <span>{s.label}</span>
                      <span className="ph">{s.phase}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
          <figcaption style={{ marginTop: 18, font: '400 12px/1.4 var(--mono)', color: '#A9AEBC' }}>Example brief created for illustration. Not a client project.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Principles({ items }: { items: Content['principles'] }) {
  return (
    <section aria-labelledby="pr-h" style={{ background: '#fff' }}>
      <div className="container section">
        <h2 id="pr-h" data-reveal className="mono-label" style={{ marginBottom: 32 }}>
          05 — Working principles
        </h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderBottom: '1px solid var(--line)' }}>
          {items.map((p, i) => (
            <li key={p.name} data-reveal tabIndex={0} className="principle">
              <p className="t">
                <small>{pad(i)}</small>
                {p.name}
              </p>
              <p className="d">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClosingCta() {
  const site = useSite();
  const clock = useClock(site.timezone);
  const spot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced || !spot.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    spot.current.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
  };
  return (
    <section aria-labelledby="cta-h" className="lcta dark" onMouseMove={onMove}>
      <div aria-hidden="true" className="cols" />
      <div aria-hidden="true" ref={spot} className="spot" />
      <div className="container" style={{ position: 'relative', padding: 'clamp(88px,11vw,160px) var(--gutter)' }}>
        <p data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 10, margin: '0 0 32px', font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: '#A9AEBC' }}>
          <span aria-hidden="true" className="live-dot" />
          {site.locationLabel.toUpperCase()}
          {clock && <> · {clock}</>}
        </p>
        <h2 id="cta-h" data-reveal style={{ maxWidth: '11em', font: '600 clamp(44px,7.4vw,112px)/.92 var(--display)', letterSpacing: '-.05em' }}>
          Have a project in mind?
        </h2>
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, marginTop: 40 }}>
          <p style={{ maxWidth: '30em', font: '400 clamp(17px,1.4vw,20px)/1.6 var(--sans)', color: '#C9CDDA' }}>
            Tell us what you’re trying to build, improve, or solve. Let’s explore the right next step.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/contact" className="lbtn lbtn-primary lbtn-glow lbtn-lg">
              Discuss a Project <span aria-hidden="true">→</span>
            </Link>
            {site.email && (
              <a href={site.mailto} className="lbtn lbtn-ghost lbtn-lg" style={{ padding: '0 24px' }}>
                Email {site.businessName}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeView() {
  const content = useContent();
  if (!content) return null;
  return (
    <>
      <Hero diagrams={content.hero} stages={content.stages} />
      <Marquee items={content.marquee} />
      <Capabilities services={content.services} />
      <Challenges content={content} />
      <Process steps={content.process} />
      <WorkBrief brief={content.scopeExample} />
      <Principles items={content.principles} />
      <ClosingCta />
    </>
  );
}
