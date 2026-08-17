import { Router } from "express";
import * as sportsController from "./sports.controller";
import { createSportSchema, updateSportSchema } from "./sports.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";

export const sportsRouter = Router();

sportsRouter.use(verifyToken);

sportsRouter.get("/", sportsController.listSports);
sportsRouter.get("/:id", sportsController.getSport);

sportsRouter.post(
  "/",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(createSportSchema),
  sportsController.createSport,
);
sportsRouter.patch(
  "/:id",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(updateSportSchema),
  sportsController.updateSport,
);
sportsRouter.delete(
  "/:id",
  requireRole("TUTOR"),
  sportsController.deleteSport,
);
