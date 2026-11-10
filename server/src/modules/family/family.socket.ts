import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { FamilyService } from "./family.service.js";

interface FamilyClient {
  ws: WebSocket;
  userId: string;
  groupId: string;
}

export class FamilySocketServer {
  private static wss: WebSocketServer;
  private static clients: Map<string, FamilyClient> = new Map(); // socketId -> client

  static init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: "/ws/family" });

    this.wss.on("connection", (ws, req) => {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId") || `usr_${Date.now()}`;
      const groupId = url.searchParams.get("groupId") || "grp_demo_sharma";
      const clientId = `${groupId}_${userId}_${Math.random().toString(36).substring(2, 7)}`;

      const client: FamilyClient = { ws, userId, groupId };
      this.clients.set(clientId, client);

      console.log(`[Family WS] Connected: User ${userId} in Group ${groupId}`);

      ws.send(
        JSON.stringify({
          type: "CONNECTED",
          message: `Connected to Kin Radar socket for group ${groupId}`,
          userId,
          groupId,
        })
      );

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());

          switch (message.type) {
            case "LOCATION_UPDATE": {
              const { latitude, longitude, batteryPct, isSharing } = message;
              const update = await FamilyService.updateLocation(userId, {
                latitude,
                longitude,
                batteryPct,
                isSharing,
              });

              // Broadcast new coordinate to all group members
              this.broadcastToGroup(groupId, {
                type: "MEMBER_LOCATION_CHANGED",
                data: update,
              }, ws);
              break;
            }

            case "RING_BUZZER": {
              const { targetUserId } = message;
              this.broadcastToGroup(groupId, {
                type: "BUZZER_TRIGGERED",
                fromUserId: userId,
                targetUserId,
                timestamp: new Date().toISOString(),
              });
              break;
            }

            case "SOS_ALERT": {
              this.broadcastToGroup(groupId, {
                type: "FAMILY_SOS_TRIGGERED",
                fromUserId: userId,
                message: message.message || "Urgent: Family member needs help!",
                latitude: message.latitude,
                longitude: message.longitude,
                timestamp: new Date().toISOString(),
              });
              break;
            }

            default:
              break;
          }
        } catch (err) {
          console.error("[Family WS] Message error:", err);
        }
      });

      ws.on("close", () => {
        this.clients.delete(clientId);
        console.log(`[Family WS] Disconnected: User ${userId}`);
      });
    });
  }

  static broadcastToGroup(groupId: string, payload: unknown, excludeWs?: WebSocket) {
    const raw = JSON.stringify(payload);
    for (const client of this.clients.values()) {
      if (client.groupId === groupId && client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(raw);
      }
    }
  }
}

