import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/ai-powered-task-review.ts';
import '@/ai/flows/extract-document-content.ts';