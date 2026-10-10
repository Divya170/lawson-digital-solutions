/** "01", "02", … */
export const pad = (i: number) => String(i + 1).padStart(2, '0');

export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const receivedAt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/** Local time in the business's time zone, e.g. "2:41 PM". */
export const timeIn = (tz: string) => {
  try {
    return new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const ENQUIRY_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  new: { label: 'New', bg: '#EEF2FD', fg: '#2848B8' },
  in_review: { label: 'In review', bg: '#F3EFFB', fg: '#5B43B0' },
  replied: { label: 'Replied', bg: '#E7F4EE', fg: '#1F6B4C' },
  closed: { label: 'Closed', bg: '#EEEFF2', fg: '#4A4F5C' },
};
