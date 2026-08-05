
"use client";

import type { CSSProperties, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Creator, Education, Certification, GalleryImage, Achievement, FeaturedProject } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Icon from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { chatWithCreator } from '@/ai/flows/creator-chat-flow';

// Suggested questions for each language (defined locally since AI flow is server-only)
const aiSuggestedQuestions: Record<string, string[]> = {
  en: [
    "What's your background?",
    "What technologies do you specialize in?",
    "Tell me about your projects",
    "What are you currently working on?",
    "How can I contact you?",
  ],
  uk: [
    "Розкажи про свій досвід",
    "Які технології ти використовуєш?",
    "Розкажи про свої проєкти",
    "Над чим зараз працюєш?",
    "Як з тобою зв'язатися?",
  ],
  sk: [
    "Povedz mi o svojom pozadí",
    "Aké technológie používaš?",
    "Povedz mi o svojich projektoch",
    "Na čom teraz pracuješ?",
    "Ako ťa môžem kontaktovať?",
  ],
};
import { Badge } from '@/components/ui/badge';
import { TechBadge } from './TechBadge';
import { AchievementIcon } from '@/components/AchievementIcon';
import { MusicIcon } from './MusicIcon';
import { cn } from '@/lib/utils';
import { getCreatorBySlug } from '@/lib/db/actions';
import { cloudinaryUrl } from '@/lib/cloudinary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Helper to get optimized image URL - prefers Cloudinary direct URL over API route
const getImageSrc = (cloudinaryId?: string | null, imageId?: number | null): string | null => {
  if (cloudinaryId) return cloudinaryUrl(cloudinaryId);
  if (imageId) return `/api/images/${imageId}`;
  return null;
};
import { ProjectsSection } from '@/components/creators/ProjectsSection';
import { ExperienceSection } from '@/components/creators/ExperienceSection';

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

const CreatorAIWidget = ({ creator, experience, projects, style }: {
  creator: Creator,
  experience?: Array<{ title: string; company: string; period: string; description?: string }>,
  projects?: Array<{ title: string; description: string; technologies?: string[]; url?: string }>,
  style?: CSSProperties
}) => {
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [lastQuestionTime, setLastQuestionTime] = useState(0);

  // Rate limiting: max 10 questions per minute
  const RATE_LIMIT = 10;
  const RATE_WINDOW = 60000; // 1 minute

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now - lastQuestionTime > RATE_WINDOW) {
      setQuestionCount(0);
      setLastQuestionTime(now);
      return true;
    }
    if (questionCount >= RATE_LIMIT) {
      toast({
        title: language === 'uk' ? 'Занадто багато запитів' : language === 'sk' ? 'Príliš veľa požiadaviek' : 'Too many requests',
        description: language === 'uk' ? 'Зачекайте хвилину перед наступним питанням.' : language === 'sk' ? 'Počkajte minútu pred ďalšou otázkou.' : 'Please wait a minute before asking another question.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleAsk = async (q: string) => {
    if (!q.trim() || !creator?.bio) return;
    if (!checkRateLimit()) return;

    setQuestion(q);
    setIsAsking(true);
    setAnswer('');
    setQuestionCount(prev => prev + 1);

    try {
        // Filter experience to only include complete entries with required fields
        const validExperience = experience?.filter(exp => exp.title && exp.company && exp.period);
        // Filter projects to only include complete entries
        const validProjects = projects?.filter(proj => proj.title && proj.description);

        const response = await chatWithCreator({
            name: creator.name,
            bio: creator.bio,
            question: q,
            skills: creator.skills,
            experience: validExperience && validExperience.length > 0 ? validExperience : undefined,
            projects: validProjects && validProjects.length > 0 ? validProjects : undefined,
            featuredProject: creator.featuredProject?.title ? {
                title: creator.featuredProject.title,
                description: creator.featuredProject.description || '',
                url: creator.featuredProject.url || ''
            } : undefined,
            chatHistory: chatHistory.length > 0 ? chatHistory.slice(-6) : undefined, // Keep last 6 messages for context
            language: language as 'en' | 'uk' | 'sk',
        });

        setAnswer(response.answer);

        // Update chat history
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: q },
          { role: 'assistant', content: response.answer }
        ]);
    } catch (e: any) {
        console.error("AI chat error:", e);

        // Check if it's a rate limit error
        const isRateLimited = e?.message?.includes('429') || e?.message?.includes('quota');

        const errorMessages = {
          rateLimited: {
            en: { title: 'AI Busy', desc: 'Too many requests. Please try again in a moment.' },
            uk: { title: 'AI зайнятий', desc: 'Забагато запитів. Спробуйте за мить.' },
            sk: { title: 'AI zaneprázdnený', desc: 'Príliš veľa požiadaviek. Skúste o chvíľu.' },
          },
          general: {
            en: { title: 'AI Error', desc: 'Sorry, the AI assistant is currently unavailable.' },
            uk: { title: 'Помилка AI', desc: 'AI асистент тимчасово недоступний.' },
            sk: { title: 'Chyba AI', desc: 'AI asistent je momentálne nedostupný.' },
          }
        };

        const errorType = isRateLimited ? 'rateLimited' : 'general';
        const msg = errorMessages[errorType][language as keyof typeof errorMessages.general] || errorMessages[errorType].en;

        toast({
            title: msg.title,
            description: msg.desc,
            variant: "destructive",
        });
    } finally {
        setIsAsking(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setAnswer('');
    setQuestion('');
  };

  // Get suggested questions for current language
  const localizedSuggestions = aiSuggestedQuestions[language] || aiSuggestedQuestions.en;

  // UI text translations
  const uiText = {
    en: {
      title: 'Ask Me Anything (AI)',
      subtitle: `Ask a question about ${creator.name}, and our AI will answer based on their profile.`,
      placeholder: 'e.g., What are their hobbies?',
      askButton: 'Ask AI',
      thinking: 'Thinking...',
      trySuggestions: 'Try asking:',
      clearChat: 'Clear chat',
      chatHistory: 'Chat history',
    },
    uk: {
      title: 'Запитай мене (AI)',
      subtitle: `Задайте питання про ${creator.name}, і наш AI відповість на основі профілю.`,
      placeholder: 'напр., Які хобі?',
      askButton: 'Запитати AI',
      thinking: 'Думаю...',
      trySuggestions: 'Спробуй запитати:',
      clearChat: 'Очистити чат',
      chatHistory: 'Історія чату',
    },
    sk: {
      title: 'Opýtaj sa ma (AI)',
      subtitle: `Opýtajte sa na ${creator.name} a náš AI odpovie na základe profilu.`,
      placeholder: 'napr., Aké sú ich záľuby?',
      askButton: 'Opýtať sa AI',
      thinking: 'Premýšľam...',
      trySuggestions: 'Skúste sa opýtať:',
      clearChat: 'Vymazať chat',
      chatHistory: 'História chatu',
    },
  };

  const t = uiText[language as keyof typeof uiText] || uiText.en;

  return (
    <div className="lg:sticky top-24">
    <ProfileSection icon={<Icon.Lightbulb className="w-6 h-6"/>} title={t.title} style={style}>
      <p className="text-sm text-foreground/70 mb-4">
        {t.subtitle}
      </p>

      {/* Chat history */}
      {chatHistory.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto space-y-2 p-2 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-foreground/60">{t.chatHistory}</span>
            <button onClick={clearChat} className="text-xs text-primary hover:underline">
              {t.clearChat}
            </button>
          </div>
          {chatHistory.map((msg, i) => (
            <div key={i} className={cn(
              "text-xs p-2 rounded",
              msg.role === 'user' ? "bg-primary/10 text-primary ml-4" : "bg-muted text-foreground/80 mr-4"
            )}>
              <span className="font-semibold">{msg.role === 'user' ? 'You' : creator.name.split(' ')[0]}:</span>{' '}
              {msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleAsk(question); }} className="space-y-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.placeholder}
            disabled={isAsking}
            className="text-sm"
          />
          <Button type="submit" disabled={isAsking || !question.trim()} size="sm" className="w-full">
            {isAsking ? <Icon.Loader2 className="animate-spin" /> : t.askButton}
          </Button>
      </form>

      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground/60 mb-2">{t.trySuggestions}</p>
        <div className="flex flex-wrap gap-1">
          {localizedSuggestions.map(q => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="text-left text-primary/80 hover:underline hover:text-primary transition-colors bg-primary/10 px-2 py-1 rounded-md text-xs disabled:opacity-50 disabled:no-underline"
              disabled={isAsking}
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {isAsking && !answer && (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground animate-pulse text-sm">
              <Icon.Loader2 className="w-4 h-4 animate-spin"/>
              <span>{t.thinking}</span>
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

const FeaturedProjectSection = ({ project, imageId, cloudinaryId, style }: { project?: FeaturedProject, imageId?: number | null, cloudinaryId?: string | null, style?: CSSProperties }) => {
    if (!project || !project.title) return null;
    const imageSrc = getImageSrc(cloudinaryId, imageId);

    return (
        <ProfileSection icon={<Icon.Briefcase className="w-6 h-6" />} title="Featured Project" style={style}>
             <Card className="bg-muted/30 overflow-hidden border-border/20">
                {imageSrc && (
                    <div className="relative aspect-video">
                        <Image src={imageSrc} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
                    </div>
                )}
                <CardContent className="p-6">
                    <h3 className="font-bold font-headline text-xl mb-2">{project.title}</h3>
                    <p className="text-foreground/80 mb-4">{project.description}</p>
                    {project.url && (
                        <Button asChild>
                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                View Project <Icon.ArrowRight className="ml-2 h-4 w-4"/>
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
                    if (!idOrUrl.startsWith('http')) {
                        console.warn(`Invalid Apple Music URL provided (must start with http): ${idOrUrl}`);
                        return null;
                    }
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
        <ProfileSection icon={<Icon.Music className="w-6 h-6" />} title="My Vibe" style={style}>
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

    const normalizeSkill = (s: string) => s.toLowerCase().replace(/[\s.-]/g, '');
    
    const professionalSkillsList = new Set([
        'leadership', 'projectmanagement', 'businessstrategy', 'publicspeaking',
        'systemarchitecture', 'systemdesign', 'embeddedsystems', 'hardwareintegration'
    ]);
    const platformsAndToolsList = new Set([
        'docker', 'kubernetes', 'windows', 'macos', 'linux', 'bash', 'shell', 
        'aws', 'azure', 'gcp', 'github', 'gitlab', 'jenkins', 'ci', 'virtualbox', 'vmware',
        'figma', 'adobe', 'vscode', 'visualstudiocode', 'intellij'
    ]);

    const technical = skills.filter(s => !professionalSkillsList.has(normalizeSkill(s)) && !platformsAndToolsList.has(normalizeSkill(s)));
    const professional = skills.filter(s => professionalSkillsList.has(normalizeSkill(s)));
    const platformsAndTools = skills.filter(s => platformsAndToolsList.has(normalizeSkill(s)));
    
    return (
        <ProfileSection icon={<Icon.Code className="w-6 h-6" />} title="Skills & Competencies" style={style}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {technical.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><Icon.Code className="w-5 h-5 text-primary"/> Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {technical.map(skill => (
                                <TechBadge key={skill} skill={skill} />
                            ))}
                        </div>
                    </div>
                )}

                {platformsAndTools.length > 0 && (
                     <div className="space-y-3">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><Icon.Terminal className="w-5 h-5 text-primary"/> Platforms &amp; Tooling</h4>
                        <div className="flex flex-wrap gap-2">
                            {platformsAndTools.map(skill => (
                                <TechBadge key={skill} skill={skill} />
                            ))}
                        </div>
                    </div>
                )}

                {professional.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2"><Icon.BriefcaseBusiness className="w-5 h-5 text-primary"/> Professional Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {professional.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-base">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ProfileSection>
    );
};

const AchievementsSection = ({ achievements, style }: { achievements?: Achievement[], style?: CSSProperties }) => {
    if (!achievements || achievements.length === 0) return null;

    return (
        <ProfileSection icon={<Icon.Award className="w-6 h-6" />} title="Achievements" style={style}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                    <div key={index} className="flex flex-col items-center justify-center text-center p-4 bg-muted/30 rounded-lg border border-border/20 hover:border-primary/50 hover:bg-muted/50 transition-all aspect-square cursor-pointer">
                        <AchievementIcon name={achievement.icon} className="h-8 w-8 text-primary" />
                        <p className="mt-2 text-sm font-semibold text-foreground truncate">{achievement.name}</p>
                    </div>
                ))}
            </div>
        </ProfileSection>
    );
};

const ContributionsSection = ({ contributions, style }: { contributions?: string[], style?: CSSProperties }) => {
    if (!contributions || contributions.length === 0) return null;
    return (
        <ProfileSection icon={<Icon.Briefcase className="w-6 h-6"/>} title="My Contributions to Spekulus" style={style}>
            <ul className="space-y-2">
                {contributions.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <Icon.CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
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
        <ProfileSection icon={<Icon.GraduationCap className="w-6 h-6"/>} title="Education &amp; Certifications" style={style}>
            <div className="space-y-6">
                {education && education.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Education</h4>
                        <ul className="space-y-3">
                        {education.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Icon.GraduationCap className="w-5 h-5 text-primary/70 mt-1 shrink-0" />
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
                                <Icon.Award className="w-5 h-5 text-primary/70 mt-1 shrink-0" />
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
        <ProfileSection icon={<Icon.Heart className="w-6 h-6"/>} title="Personal Touch" style={style}>
             <div className="space-y-6">
                {quote && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Icon.Quote className="w-4 h-4" /> A Quote I Live By</h4>
                        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/90 my-2">
                            <p>"{quote}"</p>
                            {quoteAuthor && <footer className="text-base not-italic text-foreground/70 mt-2">— {quoteAuthor}</footer>}
                        </blockquote>
                    </div>
                )}
                 {hobbies && hobbies.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Hobbies &amp; Interests</h4>
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
        <ProfileSection icon={<Icon.Camera className="w-6 h-6"/>} title="Gallery" style={style}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((image, index) => {
                    const imageSrc = getImageSrc((image as any).cloudinaryId, image.imageId);
                    if (!imageSrc) return null;
                    return (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="group relative aspect-square overflow-hidden rounded-lg cursor-zoom-in">
                                    <Image src={imageSrc} alt={image.description} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <p className="absolute bottom-2 left-2 text-white text-xs drop-shadow-md">{image.description}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                                <DialogHeader>
                                    <DialogTitle className="sr-only">{image.description}</DialogTitle>
                                </DialogHeader>
                                <img src={imageSrc} alt={image.description} className="max-h-[90vh] w-auto h-auto rounded-lg" />
                            </DialogContent>
                        </Dialog>
                    );
                })}
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
    if (!slug || !language) return;

    const fetchCreator = async () => {
        try {
            const data = await getCreatorBySlug(language, slug);
            if (data && data.isVisible !== false) {
                setCreator(data);
            } else {
                setCreator(null);
            }
        } catch (error) {
            console.error("Failed to fetch creator:", error);
            setCreator(null);
        }
    };
    
    fetchCreator();
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
            <Icon.ArrowLeft className="w-4 h-4" />
            {translations.creators.allCreators}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <aside className="lg:col-span-1 space-y-8 self-start">
             <Card className="p-6 text-center shadow-lg border-border/50 opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="relative h-40 w-40 mx-auto group overflow-hidden rounded-full shadow-lg hover:shadow-[0_0_25px_hsl(var(--primary))] transition-shadow duration-300">
                    {(creator.cloudinaryId || creator.imageId) && (
                        <Image
                          src={getImageSrc(creator.cloudinaryId, creator.imageId)!}
                          alt={creator.name}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          style={{
                            objectPosition: `${creator.profileImagePosX ?? 50}% ${creator.profileImagePosY ?? 30}%`,
                            transform: `scale(${(creator.profileImageZoom ?? 100) / 100})`
                          }}
                          priority
                        />
                    )}
                </div>
                <h1 className="text-3xl font-bold font-headline mt-4">{creator.name}</h1>
                <p className="text-xl text-primary font-semibold">{creator.role}</p>
                <div className="flex gap-3 mt-4 justify-center">
                    {creator.socials.linkedin && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><Icon.Linkedin className="w-5 h-5"/></a></Button>}
                    {creator.socials.github && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={`https://github.com/${creator.socials.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"><Icon.Github className="w-5 h-5"/></a></Button>}
                    {creator.socials.gitlab && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={`https://gitlab.com/${creator.socials.gitlab}`} target="_blank" rel="noopener noreferrer" aria-label="GitLab Profile"><Icon.Gitlab className="w-5 h-5"/></a></Button>}
                    {creator.socials.website && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website/Portfolio"><Icon.Globe className="w-5 h-5"/></a></Button>}
                    {creator.socials.discord && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord"><Icon.Disc className="w-5 h-5"/></a></Button>}
                    {creator.socials.facebook && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Profile"><Icon.Facebook className="w-5 h-5"/></a></Button>}
                    {creator.socials.instagram && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={`https://instagram.com/${creator.socials.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile"><Icon.Instagram className="w-5 h-5"/></a></Button>}
                    {creator.socials.twitter && <Button asChild variant="outline" size="icon" className="rounded-full hover:bg-accent hover:text-primary transition-all hover:scale-110 hover:rotate-6 active:rotate-0 active:scale-100"><a href={creator.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile"><Icon.Twitter className="w-5 h-5"/></a></Button>}
                </div>
                <div className="text-left text-sm mt-6 space-y-2 text-foreground/80">
                    {creator.location && <p className="flex items-center gap-2"><Icon.MapPin className="w-4 h-4 text-primary" /> {creator.location}</p>}
                    {creator.languages && <p className="flex items-center gap-2"><Icon.Languages className="w-4 h-4 text-primary" /> {creator.languages.join(', ')}</p>}
                </div>
                {creator.cvUrl && (
                    <Button asChild className="w-full mt-6">
                        <a href={creator.cvUrl} target="_blank" rel="noopener noreferrer">
                            <Icon.Download className="mr-2 h-4 w-4" /> Download CV
                        </a>
                    </Button>
                )}
             </Card>
             <CreatorAIWidget
               creator={creator}
               experience={creator.experience?.map(exp => ({
                 title: exp.title,
                 company: exp.company,
                 period: exp.period,
                 description: exp.description
               }))}
               projects={creator.projects?.map(proj => ({
                 title: proj.title,
                 description: proj.description,
                 technologies: proj.technologies,
                 url: proj.url
               }))}
               style={{ animationDelay: '300ms' }}
             />
          </aside>

          {/* Right Column */}
          <main className="lg:col-span-2 space-y-8">
            {(creator.sectionsOrder || [
              'about',
              'projects',
              'experience',
              'featuredProject',
              'contributions',
              'skills',
              'achievements',
              'education',
              'music',
              'personal',
              'gallery'
            ])
              .filter((sectionKey) => !(creator.hiddenSections || []).includes(sectionKey))
              .map((sectionKey, index) => {
              const delay = `${(index + 4) * 100}ms`;

              switch (sectionKey) {
                case 'about':
                  return (
                    <ProfileSection key="about" icon={<Icon.Users className="w-6 h-6"/>} title="About Me" style={{ animationDelay: delay }}>
                      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 text-base leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {creator.bio}
                        </ReactMarkdown>
                      </div>
                    </ProfileSection>
                  );
                case 'projects':
                  return <ProjectsSection key="projects" projects={creator.projects} style={{ animationDelay: delay }} />;
                case 'experience':
                  return <ExperienceSection key="experience" experience={creator.experience} style={{ animationDelay: delay }} />;
                case 'featuredProject':
                  return <FeaturedProjectSection key="featuredProject" project={creator.featuredProject} imageId={creator.featuredProjectImageId} cloudinaryId={(creator as any).featuredProjectCloudinaryId} style={{ animationDelay: delay }} />;
                case 'contributions':
                  return <ContributionsSection key="contributions" contributions={creator.contributions} style={{ animationDelay: delay }} />;
                case 'skills':
                  return <SkillsSection key="skills" skills={creator.skills} style={{ animationDelay: delay }} />;
                case 'achievements':
                  return <AchievementsSection key="achievements" achievements={creator.achievements} style={{ animationDelay: delay }} />;
                case 'education':
                  return <EducationSection key="education" education={creator.education} certifications={creator.certifications} style={{ animationDelay: delay }} />;
                case 'music':
                  return <MusicSection key="music" music={creator.music} style={{ animationDelay: delay }} />;
                case 'personal':
                  return <PersonalSection key="personal" hobbies={creator.hobbies} quote={creator.quote} quoteAuthor={creator.quoteAuthor} style={{ animationDelay: delay }} />;
                case 'gallery':
                  return <GallerySection key="gallery" gallery={creator.gallery} style={{ animationDelay: delay }} />;
                default:
                  return null;
              }
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
