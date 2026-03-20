'use server';
/**
 * @fileOverview An AI agent for analyzing visitor reasons.
 *
 * - analyzeVisitorReasons - A function that handles the analysis of visitor reasons.
 * - AnalyzeVisitorReasonsInput - The input type for the analyzeVisitorReasons function.
 * - AnalyzeVisitorReasonsOutput - The return type for the analyzeVisitorReasons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVisitorReasonsInputSchema = z.object({
  reasonForVisit: z
    .string()
    .describe("The free-text input describing the visitor's reason for visit."),
});
export type AnalyzeVisitorReasonsInput = z.infer<
  typeof AnalyzeVisitorReasonsInputSchema
>;

const AnalyzeVisitorReasonsOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('A list of categories that best describe the reason for visit.'),
  commonThemes: z
    .array(z.string())
    .describe('A list of common themes identified in the reason for visit.'),
  summary: z.string().describe('A brief summary of the reason for visit.'),
});
export type AnalyzeVisitorReasonsOutput = z.infer<
  typeof AnalyzeVisitorReasonsOutputSchema
>;

export async function analyzeVisitorReasons(
  input: AnalyzeVisitorReasonsInput
): Promise<AnalyzeVisitorReasonsOutput> {
  return analyzeVisitorReasonsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVisitorReasonsPrompt',
  input: {schema: AnalyzeVisitorReasonsInputSchema},
  output: {schema: AnalyzeVisitorReasonsOutputSchema},
  prompt: `You are an expert assistant for a library administrator. Your task is to analyze the provided 'Reason for Visit' text.
Based on the text, you need to:
1. Identify and list distinct categories that the reason falls into.
2. Extract and list any common themes or key topics present in the text.
3. Provide a concise summary of the reason for visit.

Reason for Visit: {{{reasonForVisit}}}`,
});

const analyzeVisitorReasonsFlow = ai.defineFlow(
  {
    name: 'analyzeVisitorReasonsFlow',
    inputSchema: AnalyzeVisitorReasonsInputSchema,
    outputSchema: AnalyzeVisitorReasonsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
