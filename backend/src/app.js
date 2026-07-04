const express = require("express");
const cors = require("cors");

const clusterRoutes = require("./routes/cluster.routes");
const healthRoutes = require("./routes/healthRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/", healthRoutes);
  app.use("/api/clusters", clusterRoutes);

  app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  });

  return app;
}

module.exports = createApp;
