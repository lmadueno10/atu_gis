const validateToken = require("./validateToken");

module.exports = async function verifyClient(info, done, pgClient) {
    const params = new URLSearchParams(info.req.url.split("?")[1]);
    const token = params.get("token");

    if (!token) {
        return done(false, 401);
    }

    try {
        const tokenValidation = await validateToken(pgClient, token);

        if (!tokenValidation.isValid) {
            return done(false, 403);
        }

        info.req.tokenValidation = tokenValidation;
        done(true);
    } catch (err) {
        console.error("Error validando el token:", err);
        return done(false, 500);
    }
};