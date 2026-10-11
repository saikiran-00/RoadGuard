const jwt = require("jsonwebtoken");


const adminAuth = (req, res, next) => {

    try {

        // ======================================
        // GET AUTHORIZATION HEADER
        // ======================================

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                message: "Admin authentication required"
            });

        }


        // ======================================
        // CHECK BEARER TOKEN
        // ======================================

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                message: "Invalid authorization format"
            });

        }


        const token =
            authHeader.split(" ")[1];


        // ======================================
        // VERIFY JWT
        // ======================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ======================================
        // CHECK ADMIN ROLE
        // ======================================

        if (decoded.role !== "ADMIN") {

            return res.status(403).json({
                message: "Admin access required"
            });

        }


        // ======================================
        // SAVE ADMIN DATA
        // ======================================

        req.admin = decoded;


        next();


    } catch (error) {

        console.error(
            "Admin authentication error:",
            error.message
        );


        return res.status(401).json({
            message: "Invalid or expired admin token"
        });

    }

};


module.exports = adminAuth;