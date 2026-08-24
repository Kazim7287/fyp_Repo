require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log("🚀 Flood Forecasting API Started");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 http://localhost:${PORT}/db-test`);
  console.log("====================================");
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});