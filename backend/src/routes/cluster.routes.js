const express = require("express");
const { getClusterById, getClusters } = require("../controllers/cluster.controller");

const router = express.Router();

// Cluster routes
router.get("/", getClusters);
router.get("/:clusterId", getClusterById);

module.exports = router;
