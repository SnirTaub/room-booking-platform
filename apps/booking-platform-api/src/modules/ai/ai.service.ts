import { logger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { roomSearchIntentRequestSchema } from "./ai.schemas";
import { OpenAiRoomSearchIntentParser } from "./openAiRoomSearchIntentParser";
import { RoomSearchIntent, RoomSearchIntentParser, RoomSearchIntentRequest, RoomSearchIntentResponse } from "./ai.types";

export class AiService {
  constructor(private readonly parser: RoomSearchIntentParser) {}

  public async parseRoomSearchIntent(correlationId: string, request: RoomSearchIntentRequest): Promise<RoomSearchIntentResponse> {
    const methodName = "AiService/parseRoomSearchIntent";

    const parsedRequest = roomSearchIntentRequestSchema.parse(request);

    logger.info(correlationId, `${methodName} - start - input parameters`, {
      promptLength: parsedRequest.prompt.length,
      timezone: parsedRequest.timezone,
    });

    const result: RoomSearchIntentResponse = await this.parser.parseRoomSearchIntent(correlationId, parsedRequest);
    const intent: RoomSearchIntent = this.normalizeIntent(result.intent);

    logger.info(correlationId, `${methodName} - end - result: intent parsed`, {
      source: result.source,
      fields: Object.keys(intent),
    });

    return {
      ...result,
      intent,
    };
  }

  private normalizeIntent(intent: RoomSearchIntent): RoomSearchIntent {
    if (!intent.capacity || intent.capacityMode) {
      return intent;
    }

    return {
      ...intent,
      capacityMode: "EXACT",
    };
  }
}

export const aiService = new AiService(new OpenAiRoomSearchIntentParser(env.ai.openAiApiKey));