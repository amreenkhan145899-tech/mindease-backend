const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("MindEase Backend is Running ✅");
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                reply: "Please type something 😊"
            });
        }

        console.log("User message:", message);

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: message,
            config: {
                systemInstruction:
                    "You are MindEase, a friendly and supportive wellness chatbot. " +
                    "Reply in simple, warm Hinglish when the user uses Hinglish, " +
                    "and use English when the user uses English. " +
                    "Keep replies short, positive and easy to understand. " +
                    "You are not a doctor or therapist, so do not give medical diagnoses."
            }
        });

        const reply = response.text;

        res.json({ reply });

    } catch (error) {
        console.error("GEMINI ERROR MESSAGE:", error.message);

        res.status(500).json({
            reply: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`MindEase AI Backend running on http://localhost:${PORT}`);
});
