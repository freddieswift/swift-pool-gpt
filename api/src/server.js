import { app } from "./app.js";
import { connectDatabase, sequelize } from "./config/database.js";
import { env } from "./config/env.js";
import "./models/index.js";

let server;

async function start() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.log(`SwiftPool API listening on port ${env.PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await sequelize.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((error) => {
  console.error("Failed to start SwiftPool API:", error);
  process.exit(1);
});
