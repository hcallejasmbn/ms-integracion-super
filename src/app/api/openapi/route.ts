import { openApiDocument } from "./openapi.document";

export function GET() {
  return Response.json(openApiDocument);
}
