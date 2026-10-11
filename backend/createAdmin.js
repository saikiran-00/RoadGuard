require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const Admin = require("./models/Admin");


const createAdmin = async () => {

    try {

        await connectDB();


        const email = "admin@roadguard.com";

        const password = "RoadGuard@123";


        // ======================================
        // CHECK IF ADMIN ALREADY EXISTS
        // ======================================

        const existingAdmin =
            await Admin.findOne({ email });


        if (existingAdmin) {

            console.log(
                "⚠️ Admin already exists."
            );

            process.exit(0);

        }


        // ======================================
        // HASH PASSWORD
        // ======================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ======================================
        // CREATE ADMIN
        // ======================================

        const admin = new Admin({

            name: "RoadGuard Admin",

            email: email,

            password: hashedPassword,

            role: "ADMIN"

        });


        await admin.save();


        console.log(
            "✅ Admin account created successfully."
        );

        console.log(
            "Email:",
            email
        );

        console.log(
            "Password:",
            password
        );


        process.exit(0);


    } catch (error) {

        console.error(
            "❌ Failed to create admin:",
            error.message
        );

        process.exit(1);

    }

};


createAdmin();