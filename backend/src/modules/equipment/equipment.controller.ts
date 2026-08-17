import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as equipmentService from "./equipment.service";
import {
  CreateEquipmentInput,
  UpdateEquipmentInput,
  listEquipmentQuerySchema,
  AssignEquipmentInput,
  ReturnEquipmentInput,
} from "./equipment.schema";

async function listEquipment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listEquipmentQuerySchema.parse(req.query);
    const result = await equipmentService.listEquipment(query);
    res
      .status(200)
      .json({ success: true, ...result, message: "Equipment fetched" });
  } catch (err) {
    next(err);
  }
}

async function getEquipment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await equipmentService.getEquipmentById(req.params.id);
    res
      .status(200)
      .json({ success: true, data: item, message: "Equipment fetched" });
  } catch (err) {
    next(err);
  }
}

async function createEquipment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateEquipmentInput;
    const item = await equipmentService.createEquipment(
      input,
      req.user?.id ?? "",
    );
    res
      .status(201)
      .json({ success: true, data: item, message: "Equipment created" });
  } catch (err) {
    next(err);
  }
}

async function updateEquipment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as UpdateEquipmentInput;
    const item = await equipmentService.updateEquipment(req.params.id, input);
    res
      .status(200)
      .json({ success: true, data: item, message: "Equipment updated" });
  } catch (err) {
    next(err);
  }
}

async function deleteEquipment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await equipmentService.deleteEquipment(req.params.id);
    res.status(200).json({ success: true, message: "Equipment deleted" });
  } catch (err) {
    next(err);
  }
}

async function assignEquipment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as AssignEquipmentInput;
    const assignment = await equipmentService.assignEquipment(
      req.params.id,
      input,
      req.user?.id ?? "",
    );
    res
      .status(201)
      .json({ success: true, data: assignment, message: "Equipment assigned" });
  } catch (err) {
    next(err);
  }
}

async function returnEquipment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as ReturnEquipmentInput;
    const assignment = await equipmentService.returnEquipment(
      req.params.assignmentId,
      input,
    );
    res
      .status(200)
      .json({ success: true, data: assignment, message: "Equipment returned" });
  } catch (err) {
    next(err);
  }
}

async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await equipmentService.deleteAssignment(req.params.assignmentId);
    res
      .status(200)
      .json({ success: true, message: "Assignment removed" });
  } catch (err) {
    next(err);
  }
}

async function listAssignments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const assignments = await equipmentService.getAssignments(req.params.id);
    res
      .status(200)
      .json({ success: true, data: assignments, message: "Assignments fetched" });
  } catch (err) {
    next(err);
  }
}

export {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  returnEquipment,
  deleteAssignment,
  listAssignments,
};
