const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "NHAI",
                "State PWD",
                "Municipal Corporation",
                "Rural Road Authority",
                "Other"
            ],
            required: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },

        phone: {
            type: String,
            default: null
        },

        website: {
            type: String,
            default: null
        },

        area: {
            type: String,
            required: true,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Authority = mongoose.model("Authority", authoritySchema);

module.exports = Authority;