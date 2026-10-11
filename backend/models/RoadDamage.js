
const mongoose = require("mongoose");

const roadDamageSchema = new mongoose.Schema(
    {
        // Registered citizen account, if authenticated
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Reporter identity for both registered citizens and guests
        reporterName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        reporterPhone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },

        reporterEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },

        reporterType: {
            type: String,
            enum: ["REGISTERED", "GUEST", "AI"],
            default: "GUEST"
        },

        source: {
            type: String,
            enum: ["MANUAL", "AI"],
            required: true
        },

        damageType: {
            type: String,
            enum: [
                "Pothole",
                "Road Crack",
                "Broken Road",
                "Debris",
                "Waterlogging",
                "Other"
            ],
            required: true
        },

        imageUrl: {
            type: String,
            default: null
        },

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },

        roadName: {
            type: String,
            default: null
        },

        roadType: {
            type: String,
            enum: [
                "National Highway",
                "State Highway",
                "City Road",
                "Rural Road",
                "Other"
            ],
            default: "Other"
        },

        estimatedLength: {
            type: Number,
            default: null
        },

        estimatedWidth: {
            type: Number,
            default: null
        },

        estimatedDepth: {
            type: Number,
            default: null
        },

        severity: {
            type: String,
            enum: ["Low", "Medium", "Critical"],
            default: "Medium"
        },

        authority: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authority",
            default: null
        },

        reportStatus: {
            type: String,
            enum: ["Pending", "Sent", "Completed"],
            default: "Pending"
        },

        completedAt: {
            type: Date,
            default: null
        },

        deleteAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const RoadDamage = mongoose.model("RoadDamage", roadDamageSchema);

module.exports = RoadDamage;
