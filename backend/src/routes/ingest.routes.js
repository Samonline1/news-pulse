const express = require("express");
const { triggerIngestion } = require("../controllers/ingest.controller");

const router = express.Router();

// Ingest route
router.post("/trigger", triggerIngestion);

module.exports = router;
