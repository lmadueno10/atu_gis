const express = require("express");
const router = express.Router();
const { poolDBBicicletas } = require("../../config/db");
const { getTransmisiones } = require("../../controllers/transmisionController");

router.get("/", getTransmisiones(poolDBBicicletas));

module.exports = router;
