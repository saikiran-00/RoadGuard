require("dotenv").config();

const cloudinary = require("./config/cloudinary");

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

cloudinary.api
    .ping()
    .then((result) => {
        console.log("Cloudinary connection successful:");
        console.log(result);
    })
    .catch((error) => {
        console.error("Cloudinary connection failed:");
        console.error(error);
    });