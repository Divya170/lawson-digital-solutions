'use client';

import Link from 'next/link';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks';
import type { HeroDiagram } from '@/lib/types';

const HERO_MS = 6500;

export function Hero({ diagrams, stages }: { diagrams: HeroDiagram[]; stages: string[] }) {
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = useReducedMotion();
  const hoverPause = useRef(false);
  const elapsed = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const count = diagrams.length;

  // Auto-advance with a progress bar under the active tab. Pauses on hover/focus, when hidden, or for reduced motion.
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => {
      if (userPaused || hoverPause.current || reduced || document.hidden) return;
      elapsed.current += 100;
      if (barRef.current) barRef.current.style.width = Math.min(100, (elapsed.current / HERO_MS) * 100) + '%';
      if (elapsed.current >= HERO_MS) {
        elapsed.current = 0;
        setIdx((i) => (i + 1) % count);
      }
    }, 100);
    return () => clearInterval(t);
  }, [count, userPaused, reduced]);

  const select = (i: number) => {
    elapsed.current = 0;
    if (barRef.current) barRef.current.style.width = '0%';
    setIdx(i);
  };

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (spotRef.current) spotRef.current.style.transform = `translate(${x}px,${y}px)`;
    if (tiltRef.current && window.innerWidth >= 900) {
      tiltRef.current.style.transform = `rotateX(${(y / r.height - 0.5) * -5}deg) rotateY(${(x / r.width - 0.5) * 7}deg)`;
    }
  };
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'none';
  };

  const H = diagrams[Math.min(idx, count - 1)];

  return (
    <section aria-labelledby="hero-h" className="lhero dark" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div aria-hidden="true" className="grid-bg mask" />
      <div aria-hidden="true" ref={spotRef} className="spot" />
      <div className="wrap">
        <div style={{ flex: '1.2 1 460px', minWidth: 0 }}>
          <p className="pill-label up">
            <span aria-hidden="true" className="pulse-dot" />
            SOFTWARE · SYSTEMS · DIGITAL SOLUTIONS
          </p>
          <h1 id="hero-h" className="up up-1">
            Build technology that moves your business <span className="grad-text">forward.</span>
          </h1>
          <p className="sub up up-2">Custom software, web development, and practical IT expertise shaped around your business needs.</p>
          <div className="up up-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 40 }}>
            <Link href="/contact" className="lbtn lbtn-primary lbtn-glow lbtn-xl">
              Discuss a Project <span aria-hidden="true">→</span>
            </Link>
            <Link href="/services" className="lbtn lbtn-ghost lbtn-xl">
              Explore Services
            </Link>
          </div>
        </div>

        {H && (
          <div
            className="up"
            style={{ flex: '1 1 440px', minWidth: 0, animationDuration: '.9s', animationDelay: '.2s' }}
            onMouseEnter={() => (hoverPause.current = true)}
            onMouseLeave={() => (hoverPause.current = false)}
            onFocus={() => (hoverPause.current = true)}
            onBlur={() => (hoverPause.current = false)}
          >
            <div className="hero-tabs">
              <div role="group" aria-label="Show diagram for a service">
                {diagrams.map((d, i) => (
                  <button key={d.label} type="button" className="htab" aria-pressed={i === idx} onClick={() => select(i)}>
                    <span style={{ position: 'relative', zIndex: 1 }}>{d.label}</span>
                    {i === idx && <span aria-hidden="true" ref={barRef} className="bar" />}
                  </button>
                ))}
              </div>
              {count > 1 && (
                <button type="button" className="hplay" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Play diagram rotation' : 'Pause diagram rotation'}>
                  {userPaused ? '▶' : 'II'}
                </button>
              )}
            </div>
            <figure style={{ margin: 0, perspective: 1200 }}>
              <div ref={tiltRef} className="tilt">
                <div className="diagram">
                  <div className="head">
                    <span>
                      {H.file}
                      <span aria-hidden="true" className="blink">
                        _
                      </span>
                    </span>
                    <span style={{ color: 'var(--violet-light)' }}>Concept</span>
                  </div>

                  <div className="hero-full" key={'full-' + idx}>
                    <div className="dgrid">
                      <div className="dcol in">
                        <p className="dcap">INPUTS</p>
                        {H.inputs.map((x) => (
                          <div key={x} className="dnode">
                            {x}
                          </div>
                        ))}
                      </div>
                      <div aria-hidden="true" className="wires">
                        {[0, 0.85, 1.7].map((d) => (
                          <div key={d} className="wire">
                            <span style={{ animationDelay: d + 's' }} />
                          </div>
                        ))}
                      </div>
                      <div className="dcore">
                        <p className="dcap" style={{ margin: '0 0 4px', color: 'var(--blue-light)' }}>
                          CORE
                        </p>
                        <p className="t">{H.core}</p>
                        <div style={{ display: 'grid', gap: 6 }}>
                          {H.rows.map(([k, v]) => (
                            <div key={k} className="drow">
                              <span>{k}</span>
                              <span>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div aria-hidden="true" className="wires out">
                        {[0.4, 1.25, 2.1].map((d) => (
                          <div key={d} className="wire">
                            <span style={{ animationDelay: d + 's' }} />
                          </div>
                        ))}
                      </div>
                      <div className="dcol out">
                        <p className="dcap">OUTPUTS</p>
                        {H.outputs.map((x) => (
                          <div key={x} className="dnode">
                            {x}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="dcompact hero-compact">
                    <div className="dnode">{H.inputs.join(' · ')}</div>
                    <div className="dcore">
                      <p className="t">{H.core}</p>
                      <p>{H.rows.map((r) => r[0]).join(' · ')}</p>
                    </div>
                    <div className="dnode">{H.outputs.join(' · ')}</div>
                  </div>

                  <div className="dstages">
                    {stages.map((l, i) => (
                      <span key={l} className={i === H.stage ? 'on' : i < H.stage ? 'done' : ''}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div aria-hidden="true" className="json-card hero-full">
                  <p className="top">
                    <span>ENQUIRY.JSON</span>
                    <span style={{ color: 'var(--ok)' }}>● valid</span>
                  </p>
                  <pre>
                    {'{\n  '}
                    <span className="k">&quot;service&quot;</span>: &quot;{H.json}&quot;,{'\n  '}
                    <span className="k">&quot;goal&quot;</span>: &quot;{H.goal}&quot;,{'\n  '}
                    <span className="k">&quot;timeline&quot;</span>: &quot;1–3 months&quot;{'\n}'}
                  </pre>
                </div>
              </div>
              <figcaption style={{ marginTop: 'clamp(20px,5vw,60px)', textAlign: 'right', font: '400 12px/1.4 var(--mono)', color: '#A9AEBC' }}>
                Illustrative system diagram. Not client work.
              </figcaption>
            </figure>
          </div>
        )}
      </div>
    </section>
  );
}
