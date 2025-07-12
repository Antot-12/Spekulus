import { HeroSection } from '@/components/landing/HeroSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { DevNotesSection } from '@/components/landing/DevNotesSection';
import { CreatorsSection } from '@/components/landing/CreatorsSection';
import { AdvantagesSection } from '@/components/landing/AdvantagesSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { ActionSection } from '@/components/landing/ActionSection';
import { getLanguage } from '@/lib/getLanguage';
import {
  getHeroData,
  getProductData,
  getAdvantagesData,
  getActionSectionData,
  getRoadmapEvents,
  getFaqs,
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
  ] = await Promise.all([
    getHeroData(lang),
    getProductData(lang),
    getAdvantagesData(lang),
    getActionSectionData(lang),
    getRoadmapEvents(lang),
    getFaqs(lang),
  ]);

  if (!heroData) {
    heroData = initialData.heroSectionData[lang];
  }

  if (!productData || !productData.components || productData.components.length === 0) {
    productData = initialData.productSectionData[lang];
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

  return (
    <>
      <HeroSection data={heroData} lang={lang} />
      <ProductSection data={productData} />
      <AdvantagesSection data={advantagesData} lang={lang} />
      <ActionSection data={actionSectionData} />
      <RoadmapSection data={roadmapEvents} lang={lang} />
      <FaqSection initialFaqs={faqs} />
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
