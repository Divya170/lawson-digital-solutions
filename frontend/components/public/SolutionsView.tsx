'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useContent } from '@/components/ui/AppProviders';
import { pad } from '@/lib/format';

export function SolutionsView() {
  const content = useContent();
  const [sol, setSol] = useState(0);
  if (!content) return null;
  const names = Object.fromEntries(content.services.map((s) => [s.id, s.name]));

  return (
    <>
      <section aria-labelledby="so-h" className="container" style={{ paddingTop: 'clamp(56px,8vw,112px)', paddingBottom: 'clamp(40px,5vw,64px)' }}>
        <p className="mono-label up" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
          Solutions
        </p>
        <h1 id="so-h" className="h-page up up-1" style={{ maxWidth: '14em' }}>
          Find the right technical approach for your business.
        </h1>
        <p className="lede up up-2" style={{ marginTop: 24 }}>
          Choosing a solution comes after understanding the problem. Pick the situation closest to yours.
        </p>
      </section>
      <section aria-label="Solution selector" className="container" style={{ paddingBottom: 'clamp(72px,9vw,128px)' }}>
        <div className="tabs-split">
          <div role="group" aria-label="Business challenges" className="tab-col" style={{ flex: '1 1 340px' }}>
            {content.solutions.map((t, i) => (
              <button key={t.name} type="button" className="sol-tab" aria-pressed={i === sol} aria-controls="sol-panel" onClick={() => setSol(i)}>
                <span>{pad(i)}</span>
                <span>{t.name}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
          <div id="sol-panel" aria-live="polite" className="stack" style={{ flex: '1.3 1 440px', minWidth: 0, display: 'grid' }}>
            {content.solutions.map((t, i) => (
              <div key={t.name} data-on={i === sol} className="sol-panel">
                <p style={{ margin: '0 0 14px', font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: 'var(--blue)' }}>{pad(i)} — SOLUTION</p>
                <h2 style={{ font: '600 clamp(28px,3.2vw,42px)/1.05 var(--display)', letterSpacing: '-.03em' }}>{t.name}</h2>
                <p style={{ margin: '16px 0 0', font: '400 17px/1.6 var(--sans)', color: 'var(--body)', textWrap: 'pretty' }}>{t.summary}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 28, marginTop: 32 }}>
                  <div>
                    <h3 className="list-h">Signs this may apply</h3>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                      {t.signs.map((x) => (
                        <li key={x} style={{ display: 'flex', gap: 10, font: '400 15px/1.55 var(--sans)', color: 'var(--body)' }}>
                          <span aria-hidden="true" style={{ color: 'var(--blue)' }}>
                            ✓
                          </span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="list-h">Typical approach</h3>
                    <p style={{ font: '400 15px/1.6 var(--sans)', color: 'var(--body)' }}>{t.approach}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                  <Link href={`/contact?service=${t.service}`} tabIndex={i === sol ? 0 : -1} className="lbtn lbtn-primary deep">
                    Tell Us About Your Challenge
                  </Link>
                  <Link href={`/services?s=${t.service}`} tabIndex={i === sol ? 0 : -1} className="ulink" style={{ fontWeight: 500 }}>
                    Related: {names[t.service]}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="dark">
        <div className="container" style={{ padding: 'clamp(64px,8vw,104px) var(--gutter)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <h2 data-reveal style={{ maxWidth: '14em', font: '600 clamp(32px,4.4vw,60px)/1 var(--display)', letterSpacing: '-.04em' }}>
            Don’t see your situation listed?
          </h2>
          <Link href="/contact?service=unsure" className="lbtn lbtn-primary lbtn-lg">
            Tell Us What You Need <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
