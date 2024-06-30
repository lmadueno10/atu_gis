const express = require("express");
const router = express.Router();
const busesRoutes = require("./busesRoutes");
const taxisRoutes = require("./taxisRoutes");
const bicicletasRoutes = require("./bicicletasRoutes");

router.use("/buses", busesRoutes);
router.use("/taxis", taxisRoutes);
router.use("/bicicletas", bicicletasRoutes);

module.exports = router;
