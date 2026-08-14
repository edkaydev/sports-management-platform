import { Request, Response, NextFunction } from "express";
import * as sportsService from "./sports.service";
import {
  CreateSportInput,
  UpdateSportInput,
  listSportsQuerySchema,
} from "./sports.schema";

async function listSports(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listSportsQuerySchema.parse(req.query);
    const sports = await sportsService.listSports(query);
    res
      .status(200)
      .json({ success: true, data: sports, message: "Sports fetched" });
  } catch (err) {
    next(err);
  }
}

async function getSport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sport = await sportsService.getSportById(req.params.id);
    res
      .status(200)
      .json({ success: true, data: sport, message: "Sport fetched" });
  } catch (err) {
    next(err);
  }
}

async function createSport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateSportInput;
    const sport = await sportsService.createSport(input);
    res
      .status(201)
      .json({ success: true, data: sport, message: "Sport created" });
  } catch (err) {
    next(err);
  }
}

async function updateSport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as UpdateSportInput;
    const sport = await sportsService.updateSport(req.params.id, input);
    res
      .status(200)
      .json({ success: true, data: sport, message: "Sport updated" });
  } catch (err) {
    next(err);
  }
}

async function deleteSport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await sportsService.deleteSport(req.params.id);
    res.status(200).json({ success: true, message: "Sport deactivated" });
  } catch (err) {
    next(err);
  }
}

export { listSports, getSport, createSport, updateSport, deleteSport };
