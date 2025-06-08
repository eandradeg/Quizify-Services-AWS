'use server';

/**
 * @fileOverview Extracts content from documents (PDF, images, text) using GenAI.
 *
 * - extractDocumentContent - A function that handles the document content extraction process.
 * - ExtractDocumentContentInput - The input type for the extractDocumentContent function.
 * - ExtractDocumentContentOutput - The return type for the extractDocumentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDocumentContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document (PDF, image, or text file) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDocumentContentInput = z.infer<typeof ExtractDocumentContentInputSchema>;

const ExtractDocumentContentOutputSchema = z.object({
  extractedContent: z
    .string()
    .describe('The extracted text content from the document.'),
});
export type ExtractDocumentContentOutput = z.infer<typeof ExtractDocumentContentOutputSchema>;

export async function extractDocumentContent(
  input: ExtractDocumentContentInput
): Promise<ExtractDocumentContentOutput> {
  return extractDocumentContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDocumentContentPrompt',
  input: {schema: ExtractDocumentContentInputSchema},
  output: {schema: ExtractDocumentContentOutputSchema},
  prompt: `You are an expert in extracting text from documents. You will receive a document in the form of a data URI.  Extract all the text from the document.  Return the extracted text. Document: {{media url=documentDataUri}}`,
});

const extractDocumentContentFlow = ai.defineFlow(
  {
    name: 'extractDocumentContentFlow',
    inputSchema: ExtractDocumentContentInputSchema,
    outputSchema: ExtractDocumentContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
