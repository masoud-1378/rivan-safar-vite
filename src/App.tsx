import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Destinations from './components/Destinations';
import TravelNeeds from './components/TravelNeeds';
import SummerTours from './components/SummerTours';
import OriginCities from './components/OriginCities';
import ExhibitionTours from './components/ExhibitionTours';
import TravelGuide from './components/TravelGuide';
import ToursPage from './components/ToursPage';
import HubPage from './components/HubPage';
import DestinationsCatalogPage from './components/DestinationsCatalogPage';
import CountryPage from './components/CountryPage';
import DestinationDetailPage from './components/DestinationDetailPage';
import TourDetailPage from './components/TourDetailPage';
import ExhibitionsHubPage from './components/ExhibitionsHubPage';
import ExhibitionDetailPage from './components/ExhibitionDetailPage';
import GuidesHubPage from './components/GuidesHubPage';
import GuideDetailPage from './components/GuideDetailPage';
import VisaGuidePage from './components/VisaGuidePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LicensesPage from './components/LicensesPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';
import { resolveRoute, RouteMatch } from './data/siteRegistry';

export default function App() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        return hash.replace('#', '');
      } else if (hash === '#tours') {
        return '/tours';
      }
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Handle URL hash and popstate changes
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        setCurrentPath(hash.replace('#', ''));
      } else if (hash === '#tours') {
        setCurrentPath('/tours');
      } else if (hash === '' || hash === '#') {
        setCurrentPath(window.location.pathname || '/');
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    // Normalise path
    let target = path;
    if (target.startsWith('#/')) {
      target = target.replace('#', '');
    } else if (target.startsWith('#')) {
      if (target === '#tours') target = '/tours';
      else target = '/' + target.replace(/^#/, '');
    }

    setCurrentPath(target);
    
    // Update browser URL history safely
    try {
      window.history.pushState({}, '', target);
    } catch {
      window.location.hash = target;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const route: RouteMatch = resolveRoute(currentPath);

  // Update document title dynamically
  useEffect(() => {
    if (route?.title) {
      document.title = route.title;
    }
  }, [route]);

  const renderCurrentView = () => {
    switch (route.type) {
      case 'home':
        return (
          <>
            <Hero showAnnouncement={showAnnouncement} onNavigate={navigateTo} />
            <TrustBar />
            <Destinations onNavigate={navigateTo} />
            <TravelNeeds onNavigate={navigateTo} />
            <SummerTours onNavigate={navigateTo} />
            <OriginCities onNavigate={navigateTo} />
            <ExhibitionTours onNavigate={navigateTo} />
            <TravelGuide onNavigate={navigateTo} />
          </>
        );

      case 'tours_all':
        return <ToursPage onGoHome={() => navigateTo('/')} />;

      case 'tours_foreign':
        return <HubPage type="foreign" onNavigate={navigateTo} />;

      case 'tours_domestic':
        return <HubPage type="domestic" onNavigate={navigateTo} />;

      case 'destinations_catalog':
        return <DestinationsCatalogPage onNavigate={navigateTo} />;

      case 'country':
        return <CountryPage countrySlug={route.params.countrySlug} onNavigate={navigateTo} />;

      case 'destination_city':
        return (
          <DestinationDetailPage 
            countrySlug={route.params.countrySlug} 
            placeSlug={route.params.placeSlug} 
            onNavigate={navigateTo} 
          />
        );

      case 'tour_detail':
        return <TourDetailPage tourSlug={route.params.tourSlug} onNavigate={navigateTo} />;

      case 'exhibitions_hub':
        return <ExhibitionsHubPage onNavigate={navigateTo} />;

      case 'exhibition_detail':
        return (
          <ExhibitionDetailPage 
            eventSeriesSlug={route.params.eventSeriesSlug} 
            editionSlug={route.params.editionSlug} 
            onNavigate={navigateTo} 
          />
        );

      case 'guides_hub':
        return <GuidesHubPage onNavigate={navigateTo} />;

      case 'guide_detail':
        return <GuideDetailPage guideSlug={route.params.guideSlug} onNavigate={navigateTo} />;

      case 'visa_country':
        return <VisaGuidePage countrySlug={route.params.countrySlug} onNavigate={navigateTo} />;

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
  };

  const isHomePage = route.type === 'home';

  return (
    <div className="min-h-screen bg-page-background text-text-primary font-sans flex flex-col justify-between selection:bg-brand-orange selection:text-white">
      <Navbar 
        showAnnouncement={showAnnouncement} 
        setShowAnnouncement={setShowAnnouncement}
        onNavigate={navigateTo}
        currentPath={currentPath}
      />
      
      <main 
        className={`flex-1 pb-32 lg:pb-0 transition-[padding-top] duration-300 ${
          isHomePage 
            ? 'pt-0' 
            : showAnnouncement 
              ? 'pt-[118px] md:pt-[124px]' 
              : 'pt-[80px] md:pt-[90px]'
        }`}
      >
        {renderCurrentView()}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
