---

# 🖥️ Backend – Full-Stack Evaluator System

**Clean • Secure • Fully Documented • No Docker Required**

A **rock-solid, enterprise-ready backend** built with **.NET 9**, **Entity Framework Core**, and **PostgreSQL** — designed for performance, security, scalability, and long-term maintainability.

---

## 🚀 Features

* 👥 **Three Roles** — `Admin`, `Evaluator`, `Employee`
  *(Enforced consistently across controllers, services, and the database)*
* ✉️ **OTP-based invitation + verification**
  *(no plain passwords sent over email — secure by design)*
* 📁 Complete **Project → Task → Submission → Evaluation** lifecycle
* 📤 **File uploads** (PDF / JPG / PNG, max 5MB)
* 🔁 **Task status workflow** with full audit history
* 👥 **Bulk employee assignment** to projects
* 📊 **Admin analytics**: user growth, project load, top performers
* 🔐 **JWT auth** + Refresh Token Rotation (30-day lifetime)
* 🧹 Automatic cleanup of expired invites via background service
* 📘 **100% documented controllers & services** with clean one-line comments
* 🧪 Fully interactive **Swagger/OpenAPI** documentation

---

## 🧰 Tech Stack

* 🟦 **.NET 9** — modern, fast Minimal API framework
* 🧱 **ASP.NET Core Web API**
* 🗃️ **Entity Framework Core** (Code-First)
* 🐘 **PostgreSQL**
* 🔐 **JWT + BCrypt + Refresh Token** authentication
* ✉️ **SMTP Email** for OTP + invitations
* 📁 **Local file storage** (`/wwwroot/uploads/tasks`) with GUID filenames
* 🔄 **IHostedService** for recurring maintenance
* 📄 **Swagger/OpenAPI** for auto-generated API docs

---

## 📂 Project Structure

```bash
backend/
├── Controllers/             # Endpoints (role-secured)
├── Services/                # Business logic (AuthService, TaskService, etc.)
├── Models/                  # Entities, DTOs, enums
├── Data/                    # DbContext, migrations
├── Helpers/                 # JwtTokenHelper, OtpService, extensions
├── wwwroot/uploads/tasks/   # Proof file storage
├── appsettings.json         # JWT, SMTP, DB configs
└── Program.cs               # Minimal API bootstrap + DI registration
```

---

## ⚡ Quick Start (No Docker Required)

### 1️⃣ Install PostgreSQL

Download: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
Create a database named: **EvaluatorDB**

---

### 2️⃣ Configure Your Connection String

`appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=EvaluatorDB;Username=postgres;Password=your_password"
}
```

---

### 3️⃣ Run the Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet watch run
```

➡️ API documentation available at: **[https://localhost:7000/swagger](https://localhost:7000/swagger)**

---

## 🧪 API Testing (via Swagger)

| Role          | Key Endpoints                                           |
| ------------- | ------------------------------------------------------- |
| **Admin**     | `/admin/invite`, `/admin/dashboard`, `/admin/analytics` |
| **Auth**      | `/auth/invite`, `/auth/verify-invite`, `/auth/login`    |
| **Evaluator** | `/projects`, `/tasks`, `/evaluations`                   |
| **Employee**  | `/employees/tasks`, `/employees/tasks/{id}/status`      |

---

## 📤 File Upload (Employee)

**Endpoint:**
`POST /employees/tasks/{id}/status`

**Form-data fields:**

* `proofFile` → file upload (PDF/JPG/PNG ≤ 5MB)

Stored in:
`/wwwroot/uploads/tasks/{guid_filename}`

---

## 🔄 Background Service

### `ExpiredInviteCleanupService`

* Runs every **1 minute**
* Detects unverified accounts with expired OTPs
* Removes them automatically
* Keeps the authentication system clean, safe, and performant

---

## 🔐 Security Highlights

* 🔒 Role-based authorization → `[Authorize(Roles="...")]`
* 🔑 **BCrypt** password hashing
* 🛡️ JWT with correct claims (`nameid`, `email`, `role`)
* 🔁 Refresh Tokens stored in DB (30-day expiry)
* 🧼 Strict file size + MIME type validation
* 🚫 **No plaintext passwords ever**
* 🔍 Input validation across all public endpoints

---

## 💎 What Makes This Backend Special

* 📘 Every controller & service includes **clean one-line documentation**
* 🧱 Clear architecture: **Controllers → Services → EF Core**
* 📤 Endpoints return **DTOs, never EF entities**
* ⚙️ Idempotent operations (task updates, assignments, etc.)
* 🔏 Enums instead of magic strings
* 🧹 Consistent naming conventions, zero technical debt
* ⚡ Minimal, fast, production-ready codebase

---

## 🚧 Future Improvements (Optional Enhancements)

* 🧪 Unit Tests (xUnit)
* 🔌 Integration Tests
* 📄 Pagination support
* 🛡️ Rate limiting (IP & user-level)
* 📜 Serilog structured logging
* 🔄 CI/CD with GitHub Actions

---

## ❤️ Built with dedication by **Joseph John Paul A. Almazan**
