import Link from 'next/link';
import { PublicShell } from '@/components/public/PublicShell';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <PublicShell>
      <div className="lstate">
        <p className="mono-label" style={{ marginBottom: 20, letterSpacing: '.12em' }}>
          404
        </p>
        <h1 style={{ font: '600 clamp(40px,5.6vw,72px)/1 var(--display)', letterSpacing: '-.04em' }}>This page doesn’t exist.</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 36 }}>
          <Link href="/" className="lbtn lbtn-primary deep">
            Go to home
          </Link>
          <Link href="/contact" className="lbtn lbtn-line">
            Contact us
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
