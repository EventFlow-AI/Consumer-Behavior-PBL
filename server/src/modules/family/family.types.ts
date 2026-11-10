export interface MemberLocationUpdate {
  userId: string;
  groupId: string;
  name: string;
  latitude: number;
  longitude: number;
  batteryPct: number;
  isSharing: boolean;
  updatedAt?: string;
}

export interface FamilyGroupData {
  id: string;
  eventId?: string | null;
  name: string;
  inviteCode: string;
  createdById: string;
  createdAt: Date;
  members: FamilyMemberData[];
  meetingPoints: MeetingPointData[];
}

export interface FamilyMemberData {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  relation: string;
  initial: string;
  avatarColor: string;
  isSharing: boolean;
  lastLat: number | null;
  lastLng: number | null;
  batteryPct: number;
  lastUpdatedMinsAgo: number;
  phone: string | null;
}

export interface MeetingPointData {
  id: string;
  groupId: string;
  name: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
}

