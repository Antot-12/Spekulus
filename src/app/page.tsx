import { HeroSection } from '@/components/landing/HeroSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { DevNotesSection } from '@/components/landing/DevNotesSection';
import { CreatorsSection } from '@/components/landing/CreatorsSection';
import { AdvantagesSection } from '@/components/landing/AdvantagesSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { ActionSection } from '@/components/landing/ActionSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProductSection />
      <AdvantagesSection />
      <ActionSection />
      <RoadmapSection />
      <FaqSection />
      <DevNotesSection />
      <CreatorsSection />
      <ContactSection />
    </>
  );
}
