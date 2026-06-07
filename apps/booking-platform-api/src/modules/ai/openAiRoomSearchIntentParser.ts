import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { logger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { SUPPORTED_ROOM_AMENITIES, SUPPORTED_ROOM_LOCATIONS } from "../../config/constants";
import { roomSearchIntentProviderResponseSchema } from "./ai.schemas";
import { RoomSearchIntentParser, RoomSearchIntentRequest, RoomSearchIntentResponse } from "./ai.types";

interface OpenAiResponseContent {
  type?: string;
  text?: string;
}

interface OpenAiResponseOutput {
  content?: OpenAiResponseContent[];
}

interface OpenAiResponse {
  output_text?: string;
  output?: OpenAiResponseOutput[];
}

export class OpenAiRoomSearchIntentParser implements RoomSearchIntentParser {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = env.ai.openAiModel
  ) {}

  public async parseRoomSearchIntent(correlationId: string, request: RoomSearchIntentRequest): Promise<RoomSearchIntentResponse> {
    const methodName = "OpenAiRoomSearchIntentParser/parseRoomSearchIntent";

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: "system",
              content: this.buildSystemPrompt(),
            },
            {
              role: "user",
              content: JSON.stringify({
                prompt: request.prompt,
                timezone: request.timezone || "UTC",
                currentDate: new Date().toISOString(),
              }),
            },
          ],
        }),
      });
    } catch (error: unknown) {
      logger.error(correlationId, `${methodName} - error: provider request failed`, { error });
      throw createAppError(ErrorCodes.AI_PROVIDER_ERROR);
    }

    if (!response.ok) {
      const body = await response.text();
      logger.error(correlationId, `${methodName} - error: provider request failed`, {
        status: response.status,
        body,
      });
      throw createAppError(ErrorCodes.AI_PROVIDER_ERROR);
    }

    const data = (await response.json()) as OpenAiResponse;
    const text = this.extractText(data);

    try {
      const parsed = roomSearchIntentProviderResponseSchema.parse(JSON.parse(text));
      return {
        source: "openai",
        intent: parsed.intent,
      };
    } catch (error: unknown) {
      logger.error(correlationId, `${methodName} - error: invalid provider response`, { error, text });
      throw createAppError(ErrorCodes.AI_INVALID_RESPONSE);
    }
  }

  private buildSystemPrompt(): string {
    return [
      "Extract a room search intent from the user's request.",
      "Return only strict JSON with this shape: {\"intent\":{\"location\":\"Tel Aviv\",\"capacity\":2,\"capacityMode\":\"EXACT\",\"startTime\":\"2026-06-03T10:00:00.000Z\",\"endTime\":\"2026-06-04T10:00:00.000Z\",\"amenities\":[\"WIFI\"]}}.",
      `Allowed locations: ${SUPPORTED_ROOM_LOCATIONS.join(", ")}.`,
      `Allowed amenities: ${SUPPORTED_ROOM_AMENITIES.join(", ")}.`,
      "capacity means number of people or guests.",
      "Set capacityMode to EXACT whenever the user asks for N people, N guests, or an N person room.",
      "Set capacityMode to AT_LEAST only when the user explicitly says at least, minimum, or N or more people.",
      "Use the provided currentDate and timezone to resolve relative dates.",
      "For phrases like next week, in 3 days, 2 weeks from now, tomorrow, or next year, infer startTime from currentDate.",
      "For phrases like 10 days period, 10 day stay, for 10 days, 4 weeks period, or for 2 nights, infer endTime from the inferred startTime.",
      "When a date is relative but no hour is stated, use 15:00 UTC for startTime and 11:00 UTC for endTime.",
      "When a start date is stated but no duration or end date is stated, use a 1 day stay.",
      "Use ISO 8601 UTC strings for all inferred dates.",
      "Omit only fields that are not stated and cannot be reasonably inferred from the rules above.",
      "Never include explanations or markdown.",
    ].join(" ");
  }

  private extractText(data: OpenAiResponse): string {
    if (data.output_text) {
      return data.output_text;
    }

    const text = data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text)
      .filter((value): value is string => Boolean(value))
      .join("");

    if (!text) {
      throw createAppError(ErrorCodes.AI_INVALID_RESPONSE);
    }

    return text;
  }
}