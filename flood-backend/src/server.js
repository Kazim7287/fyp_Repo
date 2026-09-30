require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const PORT = process.env.PORT || 5000;

// =========================================================
// HTTP SERVER
// =========================================================

const server = http.createServer(app);

// =========================================================
// SOCKET.IO SERVER
// =========================================================

const io = new Server(server, {
  cors: {
    origin: [
      // Local development
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",

      // EC2 IPs
      "http://16.171.225.118",
      "http://13.61.106.220",

      // Production
      "http://floodforecast.duckdns.org",
      "https://floodforecast.duckdns.org",

      // Optional environment-based frontend URL
      ...(process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL.trim()]
        : []),
    ],

    credentials: true,

    methods: ["GET", "POST"],
  },

  // Allow both WebSocket and polling fallback
  transports: ["websocket", "polling"],
});

// =========================================================
// MAKE SOCKET.IO AVAILABLE TO EXPRESS
// =========================================================

app.set("io", io);

// =========================================================
// WEBSOCKET CONNECTION
// =========================================================

io.on("connection", (socket) => {
  console.log("====================================");
  console.log("🔌 WebSocket client connected");
  console.log("🆔 Socket ID:", socket.id);
  console.log("🌐 Client:", socket.handshake.headers.origin);
  console.log("====================================");

  socket.on("disconnect", (reason) => {
    console.log(
      "🔌 WebSocket client disconnected:",
      socket.id,
      "| Reason:",
      reason
    );
  });
});

// =========================================================
// START SERVER
// =========================================================

server.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log("🚀 Flood Forecasting API Started");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 http://localhost:${PORT}/db-test`);
  console.log("🔌 WebSocket Server Ready");
  console.log("====================================");
});

// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");

  io.close(() => {
    console.log("WebSocket server closed");
  });

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});