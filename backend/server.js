const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const connectDB = require("./config/db");
const reportRoutes = require("./routes/reportRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());
app.use("/api/auth", authRoutes);


// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);


// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {

    console.log(
        "🟢 Client connected:",
        socket.id
    );


    socket.on("disconnect", () => {

        console.log(
            "🔴 Client disconnected:",
            socket.id
        );

    });

});


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/reports",
    reportRoutes
);
app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/admin/auth",
    adminAuthRoutes
);


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "RoadGuard API is running 🚧"
    });

});


// ==========================================
// START SERVER
// ==========================================

server.listen(PORT, () => {

    console.log(
        `RoadGuard server running on port ${PORT}`
    );

    console.log(
        "Socket.IO real-time server enabled ⚡"
    );

});