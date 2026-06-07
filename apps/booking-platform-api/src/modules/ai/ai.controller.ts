import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { aiService } from "./ai.service";
import { RoomSearchIntentResponse } from "./ai.types";

export class AiController {
  public async parseRoomSearchIntent(req: Request, res: Response): Promise<void> {
    const result: RoomSearchIntentResponse = await aiService.parseRoomSearchIntent(req.correlationId, req.body);
    res.status(HttpStatusCode.OK).json(result);
  }
}

export const aiController = new AiController();