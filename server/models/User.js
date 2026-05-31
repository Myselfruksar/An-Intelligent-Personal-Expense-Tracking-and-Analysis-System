const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use valid email"]
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    //settings
 
    monthlyIncome: {
      type: Number,
      default: 0
    },

    monthlyBudget: {
      type: Number,
      default: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    avatar: {
      type: String,
      default: ""
    },

    aiScore: {
      type: Number,
      default: 0
    },

    budgetHealthScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(password, salt);
};



module.exports = mongoose.model("User", userSchema);