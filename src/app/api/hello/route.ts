import { InvalidNameError } from "@/core/domain/greeting/greeting.errors";
import { GreetingService } from "@/service/greeting/greeting.service";
import type { ErrorResponse } from "../openapi/common.schema";
import { HelloQuerySchema, type HelloResponse } from "./hello.schema";

const greetingService = new GreetingService();

export function GET(request: Request) {
  const query = HelloQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );

  if (!query.success) {
    return badRequest(query.error.issues[0].message);
  }

  try {
    const greeting = greetingService.getGreeting(query.data.name);
    const body: HelloResponse = {
      message: greeting.message,
      timestamp: greeting.createdAt.toISOString(),
    };
    return Response.json(body);
  } catch (error) {
    if (error instanceof InvalidNameError) {
      return badRequest(error.message);
    }
    throw error;
  }
}

function badRequest(message: string) {
  const body: ErrorResponse = { error: message };
  return Response.json(body, { status: 400 });
}
