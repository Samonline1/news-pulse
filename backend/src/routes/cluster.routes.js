const express = require("express");
const {
  getClusterById,
  getClusterSummary,
  getClusters,
  refreshClusterSummary,
} = require("../controllers/cluster.controller");

const router = express.Router();

// Cluster routes
router.get("/", getClusters);
router.get("/:clusterId", getClusterById);
router.get("/:clusterId/summary", getClusterSummary);
router.post("/:clusterId/summary/refresh", refreshClusterSummary);

module.exports = router;
