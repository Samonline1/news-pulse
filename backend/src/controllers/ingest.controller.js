const ingestService = require("../services/ingest.service");

async function triggerIngestion(req, res, next) {
  try {
    const result = await ingestService.triggerIngestion();

    if (result.stdout) {
      console.log(result.stdout);
    }

    return res.status(200).json({
      success: true,
      message: "Ingestion completed successfully",
      summary: result.summary,
    });
  } catch (error) {
    if (error && error.type) {
      if (error.stdout) {
        console.log(error.stdout);
      }
      if (error.stderr) {
        console.error(error.stderr);
      }

      return res.status(500).json({
        message: "Ingestion failed",
        error: error.stderr || error.message || "Unknown error",
      });
    }

    return next(error);
  }
}

module.exports = {
  triggerIngestion,
};
