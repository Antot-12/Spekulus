
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
import { getLanguage } from '@/lib/getLanguage';
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
} from '@/lib/db/actions';
import { initialData } from '@/lib/data';

export default async function Home() {
  const lang = await getLanguage();

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
  ]);

  if (!heroData) {
    heroData = {
      ...initialData.heroSectionData[lang],
      id: 0,
      imageId: null,
      features: initialData.heroFeaturesData[lang].map((f, i) => ({...f, id: i}))
    };
  }

  if (!productData || !productData.components || productData.components.length === 0) {
    productData = {
        ...initialData.productSectionData[lang],
        components: initialData.productSectionData[lang].components.map(c => ({...c, imageId: null})),
    }
  }

  if (!advantagesData || advantagesData.length === 0) {
    advantagesData = initialData.advantagesData[lang];
  }

  if (!actionSectionData) {
    actionSectionData = initialData.actionSectionData[lang];
  }

  if (!roadmapEvents || roadmapEvents.length === 0) {
    roadmapEvents = initialData.roadmapEvents[lang];
  }

  if (!faqs || faqs.length === 0) {
    faqs = initialData.faqData[lang].map((faq, index) => ({ ...faq, id: index + 1 }));
  }

  if (!scenarios || scenarios.length === 0) {
    scenarios = initialData.scenariosData[lang];
  }
  
  if (!comparisonSectionData) {
    comparisonSectionData = initialData.comparisonSectionData[lang];
  }

  if (!competitorFeatures || competitorFeatures.length === 0) {
    competitorFeatures = initialData.competitorFeaturesData[lang];
  }

  return (
    <>
      <HeroSection data={heroData} lang={lang} />
      <ProductSection data={productData} lang={lang} />
      <AdvantagesSection data={advantagesData} lang={lang} />
      <ActionSection data={actionSectionData} />
      <WhySpekulusSection data={scenarios} lang={lang} />
      <ComparisonSection sectionData={comparisonSectionData} featuresData={competitorFeatures} lang={lang} />
      <RoadmapSection data={roadmapEvents} lang={lang} />
      <CooperationSection />
      <NewsletterSection />
      <FaqSection initialFaqs={faqs} />
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
