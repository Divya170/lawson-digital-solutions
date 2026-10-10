import { Suspense } from 'react';
import { ContactView } from '@/components/public/ContactView';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
      <ContactView />
    </Suspense>
  );
}
