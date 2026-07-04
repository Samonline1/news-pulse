const clusterService = require("../services/cluster.service");

async function getTimeline(req, res, next) {
  try {
    const timeline = await clusterService.getTimeline();

    if (!timeline.length) {
      return res.status(200).json({
        message: "No timeline data",
        data: [],
      });
    }

    return res.status(200).json({
      data: timeline,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTimeline,
};
