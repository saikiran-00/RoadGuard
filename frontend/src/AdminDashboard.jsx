import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./AdminDashboard.css";

function AdminDashboard() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("adminToken");

    // Fetch all reports
    const fetchReports = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/reports"
            );

            setReports(response.data.reports || []);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // Mark report as completed
    const markCompleted = async (reportId) => {

        try {

            await axios.patch(
                `http://localhost:5000/api/admin/reports/${reportId}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Failed to complete report:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to mark report completed"
            );
        }
    };

    // Load reports + Socket.IO
    useEffect(() => {

        fetchReports();

        const socket = io(
            "http://localhost:5000"
        );

        socket.on(
            "new-report",
            (newReport) => {

                setReports((currentReports) => {

                    const exists =
                        currentReports.some(
                            (report) =>
                                report._id ===
                                newReport._id
                        );

                    if (exists) {
                        return currentReports;
                    }

                    return [
                        newReport,
                        ...currentReports
                    ];
                });
            }
        );

        socket.on(
            "report-completed",
            (completedReport) => {

                setReports((currentReports) =>
                    currentReports.map(
                        (report) =>
                            report._id ===
                            completedReport._id
                                ? completedReport
                                : report
                    )
                );
            }
        );

        return () => {
            socket.disconnect();
        };

    }, []);

    // Logout
    const handleLogout = () => {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        window.location.href = "/admin";
    };

    // Statistics
    const totalReports = reports.length;

    const pendingReports =
        reports.filter(
            (report) =>
                report.reportStatus === "Pending"
        ).length;

    const sentReports =
        reports.filter(
            (report) =>
                report.reportStatus === "Sent"
        ).length;

    const completedReports =
        reports.filter(
            (report) =>
                report.reportStatus === "Completed"
        ).length;

    return (

        <div className="admin-dashboard">

            {/* HEADER */}

            <header className="admin-header">

                <div className="admin-brand">

                    <div className="admin-logo">
                        🛡️
                    </div>

                    <div>
                        <h1>RoadGuard Admin</h1>

                        <p>
                            Road Damage Control Center
                        </p>
                    </div>

                </div>

                <div className="admin-header-right">

                    <span className="live-status">
                        ● LIVE
                    </span>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* STATISTICS */}

            <section className="admin-stats">

                <div className="stat-card">
                    <span>Total Reports</span>
                    <strong>{totalReports}</strong>
                </div>

                <div className="stat-card pending-stat">
                    <span>Pending</span>
                    <strong>{pendingReports}</strong>
                </div>

                <div className="stat-card sent-stat">
                    <span>Sent</span>
                    <strong>{sentReports}</strong>
                </div>

                <div className="stat-card completed-stat">
                    <span>Completed</span>
                    <strong>{completedReports}</strong>
                </div>

            </section>


            {/* REPORT MANAGEMENT */}

            <section className="reports-section">

                <div className="section-header">

                    <div>
                        <h2>
                            Road Damage Reports
                        </h2>

                        <p>
                            Monitor and manage citizen reports
                        </p>
                    </div>

                    <span className="live-label">
                        ⚡ Real-time
                    </span>

                </div>


                {loading ? (

                    <div className="loading-box">
                        Loading reports...
                    </div>

                ) : reports.length === 0 ? (

                    <div className="loading-box">
                        No road damage reports found.
                    </div>

                ) : (

                    <div className="reports-grid">

                        {reports.map((report) => {

                            const isCompleted =
                                report.reportStatus ===
                                "Completed";

                            return (

                                <article
                                    className="admin-report-card"
                                    key={report._id}
                                >

                                    {/* IMAGE */}

                                    {report.imageUrl ? (

                                        <img
                                            src={
                                                report.imageUrl
                                            }
                                            alt="Road damage"
                                            className="admin-report-image"
                                        />

                                    ) : (

                                        <div className="no-image">
                                            🚧
                                            <span>
                                                No Image
                                            </span>
                                        </div>

                                    )}


                                    {/* CONTENT */}

                                    <div className="admin-report-content">

                                        <div className="report-title-row">

                                            <h3>
                                                {report.damageType}
                                            </h3>

                                            <span
                                                className={
                                                    isCompleted
                                                        ? "status completed"
                                                        : "status pending"
                                                }
                                            >
                                                {isCompleted
                                                    ? "✓ Completed"
                                                    : "● Pending"}
                                            </span>

                                        </div>


                                        <div className="report-details">

                                            <p>
                                                <b>Severity:</b>{" "}
                                                {report.severity}
                                            </p>

                                            <p>
                                                <b>Source:</b>{" "}
                                                {report.source}
                                            </p>

                                            <p>
                                                <b>Location:</b>{" "}
                                                {Number(
                                                    report.latitude
                                                ).toFixed(5)}
                                                {" , "}
                                                {Number(
                                                    report.longitude
                                                ).toFixed(5)}
                                            </p>

                                            {report.roadName && (

                                                <p>
                                                    <b>Road:</b>{" "}
                                                    {report.roadName}
                                                </p>

                                            )}

                                        </div>


                                        {/* ACTION */}

                                        {!isCompleted ? (

                                            <button
                                                className="complete-button"
                                                onClick={() =>
                                                    markCompleted(
                                                        report._id
                                                    )
                                                }
                                            >
                                                ✓ Mark Work Completed
                                            </button>

                                        ) : (

                                            <div className="completed-box">

                                                <div>
                                                    ✓ Work Completed
                                                </div>

                                                {report.completedAt && (

                                                    <small>
                                                        Completed:{" "}
                                                        {new Date(
                                                            report.completedAt
                                                        ).toLocaleString()}
                                                    </small>

                                                )}

                                                {report.deleteAt && (

                                                    <small>
                                                        🗑️ Auto-delete:{" "}
                                                        {new Date(
                                                            report.deleteAt
                                                        ).toLocaleString()}
                                                    </small>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                </article>

                            );

                        })}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminDashboard;