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
import { initialData, Language } from '@/lib/data';
import { cookies } from 'next/headers';

// Server Component - data fetched on server, HTML rendered immediately
export default async function Home() {
  // Get language from cookie (default to 'en')
  const cookieStore = await cookies();
  const lang = (cookieStore.get('language')?.value || 'en') as Language;

  // Fetch all data in parallel on the server
  const [
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

  // Apply fallbacks
  const hero = heroData || {
    ...initialData.heroSectionData[lang],
    id: 0,
    imageId: null,
    features: initialData.heroFeaturesData[lang].map((f, i) => ({ ...f, id: i }))
  };

  const product = productData && productData.components.length > 0 ? productData : {
    ...initialData.productSectionData[lang],
    components: initialData.productSectionData[lang].components.map(c => ({ ...c, imageId: null })),
  };

  const advantages = advantagesData && advantagesData.length > 0 ? advantagesData : initialData.advantagesData[lang];
  const action = actionSectionData || initialData.actionSectionData[lang];
  const roadmap = roadmapEvents && roadmapEvents.length > 0 ? roadmapEvents : initialData.roadmapEvents[lang];
  const faqItems = faqs && faqs.length > 0 ? faqs : initialData.faqData[lang].map((faq, index) => ({ ...faq, id: index + 1 }));
  const scenarioItems = scenarios && scenarios.length > 0 ? scenarios : initialData.scenariosData[lang];
  const comparison = comparisonSectionData || initialData.comparisonSectionData[lang];
  const features = competitorFeatures && competitorFeatures.length > 0 ? competitorFeatures : initialData.competitorFeaturesData[lang];
  const competitorList = competitors && competitors.length > 0 ? competitors : initialData.competitorsData;
  const newsletter = newsletterSectionData || initialData.newsletterSectionData[lang];
  const cooperation = cooperationSectionData || initialData.cooperationSectionData[lang];

  return (
    <>
      {/* Critical above-the-fold sections - rendered immediately with SSR */}
      <HeroSection data={hero} lang={lang} />
      <ProductSection data={product} lang={lang} />

      {/* Rest of the page */}
      <AdvantagesSection data={advantages} lang={lang} />
      <ActionSection data={action} />
      <WhySpekulusSection data={scenarioItems} lang={lang} />
      <ComparisonSection sectionData={comparison} featuresData={features} competitors={competitorList} lang={lang} />
      <CooperationSection data={cooperation} />
      <RoadmapSection data={roadmap} lang={lang} />
      <NewsletterSection data={newsletter} />
      <FaqSection faqs={faqItems} />
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
