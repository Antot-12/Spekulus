
"use client";

import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { creatorsData, type Creator, type Education, type Certification, type GalleryImage, type Achievement, type FeaturedProject } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Github, Twitter, Linkedin, Loader2, Download, MapPin, Languages as LanguagesIcon, CheckCircle, Award, Briefcase, GraduationCap, Camera, Lightbulb, Users, Code, Heart, Quote as QuoteIcon, Music } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { chatWithCreator } from '@/ai/flows/creator-chat-flow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { TechIcon } from './TechIcon';
import { AchievementIcon } from '@/components/AchievementIcon';
import { MusicIcon } from './MusicIcon';
import { cn } from '@/lib/utils';

// Helper component for consistent section styling
const ProfileSection = ({ icon, title, children, className, style }: { icon: ReactNode, title: string, children: ReactNode, className?: string, style?: CSSProperties }) => (
    <Card className={cn("bg-card border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 opacity-0 animate-fade-in-up", className)} style={style}>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl text-primary">
                {icon}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const CreatorAIWidget = ({ creator, style }: { creator: Creator, style?: CSSProperties }) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async (q: string) => {
    if (!q.trim() || !creator?.bio) return;
    
    setQuestion(q);
    setIsAsking(true);
    setAnswer('');
    
    try {
        const response = await chatWithCreator({
            bio: creator.bio,
            question: q,
            skills: creator.skills,
            featuredProject: creator.featuredProject?.title ? {
                title: creator.featuredProject.title,
                description: creator.featuredProject.description || '',
                url: creator.featuredProject.url || ''
            } : undefined,
        });
        setAnswer(response.answer);
    } catch (e) {
        console.error("AI chat error:", e);
        toast({
            title: "AI Error",
            description: "Sorry, the AI assistant is currently unavailable.",
            variant: "destructive",
        });
    } finally {
        setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    `What is ${creator.name.split(' ')[0]}'s role?`,
    "What are their main contributions?",
    "What technologies are they skilled in?",
  ];

  return (
    <div className="lg:sticky top-24">
    <ProfileSection icon={<Lightbulb className="w-6 h-6"/>} title="Ask Me Anything (AI)" style={style}>
      <p className="text-sm text-foreground/70 mb-4">
        Ask a question about {creator.name}, and our AI will answer based on their profile.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); handleAsk(question); }} className="space-y-2">
          <Input 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are their hobbies?"
            disabled={isAsking}
            className="text-sm"
          />
          <Button type="submit" disabled={isAsking || !question.trim()} size="sm" className="w-full">
            {isAsking ? <Loader2 className="animate-spin" /> : 'Ask AI'}
          </Button>
      </form>
      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground/60 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-1">
          {suggestedQuestions.map(q => (
            <button key={q} onClick={() => handleAsk(q)} className="text-left text-primary/80 hover:underline hover:text-primary transition-colors bg-primary/10 px-2 py-1 rounded-md text-xs disabled:opacity-50 disabled:no-underline" disabled={isAsking}>
              "{q}"
            </button>
          ))}
        </div>
      </div>
        {isAsking && !answer && (
            <div className="mt-4 flex items-center gap-2 text-muted-foreground animate-pulse text-sm">
                <Loader2 className="w-4 h-4 animate-spin"/>
                <span>Thinking...</span>
            </div>
        )}
        {answer && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border text-sm text-foreground/90 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
            </div>
        )}
    </ProfileSection>
    </div>
  )
}

const FeaturedProjectSection = ({ project, style }: { project?: FeaturedProject, style?: CSSProperties }) => {
    if (!project || !project.title) return null;

    return (
        <ProfileSection icon={<Briefcase className="w-6 h-6" />} title="Featured Project" style={style}>
             <Card className="bg-muted/30 overflow-hidden border-border/20">
                {project.imageUrl && (
                    <div className="relative aspect-video">
                        <Image src={project.imageUrl} alt={project.title} layout="fill" objectFit="cover" data-ai-hint={project.imageHint}/>
                    </div>
                )}
                <CardContent className="p-6">
                    <h3 className="font-bold font-headline text-xl mb-2">{project.title}</h3>
                    <p className="text-foreground/80 mb-4">{project.description}</p>
                    {project.url && (
                        <Button asChild>
                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                View Project <ArrowRight className="ml-2 h-4 w-4"/>
                            </a>
                        </Button>
                    )}
                </CardContent>
             </Card>
        </ProfileSection>
    )
}

type MusicPlatform = 'spotify' | 'appleMusic' | 'youtubeMusic';
type MusicInfo = {
    platform: MusicPlatform;
    idOrUrl: string;
};

const MusicSection = ({ music, style }: { music?: Creator['music'], style?: CSSProperties }) => {
    if (!music || Object.values(music).every(v => !v)) return null;

    const embeds: MusicInfo[] = (Object.keys(music) as MusicPlatform[])
        .map(platform => ({ platform, idOrUrl: music[platform]! }))
        .filter(embed => embed.idOrUrl);

    const getEmbedUrl = (platform: MusicPlatform, idOrUrl: string): string | null => {
        try {
            switch (platform) {
                case 'spotify':
                    return `https://open.spotify.com/embed/playlist/${idOrUrl}`;
                case 'appleMusic':
                    // Expects a full URL and we'll transform it to the embed URL.
                    const url = new URL(idOrUrl);
                    return `https://embed.music.apple.com${url.pathname}${url.search}`;
                case 'youtubeMusic':
                    return `https://www.youtube.com/embed/videoseries?list=${idOrUrl}`;
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Invalid URL for ${platform}:`, idOrUrl, error);
            return null;
        }
    };
    
    return (
        <ProfileSection icon={<Music className="w-6 h-6" />} title="My Vibe" style={style}>
            <div className="space-y-6">
                {embeds.map(({ platform, idOrUrl }) => {
                    const embedUrl = getEmbedUrl(platform, idOrUrl);
                    if (!embedUrl) return null;

                    return (
                        <div key={platform} className="flex flex-col gap-3">
                             <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground/90">
                                <MusicIcon platform={platform} className="w-6 h-6" />
                                <span>{platform.charAt(0).toUpperCase() + platform.slice(1).replace('M', ' M')}</span>
                            </h4>
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src={embedUrl}
                                width="100%"
                                height="352"
                                frameBorder="0"
                                allowFullScreen={false}
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                title={`${platform} Playlist`}
                            ></iframe>
                        </div>
                    )
                })}
            </div>
        </ProfileSection>
    )
}

const SkillsSection = ({ skills, style }: { skills?: string[], style?: CSSProperties }) => {
    if (!skills || skills.length === 0) return null;
    return (
        <ProfileSection icon={<Code className="w-6 h-6" />} title="Skills & Tech Stack" style={style}>
            <div className="flex flex-wrap gap-3">
                {skills.map(skill => (
                     <TooltipProvider key={skill}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
                                    <TechIcon skill={skill} className="h-5 w-5" />
                                    <span className="truncate">{skill}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{skill}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </ProfileSection>
    );
};

const AchievementsSection = ({ achievements, style }: { achievements?: Achievement[], style?: CSSProperties }) => {
    if (!achievements || achievements.length === 0) return null;

    return (
        <ProfileSection icon={<Award className="w-6 h-6" />} title="Achievements" style={style}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/30 rounded-lg border border-border/20 hover:border-primary/50 hover:bg-muted/50 transition-all aspect-square cursor-pointer">
                                    <AchievementIcon name={achievement.icon} className="h-8 w-8 text-primary" />
                                    <p className="mt-2 text-sm font-semibold text-foreground truncate">{achievement.name}</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-center">
                                <p className="font-bold mb-1">{achievement.name}</p>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </ProfileSection>
    );
};

const ContributionsSection = ({ contributions, style }: { contributions?: string[], style?: CSSProperties }) => {
    if (!contributions || contributions.length === 0) return null;
    return (
        <ProfileSection icon={<Briefcase className="w-6 h-6"/>} title="My Contributions to Spekulus" style={style}>
            <ul className="space-y-2">
                {contributions.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                    </li>
                ))}
            </ul>
        </ProfileSection>
    );
};

const EducationSection = ({ education, certifications, style }: { education?: Education[], certifications?: Certification[], style?: CSSProperties }) => {
    if ((!education || education.length === 0) && (!certifications || certifications.length === 0)) return null;

    return (
        <ProfileSection icon={<GraduationCap className="w-6 h-6"/>} title="Education & Certifications" style={style}>
            <div className="space-y-6">
                {education && education.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Education</h4>
                        <ul className="space-y-3">
                        {education.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <GraduationCap className="w-5 h-5 text-primary/70 mt-1 shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">{item.degree}</p>
                                    <p className="text-sm text-foreground/80">{item.institution}</p>
                                    <p className="text-xs text-foreground/60">{item.year}</p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
                {certifications && certifications.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Certifications</h4>
                        <ul className="space-y-3">
                        {certifications.map((item, index) => (
                             <li key={index} className="flex items-start gap-3">
                                <Award className="w-5 h-5 text-primary/70 mt-1 shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    <p className="text-sm text-foreground/80">{item.authority}</p>
                                    <p className="text-xs text-foreground/60">{item.year}</p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
            </div>
        </ProfileSection>
    )
}

const PersonalSection = ({ hobbies, quote, quoteAuthor, style }: { hobbies?: string[], quote?: string, quoteAuthor?: string, style?: CSSProperties }) => {
    if ((!hobbies || hobbies.length === 0) && !quote) return null;
    return (
        <ProfileSection icon={<Heart className="w-6 h-6"/>} title="Personal Touch" style={style}>
             <div className="space-y-6">
                {quote && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><QuoteIcon className="w-4 h-4" /> A Quote I Live By</h4>
                        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/90 my-2">
                            <p>"{quote}"</p>
                            {quoteAuthor && <footer className="text-base not-italic text-foreground/70 mt-2">— {quoteAuthor}</footer>}
                        </blockquote>
                    </div>
                )}
                 {hobbies && hobbies.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Hobbies & Interests</h4>
                        <div className="flex flex-wrap gap-2">
                        {hobbies.map(hobby => (
                            <Badge key={hobby} variant="secondary" className="text-base">{hobby}</Badge>
                        ))}
                        </div>
                    </div>
                 )}
            </div>
        </ProfileSection>
    )
}

const GallerySection = ({ gallery, style }: { gallery?: GalleryImage[], style?: CSSProperties }) => {
    if (!gallery || gallery.length === 0) return null;
    return (
        <ProfileSection icon={<Camera className="w-6 h-6"/>} title="Gallery" style={style}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                        <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-2 left-2 text-white text-xs drop-shadow-md">{image.description}</p>
                    </div>
                ))}
            </div>
        </ProfileSection>
    )
}

export default function CreatorDetailPage() {
  const { language, translations } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const [creator, setCreator] = useState<Creator | null | undefined>(undefined);

  useEffect(() => {
    const LOCAL_STORAGE_KEY = `spekulus-creators-${language}`;
    const loadCreator = () => {
      try {
        const storedCreators = localStorage.getItem(LOCAL_STORAGE_KEY);
        const creators = storedCreators ? JSON.parse(storedCreators) : creatorsData[language];
        const foundCreator = creators.find((c: Creator) => c.slug === slug);
        setCreator(foundCreator || null);
      } catch (error) {
        console.error("Failed to load creator", error);
        const foundCreator = creatorsData[language].find((c) => c.slug === slug);
        setCreator(foundCreator || null);
      }
    };
    loadCreator();
    window.addEventListener('storage', loadCreator);
    return () => window.removeEventListener('storage', loadCreator);
  }, [slug, language]);

  if (creator === undefined) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <Skeleton className="h-96 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
      </div>
    );
  }
  
  if (creator === null) {
    notFound();
  }

  return (
    <div className="bg-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="mb-8">
          <Link href="/creators" className="inline-flex items-center gap-2 text-primary hover:underline font-semibold">
            <ArrowLeft className="w-4 h-4" />
            {translations.creators.allCreators}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <aside className="lg:col-span-1 space-y-8 self-start">
             <Card className="p-6 text-center shadow-lg border-border/50 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="relative h-40 w-40 mx-auto group">
                    <Image src={creator.imageUrl} alt={creator.name} data-ai-hint={creator.imageHint} layout="fill" objectFit="cover" className="rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_hsl(var(--primary))]" priority />
                </div>
                <h1 className="text-3xl font-bold font-headline mt-4">{creator.name}</h1>
                <p className="text-xl text-primary font-semibold">{creator.role}</p>
                <div className="flex gap-3 mt-4 justify-center">
                    {creator.socials.github && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={`https://github.com/${creator.socials.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"><Github className="w-5 h-5"/></a></Button>}
                    {creator.socials.twitter && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile"><Twitter className="w-5 h-5"/></a></Button>}
                    {creator.socials.linkedin && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><Linkedin className="w-5 h-5"/></a></Button>}
                </div>
                <div className="text-left text-sm mt-6 space-y-2 text-foreground/80">
                    {creator.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {creator.location}</p>}
                    {creator.languages && <p className="flex items-center gap-2"><LanguagesIcon className="w-4 h-4 text-primary" /> {creator.languages.join(', ')}</p>}
                </div>
                {creator.cvUrl && (
                    <Button asChild className="w-full mt-6">
                        <a href={creator.cvUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download CV
                        </a>
                    </Button>
                )}
             </Card>
             <CreatorAIWidget creator={creator} style={{ animationDelay: '300ms' }}/>
          </aside>

          {/* Right Column */}
          <main className="lg:col-span-2 space-y-8">
            <ProfileSection icon={<Users className="w-6 h-6"/>} title="About Me" style={{ animationDelay: '400ms' }}>
                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 text-base leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {creator.bio}
                    </ReactMarkdown>
                </div>
            </ProfileSection>
            <FeaturedProjectSection project={creator.featuredProject} style={{ animationDelay: '500ms' }} />
            <ContributionsSection contributions={creator.contributions} style={{ animationDelay: '600ms' }} />
            <SkillsSection skills={creator.skills} style={{ animationDelay: '700ms' }} />
            <MusicSection music={creator.music} style={{ animationDelay: '800ms' }} />
            <AchievementsSection achievements={creator.achievements} style={{ animationDelay: '900ms' }} />
            <EducationSection education={creator.education} certifications={creator.certifications} style={{ animationDelay: '1000ms' }} />
            <PersonalSection hobbies={creator.hobbies} quote={creator.quote} quoteAuthor={creator.quoteAuthor} style={{ animationDelay: '1100ms' }} />
            <GallerySection gallery={creator.gallery} style={{ animationDelay: '1200ms' }} />
          </main>
        </div>
      </div>
    </div>
  );
}
