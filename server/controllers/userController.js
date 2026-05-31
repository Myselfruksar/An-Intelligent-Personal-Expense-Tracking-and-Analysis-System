const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");
const AIInsight = require("../models/AIInsight");

// ======================
// GET PROFILE
// ======================

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

// ======================
// UPDATE PROFILE
// ======================

exports.updateProfile = async (req, res) => {
    try {
        const {name,phone,monthlyIncome,monthlyBudget,currency} = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name !== user.name) {
            user.name = name;
            user.avatar = `https://api.dicebear.com/5.x/initials/svg?seed=${name}`;
        }

        if (phone) user.phone = phone;

        if (monthlyIncome >= 0) user.monthlyIncome = Number(monthlyIncome);

        if (monthlyBudget >= 0) user.monthlyBudget = Number(monthlyBudget);

        if (currency) user.currency = currency;

        await user.save();
        await AnalyticsSnapshot.deleteMany({
            userId: user._id
        });

        await AIInsight.deleteMany({
            userId: user._id
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated",
            user,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Profile update failed",
        });
    }
};

// ======================
// CHANGE PASSWORD
// ======================

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword,newPassword} = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,

                message: "All fields required",
            });
        }

        const user = await User.findById(req.user.id).select("+password");

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({success: false,message: "Old password incorrect"});
        }

        await user.setPassword(newPassword);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Password update failed",
        });
    }
};
