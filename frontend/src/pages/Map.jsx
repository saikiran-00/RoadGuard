import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../Map.css";


// ==========================================
// FIT MAP TO ROAD DAMAGE REPORTS
// ==========================================

function FitMapToReports({ reports }) {

    const map = useMap();

    useEffect(() => {

        if (reports.length === 0) {
            return;
        }

        const bounds = reports.map((report) => [
            Number(report.latitude),
            Number(report.longitude)
        ]);

        map.fitBounds(bounds, {
            padding: [50, 50]
        });

    }, [reports, map]);

    return null;
}


// ==========================================
// FOLLOW LIVE GPS LOCATION
// ==========================================

function FollowUserLocation({ location }) {

    const map = useMap();

    useEffect(() => {

        if (!location) {
            return;
        }

        map.setView(
            [
                location.latitude,
                location.longitude
            ],
            16
        );

    }, [location, map]);

    return null;
}


// ==========================================
// MAIN MAP COMPONENT
// ==========================================

function Map() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const [liveLocation, setLiveLocation] =
        useState(null);

    const [watchId, setWatchId] =
        useState(null);

    const [gpsMessage, setGpsMessage] =
        useState("");


    // ==========================================
    // FETCH EXISTING REPORTS
    // ==========================================

    useEffect(() => {

        const fetchReports = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:5000/api/reports"
                );

                console.log(
                    "Reports received:",
                    response.data
                );

                setReports(
                    response.data.reports
                );

            } catch (error) {

                console.error(
                    "Failed to fetch reports:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        fetchReports();

    }, []);


    // ==========================================
    // SOCKET.IO REAL-TIME REPORTS
    // ==========================================

    useEffect(() => {

        const socket = io(
            "http://localhost:5000"
        );


        socket.on("connect", () => {

            console.log(
                "🟢 Connected to RoadGuard Socket.IO:",
                socket.id
            );

        });


        socket.on(
            "new-report",
            (newReport) => {

                console.log(
                    "🚧 New road damage received:",
                    newReport
                );


                setReports(
                    (currentReports) => {

                        const alreadyExists =
                            currentReports.some(
                                (report) =>
                                    report._id ===
                                    newReport._id
                            );


                        if (alreadyExists) {

                            return currentReports;

                        }


                        return [
                            newReport,
                            ...currentReports
                        ];

                    }
                );

            }
        );


        socket.on("disconnect", () => {

            console.log(
                "🔴 Disconnected from RoadGuard Socket.IO"
            );

        });


        return () => {

            socket.disconnect();

        };

    }, []);


    // ==========================================
    // START LIVE GPS
    // ==========================================

    const startLiveLocation = () => {

        if (!navigator.geolocation) {

            setGpsMessage(
                "GPS is not supported by this browser."
            );

            return;
        }


        setGpsMessage(
            "📍 Getting your live location..."
        );


        const id =
            navigator.geolocation.watchPosition(

                (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    const accuracy =
                        position.coords.accuracy;


                    setLiveLocation({
                        latitude,
                        longitude,
                        accuracy
                    });


                    setGpsMessage(
                        "🟢 Live GPS is active"
                    );

                },

                (error) => {

                    console.error(error);

                    setGpsMessage(
                        "Unable to access your GPS location."
                    );

                },

                {
                    enableHighAccuracy: true,
                    maximumAge: 2000,
                    timeout: 10000
                }

            );


        setWatchId(id);

    };


    // ==========================================
    // STOP LIVE GPS
    // ==========================================

    const stopLiveLocation = () => {

        if (watchId !== null) {

            navigator.geolocation.clearWatch(
                watchId
            );

            setWatchId(null);

        }


        setLiveLocation(null);

        setGpsMessage(
            "Live GPS stopped."
        );

    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="map-page">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="map-header">

                <div>

                    <span className="map-badge">
                        🗺️ ROADGUARD LIVE MAP
                    </span>

                    <h1>
                        Road Damage Map
                    </h1>

                    <p>
                        Explore reported road problems
                        and track your current location
                        in real time.
                    </p>

                </div>

            </div>


            {/* =================================
                STAT CARDS
            ================================= */}

            <div className="map-stats">


                <div className="map-stat-card">

                    <div className="stat-icon orange">
                        🚧
                    </div>

                    <div>

                        <span>
                            Road Damages
                        </span>

                        <strong>
                            {reports.length}
                        </strong>

                    </div>

                </div>


                <div className="map-stat-card">

                    <div className="stat-icon blue">
                        📍
                    </div>

                    <div>

                        <span>
                            GPS Status
                        </span>

                        <strong>
                            {liveLocation
                                ? "LIVE"
                                : "OFF"}
                        </strong>

                    </div>

                </div>


                <div className="map-stat-card">

                    <div className="stat-icon green">
                        🟢
                    </div>

                    <div>

                        <span>
                            Map Status
                        </span>

                        <strong>
                            {loading
                                ? "LOADING"
                                : "ONLINE"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                LIVE GPS CONTROL
            ================================= */}

            <div className="gps-panel">

                <div className="gps-info">

                    <div className="gps-icon">
                        📍
                    </div>

                    <div>

                        <h3>
                            Live Location
                        </h3>

                        <p>
                            {gpsMessage ||
                                "Start live GPS to track your position."}
                        </p>

                    </div>

                </div>


                <div className="gps-actions">

                    {!liveLocation ? (

                        <button
                            className="start-gps"
                            onClick={
                                startLiveLocation
                            }
                        >
                            🟢 Start Live GPS
                        </button>

                    ) : (

                        <button
                            className="stop-gps"
                            onClick={
                                stopLiveLocation
                            }
                        >
                            🔴 Stop Live GPS
                        </button>

                    )}

                </div>

            </div>


            {/* =================================
                GPS DETAILS
            ================================= */}

            {liveLocation && (

                <div className="gps-details">

                    <div>

                        <span>
                            Latitude
                        </span>

                        <strong>
                            {liveLocation.latitude.toFixed(6)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Longitude
                        </span>

                        <strong>
                            {liveLocation.longitude.toFixed(6)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Accuracy
                        </span>

                        <strong>
                            ±{" "}
                            {Math.round(
                                liveLocation.accuracy
                            )}{" "}
                            m
                        </strong>

                    </div>

                </div>

            )}


            {/* =================================
                MAP
            ================================= */}

            <div className="map-container-card">

                <div className="map-topbar">

                    <div>

                        <strong>
                            Live RoadGuard Map
                        </strong>

                        <span>
                            {reports.length} active report
                            {reports.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>


                    <div className="map-live-status">

                        <span></span>

                        LIVE

                    </div>

                </div>


                <MapContainer
                    center={[
                        17.9133,
                        77.5301
                    ]}
                    zoom={14}
                    className="roadguard-map"
                >

                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />


                    <FitMapToReports
                        reports={reports}
                    />


                    <FollowUserLocation
                        location={liveLocation}
                    />


                    {/* ROAD DAMAGE MARKERS */}

                    {reports.map((report) => (

                        <Marker
                            key={report._id}
                            position={[
                                Number(
                                    report.latitude
                                ),
                                Number(
                                    report.longitude
                                )
                            ]}
                        >

                            <Popup>

                                <div className="map-popup">

                                    <h3>
                                        🚧{" "}
                                        {report.damageType}
                                    </h3>

                                    <div>
                                        <strong>
                                            Severity:
                                        </strong>{" "}
                                        {report.severity}
                                    </div>

                                    <div>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {report.reportStatus}
                                    </div>

                                    <div>
                                        <strong>
                                            Road:
                                        </strong>{" "}
                                        {report.roadName ||
                                            "Unknown"}
                                    </div>


                                    {report.imageUrl && (

                                        <a
                                            href={
                                                report.imageUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📷 View Evidence
                                        </a>

                                    )}

                                </div>

                            </Popup>

                        </Marker>

                    ))}


                    {/* LIVE USER LOCATION */}

                    {liveLocation && (

                        <>

                            <Marker
                                position={[
                                    liveLocation.latitude,
                                    liveLocation.longitude
                                ]}
                            >

                                <Popup>

                                    <strong>
                                        📍 You are here
                                    </strong>

                                    <br />

                                    Live GPS location

                                </Popup>

                            </Marker>


                            <Circle
                                center={[
                                    liveLocation.latitude,
                                    liveLocation.longitude
                                ]}
                                radius={
                                    liveLocation.accuracy
                                }
                                pathOptions={{
                                    color: "#ff7a00",
                                    fillColor: "#ff7a00",
                                    fillOpacity: 0.15
                                }}
                            />

                        </>

                    )}

                </MapContainer>

            </div>


            {/* =================================
                MAP LEGEND
            ================================= */}

            <div className="map-legend">

                <div>
                    <span className="legend-dot damage"></span>
                    Road Damage
                </div>

                <div>
                    <span className="legend-dot user"></span>
                    Your Location
                </div>

                <div>
                    <span className="legend-dot area"></span>
                    GPS Accuracy
                </div>

            </div>


        </div>

    );

}


export default Map;