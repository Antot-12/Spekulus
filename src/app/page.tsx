
'use client';

import { useState, useEffect, useCallback } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { DevNotesSection } from '@/components/landing/DevNotesSection';
import { CreatorsSection } from '@/components/landing/CreatorsSection';
import { AdvantagesSection } from '@/components/landing/AdvantagesSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { ActionSection } from '@/components/landing/ActionSection';
import { WhySpekulusSection } from '@/components/landing/WhySpekulusSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { CooperationSection } from '@/components/landing/CooperationSection';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getHeroData,
  getProductData,
  getAdvantagesData,
  getActionSectionData,
  getRoadmapEvents,
  getFaqs,
  getScenarios,
  getComparisonSectionData,
  getCompetitorFeatures,
  getNewsletterSectionData,
  getCompetitors,
  getCooperationSectionData,
} from '@/lib/db/actions';
import { initialData } from '@/lib/data';
import type { HeroSectionData, ProductSectionData, Advantage, ActionSectionData, RoadmapEvent, FaqItem, Scenario, ComparisonSectionData, CompetitorFeature, NewsletterSectionData, Competitor, CooperationSectionData } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-12 space-y-24">
        <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="space-y-8">
             <Skeleton className="h-12 w-1/2 mx-auto" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
             </div>
        </div>
    </div>
);


export default function Home() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
  const [productData, setProductData] = useState<ProductSectionData | null>(null);
  const [advantagesData, setAdvantagesData] = useState<Advantage[] | null>(null);
  const [actionSectionData, setActionSectionData] = useState<ActionSectionData | null>(null);
  const [roadmapEvents, setRoadmapEvents] = useState<RoadmapEvent[] | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [comparisonSectionData, setComparisonSectionData] = useState<ComparisonSectionData | null>(null);
  const [competitorFeatures, setCompetitorFeatures] = useState<CompetitorFeature[] | null>(null);
  const [newsletterSectionData, setNewsletterSectionData] = useState<NewsletterSectionData | null>(null);
  const [cooperationSectionData, setCooperationSectionData] = useState<CooperationSectionData | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const lang = language;

    let [
      heroData,
      productData,
      advantagesData,
      actionSectionData,
      roadmapEvents,
      faqs,
      scenarios,
      comparisonSectionData,
      competitorFeatures,
      newsletterSectionData,
      cooperationSectionData,
      competitors,
    ] = await Promise.all([
      getHeroData(lang),
      getProductData(lang),
      getAdvantagesData(lang),
      getActionSectionData(lang),
      getRoadmapEvents(lang),
      getFaqs(lang),
      getScenarios(lang),
      getComparisonSectionData(lang),
      getCompetitorFeatures(lang),
      getNewsletterSectionData(lang),
      getCooperationSectionData(lang),
      getCompetitors(),
    ]);
    
    setHeroData(heroData || {
      ...initialData.heroSectionData[lang],
      id: 0,
      imageId: null,
      features: initialData.heroFeaturesData[lang].map((f, i) => ({...f, id: i}))
    });

    setProductData(productData && productData.components.length > 0 ? productData : {
        ...initialData.productSectionData[lang],
        components: initialData.productSectionData[lang].components.map(c => ({...c, imageId: null})),
    });

    setAdvantagesData(advantagesData && advantagesData.length > 0 ? advantagesData : initialData.advantagesData[lang]);
    setActionSectionData(actionSectionData || initialData.actionSectionData[lang]);
    setRoadmapEvents(roadmapEvents && roadmapEvents.length > 0 ? roadmapEvents : initialData.roadmapEvents[lang]);
    setFaqs(faqs && faqs.length > 0 ? faqs : initialData.faqData[lang].map((faq, index) => ({ ...faq, id: index + 1 })));
    setScenarios(scenarios && scenarios.length > 0 ? scenarios : initialData.scenariosData[lang]);
    setComparisonSectionData(comparisonSectionData || initialData.comparisonSectionData[lang]);
    setCompetitorFeatures(competitorFeatures && competitorFeatures.length > 0 ? competitorFeatures : initialData.competitorFeaturesData[lang]);
    setCompetitors(competitors && competitors.length > 0 ? competitors : initialData.competitorsData);
    setNewsletterSectionData(newsletterSectionData || initialData.newsletterSectionData[lang]);
    setCooperationSectionData(cooperationSectionData || initialData.cooperationSectionData[lang]);

    setIsLoading(false);
  }, [language]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <HeroSection data={heroData} lang={language} />
      {productData && <ProductSection data={productData} lang={language} />}
      {advantagesData && <AdvantagesSection data={advantagesData} lang={language} />}
      <ActionSection data={actionSectionData} />
      {scenarios && <WhySpekulusSection data={scenarios} lang={language} />}
      {comparisonSectionData && competitorFeatures && competitors && (
        <ComparisonSection sectionData={comparisonSectionData} featuresData={competitorFeatures} competitors={competitors} lang={language} />
      )}
      {cooperationSectionData && <CooperationSection data={cooperationSectionData} />}
      {roadmapEvents && <RoadmapSection data={roadmapEvents} lang={language} />}
      {newsletterSectionData && <NewsletterSection data={newsletterSectionData} />}
      <FaqSection faqs={faqs} />
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
