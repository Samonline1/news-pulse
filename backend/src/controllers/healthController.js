const { getDBState } = require("../config/db");
const { errorResponse, successResponse } = require("../utils/apiResponse");

// Health
function getHealth(req, res) {
  if (getDBState() === "connected") {
    return res.status(200).json(successResponse({ database: "connected" }, "Service healthy"));
  }

  return res.status(503).json(errorResponse("Service unavailable"));
}

module.exports = {
  getHealth,
};
