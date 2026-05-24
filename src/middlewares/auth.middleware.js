import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import sessionModel from "../models/session.model.js";

export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        if (!decoded?.id || !decoded?.sessionId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const session = await sessionModel.findOne({
            _id: decoded.sessionId,
            user: decoded.id,
            revoked: false,
        });

        if (!session) {
            return res.status(401).json({ message: "Session revoked" });
        }

        req.user = {
            id: decoded.id,
            sessionId: decoded.sessionId,
        };

        return next();
    } catch (error) {
        if (error?.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default authMiddleware;
