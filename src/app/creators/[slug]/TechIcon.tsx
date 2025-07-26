
"use client";
import { Code } from 'lucide-react';

const normalizeSkill = (skill: string) => {
    return skill.toLowerCase()
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/\./g, 'dot')     // Replace dots (e.g., in .NET)
        .replace(/#/g, 'sharp')    // Replace # (e.g., in C#)
        .replace(/\+/g, 'plus');   // Replace + (e.g., in C++)
};

export const TechBadge = ({ skill }: { skill: string }) => {
    const normalizedSkill = normalizeSkill(skill);
    const iconUrl = `https://cdn.simpleicons.org/${normalizedSkill}/222222/00F0FF`;

    return (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
            <img
                src={iconUrl}
                alt={`${skill} logo`}
                className="h-4 w-4"
                // Fallback to a default icon if the image fails to load
                onError={(e) => { (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/code/222222/00F0FF`; }}
            />
            <span className="truncate">{skill}</span>
        </div>
    );
};
