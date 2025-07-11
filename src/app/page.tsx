
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
import { getHeroData, getProductData, getAdvantagesData, getActionSectionData, getRoadmapEvents, getFaqs } from '@/lib/db/actions';

export default async function Home() {
  const lang = getLanguage();
  
  // Fetch all data in parallel for performance
  const [
    heroData, 
    productData, 
    advantagesData, 
    actionSectionData, 
    roadmapEvents,
    faqs
  ] = await Promise.all([
    getHeroData(lang),
    getProductData(lang),
    getAdvantagesData(lang),
    getActionSectionData(lang),
    getRoadmapEvents(lang),
    getFaqs(lang),
  ]);

  return (
    <>
      <HeroSection data={heroData} />
      {productData && <ProductSection data={productData} />}
      {advantagesData && advantagesData.length > 0 && <AdvantagesSection data={advantagesData} />}
      {actionSectionData && <ActionSection data={actionSectionData} />}
      {roadmapEvents && roadmapEvents.length > 0 && <RoadmapSection data={roadmapEvents} />}
      {faqs && <FaqSection initialFaqs={faqs} />}
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
