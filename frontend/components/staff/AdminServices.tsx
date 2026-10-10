'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSiteData, useUi } from '@/components/ui/AppProviders';
import { api, ApiError } from '@/lib/api';
import { shortDate } from '@/lib/format';
import { useApi } from '@/lib/hooks';
import type { Service } from '@/lib/types';

export function AdminServices() {
  const { data, error, loading, reload } = useApi<Service[]>('/admin/services');
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Services</h1>
          <p style={{ marginTop: 6, font: '400 14px/1.5 var(--sans)', color: 'var(--muted)', maxWidth: '60ch' }}>
            The copy for each service appears on the homepage, the Services page, the enquiry form and the footer.
          </p>
        </div>
      </div>
      {error && (
        <div role="alert" className="state-card">
          <h2>Couldn’t load services</h2>
          <p>{error.message}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Try again
          </button>
        </div>
      )}
      {loading && !data && <div className="skel" style={{ height: 320, borderRadius: 8 }} aria-busy="true" />}
      {data && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 12 }}>
          {data.map((s) => (
            <li key={s.id} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ font: '500 12px/1 var(--mono)', color: 'var(--blue)' }}>
                {s.n} / {s.tag}
              </p>
              <h2 style={{ font: '600 20px/1.2 var(--display)' }}>{s.name}</h2>
              <p style={{ font: '400 14px/1.55 var(--sans)', color: 'var(--body)', flex: 1 }}>{s.short}</p>
              <p className="hint">Updated {shortDate(s.updatedAt)}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/staff/services/${s.id}`} className="btn btn-primary btn-sm" aria-label={`Edit ${s.name}`}>
                  Edit
                </Link>
                <a href={`/services?s=${s.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-sm" aria-label={`View ${s.name} on the site`}>
                  View ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

type Draft = Record<'name' | 'tag' | 'short' | 'outcome' | 'purpose' | 'problems' | 'considerations' | 'deliverables' | 'flow', string>;
const FIELDS: { k: keyof Draft; label: string; rows?: number; hint?: string; max?: number }[] = [
  { k: 'name', label: 'Service name', max: 80 },
  { k: 'tag', label: 'Short tag', max: 6, hint: 'Up to 6 letters, shown in mono type (e.g. APP).' },
  { k: 'short', label: 'One-line summary', rows: 2, hint: 'Homepage “Four ways we can help” list.' },
  { k: 'outcome', label: 'Outcome line', max: 160, hint: 'Shown on the homepage preview card.' },
  { k: 'purpose', label: 'Introduction', rows: 3, hint: 'Opening paragraph on the Services page.' },
  { k: 'problems', label: 'Problems it addresses', rows: 4, hint: 'One per line.' },
  { k: 'considerations', label: 'Engagement considerations', rows: 4, hint: 'One per line.' },
  { k: 'deliverables', label: 'Possible deliverables', rows: 4, hint: 'One per line.' },
  { k: 'flow', label: 'Approach diagram', rows: 3, hint: 'Exactly three steps, one per line.' },
];

export function ServiceForm({ id }: { id: string }) {
  const router = useRouter();
  const { reload: reloadSite } = useSiteData();
  const { toast } = useUi();
  const { data: list, error: loadError, loading, reload } = useApi<Service[]>('/admin/services');
  const existing = list?.find((s) => s.id === id);
  const [d, setD] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existing)
      setD({
        name: existing.name, tag: existing.tag, short: existing.short, outcome: existing.outcome, purpose: existing.purpose,
        problems: existing.problems.join('\n'), considerations: existing.considerations.join('\n'), deliverables: existing.deliverables.join('\n'), flow: existing.flow.join('\n'),
      });
  }, [existing]);
  useEffect(() => {
    if (saved) successRef.current?.focus();
  }, [saved]);

  const back = (
    <nav aria-label="Breadcrumb">
      <Link href="/staff/services" style={{ font: '500 14px var(--sans)' }}>
        ← Services
      </Link>
    </nav>
  );
  if (loading && !list) return <div className="skel" style={{ height: 520, borderRadius: 8 }} aria-busy="true" />;
  if (loadError)
    return (
      <>
        {back}
        <div role="alert" className="state-card">
          <h2>Couldn’t load this service</h2>
          <p>{loadError.message}</p>
          <button type="button" className="btn btn-primary" onClick={reload}>
            Try again
          </button>
        </div>
      </>
    );
  if (list && !existing)
    return (
      <>
        {back}
        <h1 style={{ font: '600 28px var(--display)' }}>Service not found</h1>
      </>
    );
  if (!d) return null;

  if (saved)
    return (
      <>
        {back}
        <div ref={successRef} className="success-card" role="status" tabIndex={-1} style={{ maxWidth: 720 }}>
          <p className="kicker">Service updated</p>
          <h3>{d.name}</h3>
          <p className="body">The new copy is live on the homepage, Services page, enquiry form and footer.</p>
          <div className="actions">
            <a href={`/services?s=${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              View on the site ↗
            </a>
            <Link href="/staff/services" className="btn btn-outline btn-sm">
              Back to services
            </Link>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setSaved(false)}>
              Keep editing
            </button>
          </div>
        </div>
      </>
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api(`/admin/services/${id}`, { method: 'PUT', json: d });
      reloadSite();
      router.refresh();
      setSaved(true);
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) {
        setErrors(ex.errors);
        document.getElementById('sv-' + Object.keys(ex.errors)[0])?.focus();
      } else toast(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {back}
      <h1 style={{ font: '600 32px/1.1 var(--display)', letterSpacing: '-0.03em' }}>Edit {existing?.name}</h1>
      <form noValidate onSubmit={submit} className="edit-form">
        {Object.keys(errors).length > 0 && (
          <div role="alert" className="alert-error" style={{ padding: '14px 16px' }}>
            <p style={{ font: '600 14px var(--sans)' }}>Please fix {Object.keys(errors).length === 1 ? 'the highlighted field' : `${Object.keys(errors).length} highlighted fields`}.</p>
          </div>
        )}
        <div className="edit-grid">
          {FIELDS.map((f) => {
            const fid = 'sv-' + f.k;
            const invalid = !!errors[f.k];
            const common = {
              id: fid,
              value: d[f.k],
              'aria-invalid': invalid || undefined,
              'aria-describedby': invalid ? fid + '-err' : f.hint ? fid + '-hint' : undefined,
              onChange: (e: { target: { value: string } }) => {
                setD((s) => (s ? { ...s, [f.k]: e.target.value } : s));
                setErrors((er) => ({ ...er, [f.k]: '' }));
              },
            };
            return (
              <div key={f.k} className={`field${f.rows ? ' wide' : ''}`}>
                <label htmlFor={fid} className="label-sm">
                  {f.label}
                </label>
                {f.rows ? (
                  <textarea {...common} rows={f.rows} className={`textarea input-sm${invalid ? ' is-invalid' : ''}`} style={{ minHeight: 0 }} />
                ) : (
                  <input {...common} maxLength={f.max} className={`input input-sm${invalid ? ' is-invalid' : ''}`} />
                )}
                {invalid ? (
                  <p id={fid + '-err'} className="field-error">
                    {errors[f.k]}
                  </p>
                ) : (
                  f.hint && (
                    <p id={fid + '-hint'} className="hint">
                      {f.hint}
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
        <div className="form-foot">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save service'}
          </button>
          <Link href="/staff/services" className="btn btn-quiet">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
