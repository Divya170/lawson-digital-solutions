'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChangeEvent, FocusEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useContent, useSite } from '@/components/ui/AppProviders';
import { api, ApiError } from '@/lib/api';
import { useClock } from '@/lib/hooks';

const EMPTY = { name: '', email: '', company: '', service: '', budget: '', timeline: '', url: '', description: '', website: '' };
type Form = typeof EMPTY;
type Field = keyof Form;

const FAIL: Record<string, string> = {
  network: 'We couldn’t reach the server. Check your connection and try again. Your details are still here.',
  server: 'Something went wrong on our side. Please try again, or send your details by email.',
  rate: 'Too many attempts in a short time. Please wait a minute and try again.',
  invalid: 'The server couldn’t accept some of the details. Please review the form and try again.',
};
const FIELD_ID: Record<string, string> = { name: 'f-name', email: 'f-email', description: 'f-desc', url: 'f-url', company: 'f-company' };

/** Same rules as the API (backend enquiry.validation.ts). */
function validate(f: Form) {
  const e: Record<string, string> = {};
  const t = (v: string) => (v || '').trim();
  if (!t(f.name)) e.name = 'Please enter your name.';
  else if (f.name.length > 120) e.name = 'Name must be 120 characters or fewer.';
  if (!t(f.email)) e.email = 'Please enter your email address.';
  else if (f.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t(f.email))) e.email = 'Enter an email address like name@company.com.';
  if (!t(f.description)) e.description = 'Please tell us a little about your project.';
  else if (t(f.description).length < 20) e.description = 'Please add a bit more detail (at least 20 characters).';
  else if (f.description.length > 4000) e.description = 'Please keep the description under 4,000 characters.';
  if (t(f.url) && !/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(t(f.url))) e.url = 'Enter a web address like example.com.';
  return e;
}

export function ContactView() {
  const site = useSite();
  const content = useContent();
  const params = useSearchParams();
  const clock = useClock(site.timezone);
  const services = content?.services || [];
  const validService = (s: string | null) => (s && (s === 'unsure' || services.some((x) => x.id === s)) ? s : '');

  const [form, setForm] = useState<Form>(() => ({ ...EMPTY, service: validService(params.get('service')) }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'success'>('idle');
  const [failReason, setFailReason] = useState('');
  const [more, setMore] = useState(false);
  const [ref, setRef] = useState('');
  const [copied, setCopied] = useState(false);
  const startedAt = useRef(0);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Follow ?service= links (e.g. from "Discuss This Service").
  const qService = params.get('service');
  useEffect(() => {
    const s = validService(qService);
    if (s) setForm((f) => ({ ...f, service: s }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qService, services.length]);

  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
    if (status === 'success') {
      window.scrollTo({ top: 0 });
      successRef.current?.focus();
    }
  }, [status]);

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!startedAt.current) startedAt.current = Date.now();
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (attempted) setErrors(validate(next));
      return next;
    });
  };

  const onBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as Field;
    if (!form[name] && !attempted) return;
    const all = validate(form);
    setErrors((er) => {
      const n = { ...er };
      if (all[name]) n[name] = all[name];
      else delete n[name];
      return n;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const errs = validate(form);
    const keys = Object.keys(errs);
    if (keys.length) {
      setErrors(errs);
      setAttempted(true);
      setStatus('idle');
      if (errs.url) setMore(true);
      setTimeout(() => document.getElementById(FIELD_ID[keys[0]])?.focus(), 30);
      return;
    }
    setStatus('sending');
    setErrors({});
    setAttempted(true);
    try {
      const res = await api<{ ref: string }>('/enquiries', {
        method: 'POST',
        json: {
          name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), service: form.service, budget: form.budget,
          timeline: form.timeline, url: form.url.trim(), description: form.description.trim(), website: form.website,
          elapsedMs: Date.now() - (startedAt.current || Date.now()),
        },
      });
      setRef(res.ref);
      setStatus('success');
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) {
        setErrors(ex.errors);
        if (ex.errors.url || ex.errors.budget || ex.errors.timeline) setMore(true);
        setFailReason('invalid');
      } else setFailReason(ex.status === 0 ? 'network' : ex.status === 429 ? 'rate' : ex.status === 400 || ex.status === 422 ? 'invalid' : 'server');
      setStatus('error');
    }
  };

  const reset = () => {
    setForm({ ...EMPTY });
    setErrors({});
    setAttempted(false);
    setStatus('idle');
    setFailReason('');
    setRef('');
    startedAt.current = 0;
  };

  const addPrompt = (text: string) => {
    setForm((f) => ({ ...f, description: (f.description ? f.description.replace(/\s*$/, '') + '\n' : '') + text }));
    if (!startedAt.current) startedAt.current = Date.now();
    setTimeout(() => {
      const el = descRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  };

  const copyEmail = () => {
    navigator.clipboard
      ?.writeText(site.email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const v = validate(form);
  const ok = { name: !!form.name && !v.name, email: !!form.email && !v.email, description: !!form.description && !v.description };
  const reqDone = Number(ok.name) + Number(ok.email) + Number(ok.description);
  const sending = status === 'sending';
  const keys = Object.keys(errors);
  const serviceName = form.service === 'unsure' ? 'Not sure yet' : services.find((s) => s.id === form.service)?.name || '';
  const body = `Name: ${form.name}\nCompany: ${form.company}\nService: ${serviceName}\nTimeline: ${form.timeline}\nBudget: ${form.budget}\nURL: ${form.url}\n\n${form.description}`;
  const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent('Project enquiry' + (form.name ? ' from ' + form.name : ''))}&body=${encodeURIComponent(body)}`;
  const firstName = form.name.trim().split(/\s+/)[0] || 'there';

  const fieldProps = (k: Field) => ({
    name: k,
    value: form[k],
    onChange: onField,
    onBlur,
    'aria-invalid': !!errors[k],
    className: `linput${errors[k] ? ' bad' : ''}`,
  });
  const err = (k: string, id: string) =>
    errors[k] ? (
      <p id={id} className="lerr">
        ⚠ {errors[k]}
      </p>
    ) : null;

  return (
    <>
      <section aria-labelledby="ct-h" className="container" style={{ paddingTop: 'clamp(56px,8vw,104px)', paddingBottom: 'clamp(32px,4vw,48px)' }}>
        <p className="mono-label up" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
          Contact
        </p>
        <h1 id="ct-h" className="h-page up up-1" style={{ maxWidth: '13em' }}>
          Tell us what you’re looking to build.
        </h1>
        <p className="lede up up-2" style={{ marginTop: 24 }}>
          Share a little about your project or technical challenge. We’ll use the details to understand your needs and determine the next step.
        </p>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(72px,9vw,128px)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px,5vw,64px)', alignItems: 'flex-start' }}>
        <div style={{ flex: '2 1 540px', minWidth: 0 }}>
          {status !== 'success' ? (
            <form noValidate onSubmit={submit} aria-labelledby="form-h" className="eform up" style={{ animationDelay: '.2s' }}>
              <div className="sticky-head">
                <h2 id="form-h" style={{ font: '600 20px/1.2 var(--display)', letterSpacing: '-.02em' }}>
                  Project enquiry
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, font: '500 12px/1 var(--mono)', color: reqDone === 3 ? 'var(--ok)' : 'var(--muted-2)' }}>
                  <span>{reqDone} / 3 REQUIRED</span>
                  <span aria-hidden="true" className="bar-track" style={{ width: 96, height: 6, borderRadius: 6 }}>
                    <div style={{ width: `${(reqDone / 3) * 100}%`, background: reqDone === 3 ? 'var(--ok)' : 'var(--blue)', transition: 'width .4s var(--ease),background .3s' }} />
                  </span>
                </div>
              </div>
              <div className="body">
                <p style={{ margin: '0 0 28px', font: '400 14px/1.5 var(--sans)', color: 'var(--muted-2)' }}>
                  Fields marked <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
                  <span className="sr-only">with an asterisk</span> are required. Everything else is optional.
                </p>

                {status === 'error' && (
                  <div ref={errorRef} role="alert" tabIndex={-1} className="lalert">
                    <p style={{ margin: '0 0 6px', font: '600 16px/1.3 var(--sans)', color: 'var(--danger-dark)' }}>Your enquiry was not sent.</p>
                    <p style={{ margin: '0 0 14px', font: '400 15px/1.55 var(--sans)', color: '#3F2227' }}>{FAIL[failReason] || FAIL.network}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <button type="submit" className="btn btn-sm" style={{ background: 'var(--danger-dark)', color: '#fff' }}>
                        Try again
                      </button>
                      {site.email && (
                        <a href={mailtoHref} className="btn btn-sm" style={{ border: '1px solid var(--danger-dark)', color: 'var(--danger-dark)' }}>
                          Send by email instead
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {status !== 'error' && keys.length > 0 && (
                  <div role="alert" className="lalert" style={{ padding: '14px 18px', font: '500 15px/1.5 var(--sans)', color: 'var(--danger-dark)' }}>
                    Please check {keys.length} highlighted {keys.length === 1 ? 'field' : 'fields'} below.
                  </div>
                )}

                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="legend-mono">01 — What do you need?</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,170px),1fr))', gap: 10 }}>
                    {[...services.map((s) => ({ value: s.id, label: s.name, tag: s.tag })), { value: 'unsure', label: 'Not sure yet', tag: '???' }].map((o) => (
                      <label key={o.value} className="svc-opt">
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="tg">{o.tag}</span>
                          <input type="radio" name="service" value={o.value} checked={form.service === o.value} onChange={onField} />
                        </span>
                        <span style={{ font: '500 15px/1.25 var(--display)', color: 'var(--ink)' }}>{o.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.service && <p className="lerr">⚠ {errors.service}</p>}
                </fieldset>

                <fieldset style={{ border: 0, margin: '36px 0 0', padding: '28px 0 0', borderTop: '1px solid var(--line)', display: 'grid', gap: 22 }}>
                  <legend className="legend-mono" style={{ float: 'left', width: '100%' }}>
                    02 — About you
                  </legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 22 }}>
                    <div>
                      <label htmlFor="f-name" className="lfield-label">
                        <span>
                          Full name <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
                        </span>
                        <span aria-hidden="true" className="ok" style={{ opacity: ok.name ? 1 : 0 }}>
                          ✓
                        </span>
                      </label>
                      <input id="f-name" type="text" autoComplete="name" required maxLength={120} aria-describedby="f-name-err" {...fieldProps('name')} />
                      {err('name', 'f-name-err')}
                    </div>
                    <div>
                      <label htmlFor="f-email" className="lfield-label">
                        <span>
                          Email address <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
                        </span>
                        <span aria-hidden="true" className="ok" style={{ opacity: ok.email ? 1 : 0 }}>
                          ✓
                        </span>
                      </label>
                      <input id="f-email" type="email" inputMode="email" autoComplete="email" required maxLength={254} aria-describedby="f-email-err" {...fieldProps('email')} />
                      {err('email', 'f-email-err')}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="f-company" className="lfield-label" style={{ display: 'block' }}>
                      Company name <span style={{ fontWeight: 400, color: 'var(--muted-2)' }}>(optional)</span>
                    </label>
                    <input id="f-company" type="text" autoComplete="organization" maxLength={120} {...fieldProps('company')} />
                    {err('company', 'f-company-err')}
                  </div>
                </fieldset>

                <fieldset style={{ border: 0, margin: '36px 0 0', padding: '28px 0 0', borderTop: '1px solid var(--line)' }}>
                  <legend className="legend-mono" style={{ float: 'left', width: '100%' }}>
                    03 — Your project
                  </legend>
                  <label htmlFor="f-desc" className="lfield-label" style={{ clear: 'both' }}>
                    <span>
                      Project description <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
                    </span>
                    <span aria-hidden="true" className="ok" style={{ opacity: ok.description ? 1 : 0 }}>
                      ✓
                    </span>
                  </label>
                  <p id="f-desc-help" style={{ margin: '-2px 0 10px', font: '400 14px/1.5 var(--sans)', color: 'var(--muted-2)' }}>
                    What are you trying to build, improve, or solve? Who will use it?
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {(content?.prompts || []).map((p) => (
                      <button key={p.label} type="button" className="prompt-btn" onClick={() => addPrompt(p.text)}>
                        + {p.label}
                      </button>
                    ))}
                  </div>
                  <textarea ref={descRef} id="f-desc" rows={6} required maxLength={4000} aria-describedby="f-desc-help f-desc-err f-desc-count" {...fieldProps('description')} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 8 }}>
                    {errors.description && (
                      <p id="f-desc-err" className="lerr" style={{ margin: 0 }}>
                        ⚠ {errors.description}
                      </p>
                    )}
                    <p id="f-desc-count" style={{ margin: '0 0 0 auto', font: '400 12px/1.4 var(--mono)', color: 'var(--muted-2)' }}>
                      {form.description.length} / 4000
                    </p>
                  </div>
                </fieldset>

                <div className="more-box">
                  <button type="button" className="more-toggle" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-controls="more-fields">
                    <span>
                      04 — Timeline, budget &amp; links <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--muted-2)' }}>· optional</span>
                    </span>
                    <span aria-hidden="true" className="plus">
                      +
                    </span>
                  </button>
                  {more && (
                    <div id="more-fields" style={{ display: 'grid', gap: 24, padding: '4px 18px 22px', animation: 'ldsUp .3s both' }}>
                      <p style={{ font: '400 14px/1.55 var(--sans)', color: 'var(--muted-2)' }}>
                        Timeline and budget help us suggest a realistic scope. Share as much or as little as you like.
                      </p>
                      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                        <legend style={{ padding: 0, marginBottom: 10, font: '500 15px/1.3 var(--sans)' }}>Preferred timeline</legend>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {(content?.timelines || []).map((o) => (
                            <label key={o} className="chip-radio">
                              <input type="radio" name="timeline" value={o} checked={form.timeline === o} onChange={onField} />
                              {o}
                            </label>
                          ))}
                        </div>
                        {errors.timeline && <p className="lerr">⚠ {errors.timeline}</p>}
                      </fieldset>
                      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                        <legend style={{ padding: 0, marginBottom: 10, font: '500 15px/1.3 var(--sans)' }}>Budget range</legend>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {(content?.budgets || []).map((o) => (
                            <label key={o} className="chip-radio">
                              <input type="radio" name="budget" value={o} checked={form.budget === o} onChange={onField} />
                              {o}
                            </label>
                          ))}
                        </div>
                        {errors.budget && <p className="lerr">⚠ {errors.budget}</p>}
                      </fieldset>
                      <div>
                        <label htmlFor="f-url" className="lfield-label" style={{ display: 'block' }}>
                          Existing website or app URL
                        </label>
                        <input id="f-url" type="url" inputMode="url" autoComplete="url" maxLength={300} placeholder="example.com" aria-describedby="f-url-err" {...fieldProps('url')} style={{ background: '#fff' }} />
                        {err('url', 'f-url-err')}
                      </div>
                    </div>
                  )}
                </div>

                <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
                  <label htmlFor="f-hp">Leave this field empty</label>
                  <input id="f-hp" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={onField} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px', marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
                  <button
                    type="submit"
                    className="lbtn lbtn-primary deep lbtn-glow lbtn-lg"
                    style={{ minWidth: 220, background: sending ? '#6F86D9' : undefined }}
                    disabled={sending}
                    aria-busy={sending}
                  >
                    {sending && <span aria-hidden="true" className="spinner" style={{ borderColor: 'rgba(255,255,255,.4)', borderTopColor: '#fff' }} />}
                    <span>{sending ? 'Sending…' : 'Send enquiry'}</span>
                  </button>
                  <p style={{ flex: '1 1 240px', font: '400 14px/1.5 var(--sans)', color: 'var(--muted-2)' }}>
                    Your details are used only to respond to this enquiry. See our <Link href="/privacy">Privacy Policy</Link>.
                  </p>
                </div>
                <p role="status" aria-live="polite" className="sr-only">
                  {sending ? 'Sending your enquiry' : status === 'error' ? 'Enquiry not sent' : ''}
                </p>
              </div>
            </form>
          ) : (
            <div role="status" className="success-dark">
              <div aria-hidden="true" className="ring" style={{ right: -60, top: -60, width: 220, height: 220, border: '1px solid rgba(38,122,89,.5)' }} />
              <p style={{ position: 'relative', margin: '0 0 18px', display: 'inline-flex', alignItems: 'center', gap: 10, font: '500 12px/1 var(--mono)', letterSpacing: '.1em', color: '#6FCB9F' }}>
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: '#2E9A6E', boxShadow: '0 0 0 4px rgba(46,154,110,.3)' }} />
                ENQUIRY RECEIVED · REF {ref}
              </p>
              <h2 ref={successRef} tabIndex={-1} style={{ position: 'relative', font: '600 clamp(28px,3.4vw,44px)/1.05 var(--display)', letterSpacing: '-.03em', outline: 'none' }}>
                Thanks, {firstName}. Your enquiry has been received.
              </h2>
              <p style={{ position: 'relative', margin: '16px 0 0', maxWidth: '34em', font: '400 17px/1.6 var(--sans)', color: '#C9CDDA' }}>
                We’ll review the details you shared and reply to {form.email}.{site.email && <> If anything changes in the meantime, you can email {site.email} and quote reference {ref}.</>}
              </p>
              <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
                <Link href="/services" className="lbtn lbtn-primary" style={{ minHeight: 48, padding: '0 20px', fontSize: 15 }}>
                  Back to Services →
                </Link>
                <Link href="/projects" className="lbtn lbtn-ghost" style={{ minHeight: 48, padding: '0 20px', fontSize: 15 }}>
                  See how projects take shape
                </Link>
                <button type="button" onClick={reset} style={{ minHeight: 48, padding: '0 20px', border: 0, background: 'transparent', color: 'var(--blue-light)', font: '600 15px/1 var(--sans)', textDecoration: 'underline', textUnderlineOffset: 4, cursor: 'pointer' }}>
                  Send another enquiry
                </button>
              </div>
            </div>
          )}
        </div>

        <aside aria-label="Contact details" className="contact-aside up" style={{ animationDelay: '.3s' }}>
          <div className="contact-card">
            <div aria-hidden="true" className="grid-bg small" />
            <div style={{ position: 'relative' }}>
              <p style={{ margin: '0 0 20px', display: 'flex', justifyContent: 'space-between', font: '500 12px/1.4 var(--mono)', letterSpacing: '.1em', color: '#A9AEBC' }}>
                <span>DIRECT CONTACT</span>
                {clock && <span style={{ color: '#6FCB9F' }}>● {clock}</span>}
              </p>
              <p style={{ font: '600 20px/1.3 var(--display)' }}>{site.businessName}</p>
              {site.contactName && <p style={{ margin: '4px 0 0', font: '400 15px/1.5 var(--sans)', color: '#C9CDDA' }}>{site.contactName}, business contact</p>}
              <dl style={{ margin: '28px 0 0', display: 'grid', gap: 18 }}>
                {site.email && (
                  <div>
                    <dt>EMAIL</dt>
                    <dd style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <a href={site.mailto}>{site.email}</a>
                      <button type="button" className="copy-btn" onClick={copyEmail}>
                        {copied ? 'Copied ✓' : 'Copy'}
                      </button>
                    </dd>
                  </div>
                )}
                {site.phone && (
                  <div>
                    <dt>PHONE</dt>
                    <dd>
                      <a href={site.tel}>{site.phone}</a>
                    </dd>
                  </div>
                )}
                {site.street && (
                  <div>
                    <dt>ADDRESS</dt>
                    <dd style={{ font: '400 16px/1.5 var(--sans)' }}>
                      <address style={{ fontStyle: 'normal' }}>
                        {site.street}
                        <br />
                        {site.locality}
                      </address>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          <nav aria-label="Other options" className="other-nav">
            {site.email && (
              <a href={site.mailto}>
                Email the business <span aria-hidden="true">→</span>
              </a>
            )}
            {site.phone && (
              <a href={site.tel}>
                Call the business <span aria-hidden="true">→</span>
              </a>
            )}
            <Link href="/services">
              Return to Services <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </aside>
      </section>
    </>
  );
}
