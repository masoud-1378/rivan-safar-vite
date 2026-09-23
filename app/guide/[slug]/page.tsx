import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { getLiveContent, getGuides } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';
import type { GuideItem } from '@/src/data/guidesData';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const guidesData = await getGuides();
    return Object.keys(guidesData).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => metadataFor(`/guide/${slug}`));
}

function faqJsonLd(guide?: GuideItem | null) {
  if (!guide || guide.faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [content, contact] = await Promise.all([getLiveContent(), getContactInfo()]);
  const guide = content.guides[slug];
  if (!guide) notFound();
  const seo = resolveSeo(`/guide/${slug}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={faqJsonLd(guide)} />
      <RouteView type="guide_detail" params={{ guideSlug: slug }} data={content} contact={contact} />
    </>
  );
}
