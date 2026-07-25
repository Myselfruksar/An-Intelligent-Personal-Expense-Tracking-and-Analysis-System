# 💰 ExpenseAI – AI Personal Expense Tracking & Analysis System

An AI-powered personal expense tracking and financial analysis platform built with the **MERN Stack**. ExpenseAI helps users manage expenses, analyze spending habits, visualize financial data, and receive AI-generated insights for better financial decisions.

---

# 🚀 Demo Account

If you only want to explore the application, use the demo account below.

**Email**

```text
ruksar@gmail.com
```

**Password**

```text
12345
```

---

# ⚠️ Important Notice

## Why Sign Up Doesn't Work on the Live Demo?

This project is deployed on **Render Free Tier**.

Render's free plan **does not support SMTP services** required for sending OTP emails.

Because of this limitation:

- ❌ New user registration is disabled.
- ❌ Email OTP verification cannot work.
- ❌ Forgot Password emails cannot be sent.

This is **not a bug** in the application.

The software works perfectly when SMTP credentials are configured.

---

# ✅ Run Full Version Locally

To use the complete software including:

- User Registration
- Email OTP Verification
- Forgot Password
- Password Reset

Create a **`.env`** file inside the **server** folder and add the following variables.

```env
PORT=4000

MONGO_URI=

JWT_SECRET=

MAIL_HOST=smtp.gmail.com

MAIL_USER=

MAIL_PASS=

OTP_SECRET=Ref_secret!?

RESET_SECRET=Ref_reset!?

FRONTEND_URL=
```

Example:

```env
PORT=4000

MONGO_URI=mongodb://localhost:27017/expenseai

JWT_SECRET=your_jwt_secret

MAIL_HOST=smtp.gmail.com

MAIL_USER=example@gmail.com

MAIL_PASS=your_app_password

OTP_SECRET=Ref_secret!?

RESET_SECRET=Ref_reset!?

FRONTEND_URL=http://localhost:5173
```

---

# Frontend Environment Variables

Create a **`.env`** file inside the frontend project.

```env
VITE_BASE_URL=http://localhost:4000/api
```

---

# 📦 Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Install Backend

```bash
cd server

npm install
```

---

## Install Frontend

```bash
cd client

npm install
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm run dev
```

---

# 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer
- bcrypt

---

# 📁 Project Structure

```
ExpenseAI
│
├── client
│   ├── src
│   ├── public
│   └── .env
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── utils
│   └── .env
│
└── README.md
```

---

# 🔒 Authentication Flow

- User Registration
- Email OTP Verification
- Login
- JWT Authentication
- Forgot Password
- Reset Password

---

# 📊 Core Modules

- Registration
- Login
- Expense Management
- Dashboard
- Analytics
- AI Insights
- Budget Tracking
- User Profile

---

# 📄 License

Strictly prohibited do not copy for business purpose.

---

# ❤️ Thank You

If you like this project, consider giving it a ⭐ on GitHub.

Happy Coding! 🚀
