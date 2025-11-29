# 🧪 Full-Stack Evaluator System — NOTES.md (Almazan)

> ⚡ **No Docker Required**  
> Production-grade, role-based evaluation platform built with .NET + React.

---

## 🚀 What’s Implemented

### 👥 **Role & Auth**
- 🔐 Complete role system: **Admin**, **Evaluator**, **Employee**
- 📧 Secure invite → OTP → verify → set password → login
- 🔁 JWT auth + refresh token rotation
- 🧹 Auto-cleanup of expired unverified accounts (background service)

### 📁 **Projects & Tasks**
- 📌 Full project + task management with deadlines
- 📤 Secure proof uploads (PDF/JPG/PNG, max 5MB)
- 📝 Task evaluation: **Approved**, **Needs Revision**, **Rejected**
- 💬 Evaluator comments on submissions
- 🕘 Complete task history audit trail

### 📊 **Admin Dashboard**
- 📈 Analytics + charts
- 🏆 Top performers
- 👥 Bulk employee assignment (assign/replace multiple at once)

### 🎨 **Frontend**
- ⚛️ Clean, minimal React (no Redux/Context — pure local state)
- 🧭 Well-structured service layer
- 📘 100% documented controllers, services, and frontend functions

---

## 🧩 Future Scope / Missing (Intentional)

These are **nice-to-have enhancements**, *not blockers*:

- 🧪 Unit + integration tests  
- 📄 Pagination for large datasets  
- 🔔 Real-time notifications (WebSocket / SignalR)  
- 💌 Prettier email templates  
- 🔧 CI/CD pipeline  
- 🛡️ Rate limiting & structured logging  
- 🟦 Optional migration to TypeScript  

---

## 🛠️ How to Test Your Changes (No Docker Needed)

### 🐘 1. Install & Configure PostgreSQL
- Install from official site
- Create DB: `EvaluatorDB` (or your custom DB name)

---

### ⚙️ 2. Start Backend (.NET)

```bash
cd backend
dotnet restore
# Update your appsettings.Development.json connection string if required
dotnet ef database update
dotnet watch run
````

➡️ Open Swagger: **[https://localhost:7000/swagger](https://localhost:7000/swagger)**

---

### 💻 3. Start Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

➡️ Open: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 4. Testing Flow (Role-by-Role)

### 👑 **Admin**

* Invite Evaluators & Employees
* User receives email OTP → verifies → sets password
* Can view full analytics/dashboard

### 🧑‍💼 **Evaluator**

* Create project
* Assign employees
* Create tasks + deadlines
* Review submitted tasks → Approve / Request Revision / Reject

### 👷 **Employee**

* View **My Tasks**
* Update status: *Todo → In Progress → Done → Submitted*
* Upload proof file (validated)

---

## ⚠️ 5. Edge Cases to Verify

* ⏳ **Expired OTP** → account auto-deleted
* 🔒 Unauthorized role access → **403** or redirect
* 🗂️ Oversized upload (>5MB) → friendly error
* 🚫 Editing others’ projects/tasks → blocked

---