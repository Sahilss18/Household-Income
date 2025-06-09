# 💰 Household Income & Expense Tracker with Bank Matching

A full-stack web application to track household income and expenses, visualize data using charts, upload bank statements, and match them with recorded transactions.

---

## 📸 Demo Screenshots

> You can upload screenshots in the `assets/` folder or link to images hosted on GitHub or Imgur.

FrontEnd
|-----------|-----------------|
![Image](https://github.com/user-attachments/assets/dc6d0dcd-e907-471f-8fc1-a06e5032205f)

![Image](https://github.com/user-attachments/assets/7c91f63b-97a3-48f8-be46-f658863842e3)
![Image](https://github.com/user-attachments/assets/4ff01b95-f273-4f5b-b95e-6f8e7d93a641)
![Image](https://github.com/user-attachments/assets/cedacc27-394d-437f-b321-86a78db32d5d)
![Image](https://github.com/user-attachments/assets/3b58cc5f-822d-4b66-8a32-c4bc8e0450f3)
![Image](https://github.com/user-attachments/assets/2e6fd9e9-b2c9-47ed-a4ed-fff3f09b7758)
![Image](https://github.com/user-attachments/assets/f906dbea-a1c6-4592-ac84-82c908c95a26)
![Image](https://github.com/user-attachments/assets/41a613cf-deff-4ee6-98bb-f08a6c0b73c1)

BackEnd 
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
