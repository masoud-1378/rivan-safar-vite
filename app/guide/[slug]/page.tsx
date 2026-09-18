import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { GUIDES } from '@/src/data/guidesData';

export function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => metadataFor(`/guide/${slug}`));
}

function faqJsonLd(slug: string) {
  const guide = GUIDES[slug];
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
  if (!GUIDES[slug]) notFound();
  const seo = resolveSeo(`/guide/${slug}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={faqJsonLd(slug)} />
      <RouteView type="guide_detail" params={{ guideSlug: slug }} />
    </>
  );
}
