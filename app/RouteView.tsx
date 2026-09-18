'use client';

import { useRouter } from 'next/navigation';
import Hero from '@/src/components/Hero';
import TrustBar from '@/src/components/TrustBar';
import Destinations from '@/src/components/Destinations';
import TravelNeeds from '@/src/components/TravelNeeds';
import SummerTours from '@/src/components/SummerTours';
import OriginCities from '@/src/components/OriginCities';
import ExhibitionTours from '@/src/components/ExhibitionTours';
import TravelGuide from '@/src/components/TravelGuide';
import ToursPage from '@/src/components/ToursPage';
import HubPage from '@/src/components/HubPage';
import DestinationsCatalogPage from '@/src/components/DestinationsCatalogPage';
import CountryPage from '@/src/components/CountryPage';
import DestinationDetailPage from '@/src/components/DestinationDetailPage';
import TourDetailPage from '@/src/components/TourDetailPage';
import ExhibitionsHubPage from '@/src/components/ExhibitionsHubPage';
import ExhibitionDetailPage from '@/src/components/ExhibitionDetailPage';
import GuidesHubPage from '@/src/components/GuidesHubPage';
import GuideDetailPage from '@/src/components/GuideDetailPage';
import VisaGuidePage from '@/src/components/VisaGuidePage';
import AboutPage from '@/src/components/AboutPage';
import ContactPage from '@/src/components/ContactPage';
import LicensesPage from '@/src/components/LicensesPage';
import TermsPage from '@/src/components/TermsPage';
import PrivacyPage from '@/src/components/PrivacyPage';
import NotFoundPage from '@/src/components/NotFoundPage';
import type { PageType } from '@/src/data/siteRegistry';

export interface RouteViewProps {
  type: PageType;
  params: Record<string, string>;
}

/** بدنه هر صفحه — جایگزین renderCurrentView در App قبلی؛ ناوبری با Next router */
export default function RouteView({ type, params }: RouteViewProps) {
  const router = useRouter();
  const navigateTo = (path: string) => {
    router.push(path);
  };
  const goHome = () => router.push('/');

  switch (type) {
    case 'home':
      return (
        <>
          <Hero onNavigate={navigateTo} />
          <TrustBar />
          <Destinations onNavigate={navigateTo} />
          <TravelNeeds />
          <SummerTours onNavigate={navigateTo} />
          <OriginCities />
          <ExhibitionTours onNavigate={navigateTo} />
          <TravelGuide />
        </>
      );
    case 'tours_all':
      return <ToursPage onGoHome={goHome} />;
    case 'tours_foreign':
      return <HubPage type="foreign" onNavigate={navigateTo} />;
    case 'tours_domestic':
      return <HubPage type="domestic" onNavigate={navigateTo} />;
    case 'destinations_catalog':
      return <DestinationsCatalogPage onNavigate={navigateTo} />;
    case 'country':
      return (
        <CountryPage countrySlug={params.countrySlug} onNavigate={navigateTo} />
      );
    case 'destination_city':
      return (
        <DestinationDetailPage
          countrySlug={params.countrySlug}
          placeSlug={params.placeSlug}
          onNavigate={navigateTo}
        />
      );
    case 'tour_detail':
      return (
        <TourDetailPage tourSlug={params.tourSlug} onNavigate={navigateTo} />
      );
    case 'exhibitions_hub':
      return <ExhibitionsHubPage onNavigate={navigateTo} />;
    case 'exhibition_detail':
      return (
        <ExhibitionDetailPage
          eventSeriesSlug={params.eventSeriesSlug}
          editionSlug={params.editionSlug}
          onNavigate={navigateTo}
        />
      );
    case 'guides_hub':
      return <GuidesHubPage onNavigate={navigateTo} />;
    case 'guide_detail':
      return (
        <GuideDetailPage guideSlug={params.guideSlug} onNavigate={navigateTo} />
      );
    case 'visa_country':
      return (
        <VisaGuidePage countrySlug={params.countrySlug} onNavigate={navigateTo} />
      );
    case 'about':
      return <AboutPage onNavigate={navigateTo} />;
    case 'contact':
      return <ContactPage onNavigate={navigateTo} />;
    case 'licenses':
      return <LicensesPage onNavigate={navigateTo} />;
    case 'terms':
      return <TermsPage onNavigate={navigateTo} />;
    case 'privacy':
      return <PrivacyPage onNavigate={navigateTo} />;
    case 'not_found':
    default:
      return <NotFoundPage onNavigate={navigateTo} />;
  }
}
