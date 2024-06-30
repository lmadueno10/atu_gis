const bcrypt = require("bcryptjs");

const users = [
    {
        id: 1,
        email: "lmaduenosanchez@gmail.com",
        password: "$2a$10$V1EFO1t6M1ZqW5U8jBqPNeWQ/A2LzLv4ItmX4Ib/hzhL1IcHlqGHa",
    },
];

const basicAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Missing Authorization header" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [email, password] = credentials.split(":");

    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(401).json({ message: "Invalid Authentication Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid Authentication Credentials" });
    }

    req.user = user;
    next();
};

module.exports = basicAuthMiddleware;
