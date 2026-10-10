'use client';

import Link from 'next/link';
import { useContent, useSite } from '@/components/ui/AppProviders';
import { pad } from '@/lib/format';
import { useClock } from '@/lib/hooks';

export function AboutView() {
  const site = useSite();
  const content = useContent();
  const clock = useClock(site.timezone);
  const city = site.locationLabel.replace(/, ?TX$/, ', Texas');
  if (!content) return null;
  return (
    <>
      <section aria-labelledby="ab-h" className="container" style={{ paddingTop: 'clamp(56px,8vw,112px)', paddingBottom: 'clamp(56px,7vw,96px)' }}>
        <p className="mono-label up" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
          About
        </p>
        <h1 id="ab-h" className="up up-1" style={{ font: '600 clamp(46px,8vw,120px)/.92 var(--display)', letterSpacing: '-.05em' }}>
          Practical technology.
          <br />
          <span className="grad-text-2">Thoughtful execution.</span>
        </h1>
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 64px', marginTop: 'clamp(40px,6vw,80px)', paddingTop: 32, borderTop: '1px solid var(--ink)' }}>
          <p className="mono-label" style={{ flex: '1 1 200px', lineHeight: 1.6, letterSpacing: '.08em' }}>
            {city}
            <br />
            Software &amp; IT services
            {clock && (
              <>
                <br />
                <span style={{ color: 'var(--ok)' }}>● {clock} local</span>
              </>
            )}
          </p>
          <div style={{ flex: '3 1 480px', maxWidth: 720, display: 'grid', gap: 18 }}>
            <p style={{ font: '400 clamp(20px,1.9vw,26px)/1.45 var(--display)', letterSpacing: '-.01em', textWrap: 'pretty' }}>
              {site.businessName} is a software and IT services business based in {city}. We help businesses plan, build, and improve the software and systems they rely on.
            </p>
            <p style={{ font: '400 17px/1.65 var(--sans)', color: 'var(--body)', textWrap: 'pretty' }}>
              That covers custom applications, websites and web apps, connecting existing systems, and technical guidance when a decision needs a clear second opinion. Each
              project starts by understanding the business requirement, then choosing the simplest approach that meets it well.
            </p>
            {site.contactName && <p style={{ font: '400 17px/1.65 var(--sans)', color: 'var(--body)' }}>Your contact is {site.contactName}.</p>}
          </div>
        </div>
      </section>
      <section aria-labelledby="ab-v" className="dark">
        <div className="container section">
          <h2 id="ab-v" data-reveal className="h-section" style={{ marginBottom: 40 }}>
            How we work
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 12 }}>
            {content.values.map((v, i) => (
              <li key={v.name} data-reveal tabIndex={0} className="value-card">
                <p className="big">{pad(i)}</p>
                <h3 style={{ margin: '0 0 10px', font: '600 22px/1.2 var(--display)' }}>{v.name}</h3>
                <p style={{ font: '400 15px/1.6 var(--sans)', color: '#E3E5EC' }}>{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section>
        <div className="container section" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
          <h2 data-reveal style={{ maxWidth: '13em', font: '600 clamp(34px,4.8vw,64px)/1 var(--display)', letterSpacing: '-.04em' }}>
            Let’s discuss what you’re working on.
          </h2>
          <Link href="/contact" className="lbtn lbtn-primary deep lbtn-lg">
            Start a Conversation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
