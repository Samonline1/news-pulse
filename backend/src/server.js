require("dotenv").config();

const createApp = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`News Pulse backend running on port ${PORT}`);
  });

  try {
    await connectDB(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
