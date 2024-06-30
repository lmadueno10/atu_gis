const express = require("express");
const router = express.Router();
const { poolDBTaxis } = require("../../config/db");
const { getTransmisiones } = require("../../controllers/transmisionController");

router.get("/", getTransmisiones(poolDBTaxis));

module.exports = router;
