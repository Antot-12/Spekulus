'use server';
/**
 * @fileOverview An AI agent that can generate images from a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.string().describe('A text prompt describing the image to generate.');
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.string().describe("The generated image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.");
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(prompt: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(prompt);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (prompt) => {
    if (!prompt) {
        throw new Error("Image generation prompt cannot be empty.");
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to produce an output.');
    }
    
    return media.url;
  }
);
