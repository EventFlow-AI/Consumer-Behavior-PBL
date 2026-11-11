import { Request, Response } from "express";
import { FamilyService } from "./family.service.js";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

function getParamId(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export const createGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || "usr_guest";
    const { name, userName, eventId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const group = await FamilyService.createGroup(userId, name, userName, eventId);

    return res.status(201).json({
      success: true,
      message: "Family circle created successfully",
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating group",
      error: (error as Error).message,
    });
  }
};

export const joinGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId || `usr_${Date.now()}`;
    const { inviteCode, memberName, relation, phone } = req.body;

    if (!inviteCode || !memberName) {
      return res.status(400).json({
        success: false,
        message: "Invite code and member name are required",
      });
    }

    const group = await FamilyService.joinGroupByCode(
      userId,
      inviteCode,
      memberName,
      relation,
      phone
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired family group code",
      });
    }

    return res.json({
      success: true,
      message: `Joined ${group.name} successfully`,
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while joining group",
      error: (error as Error).message,
    });
  }
};

export const getActiveGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || (req.query.userId as string) || "usr_mom";
    const group = await FamilyService.getActiveGroupForUser(userId);

    return res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching group",
      error: (error as Error).message,
    });
  }
};

export const updateLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { latitude, longitude, batteryPct, isSharing } = req.body;

    if (latitude === undefined || longitude === undefined || !userId) {
      return res.status(400).json({
        success: false,
        message: "userId, latitude, and longitude are required",
      });
    }

    const updated = await FamilyService.updateLocation(userId, {
      latitude,
      longitude,
      batteryPct,
      isSharing,
    });

    return res.json({
      success: true,
      message: "Location updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating location",
      error: (error as Error).message,
    });
  }
};

export const addMeetingPoint = async (req: Request, res: Response) => {
  try {
    const groupId = getParamId(req.params.groupId);
    const { name, landmark, latitude, longitude } = req.body;

    if (!groupId || !name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "groupId, name, latitude, and longitude are required",
      });
    }

    const mp = await FamilyService.addMeetingPoint(groupId, {
      name,
      landmark,
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: "Meeting point added",
      data: mp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding meeting point",
      error: (error as Error).message,
    });
  }
};

