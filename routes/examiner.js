const express = require("express");
const {
  registerExaminer,
  otpGenerator,
  verifyOTP,
} = require("../controllers/examiner");
const router = express.Router();

router.route("/register").post(registerExaminer);
router.route("/login").post(otpGenerator);
router.route("/verifyOtp").post(verifyOTP);
module.exports = router;
