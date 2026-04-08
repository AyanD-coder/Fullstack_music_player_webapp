const jwt = require("jsonwebtoken");

function getToken(req) {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader
        ? authHeader.replace(/^Bearer\s+/i, "").trim()
        : null;

    return cookieToken || bearerToken;
}

function authenticate(req, res, next) {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Unauthorized" });
    }
}

function authArtist(req, res, next) {
    authenticate(req, res, () => {
        if (req.user.role !== "artist") {
            return res.status(403).json({ message: "You dont have access" });
        }

        next();
    });
}

function authUser(req, res, next) {
    authenticate(req, res, next);
}

module.exports = { authenticate, authArtist, authUser };
