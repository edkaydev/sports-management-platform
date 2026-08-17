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

export const teamsRouter = Router();

teamsRouter.use(verifyToken);

teamsRouter.get("/", teamsController.listTeams);
teamsRouter.get("/:id/squad", teamsController.getTeamSquad);
teamsRouter.get("/:id/staff", teamsController.getTeamStaff);
teamsRouter.get("/:id", teamsController.getTeam);

teamsRouter.post(
  "/",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(createTeamSchema),
  teamsController.createTeam,
);
teamsRouter.patch(
  "/:id",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(updateTeamSchema),
  teamsController.updateTeam,
);
teamsRouter.delete(
  "/:id",
  requireRole("TUTOR"),
  teamsController.deleteTeam,
);

teamsRouter.post(
  "/:id/squad",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(addSquadMemberSchema),
  teamsController.addSquadMember,
);
teamsRouter.delete(
  "/:id/squad/:athleteId",
  requireRole("TUTOR", "SPORTS_REP"),
  teamsController.removeSquadMember,
);

teamsRouter.post(
  "/:id/staff",
  requireRole("TUTOR", "SPORTS_REP"),
  validate(assignStaffSchema),
  teamsController.assignStaff,
);
teamsRouter.delete(
  "/:id/staff/:staffId",
  requireRole("TUTOR", "SPORTS_REP"),
  teamsController.removeStaff,
);
