const express = require("express");
const { triggerIngestion } = require("../controllers/ingest.controller");

const router = express.Router();

router.post("/trigger", triggerIngestion);

module.exports = router;
