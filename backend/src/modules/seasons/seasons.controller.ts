import { Request, Response, NextFunction } from "express";
import * as seasonsService from "./seasons.service";
import {
  CreateSeasonInput,
  UpdateSeasonInput,
  listSeasonsQuerySchema,
} from "./seasons.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

async function listSeasons(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listSeasonsQuerySchema.parse(req.query);
    const result = await seasonsService.listSeasons(query);
    res.status(200).json({
      success: true,
      data: result.seasons,
      pagination: result.pagination,
      message: "Seasons fetched",
    });
  } catch (err) {
    next(err);
  }
}

async function getSeason(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const season = await seasonsService.getSeasonById(req.params.id);
    res
      .status(200)
      .json({ success: true, data: season, message: "Season fetched" });
  } catch (err) {
    next(err);
  }
}

async function createSeason(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateSeasonInput;
    const season = await seasonsService.createSeason(input, req.user!.id);
    res
      .status(201)
      .json({ success: true, data: season, message: "Season created" });
  } catch (err) {
    next(err);
  }
}

async function updateSeason(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as UpdateSeasonInput;
    const season = await seasonsService.updateSeason(req.params.id, input);
    res
      .status(200)
      .json({ success: true, data: season, message: "Season updated" });
  } catch (err) {
    next(err);
  }
}

async function deleteSeason(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await seasonsService.deleteSeason(req.params.id);
    res.status(200).json({ success: true, message: "Season deleted" });
  } catch (err) {
    next(err);
  }
}

export { listSeasons, getSeason, createSeason, updateSeason, deleteSeason };
