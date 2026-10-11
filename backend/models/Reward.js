const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            enum: [
                "VALID_REPORT",
                "USEFUL_EVIDENCE",
                "DUPLICATE_REPORT"
            ],
            required: true
        },

        points: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;