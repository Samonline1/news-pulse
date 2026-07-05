const express = require("express");
const { getTimeline } = require("../controllers/timeline.controller");

const router = express.Router();

// Timeline route
router.get("/", getTimeline);

module.exports = router;
