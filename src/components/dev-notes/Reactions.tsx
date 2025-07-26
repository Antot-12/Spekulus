
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Heart, Laugh, Sparkles, Frown, AlertTriangle, Milestone, HelpCircle, Search } from 'lucide-react';

type ReactionType = 'like' | 'dislike' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'surprised' | 'confused' | 'curious';

type ReactionConfig = {
    label: string;
    icon: React.ElementType;
};

const reactionMap: Record<ReactionType, ReactionConfig> = {
    like: { label: 'Like', icon: ThumbsUp },
    dislike: { label: 'Dislike', icon: ThumbsDown },
    love: { label: 'Love', icon: Heart },
    laugh: { label: 'Laugh', icon: Laugh },
    wow: { label: 'Wow', icon: Sparkles },
    sad: { label: 'Sad', icon: Frown },
    angry: { label: 'Angry', icon: AlertTriangle },
    surprised: { label: 'Surprised', icon: Milestone },
    confused: { label: 'Confused', icon: HelpCircle },
    curious: { label: 'Curious', icon: Search },
};

type ReactionsProps = {
    noteId: number;
    initialCounts: Record<string, number>;
};

export function Reactions({ noteId, initialCounts }: ReactionsProps) {
    const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [isClient, setIsClient] = useState(false);

    const storageKey = `spekulus-reactions-${noteId}`;
    const userReactionKey = `spekulus-user-reaction-${noteId}`;

    // Load state from localStorage on client-side
    useEffect(() => {
        setIsClient(true);
        try {
            const storedCounts = localStorage.getItem(storageKey);
            const storedUserReaction = localStorage.getItem(userReactionKey) as ReactionType | null;

            if (storedCounts) {
                setCounts(JSON.parse(storedCounts));
            }
            if (storedUserReaction) {
                setUserReaction(storedUserReaction);
            }
        } catch (error) {
            console.error("Failed to load reactions from localStorage", error);
        }
    }, [noteId, storageKey, userReactionKey]);

    const handleReaction = (reaction: ReactionType) => {
        if (!isClient) return;

        setCounts(prevCounts => {
            const newCounts = { ...prevCounts };

            // If user has already reacted with this type, un-react
            if (userReaction === reaction) {
                newCounts[reaction] = (newCounts[reaction] || 1) - 1;
                setUserReaction(null);
                localStorage.removeItem(userReactionKey);
            } else {
                // If user had a previous different reaction, decrement it
                if (userReaction) {
                    newCounts[userReaction] = (newCounts[userReaction] || 1) - 1;
                }
                // Increment the new reaction
                newCounts[reaction] = (newCounts[reaction] || 0) + 1;
                setUserReaction(reaction);
                localStorage.setItem(userReactionKey, reaction);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(newCounts));
            // Dispatch storage event to sync across tabs
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
         if (event.key === userReactionKey) {
            setUserReaction(event.newValue as ReactionType | null);
        }
    }, [storageKey, userReactionKey, initialCounts]);

    useEffect(() => {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [handleStorageChange]);

    return (
        <div className="mt-8 pt-6 border-t border-border/20">
            <h3 className="text-lg font-semibold mb-4 text-center">How did this article make you feel?</h3>
            <TooltipProvider>
                <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(reactionMap).map(([key, { label, icon: Icon }]) => {
                        const reactionKey = key as ReactionType;
                        const count = counts[reactionKey] || 0;
                        const hasReacted = userReaction === reactionKey;

                        return (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={hasReacted ? "default" : "outline"}
                                        onClick={() => handleReaction(reactionKey)}
                                        className={cn(
                                            "rounded-full transition-all duration-200 hover:scale-110",
                                            hasReacted && "border-primary/50 ring-2 ring-primary"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {count > 0 && <span className="ml-2 font-semibold">{count}</span>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{label}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
        </div>
    );
}
