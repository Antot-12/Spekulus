
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

const CreatorChatInputSchema = z.object({
  bio: z.string().describe('The full biography of the creator.'),
  question: z.string().describe("The user's question about the creator."),
  skills: z.array(z.string()).optional().describe("A list of the creator's skills."),
  featuredProject: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
  }).optional().describe("Details about the creator's featured project."),
});
export type CreatorChatInput = z.infer<typeof CreatorChatInputSchema>;

const CreatorChatOutputSchema = z.object({
  answer: z.string().describe("The answer to the question, delivered in the first-person persona of the creator. The answer should be based only on the provided biography."),
});
export type CreatorChatOutput = z.infer<typeof CreatorChatOutputSchema>;

export async function chatWithCreator(input: CreatorChatInput): Promise<CreatorChatOutput> {
  return creatorChatFlow(input);
}

const creatorChatPrompt = ai.definePrompt({
  name: 'creatorChatPrompt',
  input: {schema: CreatorChatInputSchema},
  output: {schema: CreatorChatOutputSchema},
  prompt: `You are acting as a helpful AI assistant for a person whose information is provided below.
Your role is to answer questions from users based *only* on the information provided (bio, skills, and featured project).
Answer in the first person, as if you are the creator. Be friendly and conversational.
If the answer cannot be found in the provided information, politely decline by saying something like "That's a great question! My profile doesn't cover that, but I'm passionate about..." and then mention a topic from the bio or one of your skills. Do not invent information.

Here is the information about the creator:

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

{{#if featuredProject}}
**Featured Project:**
---
Title: {{{featuredProject.title}}}
Description: {{{featuredProject.description}}}
URL: {{{featuredProject.url}}}
---
{{/if}}

Here is the user's question:
"{{{question}}}"

Your answer (as the creator):`,
});

const creatorChatFlow = ai.defineFlow(
  {
    name: 'creatorChatFlow',
    inputSchema: CreatorChatInputSchema,
    outputSchema: CreatorChatOutputSchema,
  },
  async (input) => {
    const {output} = await creatorChatPrompt(input);
    return output!;
  }
);
