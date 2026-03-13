import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { roomIdParamsSchema, searchRoomsSchema } from "./rooms.schemas";
import { roomsService } from "./rooms.service";
import { RoomDetails, SearchRoomsQuery, SearchRoomsResponse } from "./rooms.types";
import { logger } from "../../common/utils/logger";

export class RoomsController {
  public async searchRooms(req: Request, res: Response): Promise<void> {
    const methodName = "RoomsController/searchRooms";

    logger.info(req.correlationId, `${methodName} - start - input parameters`, { query: req.query });

    const parsedQuery: SearchRoomsQuery = searchRoomsSchema.parse(req.query);
    const result: SearchRoomsResponse = await roomsService.searchRooms(req.correlationId, parsedQuery);

    logger.info(req.correlationId, `${methodName} - end - result: rooms fetched`, { page: result.page, limit: result.limit, total: result.total });

    res.status(HttpStatusCode.OK).json(result);
  }

  public async getRoomById(req: Request, res: Response): Promise<void> {
    const methodName = "RoomsController/getRoomById";

    logger.info(req.correlationId, `${methodName} - start - input parameters`, { params: req.params });

    const { roomId } = roomIdParamsSchema.parse(req.params);
    const result: RoomDetails = await roomsService.getRoomById(req.correlationId, roomId);

    logger.info(req.correlationId, `${methodName} - end - result: room fetched`, { roomId: result.id });

    res.status(HttpStatusCode.OK).json(result);
  }
}

export const roomsController = new RoomsController();