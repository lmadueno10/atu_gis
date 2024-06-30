const express = require("express");
const router = express.Router();
const { poolDBBuses } = require("../../config/db");
const { getTransmisiones } = require("../../controllers/transmisionController");

router.get("/", getTransmisiones(poolDBBuses));

module.exports = router;
