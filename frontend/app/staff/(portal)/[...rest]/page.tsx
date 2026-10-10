import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function StaffNotFound() {
  return (
    <>
      <h1 style={{ font: '700 28px var(--display)', color: 'var(--ink)' }}>Page not found</h1>
      <p className="lead-text">That staff page doesn&apos;t exist.</p>
      <Link href="/staff/enquiries" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
        Go to enquiries
      </Link>
    </>
  );
}
