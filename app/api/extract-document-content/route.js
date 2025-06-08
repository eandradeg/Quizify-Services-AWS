import { extractDocumentContent } from '@/ai/flows/extract-document-content';

export async function POST(request) {
  const body = await request.json();
  const result = await extractDocumentContent(body);
  return Response.json(result);
}
