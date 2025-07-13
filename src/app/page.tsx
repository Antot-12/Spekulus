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
import { PartnerSection } from '@/components/landing/PartnerSection';
import { getLanguage } from '@/lib/getLanguage';
import {
  getHeroData,
  getProductData,
  getAdvantagesData,
  getActionSectionData,
  getRoadmapEvents,
  getFaqs,
  getScenarios,
  getCompetitorFeatures,
  getPartnerSectionData,
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
    competitorFeatures,
    partnerSectionData,
  ] = await Promise.all([
    getHeroData(lang),
    getProductData(lang),
    getAdvantagesData(lang),
    getActionSectionData(lang),
    getRoadmapEvents(lang),
    getFaqs(lang),
    getScenarios(lang),
    getCompetitorFeatures(lang),
    getPartnerSectionData(lang),
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

  if (!competitorFeatures || competitorFeatures.length === 0) {
    competitorFeatures = initialData.competitorFeaturesData[lang];
  }

  if (!partnerSectionData) {
    partnerSectionData = initialData.partnerSectionData[lang];
  }


  return (
    <>
      <HeroSection data={heroData} lang={lang} />
      <ProductSection data={productData} lang={lang} />
      <AdvantagesSection data={advantagesData} lang={lang} />
      <ActionSection data={actionSectionData} />
      <WhySpekulusSection data={scenarios} lang={lang} />
      <ComparisonSection data={competitorFeatures} lang={lang} />
      <RoadmapSection data={roadmapEvents} lang={lang} />
      <FaqSection initialFaqs={faqs} />
      <DevNotesSection />
      <CreatorsSection />
      <PartnerSection data={partnerSectionData} />
      <ContactSection />
    </>
  );
}
