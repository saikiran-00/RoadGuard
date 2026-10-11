const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const router = express.Router();


// ==========================================
// ADMIN LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        // ======================================
        // CHECK INPUT
        // ======================================

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });

        }


        // ======================================
        // FIND ADMIN
        // ======================================

        const admin = await Admin.findOne({
            email: email.toLowerCase()
        });


        if (!admin) {

            return res.status(401).json({
                message: "Invalid admin credentials"
            });

        }


        // ======================================
        // CHECK PASSWORD
        // ======================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid admin credentials"
            });

        }


        // ======================================
        // CREATE JWT
        // ======================================

        const token = jwt.sign(
            {
                adminId: admin._id,
                role: admin.role,
                email: admin.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }
        );


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        res.status(200).json({

            message: "Admin login successful",

            token: token,

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }

        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(500).json({

            message:
                "Admin login failed",

            error:
                error.message

        });

    }

});


module.exports = router;