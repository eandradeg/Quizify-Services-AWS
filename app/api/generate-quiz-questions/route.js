import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';

export async function POST(request) {
  const body = await request.json();
  const result = await generateQuizQuestions(body);
  return Response.json(result);
}
