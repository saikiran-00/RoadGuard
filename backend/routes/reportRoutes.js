
const express = require("express");
const jwt = require("jsonwebtoken");

const RoadDamage = require("../models/RoadDamage");
const User = require("../models/User");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Validation helpers
const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizePhone = (phone) =>
    String(phone || "").replace(/[\s()-]/g, "");

const isValidIndianMobile = (phone) =>
    /^(?:\+?91)?[6-9]\d{9}$/.test(phone);

// POST /api/reports
// Create a road damage report as a guest or registered citizen
router.post("/", upload.single("image"), async (req, res) => {
    try {
        let reportedBy = null;
        let reporterName = "";
        let reporterPhone = "";
        let reporterEmail = null;
        let reporterType = "GUEST";

        // 1. Identify registered citizens from their JWT
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            let decoded;

            try {
                if (!process.env.JWT_SECRET) {
                    console.error("JWT_SECRET is not configured.");

                    return res.status(500).json({
                        message: "Authentication is not configured."
                    });
                }

                decoded = jwt.verify(
                    authHeader.slice(7),
                    process.env.JWT_SECRET
                );
            } catch {
                return res.status(401).json({
                    message: "Your session is invalid. Please sign in again."
                });
            }

            if (decoded.role !== "CITIZEN" || !decoded.userId) {
                return res.status(401).json({
                    message: "A valid citizen account is required."
                });
            }

            const user = await User.findById(decoded.userId);

            if (!user || user.isActive === false) {
                return res.status(401).json({
                    message: "Citizen account not found or inactive."
                });
            }

            reportedBy = user._id;
            reporterName = user.name;
            reporterEmail = user.email || null;
            reporterPhone = normalizePhone(user.phone);
            reporterType = "REGISTERED";

            // If the registered account has no phone, ask for one
            if (!reporterPhone) {
                reporterPhone = normalizePhone(req.body.reporterPhone);
            }
        } else {
            // 2. Guest submissions must include contact details
            reporterName = String(
                req.body.reporterName || ""
            ).trim();

            reporterPhone = normalizePhone(
                req.body.reporterPhone
            );

            reporterEmail = String(
                req.body.reporterEmail || ""
            ).trim().toLowerCase() || null;
        }

        // 3. Validate reporter identity
        if (
            !reporterName ||
            reporterName.length > 100
        ) {
            return res.status(400).json({
                message: "Please provide a valid reporter name."
            });
        }

        if (!isValidIndianMobile(reporterPhone)) {
            return res.status(400).json({
                message: "Please enter a valid Indian mobile number."
            });
        }

        // Store phone numbers in a consistent format
        if (/^\+?91/.test(reporterPhone)) {
            reporterPhone = reporterPhone.replace(/^\+?91/, "");
        }

        if (
            reporterEmail &&
            (
                reporterEmail.length > 254 ||
                !isValidEmail(reporterEmail)
            )
        ) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 4. Validate damage type
        const allowedDamageTypes = [
            "Pothole",
            "Road Crack",
            "Broken Road",
            "Debris",
            "Waterlogging",
            "Other"
        ];

        const damageType = String(
            req.body.damageType || ""
        ).trim();

        if (!allowedDamageTypes.includes(damageType)) {
            return res.status(400).json({
                message: "Please select a valid damage type."
            });
        }

        // 5. Validate severity
        const allowedSeverities = [
            "Low",
            "Medium",
            "Critical"
        ];

        const severity = String(
            req.body.severity || "Medium"
        ).trim();

        if (!allowedSeverities.includes(severity)) {
            return res.status(400).json({
                message: "Please select a valid severity."
            });
        }

        // 6. Validate road type
        const allowedRoadTypes = [
            "National Highway",
            "State Highway",
            "City Road",
            "Rural Road",
            "Other"
        ];

        const roadType = String(
            req.body.roadType || "Other"
        ).trim();

        if (!allowedRoadTypes.includes(roadType)) {
            return res.status(400).json({
                message: "Please select a valid road type."
            });
        }

        // 7. Validate GPS coordinates
        const latitude = Number(req.body.latitude);
        const longitude = Number(req.body.longitude);

        if (
            req.body.latitude === undefined ||
            req.body.longitude === undefined ||
            req.body.latitude === "" ||
            req.body.longitude === "" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                message: "Please select a valid report location."
            });
        }

        // 8. Require a photo
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a road damage photo."
            });
        }

        if (!req.file.mimetype?.startsWith("image/")) {
            return res.status(400).json({
                message: "The uploaded file must be an image."
            });
        }

        // 9. Upload image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "roadguard",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(req.file.buffer);
        });

        // 10. Save report in MongoDB
        const report = await RoadDamage.create({
            reportedBy,
            reporterName,
            reporterPhone,
            reporterEmail,
            reporterType,

            source: "MANUAL",
            damageType,
            imageUrl: uploadResult.secure_url,
            latitude,
            longitude,
            roadName: String(
                req.body.roadName || "Unknown"
            ).trim(),
            roadType,
            severity,
            reportStatus: "Pending"
        });

        // 11. Notify connected clients
        // Do not broadcast private reporter contact details.
        const io = req.app.get("io");

        if (io) {
            io.emit("new-report", {
                _id: report._id,
                source: report.source,
                damageType: report.damageType,
                imageUrl: report.imageUrl,
                latitude: report.latitude,
                longitude: report.longitude,
                roadName: report.roadName,
                roadType: report.roadType,
                severity: report.severity,
                reportStatus: report.reportStatus,
                createdAt: report.createdAt
            });
        }

        // 12. Return the created report to the submitter
        return res.status(201).json({
            message: "Road damage report submitted successfully.",
            report: {
                _id: report._id,
                reporterName: report.reporterName,
                reporterType: report.reporterType,
                source: report.source,
                damageType: report.damageType,
                imageUrl: report.imageUrl,
                latitude: report.latitude,
                longitude: report.longitude,
                roadName: report.roadName,
                roadType: report.roadType,
                severity: report.severity,
                reportStatus: report.reportStatus,
                createdAt: report.createdAt
            }
        });
    } catch (error) {
        console.error("Create report error:", error);

        return res.status(500).json({
            message: "Failed to create road damage report."
        });
    }
});

// GET /api/reports
// Public map/list endpoint: never expose reporter contact details
router.get("/", async (req, res) => {
    try {
        const reports = await RoadDamage.find()
            .select(
                "_id source damageType imageUrl latitude longitude roadName roadType estimatedLength estimatedWidth estimatedDepth severity reportStatus createdAt completedAt"
            )
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(reports);
    } catch (error) {
        console.error("Fetch reports error:", error);

        return res.status(500).json({
            message: "Failed to fetch road damage reports."
        });
    }
});

module.exports = router;
