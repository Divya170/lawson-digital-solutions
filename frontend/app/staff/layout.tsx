import type { Metadata } from 'next';

/** Staff area: its own route tree, no public header/footer, and kept out of search engines. */
export const metadata: Metadata = {
  title: { default: 'Staff', template: '%s · Staff · Lawson Digital Solutions' },
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
