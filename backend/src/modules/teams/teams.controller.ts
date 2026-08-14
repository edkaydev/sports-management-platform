import { Request, Response, NextFunction } from "express";
import * as teamsService from "./teams.service";
import {
  CreateTeamInput,
  UpdateTeamInput,
  AddSquadMemberInput,
  AssignStaffInput,
  listTeamsQuerySchema,
} from "./teams.schema";

async function listTeams(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listTeamsQuerySchema.parse(req.query);
    const result = await teamsService.listTeams(query);
    res.status(200).json({
      success: true,
      data: result.teams,
      pagination: result.pagination,
      message: "Teams fetched",
    });
  } catch (err) {
    next(err);
  }
}

async function getTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const team = await teamsService.getTeamById(req.params.id);
    res
      .status(200)
      .json({ success: true, data: team, message: "Team fetched" });
  } catch (err) {
    next(err);
  }
}

async function createTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateTeamInput;
    const team = await teamsService.createTeam(input);
    res
      .status(201)
      .json({ success: true, data: team, message: "Team created" });
  } catch (err) {
    next(err);
  }
}

async function updateTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as UpdateTeamInput;
    const team = await teamsService.updateTeam(req.params.id, input);
    res
      .status(200)
      .json({ success: true, data: team, message: "Team updated" });
  } catch (err) {
    next(err);
  }
}

async function deleteTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await teamsService.deleteTeam(req.params.id);
    res.status(200).json({ success: true, message: "Team deleted" });
  } catch (err) {
    next(err);
  }
}

async function getTeamSquad(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const squad = await teamsService.getTeamSquad(req.params.id);
    res
      .status(200)
      .json({ success: true, data: squad, message: "Squad fetched" });
  } catch (err) {
    next(err);
  }
}

async function addSquadMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as AddSquadMemberInput;
    const entry = await teamsService.addSquadMember(req.params.id, input);
    res
      .status(201)
      .json({ success: true, data: entry, message: "Athlete added to squad" });
  } catch (err) {
    next(err);
  }
}

async function removeSquadMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await teamsService.removeSquadMember(req.params.id, req.params.athleteId);
    res
      .status(200)
      .json({ success: true, message: "Athlete removed from squad" });
  } catch (err) {
    next(err);
  }
}

async function getTeamStaff(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const staff = await teamsService.getTeamStaff(req.params.id);
    res
      .status(200)
      .json({ success: true, data: staff, message: "Staff fetched" });
  } catch (err) {
    next(err);
  }
}

async function assignStaff(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as AssignStaffInput;
    const staff = await teamsService.assignStaff(req.params.id, input);
    res
      .status(201)
      .json({ success: true, data: staff, message: "Staff assigned" });
  } catch (err) {
    next(err);
  }
}

async function removeStaff(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await teamsService.removeStaff(req.params.staffId);
    res.status(200).json({ success: true, message: "Staff removed" });
  } catch (err) {
    next(err);
  }
}

export {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamSquad,
  addSquadMember,
  removeSquadMember,
  getTeamStaff,
  assignStaff,
  removeStaff,
};
