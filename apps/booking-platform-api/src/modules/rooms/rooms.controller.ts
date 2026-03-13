import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { roomIdParamsSchema, searchRoomsSchema } from "./rooms.schemas";
import { roomsService } from "./rooms.service";
import { RoomDetails, SearchRoomsQuery, SearchRoomsResponse } from "./rooms.types";

export class RoomsController {
  public async searchRooms(req: Request, res: Response): Promise<void> {
    const parsedQuery: SearchRoomsQuery = searchRoomsSchema.parse(req.query);
    const result: SearchRoomsResponse = await roomsService.searchRooms(parsedQuery);

    res.status(HttpStatusCode.OK).json(result);
  }

  public async getRoomById(req: Request, res: Response): Promise<void> {
    const { roomId } = roomIdParamsSchema.parse(req.params);
    const result: RoomDetails = await roomsService.getRoomById(roomId);

    res.status(HttpStatusCode.OK).json(result);
  }
}

export const roomsController = new RoomsController();