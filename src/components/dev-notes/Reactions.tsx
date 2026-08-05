"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Heart, Laugh, Sparkles, Frown, AlertTriangle, Lightbulb, HelpCircle, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ReactionType = 'like' | 'dislike' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'idea' | 'confused' | 'rocket';

const reactionIcons: Record<ReactionType, React.ElementType> = {
    like: ThumbsUp,
    dislike: ThumbsDown,
    love: Heart,
    laugh: Laugh,
    wow: Sparkles,
    sad: Frown,
    angry: AlertTriangle,
    idea: Lightbulb,
    confused: HelpCircle,
    rocket: Rocket,
};

type ReactionsProps = {
    noteId: number;
    initialCounts: Record<string, number>;
};

export function Reactions({ noteId, initialCounts }: ReactionsProps) {
    const { translations } = useLanguage();
    const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
    const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
    const [isClient, setIsClient] = useState(false);
    const [animatingReaction, setAnimatingReaction] = useState<ReactionType | null>(null);

    const storageKey = `spekulus-reactions-${noteId}`;
    const userReactionsKey = `spekulus-user-reactions-${noteId}`;

    // Get reaction label from translations
    const getReactionLabel = (key: ReactionType): string => {
        const labels: Record<ReactionType, string> = {
            like: translations.devNotes.reactionLike,
            dislike: translations.devNotes.reactionDislike,
            love: translations.devNotes.reactionLove,
            laugh: translations.devNotes.reactionLaugh,
            wow: translations.devNotes.reactionWow,
            sad: translations.devNotes.reactionSad,
            angry: translations.devNotes.reactionAngry,
            idea: translations.devNotes.reactionIdea,
            confused: translations.devNotes.reactionConfused,
            rocket: translations.devNotes.reactionRocket,
        };
        return labels[key] || key;
    };

    // Load state from localStorage on client-side
    useEffect(() => {
        setIsClient(true);
        try {
            const storedCounts = localStorage.getItem(storageKey);
            const storedUserReactions = localStorage.getItem(userReactionsKey);

            if (storedCounts) {
                setCounts(JSON.parse(storedCounts));
            }
            if (storedUserReactions) {
                setUserReactions(new Set(JSON.parse(storedUserReactions)));
            }
        } catch (error) {
            console.error("Failed to load reactions from localStorage", error);
        }
    }, [noteId, storageKey, userReactionsKey]);

    const handleReaction = (reaction: ReactionType) => {
        if (!isClient) return;

        // Trigger animation
        setAnimatingReaction(reaction);
        setTimeout(() => setAnimatingReaction(null), 300);

        setCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            const newUserReactions = new Set(userReactions);

            // Toggle reaction - users can have multiple reactions
            if (userReactions.has(reaction)) {
                newCounts[reaction] = Math.max(0, (newCounts[reaction] || 1) - 1);
                newUserReactions.delete(reaction);
            } else {
                newCounts[reaction] = (newCounts[reaction] || 0) + 1;
                newUserReactions.add(reaction);
            }

            setUserReactions(newUserReactions);
            localStorage.setItem(storageKey, JSON.stringify(newCounts));
            localStorage.setItem(userReactionsKey, JSON.stringify([...newUserReactions]));
            window.dispatchEvent(new Event('storage'));
            return newCounts;
        });
    };

    // Listen for storage changes to sync across tabs
    const handleStorageChange = useCallback((event: StorageEvent) => {
        if (event.key === storageKey) {
            try {
                const newCounts = event.newValue ? JSON.parse(event.newValue) : initialCounts;
                setCounts(newCounts);
            } catch (error) {
                console.error("Failed to parse reaction counts from storage", error);
            }
        }
        if (event.key === userReactionsKey) {
            try {
                const reactions = event.newValue ? JSON.parse(event.newValue) : [];
                setUserReactions(new Set(reactions));
            } catch (error) {
                console.error("Failed to parse user reactions from storage", error);
            }
        }
    }, [storageKey, userReactionsKey, initialCounts]);

    useEffect(() => {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [handleStorageChange]);

    const totalReactions = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);

    return (
        <div className="mt-10 pt-8 border-t border-border/30">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{translations.devNotes.reactionsTitle}</h3>
                <p className="text-sm text-muted-foreground">
                    {totalReactions > 0
                        ? `${totalReactions} ${totalReactions === 1 ? translations.devNotes.reactionsCount : translations.devNotes.reactionsCountPlural}`
                        : translations.devNotes.reactionsBeFirst
                    }
                </p>
            </div>

            <TooltipProvider delayDuration={100}>
                <div className="flex flex-wrap gap-3 justify-center">
                    {(Object.keys(reactionIcons) as ReactionType[]).map((key) => {
                        const Icon = reactionIcons[key];
                        const count = counts[key] || 0;
                        const hasReacted = userReactions.has(key);
                        const isAnimating = animatingReaction === key;

                        return (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleReaction(key)}
                                        className={cn(
                                            "relative rounded-full px-4 py-6 transition-all duration-200",
                                            "hover:scale-105 active:scale-95",
                                            "hover:bg-cyan-400/20 hover:text-cyan-400",
                                            hasReacted
                                                ? "bg-cyan-400/20 text-cyan-400 ring-2 ring-offset-2 ring-offset-background ring-cyan-400"
                                                : "bg-muted/50 text-muted-foreground",
                                            isAnimating && "animate-bounce"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-6 h-6 transition-transform duration-200",
                                            hasReacted && "scale-110"
                                        )} />
                                        {count > 0 && (
                                            <span
                                                className={cn(
                                                    "absolute -top-1 -right-1 min-w-[1.5rem] h-6 flex items-center justify-center",
                                                    "text-xs font-bold rounded-full px-1.5 border",
                                                    hasReacted
                                                        ? "bg-cyan-400 text-background border-cyan-400"
                                                        : "bg-muted text-foreground border-border"
                                                )}
                                            >
                                                {count > 99 ? '99+' : count}
                                            </span>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="font-medium">
                                    <p>{getReactionLabel(key)}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>

            {userReactions.size > 0 && (
                <div className="text-center mt-4">
                    <p className="text-sm text-cyan-400">
                        {translations.devNotes.reactionsThanks}
                    </p>
                    <p className="text-sm text-cyan-400/80 italic mt-1">
                        {Array.from(userReactions).map(r => getReactionLabel(r)).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
}
