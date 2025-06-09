# 💰 Household Income & Expense Tracker with Bank Matching

A full-stack web application to track household income and expenses, visualize data using charts, upload bank statements, and match them with recorded transactions.

---

## 📸 Demo Screenshots

> You can upload screenshots in the `assets/` folder or link to images hosted on GitHub or Imgur.

| Dashboard | Add Transaction |
|-----------|-----------------|
| ![Dashboard](assets/frontend-dashboard.png) | ![Add Transaction](assets/frontend-add.png) |

| Upload CSV | Backend API |
|------------|-------------|
| ![CSV Upload](assets/frontend-upload.png) | ![API Screenshot](assets/backend-api.png) |

---

## 🚀 Features

- 🔐 User Signup/Login (with hashed passwords)
- 📊 Visual summary with **Doughnut** and **Bar** charts
- 📝 Add transactions with date, reason, type, and amount
- 📅 Filter by week, month, year *(upcoming)*
- 📁 Upload and parse **bank statement CSVs**
- 🔁 Match uploaded entries with database records
- 📤 Export to **PDF / Excel** *(optional extension)*
- ✅ Toast notifications like “Transaction Added!”
- 🌐 Fully responsive frontend (Tailwind CSS / Bootstrap)

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|--------------------------|
| Frontend  | React (Vite) + Chart.js  |
| Backend   | Flask (Python) + REST API |
| Database  | MySQL                    |
| Styling   | Tailwind CSS  |
| Deploy    | Vercel (Frontend)|

---

## ⚙️ Getting Started Locally

### 🔧 Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
