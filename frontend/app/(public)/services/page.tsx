import { Suspense } from 'react';
import { ServicesView } from '@/components/public/ServicesView';

export const metadata = { title: 'Services' };

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesView />
    </Suspense>
  );
}
