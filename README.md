<!-- One-liner description for SEO + GitHub preview -->
Full-stack MERN event management app with OTP auth, student & institution dashboards, and email onboarding — deployed via Vercel & Render.
# 🎉 EventInn — Full-Stack MERN Campus Event Platform

**EventInn** is a full-stack event management platform where institutions can post events and students can register for them — built with **MongoDB, Express, React, Node.js**, and styled with **TailwindCSS**.

> Includes: JWT Auth, OTP verification, Email onboarding, Role-based Dashboards, Protected Routes, and Deployment on Vercel + Render.

---

## 🚀 Features

* 👥 **Two user roles**: Students & Institutions
* 🔐 **Secure Auth**: JWT-based login & protected routes
* 🔄 **OTP Verification** during registration
* 📩 **Welcome Emails** sent on signup
* 🧑‍🏫 **Institutions** can:

  * Register/Login
  * Post Events
  * View number of enrolled students
* 🎓 **Students** can:

  * Register/Login
  * Enroll into events
  * View their enrolled events
* 🌍 Fully deployed on Render (API) + Vercel (Client)

---

## 🛠️ Tech Stack

* **Frontend**: React.js, TailwindCSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Auth**: JWT, OTP, bcrypt
* **Email**: Nodemailer via SMTP (Gmail)
* **Deploy**: Vercel (frontend), Render (backend)

---

## 📦 Installation

### 1. Clone this repo

```bash
git clone https://github.com/anshu2k24/EventInn.git
cd EventInn
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` with the following:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_email
SMTP_PASS=your_gmail_app_password
```

Run the backend:

```bash
node server.js
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔑 Demo Credentials (optional)

If you're testing without email/OTP setup:

* Institution:

  * Email: [inst@example.com](mailto:inst@example.com)
  * Password: \*\*\*\*\*\*

* Student:

  * Email: [stud@example.com](mailto:stud@example.com)
  * Password: \*\*\*\*\*\*

---

## 🌐 Live Demo

🔗 [https://eventinn.vercel.app](https://eventinn.vercel.app)

---

## 📸 Screenshots

### 🏠 Home Page
![Home](https://github.com/user-attachments/assets/654fedee-f15d-4ae7-9929-1fcb64caf088)

### 🎓 Login/Register
![LoginRegister](https://github.com/user-attachments/assets/54da70a1-d56b-4734-bec5-a6c4cf2ca794)

### 📩 Student Welcome Email
![WelcomeStudentEmail](https://github.com/user-attachments/assets/c6f9c68c-3f1e-4ff5-b105-dc64658d54c4)

### 🧑🏻‍🎓 Student Dashboard
![Student](https://github.com/user-attachments/assets/05fb510d-f2f1-4b52-ac71-28a7a9a65bcd)

### 🏫 Institution Dashboard - add event
![Institution](https://github.com/user-attachments/assets/2946437c-c339-4b36-8e05-b136d28a4ca6)

### 🏫 Institution Dashboard - hosted event
![Institution](https://github.com/user-attachments/assets/8726eae7-a77a-4222-9508-711fcb27bbb7)
![Institution](https://github.com/user-attachments/assets/52139160-86f4-423c-9161-bc7c1e29be41)

---

## 🤝 Contributions

Pull requests are welcome.
For major changes, open an issue first to discuss what you'd like to change.

---

## 🧠 What I Learned

* Role-based user management
* Email + OTP verification flow
* JWT tokens for secure auth
* MongoDB modeling with Mongoose
* Route protection & middleware
* Full deployment via Vercel & Render

---

## 👋 Connect With Me

Drop a ⭐ if this helped, or connect on [LinkedIn](https://www.linkedin.com/in/anshuman-pati-5575bb34a/)!
