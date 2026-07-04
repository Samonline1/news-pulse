const express = require("express");
const { getClusters } = require("../controllers/cluster.controller");

const router = express.Router();

router.get("/", getClusters);

module.exports = router;
