// filename mailsender.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let message = await transporter.sendMail({
      from: `Expense AI <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });
    console.log(message);
  } catch (err) {
    console.log("error occurred at util/mailsender\n", err.message);
  }
};

module.exports = mailSender;