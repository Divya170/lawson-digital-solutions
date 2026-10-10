import { ServiceForm } from '@/components/staff/AdminServices';

export const metadata = { title: 'Edit service' };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceForm key={id} id={id} />;
}
