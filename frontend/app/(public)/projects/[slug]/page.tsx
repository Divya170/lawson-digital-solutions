import type { Metadata } from 'next';
import { CaseStudyView } from '@/components/public/ProjectsView';
import { serverGet } from '@/lib/server-api';
import type { CaseStudy } from '@/lib/types';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await serverGet<CaseStudy>(`/case-studies/${encodeURIComponent(slug)}`);
  if (!c) return { title: 'Case study not available' };
  return { title: c.title, description: c.summary || undefined, openGraph: c.coverImage ? { images: [c.coverImage] } : undefined };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  return <CaseStudyView slug={slug} />;
}
