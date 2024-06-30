const express = require("express");
const router = express.Router();
const transRoutes = require("./transmisiones");
const fiscatuRoutes = require("./fiscatu");

router.use("/transmisiones", transRoutes);
router.use("/inspectores", fiscatuRoutes);

module.exports = router;
