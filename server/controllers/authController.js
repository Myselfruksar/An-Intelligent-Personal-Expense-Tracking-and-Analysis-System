const User = require("../models/User");
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const mailSender = require("../utils/mailSender");

const { emailVerifyTemplate } = require("../mail/templates/emailVerifyTemplate");

const { passwordResetTemplate } = require("../mail/templates/passwordResetTemplate");

require("dotenv").config();



// ======================
// OTP HELPERS
// ======================

const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};




// ======================
// SEND OTP
// ======================

exports.sendOTP = async (req, res) => {

    try {

        const { email, type } = req.body;

        if (!email || !type) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and type required"
            });

        }

        // SIGNUP FLOW
        if (type === "signup") {

            const existingUser =
                await User.findOne({ email });

            if (existingUser) {

                return res.status(400).json({
                    success: false,
                    message:
                        "User already exists"
                });

            }

        }

        // FORGOT PASSWORD FLOW
        if (type === "forgot-password") {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });
            }

        }

        // DELETE OLD OTP
        await OTP.deleteMany({
            email
        });

        // GENERATE OTP
        const otp = generateOTP();

        // HASH OTP
        const hashedOTP = await bcrypt.hash(otp, 10);

        // STORE OTP
        await OTP.create({ email, otp: hashedOTP, type });



        // SEND EMAIL
        const emailBody = emailVerifyTemplate(otp);

        await mailSender(email, "ExpenseAI OTP Verification", emailBody);

        return res.status(200).json({
            success: true,
            message:
                "OTP sent successfully"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message:
                "Failed to send OTP"
        });

    }

};



// ======================
// REGISTER
// VERIFY OTP + CREATE USER
// ======================

exports.register = async (req, res) => {

    try {
        const { name, email, phone, password, otp } = req.body;

        if (!name || !email || !phone || !password || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "All fields are required"
            });

        }



        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message:
                    "User already exists"
            });

        }


        const recentOTP = await OTP.findOne({
            email,
            type: "signup"
        }).sort({ createdAt: -1 });

        if (!recentOTP) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP expired"
            });
        }

        const isValidOTP = await bcrypt.compare(otp, recentOTP.otp);

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP"
            });
        }
        const avatar = `https://api.dicebear.com/5.x/initials/svg?seed=${name}`
        const user = new User({ name, email, phone, avatar });

        await user.setPassword(password);

        await user.save();

        user.password = undefined;

        const payload = { email: user.email, id: user._id };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        
        res.status(201).json({
            success: true,
            user,
            token,
            message: "Registration successful"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message:
                err.message ||
                "Registration failed"
        });

    }

};



// ======================
// LOGIN
// ======================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(403).json({
                success: false,
                message:
                    "Fill in all the fields.",
            });

        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid email or password"
            });

        }

        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h",
                }
            );

            user.password = undefined;

            res.status(200).json({
                success: true,
                token,
                user,
            });

            console.log(user + "user logged In")

        } else {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });

        }

    } catch {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// ======================
// RESET PASSWORD
// ======================

exports.resetPassword = async (req, res) => {

    try {
        const { email, password, otp } = req.body;
        if (!email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const recentOTP = await OTP.findOne({
            email,
            type: "forgot-password"
        }).sort({ createdAt: -1 });

        if (!recentOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        const isValidOTP = await bcrypt.compare(
            otp.toString(),
            recentOTP.otp
        );

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message:
                    "Incorrect OTP"
            });
        }

        await user.setPassword(password);

        await user.save();

        // MAIL
        const emailBody = passwordResetTemplate(user.name);

        await mailSender(email, "Password Updated", emailBody);

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Password reset failed"
        });

    }

};