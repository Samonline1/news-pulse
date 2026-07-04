require("dotenv").config();

const createApp = require("./app");
const { connectDB } = require("./config/db");

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || "development";

async function startServer() {
  const app = createApp();
  try {
    await connectDB(MONGODB_URI);
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`News Pulse backend running on port ${PORT} (${NODE_ENV})`);
    });

    server.on("error", (error) => {
      console.error("Server failed to start:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
