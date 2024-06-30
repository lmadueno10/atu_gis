const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { PORT } = require("./src/config/config");
const routes = require("./src/routes");

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get("/ping", (_, res) => {
    res.send("pong");
});

// Custom Routes
app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
