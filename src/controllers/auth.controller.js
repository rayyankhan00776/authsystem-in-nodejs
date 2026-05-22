import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import crypto from "crypto";
import { decode } from "punycode";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email or username already exists" });
        }
        // Hash the password using SHA-256
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');


        // Create a new user
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();

        // generating a jwt token
        const accesstoken = jwt.sign({ id: newUser._id }, config.JWT_SECRET, { expiresIn: config.ACCESS_JWT_EXPIRES_IN });
        const refreshtoken = jwt.sign({ id: newUser._id }, config.JWT_SECRET, { expiresIn: config.REFRESH_JWT_EXPIRES_IN });
        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.status(201).json({ message: "User registered successfully", data: { username, email }, accesstoken });



    } catch (error) {
        console.error("Error in register controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getME(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        // since you stored only email in token
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User found successfully",
            user: {
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Error in getME controller:", error);

        // token errors (invalid/expired)
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshtoken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        // since you stored only email in token
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: config.ACCESS_JWT_EXPIRES_IN });
        const newRefreshtoken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, { expiresIn: config.REFRESH_JWT_EXPIRES_IN });

        res.cookie("refreshtoken", newRefreshtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            message: "Access token refreshed successfully",
            accesstoken: newAccessToken,
        });

    } catch (error) {
        console.error("Error in refreshToken controller:", error);

        // token errors (invalid/expired)
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export default { register, getME, refreshToken };