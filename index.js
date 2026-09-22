const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// GEMINI AI
// =========================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// =========================
// MONGODB CONNECTION
// =========================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully ✅");
    })
    .catch((error) => {
        console.error(
            "MongoDB Connection Error ❌",
            error.message
        );
    });

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
    res.send("MindEase Backend is Running ✅");
});

// =========================
// SIGNUP API
// =========================

app.post("/api/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Please fill all fields."
            });

        }

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered."
            });

        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const newUser =
            new User({
                name: name,
                email: email.toLowerCase(),
                password: hashedPassword
            });

        await newUser.save();

        console.log(
            "New user registered:",
            email
        );

        return res.status(201).json({
            message:
                "Signup successful! 🎉"
        });

    } catch (error) {

        console.error(
            "Signup Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Signup failed."
        });

    }

});

// =========================
// LOGIN API
// =========================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Please enter email and password."
            });

        }

        const user =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (!user) {

            return res.status(401).json({
                message:
                    "Account not found."
            });

        }

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordCorrect) {

            return res.status(401).json({
                message:
                    "Incorrect password."
            });

        }

        console.log(
            "User logged in:",
            user.email
        );

        return res.status(200).json({

            message:
                "Login successful! 🎉",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Login failed."
        });

    }

});

// =========================
// SAVE JOURNAL API
// =========================

app.post("/api/journal/save", async (req, res) => {

    try {

        const {
            email,
            journal
        } = req.body;

        if (!email) {

            return res.status(400).json({
                message:
                    "User email is required."
            });

        }

        const user =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (!user) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }

        user.journal = journal || "";

        await user.save();

        console.log(
            "Journal saved for:",
            user.email
        );

        return res.status(200).json({
            message:
                "Journal saved successfully! 📝"
        });

    } catch (error) {

        console.error(
            "Journal Save Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Journal save failed."
        });

    }

});

// =========================
// LOAD JOURNAL API
// =========================

app.get("/api/journal/:email", async (req, res) => {

    try {

        const email =
            req.params.email.toLowerCase();

        const user =
            await User.findOne({
                email: email
            });

        if (!user) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }

        return res.status(200).json({

            journal:
                user.journal || ""

        });

    } catch (error) {

        console.error(
            "Journal Load Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Journal load failed."
        });

    }

});

// =========================
// SAVE MOOD API
// =========================

app.post("/api/mood", async (req, res) => {

    try {

        const {
            email,
            mood
        } = req.body;

        if (!email || !mood) {

            return res.status(400).json({
                message:
                    "Email and mood are required."
            });

        }

        const user =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (!user) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }

        user.moodHistory.push({
            mood: mood,
            date: new Date()
        });

        await user.save();

        console.log(
            "Mood saved:",
            mood,
            "for:",
            user.email
        );

        return res.status(200).json({
            message:
                "Mood saved successfully! 😊"
        });

    } catch (error) {

        console.error(
            "Mood Save Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Mood save failed."
        });

    }

});

// =========================
// GET MOOD HISTORY API
// =========================

app.get("/api/mood/:email", async (req, res) => {

    try {

        const email =
            req.params.email.toLowerCase();

        const user =
            await User.findOne({
                email: email
            });

        if (!user) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }

        return res.status(200).json({

            moodHistory:
                user.moodHistory || []

        });

    } catch (error) {

        console.error(
            "Mood History Error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Mood history load failed."
        });

    }

});

// =========================
// AI CHAT API
// =========================

app.post("/api/chat", async (req, res) => {

    console.log("🔥 CHAT API HIT");

    try {

        const {
            message
        } = req.body;

        if (
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                reply:
                    "Please type something 😊"
            });

        }

        console.log(
            "User message:",
            message
        );

        const response =
            await ai.models.generateContent({

                model:
                    "gemini-3.6-flash",

                contents:
                    message,

                config: {

                    systemInstruction:
                        "You are MindEase, a friendly and supportive wellness chatbot. " +
                        "Reply in simple, warm Hinglish when the user uses Hinglish, " +
                        "and use English when the user uses English. " +
                        "Keep replies short, positive and easy to understand. " +
                        "You are not a doctor or therapist, so do not give medical diagnoses."

                }

            });

        const reply =
            response.text;

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "GEMINI ERROR MESSAGE:",
            error.message
        );

        res.status(500).json({

            reply:
                error.message

        });

    }

});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log(
        `MindEase AI Backend running on http://localhost:${PORT}`
    );

});