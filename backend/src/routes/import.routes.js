const express = require("express");
const upload = require("../middleware/upload.middleware");
const { importCsv } = require("../controllers/import.controller");

const router = express.Router();

// POST /api/import  (multipart/form-data, field name: "file")
router.post("/import", upload.single("file"), importCsv);

module.exports = router;
