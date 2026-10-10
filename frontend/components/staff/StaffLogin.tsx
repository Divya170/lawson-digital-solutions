'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';

/** Only allow redirects back into the staff area. */
const safeNext = (n: string | null) => (n && n.startsWith('/staff/') && !n.startsWith('//') ? n : '/staff/enquiries');

export function StaffLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const expired = params.get('expired') === '1';
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in? Skip the form.
  useEffect(() => {
    api('/auth/me')
      .then(() => router.replace(next))
      .catch(() => setChecking(false));
  }, [router, next]);

  const set = (k: 'email' | 'password', v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
    setFormError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const err: Record<string, string> = {};
    const email = form.email.trim();
    if (!email) err.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) err.email = 'Enter a valid email address.';
    if (!form.password) err.password = 'Enter your password.';
    else if (form.password.length < 8) err.password = 'Passwords are at least 8 characters.';
    if (Object.keys(err).length) {
      setErrors(err);
      document.getElementById(err.email ? 'login-email' : 'login-pw')?.focus();
      return;
    }
    setBusy(true);
    setErrors({});
    setFormError('');
    try {
      await api('/auth/login', { method: 'POST', json: { email, password: form.password } });
      router.replace(next);
      router.refresh();
    } catch (x) {
      const ex = x as ApiError;
      if (Object.keys(ex.errors).length) setErrors(ex.errors);
      else setFormError(ex.message);
      setForm((f) => ({ ...f, password: '' }));
      setBusy(false);
    }
  };

  return (
    <main id="main" className="staff-login">
      <div className="card-login">
        <div className="lbrand" style={{ color: 'var(--ink)' }}>
          <span aria-hidden="true" className="lmark staff-mark" />
          <span className="words">
            <span className="w1">Lawson</span>
            <span className="w2" style={{ color: 'var(--muted-2)' }}>Staff portal</span>
          </span>
        </div>
        <div>
          <h1>Staff sign-in</h1>
          <p style={{ marginTop: 8, font: '400 15px/1.5 var(--sans)', color: 'var(--muted)' }}>Review enquiries, publish case studies and keep site details up to date.</p>
        </div>
        {expired && !formError && (
          <p role="status" className="note-box">
            Your session ended. Please sign in again.
          </p>
        )}
        {formError && (
          <div role="alert" className="alert-error" style={{ padding: '12px 14px' }}>
            <p style={{ font: '500 14px/1.5 var(--sans)' }}>{formError}</p>
          </div>
        )}
        <form noValidate onSubmit={submit} className="form" style={{ gap: 18 }} aria-busy={checking}>
          <div className="field">
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              className={`input${errors.email ? ' is-invalid' : ''}`}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={!!errors.email || undefined}
              aria-describedby={errors.email ? 'login-email-err' : undefined}
            />
            {errors.email && (
              <p id="login-email-err" className="field-error">
                {errors.email}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="login-pw" className="label">
              Password
            </label>
            <input
              id="login-pw"
              type="password"
              autoComplete="current-password"
              className={`input${errors.password ? ' is-invalid' : ''}`}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              aria-invalid={!!errors.password || undefined}
              aria-describedby={errors.password ? 'login-pw-err' : undefined}
            />
            {errors.password && (
              <p id="login-pw-err" className="field-error">
                {errors.password}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 52, fontSize: 16 }} disabled={busy || checking} aria-busy={busy}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link href="/" style={{ font: '500 14px var(--sans)' }}>
          ← Back to the public site
        </Link>
      </div>
    </main>
  );
}
