# 🎨 Frontend – Full-Stack Evaluator System

A **production-ready, fully documented React frontend** for the Evaluator platform.

**🎭 Role-based UI** • **📤 File Uploads** • **📚 Clean Service Layer**
**⚡ Fast, maintainable, and free of unnecessary complexity**

---

## ✨ Features

* 👥 **Three User Roles** — Admin | Evaluator | Employee
  (each with isolated, purpose-built UIs)
* 🔐 Secure login + **OTP-based email registration**
* 📊 **Admin**: Dashboard • Analytics • User invitation
* 🧑‍💼 **Evaluator**: Create projects → Assign employees → Create tasks → Review submissions
* 👷 **Employee**: View tasks • Submit files • Receive evaluator feedback
* 💻 Fully responsive design for desktop + mobile
* 🗓️ Consistent date parsing across the application
* 🧼 Proper loading states and error handling
* 📁 Robust **FormData** file upload system

---

## 🧰 Tech Stack

* ⚛️ **React 18 + Vite** — Lightning-fast modern setup
* 🌐 **Axios** — HTTP client with interceptors & token handling
* 🧭 **React Router DOM** — Role-driven route structure
* 🎨 **Tailwind** — Clean, flexible styling
* 🧠 **Local state only** — No Redux / No Context (simplicity by design)
* 📤 **Native FormData uploads**
* 🔔 **react-hot-toast**
---

## 📁 Project Structure

```bash
frontend/
├── public/                  # Static assets
├── src/
│   ├── api/                 # Axios instance & interceptors
│   ├── components/          # Reusable + role-specific components
│   │   ├── admin/           # AdminDashboard, InviteForm
│   │   ├── evaluator/       # ProjectList, TaskReview
│   │   ├── employee/        # MyTasks, SubmitTask
│   │   └── common/          # Header, Sidebar, Loading, etc.
│   ├── pages/               # Login, Dashboard, Projects, etc.
│   ├── services/            # Clean, documented API wrappers
│   │   ├── adminService.js
│   │   ├── authService.js
│   │   ├── employeeService.js
│   │   ├── evaluationService.js
│   │   ├── projectService.js
│   │   ├── tasksService.js
│   │   └── userService.js
│   ├── utils/               # formatDate, statusColor, helpers
│   ├── App.jsx              # Layout + routing
│   └── main.jsx
└── package.json
```

---

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/PAUL909-09/full-stack-evaluator-Almazan.git

# Enter frontend
cd full-stack-evaluator-Almazan/frontend

# Install dependencies
npm install

# Start dev server (backend must run on https://localhost:7000)
npm run dev
```

➡️ Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> If your backend uses a custom port, update `src/api/axios.js`.

---

## 🏗️ Production Build

```bash
npm run build
```

Output is generated in `/dist` — deployable on **Vercel**, **Netlify**, or served via any backend.

---

## 🧪 End-to-End Flow (Manual Testing Guide)

1. ▶️ Start backend (`dotnet watch run`)
2. 🔑 Log in as **Admin**
3. ✉️ Invite Evaluators & Employees
4. 🔐 Users register via **email OTP**
5. 🧑‍💼 Evaluator: Create project → Assign employees → Add tasks
6. 👷 Employee: Submit work with file proof
7. 🧑‍💼 Evaluator: Approve / Request changes / Reject
8. 👑 Admin: View updated analytics & insights

---

## 💎 Why This Frontend Stands Out

* 📘 Every service has **clear, single-line JSDoc** documentation
* 🔁 Centralized API logic → minimal duplication
* 🧼 Clean, readable code with consistent patterns
* 🗓️ Dates parsed once—never repeated in components
* 📤 File uploads fully handled with proper headers + FormData
* 🧹 Zero debug noise (`console.log`)
* 🧩 Architecture built for scale without over-engineering

---

## 🚀 Roadmap / Optional Enhancements

* 🔒 Role-based route guards
* 🎨 Full Tailwind UI refactor
* 🔔 Toast notifications for key actions
* 🧪 Cypress E2E tests
* 💤 Code-splitting & route-based lazy loading

---

## ❤️ Built with dedication by **Joseph John Paul A. Almazan**


