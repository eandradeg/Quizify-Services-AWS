
'use server';
/**
 * @fileOverview An AI-powered task review agent.
 *
 * - aiPoweredTaskReview - A function that handles the task review process.
 * - AiPoweredTaskReviewInput - The input type for the aiPoweredTaskReview function.
 * - AiPoweredTaskReviewOutput - The return type for the aiPoweredTaskReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredTaskReviewInputSchema = z.object({
  homeworkDataUri: z
    .string()
    .describe(
      "A homework document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  contextDataUris: z
    .array(z.string())
    .max(5)
    .optional()
    .describe(
      "Contextual documents related to the homework, as an array of data URIs. Each URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Up to 5 documents."
    ),
  educationalLevel: z.string().describe('The educational level of the student.'),
});
export type AiPoweredTaskReviewInput = z.infer<typeof AiPoweredTaskReviewInputSchema>;

const AiPoweredTaskReviewOutputSchema = z.object({
  feedback: z.string().describe('Detailed feedback, corrections, and suggestions for the homework.'),
});
export type AiPoweredTaskReviewOutput = z.infer<typeof AiPoweredTaskReviewOutputSchema>;

export async function aiPoweredTaskReview(input: AiPoweredTaskReviewInput): Promise<AiPoweredTaskReviewOutput> {
  return aiPoweredTaskReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredTaskReviewPrompt',
  input: {schema: AiPoweredTaskReviewInputSchema},
  output: {schema: AiPoweredTaskReviewOutputSchema},
  prompt: `You are an AI-powered educational assistant specializing in providing feedback on student homework.

You will receive the student's homework and any related contextual documents. Based on this information, you will provide detailed feedback, corrections, and suggestions tailored to the student's educational level.

Homework: {{media url=homeworkDataUri}}

{{#if contextDataUris.length}}
Contextual Documents:
{{#each contextDataUris}}
  {{media url=this}}
{{/each}}
{{else}}
No contextual documents provided.
{{/if}}

Educational Level: {{{educationalLevel}}}

Provide specific and actionable feedback to help the student improve their understanding and performance. Focus on areas where the student can enhance their work and offer suggestions for further learning. Be positive and encouraging in your feedback.
`,
});

const aiPoweredTaskReviewFlow = ai.defineFlow(
  {
    name: 'aiPoweredTaskReviewFlow',
    inputSchema: AiPoweredTaskReviewInputSchema,
    outputSchema: AiPoweredTaskReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
