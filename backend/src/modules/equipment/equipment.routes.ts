import { Router } from "express";
import * as equipmentController from "./equipment.controller";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  assignEquipmentSchema,
  returnEquipmentSchema,
} from "./equipment.schema";
import { validate } from "../../middleware/validate.middleware";
import { verifyToken, requireRole } from "../../middleware/auth.middleware";

export const equipmentRouter = Router();

equipmentRouter.use(verifyToken);

equipmentRouter.get("/", requireRole("TUTOR"), equipmentController.listEquipment);
equipmentRouter.get("/:id", requireRole("TUTOR"), equipmentController.getEquipment);
equipmentRouter.get(
  "/:id/assignments",
  requireRole("TUTOR"),
  equipmentController.listAssignments,
);

equipmentRouter.post(
  "/",
  requireRole("TUTOR"),
  validate(createEquipmentSchema),
  equipmentController.createEquipment,
);
equipmentRouter.patch(
  "/:id",
  requireRole("TUTOR"),
  validate(updateEquipmentSchema),
  equipmentController.updateEquipment,
);
equipmentRouter.delete(
  "/:id",
  requireRole("TUTOR"),
  equipmentController.deleteEquipment,
);

equipmentRouter.post(
  "/:id/assign",
  requireRole("TUTOR"),
  validate(assignEquipmentSchema),
  equipmentController.assignEquipment,
);
equipmentRouter.post(
  "/assignments/:assignmentId/return",
  requireRole("TUTOR"),
  validate(returnEquipmentSchema),
  equipmentController.returnEquipment,
);
equipmentRouter.delete(
  "/assignments/:assignmentId",
  requireRole("TUTOR"),
  equipmentController.deleteAssignment,
);
