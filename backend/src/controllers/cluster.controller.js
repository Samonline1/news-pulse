const clusterService = require("../services/cluster.service");
const { errorResponse, successResponse } = require("../utils/apiResponse");

// List view
async function getClusters(req, res, next) {
  try {
    const clusters = await clusterService.getAllClusters();

    return res.status(200).json(successResponse(clusters, clusters.length ? undefined : "No clusters found"));
  } catch (error) {
    return next(error);
  }
}

// Detail view
async function getClusterById(req, res, next) {
  try {
    const { clusterId } = req.params;

    if (!clusterId || typeof clusterId !== "string") {
      return res.status(400).json(errorResponse("Invalid clusterId"));
    }

    const result = await clusterService.getClusterDetails(clusterId);

    if (!result) {
      return res.status(404).json(errorResponse("Cluster not found"));
    }

    return res.status(200).json(successResponse(result));
  } catch (error) {
    return next(error);
  }
}

// Summary view
async function getClusterSummary(req, res, next) {
  try {
    const { clusterId } = req.params;

    if (!clusterId || typeof clusterId !== "string") {
      return res.status(400).json(errorResponse("Invalid clusterId"));
    }

    const result = await clusterService.getClusterSummary(clusterId);

    if (!result) {
      return res.status(404).json(errorResponse("Cluster not found"));
    }

    return res.status(200).json(successResponse(result));
  } catch (error) {
    return res.status(500).json(errorResponse("Failed to generate cluster summary"));
  }
}

// Refresh summary
async function refreshClusterSummary(req, res, next) {
  try {
    const { clusterId } = req.params;

    if (!clusterId || typeof clusterId !== "string") {
      return res.status(400).json(errorResponse("Invalid clusterId"));
    }

    const result = await clusterService.refreshClusterSummary(clusterId);

    if (!result) {
      return res.status(404).json(errorResponse("Cluster not found"));
    }

    return res.status(200).json(successResponse(result));
  } catch (error) {
    return res.status(500).json(errorResponse("Failed to refresh cluster summary"));
  }
}

module.exports = {
  getClusters,
  getClusterById,
  getClusterSummary,
  refreshClusterSummary,
};
