import { Router } from "express";
import * as seasonsController from "./seasons.controller";
import { createSeasonSchema, updateSeasonSchema } from "./seasons.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";

export const seasonsRouter = Router();

seasonsRouter.use(verifyToken);

seasonsRouter.get("/", seasonsController.listSeasons);
seasonsRouter.get("/:id", seasonsController.getSeason);

seasonsRouter.post(
  "/",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(createSeasonSchema),
  seasonsController.createSeason,
);
seasonsRouter.patch(
  "/:id",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(updateSeasonSchema),
  seasonsController.updateSeason,
);
seasonsRouter.delete(
  "/:id",
  requireRole("TUTOR"),
  seasonsController.deleteSeason,
);
