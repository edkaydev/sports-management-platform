import { Router } from "express";
import * as seasonsController from "./seasons.controller";
import { createSeasonSchema, updateSeasonSchema } from "./seasons.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

export const seasonsRouter = Router();

seasonsRouter.use(verifyToken);

seasonsRouter.get("/", seasonsController.listSeasons);
seasonsRouter.get("/:id", seasonsController.getSeason);

seasonsRouter.post(
  "/",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(createSeasonSchema),
  seasonsController.createSeason,
);
seasonsRouter.patch(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(updateSeasonSchema),
  seasonsController.updateSeason,
);
seasonsRouter.delete(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  seasonsController.deleteSeason,
);
