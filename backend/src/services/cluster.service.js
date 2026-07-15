const Cluster = require("../models/Cluster");
const Article = require("../models/Article");
const { generateSummary } = require("./ai.service");

function toPublicCluster(cluster) {
  if (!cluster) {
    return cluster;
  }

  const { _id, keywords, articleIds, createdAt, ...publicCluster } = cluster;
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
      summary: 1,
      summaryStatus: 1,
      summaryGeneratedAt: 1,
      summaryArticleCount: 1,
      lastArticleUpdatedAt: 1,
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

async function getClusterSummary(clusterId) {
  const cluster = await Cluster.findOne({ clusterId }).lean();
  if (!cluster) {
    return null;
  }

  if (cluster.summary && cluster.summaryStatus === "ready") {
    console.log("[AI] Returning cached summary");
    return {
      summary: cluster.summary,
      summaryGeneratedAt: cluster.summaryGeneratedAt,
      summaryArticleCount: cluster.summaryArticleCount,
      lastArticleUpdatedAt: cluster.lastArticleUpdatedAt,
      summaryStatus: cluster.summaryStatus,
    };
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

  await Cluster.updateOne(
    { clusterId },
    {
      $set: {
        summaryStatus: "generating",
      },
    }
  );

  try {
    console.log(`[AI] Generating summary for cluster ${clusterId}`);
    const summary = await generateSummary(articles);
    const updatedAt = new Date();

    await Cluster.updateOne(
      { clusterId },
      {
        $set: {
          summary,
          summaryGeneratedAt: updatedAt,
          summaryArticleCount: articles.length,
          summaryStatus: "ready",
        },
      }
    );

    console.log("[AI] Summary generated successfully");

    return {
      summary,
      summaryGeneratedAt: updatedAt,
      summaryArticleCount: articles.length,
      lastArticleUpdatedAt: cluster.lastArticleUpdatedAt,
      summaryStatus: "ready",
    };
  } catch (error) {
    await Cluster.updateOne(
      { clusterId },
      {
        $set: {
          summaryStatus: "failed",
        },
      }
    );
    console.log("[AI] Failed generating summary");
    console.log(error);
    throw error;
  }
}

async function refreshClusterSummary(clusterId) {
  const cluster = await Cluster.findOne({ clusterId }).lean();
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

  await Cluster.updateOne(
    { clusterId },
    {
      $set: {
        summaryStatus: "generating",
      },
    }
  );

  try {
    console.log(`[AI] Refreshing stale summary`);
    const summary = await generateSummary(articles);
    const updatedAt = new Date();

    await Cluster.updateOne(
      { clusterId },
      {
        $set: {
          summary,
          summaryGeneratedAt: updatedAt,
          summaryArticleCount: articles.length,
          summaryStatus: "ready",
        },
      }
    );

    console.log("[AI] Summary generated successfully");

    return {
      summary,
      summaryGeneratedAt: updatedAt,
      summaryArticleCount: articles.length,
      lastArticleUpdatedAt: cluster.lastArticleUpdatedAt,
      summaryStatus: "ready",
    };
  } catch (error) {
    await Cluster.updateOne(
      { clusterId },
      {
        $set: {
          summaryStatus: "failed",
        },
      }
    );
    console.log("[AI] Failed generating summary");
    console.log(error);
    throw error;
  }
}

module.exports = {
  getAllClusters,
  getTimeline,
  getClusterDetails,
  getClusterSummary,
  refreshClusterSummary,
};
