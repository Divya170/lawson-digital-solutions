'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminStats, StaffUser } from '@/lib/types';

interface StaffCtx {
  user: StaffUser | null;
  stats: AdminStats | null;
  refreshStats: () => void;
}
const Ctx = createContext<StaffCtx>({ user: null, stats: null, refreshStats: () => {} });
export const useStaff = () => useContext(Ctx);

export function StaffShell({ children }: { children: ReactNode }) {
  const path = usePathname() || '';
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const refreshStats = useCallback(() => {
    api<AdminStats>('/admin/stats').then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    // A 401 here is handled by the API client (redirect to sign-in).
    api<StaffUser>('/auth/me').then(setUser).catch(() => {});
    refreshStats();
  }, [refreshStats]);

  const signOut = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/staff/login');
    router.refresh();
  };

  const nav = [
    { label: 'Enquiries', href: '/staff/enquiries', count: stats ? String(stats.enquiries.total) : '', fresh: stats?.enquiries.new || 0 },
    { label: 'Case studies', href: '/staff/case-studies', count: stats ? `${stats.caseStudies.published}/${stats.caseStudies.total}` : '' },
    { label: 'Services', href: '/staff/services', count: '' },
    { label: 'Settings', href: '/staff/settings', count: '' },
  ];

  return (
    <Ctx.Provider value={{ user, stats, refreshStats }}>
      <a href="#staff-main" className="skip-link">
        Skip to main content
      </a>
      <div className="staff-shell">
        <aside className="staff-side">
          <Link href="/staff/enquiries" className="staff-brand">
            <span className="w1">Lawson</span>
            <span className="w2">STAFF PORTAL</span>
          </Link>
          <nav aria-label="Staff" className="staff-nav">
            <ul>
              {nav.map((n) => {
                const current = path === n.href || path.startsWith(n.href + '/');
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={current ? 'page' : undefined}>
                      {n.label}
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {!!n.fresh && (
                          <span className="badge-new" aria-label={`${n.fresh} new`}>
                            {n.fresh} new
                          </span>
                        )}
                        {n.count && <span className="count" title={n.label === 'Case studies' ? 'published / total' : undefined}>{n.count}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {user && (
            <p className="staff-user">
              Signed in as<strong>{user.name || user.email}</strong>
              {user.email}
            </p>
          )}
          <div className="staff-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">
              View public site ↗
            </a>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </aside>
        <main id="staff-main" tabIndex={-1} className="staff-main main">
          {children}
        </main>
      </div>
    </Ctx.Provider>
  );
}
