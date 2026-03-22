const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ─── Configure Cloudinary with your credentials ────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage engine: uploads directly to Cloudinary ────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "scms_complaints",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ─── Multer instance using Cloudinary storage ───────────────
const upload = multer({ storage });

module.exports = { cloudinary, upload };
