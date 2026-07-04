const Cluster = require("../models/Cluster");

async function getAllClusters() {
  const clusters = await Cluster.find(
    {},
    {
      clusterId: 1,
      label: 1,
      articleCount: 1,
      sources: 1,
      startTime: 1,
      endTime: 1,
    }
  )
    .sort({ startTime: -1 })
    .lean();

  return clusters;
}

module.exports = {
  getAllClusters,
};
