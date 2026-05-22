import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import crypto from "crypto";

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

        // generating a jwt token
        const token = jwt.sign({ email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

        // Create a new user
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", data: { username, email }, token });

    }catch (error) {
        console.error("Error in register controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export default { register };