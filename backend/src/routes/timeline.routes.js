const express = require("express");
const { getTimeline } = require("../controllers/timeline.controller");

const router = express.Router();

router.get("/", getTimeline);

module.exports = router;
