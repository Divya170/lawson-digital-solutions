'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useDialog } from '@/lib/hooks';
import type { Content, Site } from '@/lib/types';

/* ------------- Site details & page content (rendered on the server, refreshable) ------------- */

interface SiteData {
  site: Site | null;
  content: Content | null;
  /** True while a client-side retry is running after the server render couldn't reach the API. */
  loading: boolean;
  failed: boolean;
  reload: () => void;
}
const SiteContext = createContext<SiteData>({ site: null, content: null, loading: false, failed: false, reload: () => {} });
export const useSiteData = () => useContext(SiteContext);

const EMPTY_SITE: Site = {
  businessName: 'Lawson Digital Solutions', contactName: '', email: '', mailto: '#', phone: '', tel: '#', street: '', locality: '',
  locationLabel: 'Austin, TX', timezone: 'America/Chicago', budgetRanges: [], timelines: [], updatedAt: '',
};
/** Always returns an object so layout never breaks; fields are empty if the API was unreachable. */
export const useSite = () => useContext(SiteContext).site || EMPTY_SITE;
export const useContent = () => useContext(SiteContext).content;

/* ---------------------------------- Toasts & confirm ---------------------------------- */

interface ConfirmOpts {
  title: string;
  body: string;
  label: string;
  danger?: boolean;
}
interface Ui {
  toast: (msg: string, kind?: 'info' | 'error') => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
}
const UiContext = createContext<Ui>({ toast: () => {}, confirm: async () => false });
export const useUi = () => useContext(UiContext);

function ConfirmDialog({ opts, onDone }: { opts: ConfirmOpts; onDone: (ok: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, () => onDone(false));
  return (
    <div className="overlay">
      <div className="backdrop" aria-hidden="true" onClick={() => onDone(false)} />
      <div ref={ref} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="cf-h" aria-describedby="cf-b">
        <h2 id="cf-h">{opts.title}</h2>
        <p id="cf-b">{opts.body}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-quiet btn-sm" data-autofocus onClick={() => onDone(false)}>
            Cancel
          </button>
          <button type="button" className={`btn btn-sm ${opts.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => onDone(true)}>
            {opts.label}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppProviders({ site: initialSite, content: initialContent, children }: { site: Site | null; content: Content | null; children: ReactNode }) {
  const [site, setSite] = useState(initialSite);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(!initialSite || !initialContent);
  const [toast, setToast] = useState<{ msg: string; kind: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{ opts: ConfirmOpts; resolve: (b: boolean) => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Server props change after router.refresh() (e.g. staff saved settings).
  useEffect(() => {
    if (initialSite) setSite(initialSite);
    if (initialContent) setContent(initialContent);
  }, [initialSite, initialContent]);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([api<Site>('/site'), api<Content>('/content')])
      .then(([s, c]) => {
        setSite(s);
        setContent(c);
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  // If the server render couldn't reach the API, try again from the browser.
  useEffect(() => {
    if (!initialSite || !initialContent) reload();
  }, [initialSite, initialContent, reload]);

  const showToast = useCallback((msg: string, kind: 'info' | 'error' = 'info') => {
    clearTimeout(timer.current);
    setToast({ msg, kind });
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);
  const confirm = useCallback((opts: ConfirmOpts) => new Promise<boolean>((resolve) => setConfirmState({ opts, resolve })), []);

  return (
    <SiteContext.Provider value={{ site, content, loading, failed: failed && !content, reload }}>
      <UiContext.Provider value={{ toast: showToast, confirm }}>
        {children}
        {confirmState && (
          <ConfirmDialog
            opts={confirmState.opts}
            onDone={(ok) => {
              confirmState.resolve(ok);
              setConfirmState(null);
            }}
          />
        )}
        <div className="toast-region" role="status" aria-live="polite">
          {toast && <p className={`toast ${toast.kind === 'error' ? 'error' : ''}`}>{toast.msg}</p>}
        </div>
      </UiContext.Provider>
    </SiteContext.Provider>
  );
}
