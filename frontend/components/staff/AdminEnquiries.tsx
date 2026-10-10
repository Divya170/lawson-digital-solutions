'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useContent, useUi } from '@/components/ui/AppProviders';
import { api, ApiError, qs } from '@/lib/api';
import { ENQUIRY_STATUS, receivedAt } from '@/lib/format';
import { useApi, useDebounced, useDialog } from '@/lib/hooks';
import type { Enquiry, EnquiryStatus } from '@/lib/types';
import { useStaff } from './StaffShell';

type List = { items: Enquiry[]; total: number; new: number; byStatus: Record<string, number> };
const STATUSES = Object.entries(ENQUIRY_STATUS).map(([value, s]) => ({ value: value as EnquiryStatus, label: s.label }));

function StatusBadge({ s }: { s: EnquiryStatus }) {
  const st = ENQUIRY_STATUS[s];
  return (
    <span className="status-badge" style={{ background: st.bg, color: st.fg }}>
      {st.label}
    </span>
  );
}

function EnquiryPanel({ e, onClose, onChange, onDelete }: { e: Enquiry; onClose: () => void; onChange: (x: Enquiry) => void; onDelete: (x: Enquiry) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useUi();
  const { refreshStats } = useStaff();
  const [notes, setNotes] = useState(e.staffNotes);
  const [notesErr, setNotesErr] = useState('');
  const [saving, setSaving] = useState(false);
  useDialog(ref, true, onClose);
  useEffect(() => setNotes(e.staffNotes), [e.id, e.staffNotes]);

  const patch = async (body: Partial<Enquiry>, msg: string) => {
    setSaving(true);
    try {
      const x = await api<Enquiry>(`/admin/enquiries/${e.id}`, { method: 'PATCH', json: body });
      onChange(x);
      refreshStats();
      toast(msg);
      setNotesErr('');
    } catch (err) {
      const ex = err as ApiError;
      if (ex.errors.staffNotes) setNotesErr(ex.errors.staffNotes);
      else toast(ex.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = (ev: FormEvent) => {
    ev.preventDefault();
    patch({ staffNotes: notes }, 'Notes saved.');
  };

  const url = e.url ? (/^https?:\/\//i.test(e.url) ? e.url : 'https://' + e.url) : '';
  const reply = `mailto:${e.email}?subject=${encodeURIComponent(`Re: your project enquiry (${e.id})`)}&body=${encodeURIComponent(`Hi ${e.name.split(/\s+/)[0]},\n\nThanks for getting in touch about your project.\n\n`)}`;
  const facts: [string, string][] = [
    ['Service', e.serviceName || '—'],
    ['Timeline', e.timeline || '—'],
    ['Budget', e.budget || '—'],
    ['Company', e.company || '—'],
  ];

  return (
    <div className="drawer-wrap">
      <div className="backdrop" aria-hidden="true" onClick={onClose} />
      <div ref={ref} className="drawer" role="dialog" aria-modal="true" aria-labelledby="enq-h">
        <div className="drawer-head">
          <div>
            <p className="mono-label" style={{ fontSize: 11 }}>
              {e.id} · {receivedAt(e.createdAt)}
            </p>
            <h2 id="enq-h">{e.name}</h2>
          </div>
          <button type="button" className="btn btn-quiet btn-sm" data-autofocus onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ padding: '20px clamp(20px,3vw,32px) 40px', display: 'grid', gap: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <a href={reply} className="btn btn-primary btn-sm">
              Reply by email
            </a>
            <a href={`mailto:${e.email}`} style={{ font: '500 15px var(--sans)', wordBreak: 'break-all' }}>
              {e.email}
            </a>
          </div>
          <div className="field">
            <label htmlFor="enq-status" className="label-sm">
              Status
            </label>
            <select
              id="enq-status"
              className="select select-sm"
              value={e.status}
              disabled={saving}
              onChange={(ev) => patch({ status: ev.target.value as EnquiryStatus }, `Marked ${ENQUIRY_STATUS[ev.target.value].label.toLowerCase()}.`)}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px 16px', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt style={{ font: '500 12px/1.3 var(--sans)', color: 'var(--muted-2)' }}>{k}</dt>
                <dd style={{ margin: '3px 0 0', font: '600 15px/1.35 var(--sans)' }}>{v}</dd>
              </div>
            ))}
            {url && (
              <div style={{ gridColumn: '1/-1' }}>
                <dt style={{ font: '500 12px/1.3 var(--sans)', color: 'var(--muted-2)' }}>Website / app</dt>
                <dd style={{ margin: '3px 0 0' }}>
                  <a href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ wordBreak: 'break-all' }}>
                    {e.url} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div>
            <h3 className="label-sm" style={{ marginBottom: 8 }}>
              Project description
            </h3>
            <p style={{ font: '400 15px/1.65 var(--sans)', color: 'var(--body)', whiteSpace: 'pre-line', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              {e.description}
            </p>
          </div>
          <form onSubmit={saveNotes} className="field">
            <label htmlFor="enq-notes" className="label-sm">
              Internal notes <span className="optional">(staff only)</span>
            </label>
            <textarea
              id="enq-notes"
              rows={5}
              maxLength={4000}
              className={`textarea${notesErr ? ' is-invalid' : ''}`}
              value={notes}
              onChange={(ev) => setNotes(ev.target.value)}
              aria-invalid={!!notesErr || undefined}
              aria-describedby={notesErr ? 'enq-notes-err' : undefined}
            />
            {notesErr && (
              <p id="enq-notes-err" className="field-error">
                {notesErr}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              <button type="submit" className="btn btn-outline btn-sm" disabled={saving || notes === e.staffNotes}>
                Save notes
              </button>
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onDelete(e)}>
                Delete enquiry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminEnquiries() {
  const content = useContent();
  const { toast, confirm } = useUi();
  const { refreshStats } = useStaff();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [service, setService] = useState('');
  const dq = useDebounced(q.trim(), 250);
  const filter = qs({ q: dq, status, service });
  const { data, error, loading, reload, setData } = useApi<List>('/admin/enquiries' + filter);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data?.items.find((x) => x.id === openId) || null;

  const replace = (x: Enquiry) => setData((d) => (d ? { ...d, items: d.items.map((i) => (i.id === x.id ? x : i)) } : d));

  const quickStatus = async (e: Enquiry, s: EnquiryStatus) => {
    replace({ ...e, status: s });
    try {
      replace(await api<Enquiry>(`/admin/enquiries/${e.id}`, { method: 'PATCH', json: { status: s } }));
      refreshStats();
      toast(`${e.id} marked ${ENQUIRY_STATUS[s].label.toLowerCase()}.`);
      reload(); // refresh the per-status counts (and the list, if filtered)
    } catch (x) {
      replace(e);
      toast((x as Error).message, 'error');
    }
  };

  const remove = async (e: Enquiry) => {
    const ok = await confirm({
      title: `Delete the enquiry from ${e.name}?`,
      body: 'The enquiry and its notes will be permanently deleted. This cannot be undone. Export to CSV first if you need a record.',
      label: 'Delete enquiry',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/admin/enquiries/${e.id}`, { method: 'DELETE' });
      setOpenId(null);
      toast(`Enquiry ${e.id} deleted.`);
      reload();
      refreshStats();
    } catch (x) {
      toast((x as Error).message, 'error');
    }
  };

  const rows = data?.items || [];
  const filtered = !!(dq || status || service);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Enquiries</h1>
          {data && (
            <p className="tnum" style={{ marginTop: 6, font: '500 14px var(--sans)', color: 'var(--muted)' }}>
              {data.total} total · {data.new} new
            </p>
          )}
        </div>
        <a href={'/api/admin/enquiries/export.csv' + filter} className="btn btn-outline btn-sm" download>
          Export CSV{filtered ? ' (filtered)' : ''}
        </a>
      </div>

      {data && (
        <dl className="stat-grid">
          {STATUSES.map((s) => (
            <div key={s.value}>
              <dt>{s.label}</dt>
              <dd>{data.byStatus[s.value] ?? 0}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="toolbar">
        <label style={{ flex: '1 1 260px' }}>
          Search
          <input type="search" className="input input-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, company, ref or text" />
        </label>
        <label style={{ flex: '0 1 180px' }}>
          Status
          <select className="select select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flex: '0 1 240px' }}>
          Service
          <select className="select select-sm" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">All services</option>
            {(content?.services || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="unsure">Not sure yet</option>
            <option value="none">Not specified</option>
          </select>
        </label>
      </div>

      <div className="table-wrap" aria-busy={loading}>
        {error ? (
          <div role="alert" className="table-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p>We couldn&apos;t load enquiries. {error.message}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={reload}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <table className="data-table top" style={{ minWidth: 960 }}>
              <thead>
                <tr>
                  <th scope="col">Received</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Service</th>
                  <th scope="col">Project</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && !data
                  ? [0, 1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={6}>
                          <div className="skel" style={{ height: 40 }} />
                        </td>
                      </tr>
                    ))
                  : rows.map((e) => (
                      <tr key={e.id} style={{ background: e.status === 'new' ? '#FBFCFF' : undefined }}>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                          {receivedAt(e.createdAt)}
                          <br />
                          <span style={{ font: '500 12px var(--mono)', color: 'var(--muted-2)' }}>{e.id}</span>
                        </td>
                        <td style={{ minWidth: 200 }}>
                          <p style={{ fontWeight: 600, color: 'var(--ink)' }}>
                            {e.status === 'new' && <span className="dot" style={{ background: 'var(--blue)', marginRight: 6 }} aria-label="New" />}
                            {e.name}
                          </p>
                          <a href={`mailto:${e.email}`} style={{ wordBreak: 'break-word' }}>
                            {e.email}
                          </a>
                          {e.company && <p style={{ font: '400 13px var(--sans)', color: 'var(--muted-2)' }}>{e.company}</p>}
                        </td>
                        <td style={{ minWidth: 150 }}>
                          {e.serviceName || '—'}
                          {(e.timeline || e.budget) && <p style={{ font: '400 13px/1.4 var(--sans)', color: 'var(--muted-2)', marginTop: 2 }}>{[e.timeline, e.budget].filter(Boolean).join(' · ')}</p>}
                        </td>
                        <td style={{ maxWidth: 340, color: 'var(--body)' }}>
                          <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.description}</p>
                          {e.staffNotes && <p style={{ marginTop: 6, font: '400 12px/1.4 var(--sans)', color: 'var(--violet-dark)' }}>✎ {e.staffNotes.slice(0, 80)}{e.staffNotes.length > 80 ? '…' : ''}</p>}
                        </td>
                        <td>
                          <select className="lead-status" data-status={e.status} value={e.status} aria-label={`Status for ${e.id}`} onChange={(ev) => quickStatus(e, ev.target.value as EnquiryStatus)}>
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="btn btn-quiet btn-xs" onClick={() => setOpenId(e.id)} aria-label={`Open enquiry ${e.id} from ${e.name}`}>
                              Open
                            </button>
                            <button type="button" className="btn btn-danger-outline btn-xs" onClick={() => remove(e)} aria-label={`Delete enquiry ${e.id}`}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {data && rows.length === 0 && (
              <div className="table-empty">
                {filtered ? (
                  <p>No enquiries match these filters.</p>
                ) : (
                  <p>
                    No enquiries yet. Submissions from the{' '}
                    <a href="/contact" target="_blank" rel="noopener noreferrer">
                      contact page
                    </a>{' '}
                    will appear here.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {open && <EnquiryPanel e={open} onClose={() => setOpenId(null)} onChange={(x) => {
            replace(x);
            reload();
          }} onDelete={remove} />}
    </>
  );
}

export { StatusBadge };
