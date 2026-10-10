'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUi } from '@/components/ui/AppProviders';
import { api, ApiError, qs } from '@/lib/api';
import { shortDate } from '@/lib/format';
import { useApi, useDebounced } from '@/lib/hooks';
import type { CaseStudy } from '@/lib/types';
import { useStaff } from './StaffShell';

type List = { items: CaseStudy[]; total: number; published: number; drafts: number };

export function AdminCaseStudies() {
  const { toast, confirm } = useUi();
  const { refreshStats } = useStaff();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const dq = useDebounced(q.trim(), 250);
  const { data, error, loading, reload } = useApi<List>('/admin/case-studies' + qs({ q: dq, status }));
  const [busy, setBusy] = useState<number | null>(null);

  const after = (msg: string) => {
    toast(msg);
    reload();
    refreshStats();
  };

  const toggle = async (c: CaseStudy) => {
    const next = c.status === 'published' ? 'draft' : 'published';
    if (next === 'draft') {
      const ok = await confirm({
        title: `Unpublish “${c.title}”?`,
        body: 'It will be removed from the public Projects page straight away. You can publish it again at any time.',
        label: 'Unpublish',
      });
      if (!ok) return;
    }
    setBusy(c.id);
    try {
      await api(`/admin/case-studies/${c.id}/status`, { method: 'PATCH', json: { status: next } });
      after(next === 'published' ? `“${c.title}” is now live on the Projects page.` : `“${c.title}” moved back to drafts.`);
    } catch (x) {
      const ex = x as ApiError;
      const missing = Object.values(ex.errors);
      toast(missing.length ? `Can’t publish yet: ${missing[0]} Open it to finish the write-up.` : ex.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c: CaseStudy) => {
    const ok = await confirm({
      title: `Delete “${c.title}”?`,
      body: c.status === 'published' ? 'It is currently published and will disappear from the Projects page. This cannot be undone.' : 'This draft will be permanently deleted.',
      label: 'Delete case study',
      danger: true,
    });
    if (!ok) return;
    setBusy(c.id);
    try {
      await api(`/admin/case-studies/${c.id}`, { method: 'DELETE' });
      after(`“${c.title}” deleted.`);
    } catch (x) {
      toast((x as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const rows = data?.items || [];
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Case studies</h1>
          <p style={{ marginTop: 6, font: '400 14px/1.5 var(--sans)', color: 'var(--muted)', maxWidth: '52ch' }}>
            Only <strong>published</strong> case studies appear on the public Projects page. Publish once the client has approved what can be shared.
          </p>
        </div>
        <Link href="/staff/case-studies/new" className="btn btn-primary btn-sm">
          + New case study
        </Link>
      </div>

      <dl className="stat-grid">
        <div>
          <dt>Total</dt>
          <dd>{data ? data.total : '—'}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{data ? data.published : '—'}</dd>
        </div>
        <div>
          <dt>Drafts</dt>
          <dd>{data ? data.drafts : '—'}</dd>
        </div>
      </dl>

      <div className="toolbar">
        <label style={{ flex: '1 1 260px' }}>
          Search
          <input type="search" className="input input-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, client or summary" />
        </label>
        <label style={{ flex: '0 1 200px' }}>
          Status
          <select className="select select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </label>
      </div>

      <div className="table-wrap" aria-busy={loading}>
        {error ? (
          <div role="alert" className="table-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p>We couldn&apos;t load case studies. {error.message}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={reload}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="data-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th scope="col">Case study</th>
                  <th scope="col">Service</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && !data
                  ? [0, 1, 2].map((i) => (
                      <tr key={i}>
                        <td colSpan={5}>
                          <div className="skel" style={{ height: 40 }} />
                        </td>
                      </tr>
                    ))
                  : rows.map((c) => (
                      <tr key={c.id} style={{ opacity: busy === c.id ? 0.6 : 1 }}>
                        <td>
                          <p style={{ font: '600 15px var(--sans)', color: 'var(--ink)' }}>{c.title}</p>
                          <p style={{ marginTop: 2, font: '400 13px var(--mono)', color: 'var(--muted-2)' }}>/projects/{c.slug}</p>
                        </td>
                        <td>{c.serviceName || '—'}</td>
                        <td>
                          <span className="status-badge" style={c.status === 'published' ? { background: '#E7F4EE', color: '#1F6B4C' } : { background: '#EEEFF2', color: '#4A4F5C' }}>
                            {c.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{shortDate(c.updatedAt)}</td>
                        <td>
                          <div className="row-actions">
                            {c.status === 'published' && (
                              <a href={`/projects/${c.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-quiet btn-xs" aria-label={`View ${c.title} on the site`}>
                                View
                              </a>
                            )}
                            <Link href={`/staff/case-studies/${c.id}/edit`} className="btn btn-quiet btn-xs" aria-label={`Edit ${c.title}`}>
                              Edit
                            </Link>
                            <button type="button" className="btn btn-quiet btn-xs" disabled={busy === c.id} onClick={() => toggle(c)} aria-label={`${c.status === 'published' ? 'Unpublish' : 'Publish'} ${c.title}`}>
                              {c.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button type="button" className="btn btn-danger-outline btn-xs" disabled={busy === c.id} onClick={() => remove(c)} aria-label={`Delete ${c.title}`}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {data && rows.length === 0 && (
              <div className="table-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {dq || status ? (
                  <p>No case studies match this search.</p>
                ) : (
                  <>
                    <p>No case studies yet. The public Projects page shows “Approved work samples aren’t available yet” until one is published.</p>
                    <Link href="/staff/case-studies/new" className="btn btn-primary btn-sm">
                      + Write the first case study
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
