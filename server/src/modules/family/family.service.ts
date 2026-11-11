import prisma from "../../config/prisma.js";
import {
  FamilyGroupData,
  FamilyMemberData,
  MeetingPointData,
  MemberLocationUpdate,
} from "./family.types.js";

// In-memory store fallback for instant responsiveness & mock mode
const memoryGroups = new Map<string, FamilyGroupData>();
const memoryCodeIndex = new Map<string, string>(); // inviteCode -> groupId

// Seed a default demo family so that initial app tests instantly show rich data
const seedDemoGroup = () => {
  const groupId = "grp_demo_sharma";
  const code = "EVF-782";

  const group: FamilyGroupData = {
    id: groupId,
    name: "Sharma Family Circle",
    inviteCode: code,
    createdById: "usr_mom",
    createdAt: new Date(),
    members: [
      {
        id: "mem_mom",
        groupId,
        userId: "usr_mom",
        name: "Sunita Sharma",
        relation: "Mom",
        initial: "M",
        avatarColor: "#006C4A",
        isSharing: true,
        lastLat: 25.3176,
        lastLng: 82.9739,
        batteryPct: 82,
        lastUpdatedMinsAgo: 1,
        phone: "+91 98765 43210",
      },
      {
        id: "mem_brother",
        groupId,
        userId: "usr_rahul",
        name: "Rahul Sharma",
        relation: "Brother",
        initial: "R",
        avatarColor: "#0A2540",
        isSharing: true,
        lastLat: 25.3182,
        lastLng: 82.9725,
        batteryPct: 45,
        lastUpdatedMinsAgo: 2,
        phone: "+91 98765 43211",
      },
      {
        id: "mem_grandpa",
        groupId,
        userId: "usr_om",
        name: "Om Prakash",
        relation: "Grandfather",
        initial: "G",
        avatarColor: "#C68A00",
        isSharing: true,
        lastLat: 25.3168,
        lastLng: 82.9745,
        batteryPct: 91,
        lastUpdatedMinsAgo: 1,
        phone: "+91 98765 43212",
      },
    ],
    meetingPoints: [
      {
        id: "mp_1",
        groupId,
        name: "Sector 4 Main Medical & Info Kiosk",
        landmark: "Next to Big Blue Light Tower #4",
        latitude: 25.3172,
        longitude: 25.3172,
      },
    ],
  };

  memoryGroups.set(groupId, group);
  memoryCodeIndex.set(code, groupId);
};

seedDemoGroup();

const generateInviteCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EVF-";
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export class FamilyService {
  static async createGroup(
    userId: string,
    name: string,
    userName = "Admin",
    eventId?: string
  ): Promise<FamilyGroupData> {
    const inviteCode = generateInviteCode();
    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newGroup: FamilyGroupData = {
      id: groupId,
      name,
      inviteCode,
      createdById: userId,
      eventId: eventId || null,
      createdAt: new Date(),
      members: [
        {
          id: `mem_${Date.now()}`,
          groupId,
          userId,
          name: userName,
          relation: "Me (Organizer)",
          initial: userName.charAt(0).toUpperCase() || "U",
          avatarColor: "#006C4A",
          isSharing: true,
          lastLat: null,
          lastLng: null,
          batteryPct: 100,
          lastUpdatedMinsAgo: 0,
          phone: null,
        },
      ],
      meetingPoints: [],
    };

    memoryGroups.set(groupId, newGroup);
    memoryCodeIndex.set(inviteCode, groupId);

    try {
      // If DB is reachable, persist
      await prisma.familyGroup.create({
        data: {
          id: groupId,
          name,
          inviteCode,
          createdById: userId,
          eventId,
        },
      });
    } catch {
      // Fallback in-memory
    }

    return newGroup;
  }

  static async joinGroupByCode(
    userId: string,
    inviteCode: string,
    memberName: string,
    relation = "Member",
    phone?: string
  ): Promise<FamilyGroupData | null> {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const groupId = memoryCodeIndex.get(normalizedCode);
    if (!groupId) return null;

    const group = memoryGroups.get(groupId);
    if (!group) return null;

    // Check if member already exists
    const existing = group.members.find((m) => m.userId === userId);
    if (!existing) {
      const colors = ["#006C4A", "#0A2540", "#C68A00", "#7B1FA2", "#C2185B"];
      const randomColor = colors[group.members.length % colors.length];

      const newMember: FamilyMemberData = {
        id: `mem_${Date.now()}`,
        groupId,
        userId,
        name: memberName,
        relation,
        initial: memberName.charAt(0).toUpperCase() || "K",
        avatarColor: randomColor,
        isSharing: true,
        lastLat: null,
        lastLng: null,
        batteryPct: 90,
        lastUpdatedMinsAgo: 0,
        phone: phone || null,
      };

      group.members.push(newMember);
    }

    return group;
  }

  static async getActiveGroupForUser(userId: string): Promise<FamilyGroupData | null> {
    for (const group of memoryGroups.values()) {
      if (group.members.some((m) => m.userId === userId)) {
        return group;
      }
    }
    // Return demo group if user has not created or joined any group yet
    return memoryGroups.get("grp_demo_sharma") || null;
  }

  static async updateLocation(
    userId: string,
    data: {
      latitude: number;
      longitude: number;
      batteryPct?: number;
      isSharing?: boolean;
    }
  ): Promise<MemberLocationUpdate | null> {
    for (const group of memoryGroups.values()) {
      const member = group.members.find((m) => m.userId === userId);
      if (member) {
        member.lastLat = data.latitude;
        member.lastLng = data.longitude;
        if (data.batteryPct !== undefined) member.batteryPct = data.batteryPct;
        if (data.isSharing !== undefined) member.isSharing = data.isSharing;
        member.lastUpdatedMinsAgo = 0;

        return {
          userId,
          groupId: group.id,
          name: member.name,
          latitude: data.latitude,
          longitude: data.longitude,
          batteryPct: member.batteryPct,
          isSharing: member.isSharing,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    return null;
  }

  static async addMeetingPoint(
    groupId: string,
    data: { name: string; landmark?: string; latitude: number; longitude: number }
  ): Promise<MeetingPointData | null> {
    const group = memoryGroups.get(groupId);
    if (!group) return null;

    const mp: MeetingPointData = {
      id: `mp_${Date.now()}`,
      groupId,
      name: data.name,
      landmark: data.landmark || null,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    group.meetingPoints.push(mp);
    return mp;
  }
}

