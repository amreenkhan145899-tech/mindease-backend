const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        // =========================
        // JOURNAL
        // =========================

        journal: {
            type: String,
            default: ""
        },

        // =========================
        // MOOD HISTORY
        // =========================

        moodHistory: [
            {
                mood: {
                    type: String,
                    required: true
                },

                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("User", userSchema);