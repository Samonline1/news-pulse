const clusterService = require("../services/cluster.service");
const { errorResponse, successResponse } = require("../utils/apiResponse");

async function getClusters(req, res, next) {
  try {
    const clusters = await clusterService.getAllClusters();

    return res.status(200).json(successResponse(clusters, clusters.length ? undefined : "No clusters found"));
  } catch (error) {
    return next(error);
  }
}

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

module.exports = {
  getClusters,
  getClusterById,
};
