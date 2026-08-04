import Link from 'next/link';
import Image from 'next/image';
import type { Creator, Language } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github, Twitter, Linkedin, ArrowLeft } from 'lucide-react';
import { getCreators } from '@/lib/db/actions';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { translations } from '@/lib/translations';
import { cloudinaryUrl } from '@/lib/cloudinary';

export default async function CreatorsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('language')?.value || 'en') as Language;
  const t = translations[lang];

  const data = await getCreators(lang);
  const creators = data
    .filter((c: Creator) => c && c.slug && c.isVisible !== false)
    .sort((a, b) => a.id - b.id);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">{t.creators.title}</h1>
        <p className="text-xl text-foreground/70 mt-3">{t.creators.subtitle}</p>
      </div>

      {creators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {creators.map((creator, index) => {
            const imageSrc = creator.cloudinaryId
              ? cloudinaryUrl(creator.cloudinaryId)
              : creator.imageId
                ? `/api/images/${creator.imageId}`
                : null;

            return (
              <Link href={`/creators/${creator.slug}`} key={creator.id} className="block group">
                <Card
                  className="bg-card border-border/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 opacity-0 animate-fade-in-up flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 w-full bg-muted overflow-hidden">
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={creator.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover"
                        style={{
                          objectPosition: `${creator.cardImagePosX ?? 50}% ${creator.cardImagePosY ?? 20}%`,
                          transform: `scale(${(creator.cardImageZoom ?? 100) / 100})`
                        }}
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{creator.name}</CardTitle>
                    <CardDescription>{creator.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end">
                    <div className="flex gap-4 text-muted-foreground">
                      {creator.socials?.github && <Github className="h-5 w-5 hover:text-primary" />}
                      {creator.socials?.twitter && <Twitter className="h-5 w-5 hover:text-primary" />}
                      {creator.socials?.linkedin && <Linkedin className="h-5 w-5 hover:text-primary" />}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Creator profiles are not available yet.</p>
          <p>Check back soon to meet the team!</p>
        </div>
      )}
    </div>
  );
}
