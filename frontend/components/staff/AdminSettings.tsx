'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteData, useUi } from '@/components/ui/AppProviders';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import type { Site } from '@/lib/types';

type SettingsDraft = Record<'businessName' | 'contactName' | 'email' | 'phone' | 'street' | 'locality' | 'locationLabel' | 'timezone' | 'budgetRanges' | 'timelines', string>;

const SETTINGS_FIELDS: { k: keyof SettingsDraft; label: string; type?: string; auto?: string; rows?: number; hint?: string }[] = [
  { k: 'businessName', label: 'Business name', auto: 'organization' },
  { k: 'contactName', label: 'Contact person', auto: 'name' },
  { k: 'email', label: 'Public email', type: 'email', auto: 'email', hint: 'Shown on the site and used for “Send by email instead”.' },
  { k: 'phone', label: 'Phone', type: 'tel', auto: 'tel' },
  { k: 'street', label: 'Street address', auto: 'address-line1' },
  { k: 'locality', label: 'City, state, ZIP and country', auto: 'address-level2' },
  { k: 'locationLabel', label: 'Location label', hint: 'Short label next to the live clock, e.g. Austin, TX.' },
  { k: 'timezone', label: 'Time zone', hint: 'IANA name for the live clock, e.g. America/Chicago.' },
  { k: 'budgetRanges', label: 'Budget ranges (one per line)', rows: 4, hint: '“Not sure yet” and “Prefer not to say” are always added.' },
  { k: 'timelines', label: 'Timeline options (one per line)', rows: 5 },
];

function SiteSettingsForm() {
  const { reload: reloadSite } = useSiteData();
  const router = useRouter();
  const { toast } = useUi();
  const { data, error, loading, reload } = useApi<Site>('/admin/settings');
  const [d, setD] = useState<SettingsDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data)
      setD({
        businessName: data.businessName, contactName: data.contactName, email: data.email, phone: data.phone, street: data.street, locality: data.locality,
        locationLabel: data.locationLabel, timezone: data.timezone, budgetRanges: data.budgetRanges.join('\n'), timelines: data.timelines.join('\n'),
      });
  }, [data]);
  useEffect(() => {
    if (saved) successRef.current?.focus();
  }, [saved]);

  if (loading && !d) return <div className="skel" style={{ height: 520, borderRadius: 8 }} aria-busy="true" />;
  if (error)
    return (
      <div role="alert" className="state-card">
        <h2>Couldn&apos;t load settings</h2>
        <p>{error.message}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          Try again
        </button>
      </div>
    );
  if (!d) return null;

  if (saved)
    return (
      <div ref={successRef} className="success-card" role="status" tabIndex={-1}>
        <p className="kicker">Settings saved</p>
        <h3>Site details updated.</h3>
        <p className="body">The header, footer, contact page and enquiry form now use the new details.</p>
        <div className="actions">
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            View the contact page ↗
          </a>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSaved(false)}>
            Edit again
          </button>
        </div>
      </div>
    );

  const set = (k: keyof SettingsDraft, v: string) => {
    setD((s) => (s ? { ...s, [k]: v } : s));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api<Site>('/admin/settings', { method: 'PUT', json: d });
      reloadSite();
      router.refresh();
      setSaved(true);
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) {
        setErrors(ex.errors);
        document.getElementById('st-' + Object.keys(ex.errors)[0])?.focus();
      } else toast(ex.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="edit-form">
      <h2 className="panel-title">Business details</h2>
      <p className="hint" style={{ marginTop: -12 }}>
        Used across the public site and in the structured data search engines read.
      </p>
      {SETTINGS_FIELDS.map((f) => (
        <div key={f.k} className="field">
          <label htmlFor={'st-' + f.k} className="label-sm">
            {f.label} <span aria-hidden="true" className="req">*</span>
          </label>
          {f.rows ? (
            <textarea
              id={'st-' + f.k}
              rows={f.rows}
              className={`textarea input-sm${errors[f.k] ? ' is-invalid' : ''}`}
              style={{ minHeight: 0 }}
              value={d[f.k]}
              onChange={(e) => set(f.k, e.target.value)}
              aria-invalid={!!errors[f.k] || undefined}
              aria-describedby={errors[f.k] ? `st-${f.k}-err` : f.hint ? `st-${f.k}-hint` : undefined}
            />
          ) : (
            <input
              id={'st-' + f.k}
              type={f.type || 'text'}
              autoComplete={f.auto}
              className={`input input-sm${errors[f.k] ? ' is-invalid' : ''}`}
              value={d[f.k]}
              onChange={(e) => set(f.k, e.target.value)}
              aria-invalid={!!errors[f.k] || undefined}
              aria-describedby={errors[f.k] ? `st-${f.k}-err` : f.hint ? `st-${f.k}-hint` : undefined}
            />
          )}
          {errors[f.k] ? (
            <p id={`st-${f.k}-err`} className="field-error">
              {errors[f.k]}
            </p>
          ) : (
            f.hint && (
              <p id={`st-${f.k}-hint`} className="hint">
                {f.hint}
              </p>
            )
          )}
        </div>
      ))}
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const blank = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [v, setV] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useUi();

  if (done)
    return (
      <div className="success-card" role="status">
        <p className="kicker">Password updated</p>
        <h3>Use your new password next time you sign in.</h3>
        <div className="actions">
          <a href="/staff/enquiries" className="btn btn-primary btn-sm">
            Back to enquiries
          </a>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setV(blank);
              setDone(false);
            }}
          >
            Change it again
          </button>
        </div>
      </div>
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.currentPassword) err.currentPassword = 'Enter your current password.';
    if (!v.newPassword) err.newPassword = 'Enter a new password.';
    else if (v.newPassword.length < 10) err.newPassword = 'Use at least 10 characters.';
    else if (!/[A-Za-z]/.test(v.newPassword) || !/\d/.test(v.newPassword)) err.newPassword = 'Include at least one letter and one number.';
    if (v.newPassword && v.confirmPassword !== v.newPassword) err.confirmPassword = 'The passwords don’t match.';
    if (Object.keys(err).length) return setErrors(err);
    setBusy(true);
    try {
      await api('/auth/change-password', { method: 'POST', json: v });
      setDone(true);
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) setErrors(ex.errors);
      else toast(ex.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const fields: [keyof typeof blank, string, string][] = [
    ['currentPassword', 'Current password', 'current-password'],
    ['newPassword', 'New password', 'new-password'],
    ['confirmPassword', 'Confirm new password', 'new-password'],
  ];

  return (
    <form noValidate onSubmit={submit} className="edit-form">
      <h2 className="panel-title">Change password</h2>
      <p className="hint" style={{ marginTop: -12 }}>
        At least 10 characters, with a letter and a number.
      </p>
      {fields.map(([k, label, auto]) => (
        <div key={k} className="field">
          <label htmlFor={'pw-' + k} className="label-sm">
            {label}
          </label>
          <input
            id={'pw-' + k}
            type="password"
            autoComplete={auto}
            className={`input input-sm${errors[k] ? ' is-invalid' : ''}`}
            value={v[k]}
            onChange={(e) => {
              setV((s) => ({ ...s, [k]: e.target.value }));
              setErrors((x) => ({ ...x, [k]: '' }));
            }}
            aria-invalid={!!errors[k] || undefined}
            aria-describedby={errors[k] ? `pw-${k}-err` : undefined}
          />
          {errors[k] && (
            <p id={`pw-${k}-err`} className="field-error">
              {errors[k]}
            </p>
          )}
        </div>
      ))}
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

export function AdminSettings() {
  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>
      <div className="settings-grid">
        <SiteSettingsForm />
        <PasswordForm />
      </div>
    </>
  );
}
