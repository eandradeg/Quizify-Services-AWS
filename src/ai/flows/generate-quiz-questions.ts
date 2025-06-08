
'use server';

/**
 * @fileOverview A quiz question generator AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to generate quiz questions from.'),
  numberOfQuestions: z
    .number()
    .default(5)
    .describe('The number of quiz questions to generate.'),
  questionTypePreference: z
    .enum(['multiple_choice', 'true_false', 'fill_in_the_blank', 'combined'])
    .default('combined')
    .describe(
      "The preferred type of questions to generate: 'multiple_choice', 'true_false', 'fill_in_the_blank', or 'combined' for a mix of all types."
    ),
});
export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const MultipleChoiceQuestionSchema = z.object({
  type: z.string().describe("The type of question. Must be 'multiple_choice'."),
  question: z.string().describe('The text of the multiple choice question.'),
  options: z.array(z.string()).describe('The possible answers to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});

const TrueFalseQuestionSchema = z.object({
  type: z.string().describe("The type of question. Must be 'true_false'."),
  question: z.string().describe('The text of the true/false question.'),
  correctAnswer: z.union([z.literal('true'), z.literal('false')]).describe('The correct answer to the question (true or false).'),
});

const FillInTheBlankQuestionSchema = z.object({
  type: z.string().describe("The type of question. Must be 'fill_in_the_blank'."),
  question: z.string().describe('The question text with a placeholder (e.g., "____" or "[BLANK]") for the answer.'),
  correctAnswer: z.string().describe('The word or phrase that correctly fills the blank.'),
});

const QuizQuestionSchema = z.union([
  MultipleChoiceQuestionSchema,
  TrueFalseQuestionSchema,
  FillInTheBlankQuestionSchema,
]);

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert quiz generator for teachers.

  You will generate questions based on the provided document content and the specified question type preference.
  Ensure the questions are relevant to the content.
  The output should be a JSON object with a 'questions' field containing an array of question objects.

  Question Type Preference: {{questionTypePreference}}

  Guidance based on questionTypePreference:
  - If 'multiple_choice', generate ONLY multiple-choice questions.
  - If 'true_false', generate ONLY true/false questions.
  - If 'fill_in_the_blank', generate ONLY fill-in-the-blank questions.
  - If 'combined' (or if not specified), generate a mix of multiple-choice, true/false, and fill-in-the-blank questions.

  For multiple-choice questions:
  - The 'type' field must be 'multiple_choice'.
  - The 'question' field should contain the text of the question.
  - The 'options' field should contain an array of possible answers.
  - The 'correctAnswer' field should contain the correct answer from the options.

  For true/false questions:
  - The 'type' field must be 'true_false'.
  - The 'question' field should contain the text of the question.
  - The 'correctAnswer' field should be either 'true' or 'false'.

  For fill-in-the-blank questions:
  - The 'type' field must be 'fill_in_the_blank'.
  - The 'question' field should contain the question text with a placeholder like "____" or "[BLANK]" indicating where the answer should go (e.g., "The capital of France is ____.").
  - The 'correctAnswer' field should contain the word or phrase that fills the blank.

  Generate {{numberOfQuestions}} questions.

  Document Content: {{{documentContent}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
