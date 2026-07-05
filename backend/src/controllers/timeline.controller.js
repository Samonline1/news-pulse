const clusterService = require("../services/cluster.service");
const { successResponse } = require("../utils/apiResponse");

// Timeline
async function getTimeline(req, res, next) {
  try {
    const timeline = await clusterService.getTimeline();

    return res.status(200).json(successResponse(timeline, timeline.length ? undefined : "No timeline data"));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTimeline,
};
