const ingestService = require("../services/ingest.service");
const { errorResponse, successResponse } = require("../utils/apiResponse");

async function triggerIngestion(req, res, next) {
  try {
    const result = ingestService.triggerIngestion();

    if (!result.started) {
      return res.status(409).json(
        errorResponse("Ingestion already in progress.")
      );
    }

    return res
      .status(202)
      .json(successResponse(null, "News ingestion started."));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  triggerIngestion,
};
