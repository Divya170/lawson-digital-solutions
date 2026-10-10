import { getSite } from '@/lib/server-api';

export const metadata = { title: 'Privacy Policy' };

export default async function PrivacyPage() {
  const site = await getSite();
  const email = site?.email || 'us';
  const h2 = { margin: '0 0 8px', font: '600 22px/1.3 var(--display)', color: 'var(--ink)' } as const;
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(56px,8vw,96px) var(--gutter) clamp(64px,8vw,112px)' }}>
      <p className="mono-label" style={{ marginBottom: 24, letterSpacing: '.12em' }}>
        Legal
      </p>
      <h1 style={{ font: '600 clamp(36px,4.6vw,56px)/1.02 var(--display)', letterSpacing: '-.035em' }}>Privacy Policy</h1>
      {site?.updatedAt && (
        <p className="mono-label" style={{ marginTop: 16, fontSize: 11 }}>
          Contact details last updated {new Date(site.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      )}
      <div style={{ marginTop: 40, display: 'grid', gap: 28, font: '400 17px/1.7 var(--sans)', color: 'var(--body)' }}>
        <div>
          <h2 style={h2}>What we collect</h2>
          <p>
            When you submit the project enquiry form, we collect the details you enter: your name, email address, and project description, plus any optional details you
            choose to share (company, service of interest, timeline, budget range, and a website URL).
          </p>
        </div>
        <div>
          <h2 style={h2}>How it is used</h2>
          <p>Enquiry details are used to understand your request and respond to you. They are not sold or shared for marketing.</p>
        </div>
        <div>
          <h2 style={h2}>How it is stored</h2>
          <p>Enquiries are stored securely on our systems and are only accessible to the people who respond to them.</p>
        </div>
        <div>
          <h2 style={h2}>Your choices</h2>
          <p>
            To ask what we hold about you, or to have it deleted, email {site ? <a href={site.mailto}>{email}</a> : email}.
          </p>
        </div>
      </div>
    </div>
  );
}
