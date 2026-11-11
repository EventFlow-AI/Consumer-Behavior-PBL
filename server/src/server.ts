import http from "http";
import app from "./app.js";
import { FamilySocketServer } from "./modules/family/family.socket.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize real-time family radar socket
FamilySocketServer.init(server);

server.listen(PORT, () => {
  console.log(`EventFlow AI API running on port ${PORT}`);
  console.log(`Kin Radar WebSocket ready at ws://localhost:${PORT}/ws/family`);
});
