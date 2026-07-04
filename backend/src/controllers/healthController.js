const { getDBState } = require("../config/db");

function getHealth(req, res) {
  if (getDBState() === "connected") {
    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  }

  return res.status(503).json({
    status: "error",
  });
}

module.exports = {
  getHealth,
};
