'use server';
/**
 * @fileOverview An AI agent that simulates the Spekulus smart mirror.
 *
 * - simulateMirror - A function that handles user interactions with the virtual mirror.
 * - MirrorSimulatorInput - The input type for the simulateMirror function.
 * - MirrorSimulatorOutput - The return type for the simulateMirror function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MirrorSimulatorInputSchema = z.string().describe("The user's command or question to the smart mirror.");
export type MirrorSimulatorInput = z.infer<typeof MirrorSimulatorInputSchema>;

const MirrorSimulatorOutputSchema = z.object({
  response: z.string().describe("The mirror's response, delivered in a helpful, slightly futuristic assistant persona. The response should be concise and directly address the user's query."),
});
export type MirrorSimulatorOutput = z.infer<typeof MirrorSimulatorOutputSchema>;

export async function simulateMirror(input: MirrorSimulatorInput): Promise<MirrorSimulatorOutput> {
  return mirrorSimulatorFlow(input);
}

const mirrorSimulatorPrompt = ai.definePrompt({
  name: 'mirrorSimulatorPrompt',
  input: {schema: MirrorSimulatorInputSchema},
  output: {schema: MirrorSimulatorOutputSchema},
  prompt: `You are Spekulus, a friendly and helpful AI assistant integrated into a smart mirror.
Your persona is knowledgeable, concise, and slightly futuristic, but always approachable.
You are to respond to the user's commands based on the simulated data provided below.
If the user asks something outside your capabilities or data, politely state that the feature is under development or that you cannot answer. Do not invent information beyond this context.

**Current Simulated Data:**
- **Date:** Today is Monday, October 28, 2024.
- **Weather:** 14°C and sunny with a light breeze. The evening will be clear and cool.
- **Your Schedule:**
  - 09:00 AM: Team Standup Meeting
  - 11:00 AM: Project Phoenix Sync
  - 02:00 PM: Lunch with Alex
  - 06:00 PM: Yoga Class
- **Latest Tech News:**
  - "Quantum computing startup announces major breakthrough."
  - "Next-gen neural networks are becoming smaller and more efficient."
  - "The new 'Stardust' OS for smart devices has been released to developers."
- **Health & Wellness Tip of the Day:** "Remember to take a 5-minute break to stretch every hour. Your body will thank you!"
- **Available Skills:** You can tell the weather, summarize the schedule, give a news headline, offer a health tip, or provide a motivational quote. You can also answer general knowledge questions as a helpful assistant.

Here is the user's command:
"{{{value}}}"

Your response:`,
});

const mirrorSimulatorFlow = ai.defineFlow(
  {
    name: 'mirrorSimulatorFlow',
    inputSchema: MirrorSimulatorInputSchema,
    outputSchema: MirrorSimulatorOutputSchema,
  },
  async (input) => {
    const {output} = await mirrorSimulatorPrompt(input);
    return output!;
  }
);
