const router = require("express").Router();

const { register, login, sendOTP, resetPassword } = require("../controllers/authController");


router.post("/send-otp", sendOTP);

router.post("/register", register);

router.post("/login", login);

router.post("/reset-password", resetPassword );


module.exports = router;
