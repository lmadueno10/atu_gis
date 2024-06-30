const { INSPECTOR_API_TOKEN } = require("./config");

module.exports = async function verifyClient(info, done) {
    const params = new URLSearchParams(info.req.url.split("?")[1]);
    const token = params.get("token");

    if (!token) {
        return done(false, 401);
    }

    if (token !== INSPECTOR_API_TOKEN) {
        return done(false, 403);
    }

    info.req.tokenValidation = { isValid: true, token };
    done(true);
};
