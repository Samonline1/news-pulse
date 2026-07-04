const Cluster = require("../models/Cluster");
const Article = require("../models/Article");

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

async function getTimeline() {
  const clusters = await Cluster.find(
    {},
    {
      clusterId: 1,
      label: 1,
      articleCount: 1,
      startTime: 1,
      endTime: 1,
    }
  )
    .sort({ startTime: 1 })
    .lean();

  return clusters;
}

async function getClusterDetails(clusterId) {
  const cluster = await Cluster.findOne(
    { clusterId },
    {
      clusterId: 1,
      label: 1,
      articleCount: 1,
      sources: 1,
      startTime: 1,
      endTime: 1,
    }
  ).lean();

  if (!cluster) {
    return null;
  }

  const articles = await Article.find(
    { clusterId },
    {
      title: 1,
      summary: 1,
      source: 1,
      published: 1,
      link: 1,
    }
  )
    .sort({ published: -1 })
    .lean();

  return {
    cluster,
    articles,
  };
}

module.exports = {
  getAllClusters,
  getTimeline,
  getClusterDetails,
};
