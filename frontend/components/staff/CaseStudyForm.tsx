'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useContent, useUi } from '@/components/ui/AppProviders';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import type { CaseStudy } from '@/lib/types';
import { useStaff } from './StaffShell';

type Draft = Pick<CaseStudy, 'title' | 'slug' | 'client' | 'serviceId' | 'summary' | 'requirement' | 'approach' | 'delivered' | 'results' | 'coverImage' | 'status'>;
const BLANK: Draft = { title: '', slug: '', client: '', serviceId: '', summary: '', requirement: '', approach: '', delivered: '', results: '', coverImage: '', status: 'draft' };

const LABELS: Record<string, string> = {
  title: 'Title', slug: 'URL slug', client: 'Client name', serviceId: 'Service', summary: 'Summary', coverImage: 'Cover image',
  requirement: 'Requirement', approach: 'Approach', delivered: 'Delivered', results: 'Results', status: 'Status',
};
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

export function CaseStudyForm({ id }: { id?: number }) {
  const content = useContent();
  const { toast } = useUi();
  const { refreshStats } = useStaff();
  const { data: existing, error: loadError, loading, reload } = useApi<CaseStudy>(id ? `/admin/case-studies/${id}` : null);
  const [d, setD] = useState<Draft>(BLANK);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState<CaseStudy | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      const { title, slug, client, serviceId, summary, requirement, approach, delivered, results, coverImage, status } = existing;
      setD({ title, slug, client, serviceId, summary, requirement, approach, delivered, results, coverImage, status });
      setSlugTouched(true);
    }
  }, [existing]);
  useEffect(() => {
    if (saved) successRef.current?.focus();
  }, [saved]);

  const set = (k: keyof Draft, v: string) => {
    setD((s) => {
      const n = { ...s, [k]: v } as Draft;
      if (k === 'title' && !slugTouched) n.slug = slugify(v);
      return n;
    });
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  const onCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast(`${file.name} is larger than 8 MB.`, 'error');
    const fd = new FormData();
    fd.append('files', file);
    setUploading(true);
    try {
      const res = await api<{ urls: string[] }>('/admin/uploads', { method: 'POST', body: fd });
      set('coverImage', res.urls[0]);
      toast('Image uploaded. Save to keep it.');
    } catch (x) {
      toast((x as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = 'Enter a title.';
    if (d.status === 'published') {
      if (!d.summary.trim()) e.summary = 'Add a summary before publishing.';
      if (!d.requirement.trim()) e.requirement = 'Add the requirement before publishing.';
      if (!d.approach.trim()) e.approach = 'Add the approach before publishing.';
      if (!d.delivered.trim()) e.delivered = 'Add what was delivered before publishing.';
    }
    if (Object.keys(e).length) {
      setErrors(e);
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setSaving(true);
    try {
      const c = await api<CaseStudy>(id ? `/admin/case-studies/${id}` : '/admin/case-studies', { method: id ? 'PUT' : 'POST', json: d });
      setSaved(c);
      refreshStats();
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) {
        setErrors(ex.errors);
        setTimeout(() => summaryRef.current?.focus(), 0);
      } else toast(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const back = (
    <nav aria-label="Breadcrumb">
      <Link href="/staff/case-studies" style={{ font: '500 14px var(--sans)' }}>
        ← Case studies
      </Link>
    </nav>
  );

  if (id && loading)
    return (
      <div aria-busy="true">
        <div className="skel" style={{ height: 32, width: 280, marginBottom: 24 }} />
        <div className="skel" style={{ height: 520, borderRadius: 8 }} />
      </div>
    );
  if (id && loadError)
    return (
      <>
        {back}
        <h1 style={{ font: '600 28px var(--display)' }}>{loadError.status === 404 ? 'Case study not found' : 'Couldn’t load this case study'}</h1>
        <p className="lead-text">{loadError.status === 404 ? 'It may have been deleted.' : loadError.message}</p>
        {loadError.status !== 404 && (
          <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={reload}>
            Try again
          </button>
        )}
      </>
    );

  if (saved)
    return (
      <>
        {back}
        <div ref={successRef} className="success-card" role="status" tabIndex={-1} style={{ maxWidth: 720 }}>
          <p className="kicker">{saved.status === 'published' ? 'Published' : 'Saved as draft'}</p>
          <h3>{saved.title}</h3>
          <p className="body">
            {saved.status === 'published' ? (
              <>
                It’s live at <strong>/projects/{saved.slug}</strong> and listed on the Projects page.
              </>
            ) : (
              'It isn’t visible on the public site. Publish it once the client has approved the write-up.'
            )}
          </p>
          <div className="actions">
            {saved.status === 'published' ? (
              <a href={`/projects/${saved.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                View on the site ↗
              </a>
            ) : null}
            <Link href="/staff/case-studies" className={`btn btn-sm ${saved.status === 'published' ? 'btn-outline' : 'btn-primary'}`}>
              Back to case studies
            </Link>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                if (!id) {
                  setD(BLANK);
                  setSlugTouched(false);
                }
                setSaved(null);
              }}
            >
              {id ? 'Keep editing' : 'Write another'}
            </button>
          </div>
        </div>
      </>
    );

  const errKeys = Object.keys(errors);
  const field = (k: keyof Draft, opts: { rows?: number; hint?: string; req?: boolean; max?: number } = {}) => {
    const fid = 'cs-' + k;
    const invalid = !!errors[k];
    const common = {
      id: fid,
      value: d[k],
      'aria-invalid': invalid || undefined,
      'aria-describedby': invalid ? fid + '-err' : opts.hint ? fid + '-hint' : undefined,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (k === 'slug') setSlugTouched(true);
        set(k, e.target.value);
      },
    };
    return (
      <div className="field">
        <label htmlFor={fid} className="label-sm">
          {LABELS[k]}
          {opts.req && (
            <span aria-hidden="true" className="req">
              {' '}
              *
            </span>
          )}
        </label>
        {opts.rows ? (
          <textarea {...common} rows={opts.rows} maxLength={opts.max} className={`textarea input-sm${invalid ? ' is-invalid' : ''}`} style={{ minHeight: 0 }} />
        ) : (
          <input {...common} maxLength={opts.max} className={`input input-sm${invalid ? ' is-invalid' : ''}`} />
        )}
        {invalid ? (
          <p id={fid + '-err'} className="field-error">
            {errors[k]}
          </p>
        ) : (
          opts.hint && (
            <p id={fid + '-hint'} className="hint">
              {opts.hint}
            </p>
          )
        )}
      </div>
    );
  };
  const willPublish = d.status === 'published';

  return (
    <>
      {back}
      <h1 style={{ font: '600 32px/1.1 var(--display)', letterSpacing: '-0.03em', color: 'var(--ink)' }}>{existing ? `Edit “${existing.title}”` : 'New case study'}</h1>
      <form noValidate onSubmit={submit} className="edit-form">
        {errKeys.length > 0 && (
          <div ref={summaryRef} role="alert" tabIndex={-1} className="alert-error" style={{ padding: '14px 16px' }}>
            <p style={{ font: '600 14px var(--sans)' }}>Fix the following before saving:</p>
            <ul>
              {errKeys.map((k) => (
                <li key={k}>
                  <a
                    href={`#cs-${k}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('cs-' + k)?.focus();
                    }}
                  >
                    {LABELS[k] || k}: {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="edit-grid">
          <div className="wide">{field('title', { req: true, max: 160 })}</div>
          {field('slug', { hint: `Public address: /projects/${d.slug || '…'}`, max: 100 })}
          {field('client', { hint: 'Only if the client agreed to be named.', max: 120 })}
          <div className="field">
            <label htmlFor="cs-serviceId" className="label-sm">
              Service
            </label>
            <select id="cs-serviceId" className={`select select-sm${errors.serviceId ? ' is-invalid' : ''}`} value={d.serviceId} onChange={(e) => set('serviceId', e.target.value)}>
              <option value="">Not specified</option>
              {(content?.services || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="field-error">{errors.serviceId}</p>}
          </div>
          <div className="wide">{field('summary', { rows: 2, req: willPublish, max: 400, hint: 'One or two sentences shown on the Projects page.' })}</div>
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'grid', gap: 18 }}>
          <legend className="panel-title" style={{ marginBottom: 6 }}>
            The four sections
          </legend>
          <p className="hint" style={{ marginTop: -8 }}>
            Matches “What each case study will cover” on the public site. Leave a blank line between paragraphs.
          </p>
          {field('requirement', { rows: 4, req: willPublish, hint: 'The original problem and context, as approved by the client.' })}
          {field('approach', { rows: 4, req: willPublish, hint: 'Technical considerations and how the solution was planned.' })}
          {field('delivered', { rows: 4, req: willPublish, hint: 'Scope of work and functionality.' })}
          {field('results', { rows: 3, hint: 'Optional — only outcomes that were documented and verified.' })}
        </fieldset>

        <div className="field">
          <span className="label-sm">Cover image</span>
          {d.coverImage && (
            <div className="cover-preview">
              <img src={d.coverImage} alt="Cover preview" />
            </div>
          )}
          <div className="upload-row">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={onCover} />
            <button type="button" className="btn btn-outline btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : d.coverImage ? 'Replace image' : 'Upload image'}
            </button>
            {d.coverImage && (
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => set('coverImage', '')}>
                Remove
              </button>
            )}
            <p className="hint">Approved screenshot only. PNG, JPG, WebP or AVIF up to 8 MB.</p>
          </div>
          {errors.coverImage && <p className="field-error">{errors.coverImage}</p>}
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="label-sm" style={{ marginBottom: 8 }}>
            Visibility
          </legend>
          <div className="seg">
            <label>
              <input type="radio" name="cs-status" checked={d.status === 'draft'} onChange={() => set('status', 'draft')} />
              Draft (private)
            </label>
            <label>
              <input type="radio" name="cs-status" checked={d.status === 'published'} onChange={() => set('status', 'published')} />
              Published
            </label>
          </div>
        </fieldset>

        <div className="form-foot">
          <button type="submit" className="btn btn-primary" disabled={saving || uploading} aria-busy={saving}>
            {saving ? 'Saving…' : willPublish ? (existing?.status === 'published' ? 'Save changes' : 'Publish') : 'Save draft'}
          </button>
          <Link href="/staff/case-studies" className="btn btn-quiet">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
