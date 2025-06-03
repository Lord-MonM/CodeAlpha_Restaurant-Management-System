const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/authController.js");
const validateToken = require("../middleware/validateTokenHandler.js");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

module.exports = router;