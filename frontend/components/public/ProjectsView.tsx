'use client';

import Link from 'next/link';
import { useContent } from '@/components/ui/AppProviders';
import { pad, shortDate } from '@/lib/format';
import { useApi } from '@/lib/hooks';
import type { CaseStudy } from '@/lib/types';

function CaseCard({ c }: { c: CaseStudy }) {
  return (
    <Link href={`/projects/${c.slug}`} className="case-card">
      <div className="cover">
        {c.coverImage ? (
          <img src={c.coverImage} alt="" loading="lazy" />
        ) : (
          <>
            <div className="hatch" />
            <div className="grid-bg small" />
            <span style={{ position: 'absolute', left: 20, bottom: 18, font: '600 56px/1 var(--display)', letterSpacing: '-.05em', color: 'var(--blue)' }}>{c.serviceName ? c.serviceName.split(' ')[0] : 'Case'}</span>
          </>
        )}
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <p className="mono-label" style={{ fontSize: 11 }}>
          {[c.serviceName, c.client].filter(Boolean).join(' · ') || 'Case study'}
        </p>
        <h3 style={{ font: '600 22px/1.2 var(--display)', letterSpacing: '-.02em' }}>{c.title}</h3>
        <p style={{ font: '400 15px/1.55 var(--sans)', color: 'var(--body)' }}>{c.summary}</p>
        <span className="ulink" style={{ marginTop: 'auto', paddingTop: 8 }}>
          Read the case study <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function ProjectsView() {
  const content = useContent();
  const { data, error, loading, reload } = useApi<CaseStudy[]>('/case-studies');
  const count = data?.length ?? 0;

  return (
    <>
      <section aria-labelledby="pj-h" className="container" style={{ paddingTop: 'clamp(56px,8vw,112px)', paddingBottom: 'clamp(40px,5vw,64px)' }}>
        <p className="mono-label up" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
          Projects
        </p>
        <h1 id="pj-h" className="h-page up up-1" style={{ maxWidth: '13em' }}>
          Case studies, published with permission.
        </h1>
        <p className="lede up up-2" style={{ marginTop: 24 }}>
          Project write-ups appear here once each client has approved what can be shared, including screenshots and results.
        </p>
      </section>

      <section aria-label="Published case studies" className="container" style={{ paddingBottom: 'clamp(56px,7vw,96px)' }}>
        {loading && (
          <div role="status" aria-busy="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skel" style={{ height: 360, borderRadius: 12 }} />
            ))}
            <span className="sr-only">Loading case studies…</span>
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="empty-panel">
            <div className="hatch" />
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <h2 style={{ font: '600 clamp(26px,3vw,36px)/1.1 var(--display)' }}>We couldn’t load the case studies.</h2>
              <p style={{ margin: '14px 0 0', font: '400 16px/1.6 var(--sans)', color: '#C9CDDA' }}>Please try again in a moment.</p>
            </div>
            <button type="button" className="lbtn lbtn-ghost" style={{ position: 'relative' }} onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && count === 0 && (
          <div data-reveal className="empty-panel">
            <div aria-hidden="true" className="hatch" />
            <div style={{ position: 'relative', maxWidth: 560 }}>
              <p style={{ margin: '0 0 14px', display: 'inline-flex', alignItems: 'center', gap: 10, font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: 'var(--violet-light)' }}>
                <span aria-hidden="true" className="pulse-dot" style={{ background: 'var(--violet)' }} />0 PUBLISHED · IN PREPARATION
              </p>
              <h2 style={{ font: '600 clamp(28px,3.2vw,40px)/1.1 var(--display)', letterSpacing: '-.025em' }}>Approved work samples aren’t available yet.</h2>
              <p style={{ margin: '14px 0 0', font: '400 16px/1.6 var(--sans)', color: '#C9CDDA' }}>
                If you’d like to understand how we would approach your project, the quickest route is a conversation about it.
              </p>
            </div>
            <Link href="/contact" className="lbtn lbtn-primary lbtn-lg" style={{ position: 'relative' }}>
              Discuss a Project
            </Link>
          </div>
        )}

        {!loading && !error && count > 0 && (
          <>
            <p className="mono-label" style={{ marginBottom: 20 }}>
              {count} published
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 16 }}>
              {data!.map((c) => (
                <li key={c.id} data-reveal>
                  <CaseCard c={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="pj-cover" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container" style={{ padding: 'clamp(56px,7vw,96px) var(--gutter)' }}>
          <h2 id="pj-cover" data-reveal style={{ margin: '0 0 40px', maxWidth: '16em', font: '600 clamp(28px,3.4vw,44px)/1.05 var(--display)', letterSpacing: '-.03em' }}>
            What each case study will cover
          </h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 16 }}>
            {(content?.caseOutline || []).map((c, i) => (
              <li key={c.name} data-reveal className="outline-card">
                <p style={{ margin: '0 0 32px', font: '600 48px/1 var(--display)', letterSpacing: '-.04em', color: 'var(--blue)' }}>{pad(i)}</p>
                <h3 style={{ margin: '0 0 8px', font: '600 20px/1.2 var(--display)' }}>{c.name}</h3>
                <p style={{ font: '400 15px/1.55 var(--sans)', color: 'var(--body)' }}>{c.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

export function CaseStudyView({ slug }: { slug: string }) {
  const { data: c, error, loading, reload } = useApi<CaseStudy>(`/case-studies/${encodeURIComponent(slug)}`);
  if (loading)
    return (
      <div className="lstate" aria-busy="true">
        <div className="skel" style={{ height: 16, width: 180, marginBottom: 24 }} />
        <div className="skel" style={{ height: 64, width: '70%' }} />
      </div>
    );
  if (error || !c)
    return (
      <div role={error?.status === 404 ? undefined : 'alert'} className="lstate">
        <p className="mono-label" style={{ marginBottom: 20 }}>
          {error?.status === 404 ? 'Not published' : 'Connection problem'}
        </p>
        <h1 style={{ font: '600 clamp(36px,5vw,64px)/1 var(--display)', letterSpacing: '-.04em' }}>
          {error?.status === 404 ? 'This case study isn’t available.' : 'We couldn’t load this case study.'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 36 }}>
          {error?.status !== 404 && (
            <button type="button" className="lbtn lbtn-primary" onClick={reload}>
              Try again
            </button>
          )}
          <Link href="/projects" className="lbtn lbtn-line">
            All projects
          </Link>
        </div>
      </div>
    );
  const sections: [string, string][] = [
    ['Requirement', c.requirement],
    ['Approach', c.approach],
    ['Delivered', c.delivered],
    ['Results', c.results],
  ];
  return (
    <>
      <section className="dark" style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" className="grid-bg" style={{ maskImage: 'linear-gradient(90deg,transparent,#000)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000)' }} />
        <div className="container" style={{ position: 'relative', padding: 'clamp(56px,8vw,112px) var(--gutter)' }}>
          <nav aria-label="Breadcrumb" className="up">
            <Link href="/projects" style={{ font: '500 12px/1.4 var(--mono)', letterSpacing: '.12em', textTransform: 'uppercase', color: '#A9AEBC' }}>
              ← Projects
            </Link>
          </nav>
          <h1 className="h-page up up-1" style={{ marginTop: 24, maxWidth: '16em' }}>
            {c.title}
          </h1>
          <p className="up up-2" style={{ margin: '24px 0 0', maxWidth: '36em', font: '400 18px/1.6 var(--sans)', color: '#C9CDDA' }}>
            {c.summary}
          </p>
          <p className="up up-3" style={{ margin: '28px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', font: '500 12px/1.4 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A9AEBC' }}>
            {c.serviceName && <span>Service · {c.serviceName}</span>}
            {c.client && <span>Client · {c.client}</span>}
            {c.publishedAt && <span>Published · {shortDate(c.publishedAt)}</span>}
          </p>
        </div>
      </section>
      {c.coverImage && (
        <div className="container" style={{ marginTop: 'clamp(32px,5vw,64px)' }}>
          <img src={c.coverImage} alt={`${c.title} — approved screenshot`} style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)' }} />
        </div>
      )}
      <article className="container" style={{ padding: 'clamp(40px,6vw,80px) var(--gutter)' }}>
        {sections
          .filter(([, v]) => v)
          .map(([h, v], i) => (
            <section key={h} data-reveal className="case-section" aria-labelledby={`cs-${i}`}>
              <div>
                <p style={{ font: '600 48px/1 var(--display)', letterSpacing: '-.04em', color: 'var(--blue)', margin: '0 0 12px' }}>{pad(i)}</p>
                <h2 id={`cs-${i}`} style={{ font: '600 clamp(24px,2.6vw,32px)/1.1 var(--display)', letterSpacing: '-.03em' }}>
                  {h}
                </h2>
              </div>
              <div className="prose">
                {v.split(/\n{2,}/).map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 40, borderTop: '1px solid var(--line)' }}>
          <Link href={c.serviceId ? `/contact?service=${c.serviceId}` : '/contact'} className="lbtn lbtn-primary">
            Discuss a Similar Project <span aria-hidden="true">→</span>
          </Link>
          <Link href="/projects" className="lbtn lbtn-line">
            All projects
          </Link>
        </div>
      </article>
    </>
  );
}
