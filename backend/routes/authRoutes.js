
const express = require("express");
const authController = require("../controllers/authController");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post(
    "/logout",
    authorize,
    authController.logout
);

module.exports = router;

