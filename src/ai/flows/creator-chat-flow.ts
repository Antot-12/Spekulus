
'use server';
/**
 * @fileOverview An AI agent that can answer questions about a creator based on their bio.
 *
 * - chatWithCreator - A function that handles the Q&A process.
 * - CreatorChatInput - The input type for the chatWithCreator function.
 * - CreatorChatOutput - The return type for the chatWithCreator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Chat message schema for conversation history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Experience schema
const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string().optional(),
});

// Project schema
const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
});

const CreatorChatInputSchema = z.object({
  // Creator info
  name: z.string().describe('The name of the creator.'),
  bio: z.string().describe('The full biography of the creator.'),
  skills: z.array(z.string()).optional().describe("A list of the creator's skills."),

  // Extended data
  experience: z.array(ExperienceSchema).optional().describe("Work experience history."),
  projects: z.array(ProjectSchema).optional().describe("Portfolio of projects."),
  achievements: z.array(z.string()).optional().describe("List of achievements."),
  education: z.string().optional().describe("Education background."),
  socialLinks: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
  }).optional().describe("Social media links."),

  // Featured project (legacy support)
  featuredProject: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
  }).optional().describe("Details about the creator's featured project."),

  // Chat context
  question: z.string().describe("The user's question about the creator."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("Previous messages in the conversation."),

  // Language setting
  language: z.enum(['en', 'uk', 'sk']).default('en').describe("Language for the response."),
});
export type CreatorChatInput = z.infer<typeof CreatorChatInputSchema>;

const CreatorChatOutputSchema = z.object({
  answer: z.string().describe("The answer to the question, delivered in the first-person persona of the creator."),
});
export type CreatorChatOutput = z.infer<typeof CreatorChatOutputSchema>;

// Language instructions mapping
const languageInstructions: Record<string, string> = {
  en: 'Respond in English.',
  uk: 'Відповідай українською мовою. (Respond in Ukrainian.)',
  sk: 'Odpovedaj v slovenčine. (Respond in Slovak.)',
};

export async function chatWithCreator(input: CreatorChatInput): Promise<CreatorChatOutput> {
  return creatorChatFlow(input);
}

const creatorChatPrompt = ai.definePrompt({
  name: 'creatorChatPrompt',
  input: {schema: CreatorChatInputSchema},
  output: {schema: CreatorChatOutputSchema},
  prompt: `You are acting as a helpful AI assistant for {{name}}, whose information is provided below.
Your role is to answer questions from users based *only* on the information provided.
Answer in the first person, as if you are {{name}}. Be friendly and conversational.

**IMPORTANT: {{languageInstruction}}**

If the answer cannot be found in the provided information, politely decline by saying something like "That's a great question! My profile doesn't cover that, but I'm passionate about..." and then mention a topic from the bio or one of your skills. Do not invent information.

Here is the information about {{name}}:

**Biography:**
---
{{{bio}}}
---

{{#if skills}}
**Skills:**
---
{{#each skills}}
- {{{this}}}
{{/each}}
---
{{/if}}

{{#if experience}}
**Work Experience:**
---
{{#each experience}}
- **{{{title}}}** at {{{company}}} ({{{period}}})
  {{#if description}}{{{description}}}{{/if}}
{{/each}}
---
{{/if}}

{{#if projects}}
**Projects Portfolio:**
---
{{#each projects}}
- **{{{title}}}**: {{{description}}}
  {{#if technologies}}Technologies: {{#each technologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{#if url}}Link: {{{url}}}{{/if}}
{{/each}}
---
{{/if}}

{{#if achievements}}
**Achievements:**
---
{{#each achievements}}
- {{{this}}}
{{/each}}
---
{{/if}}

{{#if education}}
**Education:**
---
{{{education}}}
---
{{/if}}

{{#if socialLinks}}
**Social Links:**
---
{{#if socialLinks.github}}GitHub: {{{socialLinks.github}}}{{/if}}
{{#if socialLinks.linkedin}}LinkedIn: {{{socialLinks.linkedin}}}{{/if}}
{{#if socialLinks.twitter}}Twitter: {{{socialLinks.twitter}}}{{/if}}
{{#if socialLinks.website}}Website: {{{socialLinks.website}}}{{/if}}
---
{{/if}}

{{#if featuredProject}}
**Featured Project:**
---
Title: {{{featuredProject.title}}}
Description: {{{featuredProject.description}}}
URL: {{{featuredProject.url}}}
---
{{/if}}

{{#if chatHistoryFormatted}}
**Previous conversation:**
---
{{{chatHistoryFormatted}}}
---
{{/if}}

Here is the user's current question:
"{{{question}}}"

Your answer (as {{name}}, in the requested language):`,
});

const creatorChatFlow = ai.defineFlow(
  {
    name: 'creatorChatFlow',
    inputSchema: CreatorChatInputSchema,
    outputSchema: CreatorChatOutputSchema,
  },
  async (input) => {
    // Format chat history as a string
    const chatHistoryFormatted = input.chatHistory?.map(msg =>
      msg.role === 'user' ? `User: ${msg.content}` : `${input.name}: ${msg.content}`
    ).join('\n') || '';

    // Add language instruction to input
    const inputWithLanguage = {
      ...input,
      languageInstruction: languageInstructions[input.language] || languageInstructions.en,
      chatHistoryFormatted,
    };

    const {output} = await creatorChatPrompt(inputWithLanguage);
    return output!;
  }
);
