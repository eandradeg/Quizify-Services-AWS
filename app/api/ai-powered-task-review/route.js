import { aiPoweredTaskReview } from '@/ai/flows/ai-powered-task-review';

export async function POST(request) {
  const body = await request.json();
  const result = await aiPoweredTaskReview(body);
  return Response.json(result);
}
