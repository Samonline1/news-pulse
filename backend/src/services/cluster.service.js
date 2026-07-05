const Cluster = require("../models/Cluster");
const Article = require("../models/Article");

function toPublicCluster(cluster) {
  if (!cluster) {
    return cluster;
  }

  const {
    _id,
    keywords,
    articleIds,
    createdAt,
    ...publicCluster
  } = cluster;

  return publicCluster;
}

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
      _id: 0,
    }
  )
    .sort({ startTime: -1 })
    .lean();

  return clusters.map(toPublicCluster);
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
      _id: 0,
    }
  )
    .sort({ endTime: -1, startTime: -1 })
    .lean();

  return clusters.map(toPublicCluster);
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
      _id: 0,
    }
  ).lean();

  if (!cluster) {
    return null;
  }

  const articles = await Article.find(
    { clusterId },
    {
      _id: 0,
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
    cluster: toPublicCluster(cluster),
    articles,
  };
}

module.exports = {
  getAllClusters,
  getTimeline,
  getClusterDetails,
};
