import { Router } from "express";
import * as sportsController from "./sports.controller";
import { createSportSchema, updateSportSchema } from "./sports.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

export const sportsRouter = Router();

sportsRouter.use(verifyToken);

sportsRouter.get("/", sportsController.listSports);
sportsRouter.get("/:id", sportsController.getSport);

sportsRouter.post(
  "/",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(createSportSchema),
  sportsController.createSport,
);
sportsRouter.patch(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(updateSportSchema),
  sportsController.updateSport,
);
sportsRouter.delete(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  sportsController.deleteSport,
);
