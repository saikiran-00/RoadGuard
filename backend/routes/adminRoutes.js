
const express = require("express");
const mongoose = require("mongoose");

const RoadDamage = require("../models/RoadDamage");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// ==========================================
// GET ALL REPORTS WITH REPORTER DETAILS
// ADMIN ONLY
// ==========================================
router.get("/reports", adminAuth, async (req, res) => {
    try {
        const reports = await RoadDamage.find()
            .select(
                "_id reportedBy reporterName reporterPhone reporterEmail reporterType source damageType imageUrl latitude longitude roadName roadType estimatedLength estimatedWidth estimatedDepth severity authority reportStatus createdAt completedAt deleteAt"
            )
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ reports });
    } catch (error) {
        console.error("Failed to fetch admin reports:", error);

        return res.status(500).json({
            message: "Failed to fetch road damage reports"
        });
    }
});

// ==========================================
// MARK ROAD DAMAGE AS COMPLETED
// ==========================================
router.patch(
    "/reports/:id/complete",
    adminAuth,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid report ID"
                });
            }

            const report = await RoadDamage.findById(id);

            if (!report) {
                return res.status(404).json({
                    message: "Road damage report not found"
                });
            }

            if (report.reportStatus === "Completed") {
                return res.status(200).json({
                    message: "Report is already completed",
                    report
                });
            }

            const completedAt = new Date();

            const deleteAt = new Date(
                completedAt.getTime() + 7 * 24 * 60 * 60 * 1000
            );

            report.reportStatus = "Completed";
            report.completedAt = completedAt;
            report.deleteAt = deleteAt;

            const updatedReport = await report.save();

            const io = req.app.get("io");

            if (io) {
                // Do not broadcast reporter contact details.
                io.emit("report-completed", {
                    _id: updatedReport._id,
                    reportStatus: updatedReport.reportStatus,
                    completedAt: updatedReport.completedAt,
                    deleteAt: updatedReport.deleteAt
                });
            }

            return res.status(200).json({
                message: "Road damage marked as completed",
                report: updatedReport
            });
        } catch (error) {
            console.error("Failed to complete report:", error);

            return res.status(500).json({
                message: "Failed to complete road damage report"
            });
        }
    }
);

module.exports = router;
