const express = require("express");
const cors = require("cors");

const clusterRoutes = require("./routes/cluster.routes");
const ingestRoutes = require("./routes/ingest.routes");
const healthRoutes = require("./routes/healthRoutes");
const timelineRoutes = require("./routes/timeline.routes");
const { errorResponse } = require("./utils/apiResponse");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/", healthRoutes);
  app.use("/api/ingest", ingestRoutes);
  app.use("/api/clusters", clusterRoutes);
  app.use("/api/timeline", timelineRoutes);

  app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    return res.status(500).json(errorResponse("Internal server error"));
  });

  return app;
}

module.exports = createApp;
