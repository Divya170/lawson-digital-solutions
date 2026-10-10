'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

/** Fetch JSON from the API with loading / error state and a reload function. Pass null to skip. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch((e: ApiError) => {
        if (!alive) return;
        setError(e);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

export function useMediaQuery(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

export function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* -------------------------------------------------------------------------- */
/* Modal dialogs: focus trap, Escape to close, scroll lock, focus restore.    */
/* -------------------------------------------------------------------------- */

const stack: symbol[] = [];
let locks = 0;

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';

export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, opts: { lockScroll?: boolean } = {}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const lockScroll = opts.lockScroll !== false;

  useEffect(() => {
    if (!open) return;
    const id = Symbol('dialog');
    stack.push(id);
    const previous = document.activeElement as HTMLElement | null;
    if (lockScroll) {
      locks++;
      document.body.style.overflow = 'hidden';
    }
    const t = setTimeout(() => {
      const root = ref.current;
      const el = root?.querySelector<HTMLElement>('[data-autofocus]') || root?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = ref.current;
      if (!root) return;
      const f = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!root.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (lockScroll) {
        locks = Math.max(0, locks - 1);
        if (!locks) document.body.style.overflow = '';
      }
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [open, ref, lockScroll]);
}

/** Current time in an IANA time zone, refreshed every 30 seconds. Empty until mounted (avoids hydration mismatch). */
export function useClock(timezone: string) {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () => {
      try {
        setNow(new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }));
      } catch {
        setNow('');
      }
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [timezone]);
  return now;
}
