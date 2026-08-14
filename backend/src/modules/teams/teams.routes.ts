import { Router } from "express";
import * as teamsController from "./teams.controller";
import {
  createTeamSchema,
  updateTeamSchema,
  addSquadMemberSchema,
  assignStaffSchema,
} from "./teams.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

export const teamsRouter = Router();

teamsRouter.use(verifyToken);

teamsRouter.get("/", teamsController.listTeams);
teamsRouter.get("/:id/squad", teamsController.getTeamSquad);
teamsRouter.get("/:id/staff", teamsController.getTeamStaff);
teamsRouter.get("/:id", teamsController.getTeam);

teamsRouter.post(
  "/",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(createTeamSchema),
  teamsController.createTeam,
);
teamsRouter.patch(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(updateTeamSchema),
  teamsController.updateTeam,
);
teamsRouter.delete(
  "/:id",
  requireRole(UserRole.SPORTS_ADMIN),
  teamsController.deleteTeam,
);

teamsRouter.post(
  "/:id/squad",
  requireRole(UserRole.SPORTS_ADMIN, UserRole.COACH),
  validate(addSquadMemberSchema),
  teamsController.addSquadMember,
);
teamsRouter.delete(
  "/:id/squad/:athleteId",
  requireRole(UserRole.SPORTS_ADMIN),
  teamsController.removeSquadMember,
);

teamsRouter.post(
  "/:id/staff",
  requireRole(UserRole.SPORTS_ADMIN),
  validate(assignStaffSchema),
  teamsController.assignStaff,
);
teamsRouter.delete(
  "/:id/staff/:staffId",
  requireRole(UserRole.SPORTS_ADMIN),
  teamsController.removeStaff,
);
