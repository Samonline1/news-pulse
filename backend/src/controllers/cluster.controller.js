const clusterService = require("../services/cluster.service");

async function getClusters(req, res, next) {
  try {
    const clusters = await clusterService.getAllClusters();

    if (!clusters.length) {
      return res.status(200).json({
        message: "No clusters found",
        data: [],
      });
    }

    return res.status(200).json({
      data: clusters,
    });
  } catch (error) {
    return next(error);
  }
}

async function getClusterById(req, res, next) {
  try {
    const { clusterId } = req.params;
    const result = await clusterService.getClusterDetails(clusterId);

    if (!result) {
      return res.status(404).json({
        message: "Cluster not found",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getClusters,
  getClusterById,
};
