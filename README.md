# 👟 Shoe Management App

![Vite](https://img.shields.io/badge/Vite-7.x-purple?logo=vite)  
![React](https://img.shields.io/badge/React-19-blue?logo=react)  
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac?logo=tailwindcss)  
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?logo=firebase)  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> A modern web app to manage and track shoe records with filtering, sorting, image support, and real-time database using Firebase Firestore.

---

## 🚀 Features

- 🔐 Anonymous authentication with Firebase Auth
- 📦 Real-time CRUD with Firebase Firestore
- 🔍 Search, filter (by size & season), and sort (size, season, details)
- 🖼 Image URL field with placeholder fallback
- 📤 Export shoe list to CSV
- 🎨 Responsive UI with Tailwind CSS
- 💡 Built using React 19 and Vite 7

---

## 📦 Tech Stack

| Frontend     | Backend     | Styling      | Tooling        |
|--------------|-------------|--------------|----------------|
| React 19     | Firebase DB | Tailwind CSS | Vite, ESLint   |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Modal.jsx
│   ├── ShoeForm.jsx
│   └── ShoeTable.jsx
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🛠 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/shoe-management-app.git
cd shoe-management-app
npm install
```

### 2. Firebase Configuration

Update the Firebase config in `App.jsx`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  ...
};
```

Optional: Inject it as `__firebase_config` at runtime for flexibility.

---

## 🧪 Run Locally

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔧 Build for Production

```bash
npm run build
```

To preview the build locally:

```bash
npm run preview
```

---

## ☁️ Deployment Guide

### ➤ Deploy to **Vercel**

1. Push your repo to GitHub.
2. Go to [vercel.com](https://vercel.com), connect the repo.
3. Use build command: `npm run build`  
   Set output directory: `dist`
4. Add your Firebase config as environment variables if using `__firebase_config`.

### ➤ Deploy to **Firebase Hosting**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📤 Exporting to CSV

Click the **CSV** button in the UI to export filtered results as `shoe_data.csv`.

---

## ✅ TODOs

- [ ] Add Google/email login
- [ ] Paginate or virtualize large shoe lists
- [ ] Show timestamps for each record
- [ ] Support real image uploads

---

## 📄 License

Distributed under the MIT License. © 2025 [Kasun Akalanka](mailto:k3akalanka@gmail.com).
