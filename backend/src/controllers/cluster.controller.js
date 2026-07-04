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

module.exports = {
  getClusters,
};
