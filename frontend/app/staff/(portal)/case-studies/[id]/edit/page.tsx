import { notFound } from 'next/navigation';
import { CaseStudyForm } from '@/components/staff/CaseStudyForm';

export const metadata = { title: 'Edit case study' };

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) notFound();
  return <CaseStudyForm key={n} id={n} />;
}
