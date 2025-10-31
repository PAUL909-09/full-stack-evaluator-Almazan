# 🧠 Backend Documentation — Task Manager API

![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet?logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-316192?logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/API-Swagger-green?logo=swagger&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📚 Table of Contents

- [📖 Overview](#-overview)
- [🏗️ Project Structure](#%EF%B8%8F-project-structure)
- [⚙️ Setup and Configuration](#%EF%B8%8F-setup-and-configuration)
- [🧰 Testing the API (via Swagger)](#-testing-the-api-via-swagger)
- [🔑 Default Seeded Accounts](#-default-seeded-accounts)
- [🧩 Database Model Summary](#-database-model-summary)
- [⚔️ Authentication Summary](#%EF%B8%8F-authentication-summary)
- [🧠 Learning Reflections](#-learning-reflections)
- [🛠️ Common Commands Reference](#%EF%B8%8F-common-commands-reference)
- [🚨 Troubleshooting Tips](#-troubleshooting-tips)

---

## 📖 Overview

This backend is built with **ASP.NET Core (C#)** using **Entity Framework Core** and **PostgreSQL**.  
It provides RESTful APIs for:

- User authentication 🔐
- Task management 🧾
- Task evaluation 🧮

**Swagger UI** is integrated for easy endpoint testing and exploration.

---

## 🏗️ Project Structure

```

backend/
│
├── Program.cs                 # Main entry point (service setup, middleware)
├── appsettings.json           # Configuration: JWT secret, DB connection
├── task-manager-api.csproj    # Project definition
│
└── src/
├── Controllers/           # API endpoints (Auth, Tasks, Evaluations)
├── Data/                  # EF Core context (ApplicationDbContext)
├── Migrations/            # Database migrations
├── Models/                # Entities: User, TaskItem, Evaluation
└── Services/              # Logic: AuthService for login/register

```

---

## ⚙️ Setup and Configuration

### 1️⃣ Requirements

Before running:

- Install **.NET 8 SDK** or later
- Install **PostgreSQL**
- Create a database named **TaskManagerDb**

---

### 2️⃣ Configure the Connection

Open `appsettings.json` and verify your connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=TaskManagerDb;Username=postgres;Password=root;"
}
```

Also verify the JWT secret:

```json
"Jwt": {
  "Secret": "276e0c99b4ea4376ad0345cbb35389d45f080122cfb24b55a038c330f362544c"
}
```

---

### 3️⃣ Apply Database Migrations

Run the following commands inside the `backend/` folder:

```bash
dotnet ef database update
```

✅ This creates tables (`Users`, `Tasks`, `Evaluations`) and seeds sample data.

---

### 4️⃣ Run the Server

```bash
dotnet run
```

Then open:
👉 [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## 🧰 Testing the API (via Swagger)

### ✅ What is Swagger?

Swagger is an interactive API testing tool provided by ASP.NET Core.
It lists all endpoints, request bodies, and allows direct execution.

---

### 🔐 Step 1: Login to Get Token

Endpoint:

```
POST /api/auth/login
```

Example body:

```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

You’ll receive a **JWT token** in the response.

---

### 🔒 Step 2: Authorize in Swagger

Click the 🔒 “Authorize” button (top-right of Swagger UI).
Paste:

```
Bearer <your_token_here>
```

Then click **Authorize → Close**.
✅ Protected endpoints will now use your token automatically.

---

### 🧪 Step 3: Test Endpoints by Role

| Role             | Example Endpoints                                                                       |
| ---------------- | --------------------------------------------------------------------------------------- |
| 👑 **Admin**     | `POST /api/tasks` → Create a new task <br>`POST /api/tasks/{id}/assign` → Assign a task |
| 🧑‍🏫 **Evaluator** | `POST /api/tasks/{id}/evaluations` → Evaluate a task                                    |
| 👷 **Employee**  | `PATCH /api/tasks/{id}/status` → Update task status                                     |

---

## 🔑 Default Seeded Accounts

| Role      | Email                                                 | Password      |
| --------- | ----------------------------------------------------- | ------------- |
| Admin     | [admin@example.com](mailto:admin@example.com)         | adminpassword |
| Evaluator | [evaluator@example.com](mailto:evaluator@example.com) | evalpass      |
| Employee  | [employee@example.com](mailto:employee@example.com)   | employeepass  |

---

## 🧩 Database Model Summary

### 🧍‍♂️ **User**

| Field        | Type   | Description                |
| ------------ | ------ | -------------------------- |
| Id           | Guid   | User ID                    |
| Name         | string | Full name                  |
| Email        | string | Unique email               |
| PasswordHash | string | Hashed password            |
| Role         | Enum   | Admin, Evaluator, Employee |

---

### 📋 **TaskItem**

| Field      | Type   | Description                      |
| ---------- | ------ | -------------------------------- |
| Id         | Guid   | Task ID                          |
| Title      | string | Task title                       |
| Status     | Enum   | Pending / InProgress / Completed |
| AssignedTo | Guid?  | Assigned user ID                 |

---

### 🧮 **Evaluation**

| Field       | Type    | Description       |
| ----------- | ------- | ----------------- |
| Id          | Guid    | Evaluation ID     |
| TaskId      | Guid    | Related task      |
| EvaluatorId | Guid    | Evaluator user ID |
| Score       | decimal | Evaluation score  |

---

## ⚔️ Authentication Summary

Tokens are created by `AuthController` via `AuthService`.

JWT contains:

- `sub` → User ID
- `role` → User Role

Protected endpoints use:

```csharp
[Authorize]
[Authorize(Roles = "Admin")]
```

---

## 🧠 Learning Reflections

### 🧩 1. Setting Up the Backend

Learned to structure a C# backend with Controllers, Models, and Services separation.
Dependency Injection + EF Core clarified how the database connects.

---

### 🔐 2. JWT Authentication

Implemented token-based authentication:

- Generate token on login
- Store user identity + role in token
- Auto-validate per request

---

### 🧰 3. Swagger Integration

Swagger simplified API testing — no Postman needed.
The 🔒 Authorize feature is great for testing protected routes.

---

### 🧩 4. Role-Based Access Control

Using `[Authorize(Roles = "Admin")]` or `[Authorize(Roles = "Employee")]` enabled real-world-style access restriction.

---

### 💾 5. Database Migrations

EF Core Migrations made schema updates smooth:

```bash
dotnet ef migrations add <Name>
dotnet ef database update
```

---

## 🛠️ Common Commands Reference

| Command                           | Description           |
| --------------------------------- | --------------------- |
| `dotnet build`                    | Build the project     |
| `dotnet run`                      | Run the server        |
| `dotnet watch run`                | Run with hot reload   |
| `dotnet ef migrations add <Name>` | Add a new migration   |
| `dotnet ef database update`       | Apply migrations      |
| `dotnet clean`                    | Clean build artifacts |

---

## 🚨 Troubleshooting Tips

| Issue                              | Cause                      | Solution                                        |
| ---------------------------------- | -------------------------- | ----------------------------------------------- |
| **Failed to determine HTTPS port** | Missing HTTPS config       | Use `http://localhost:5000`                     |
| **Swagger 🔒 not visible**         | Running in Production mode | Use `dotnet run --environment Development`      |
| **401 Unauthorized**               | Invalid JWT token          | Re-authorize in Swagger                         |
| **Duplicate compile items**        | Files moved to `src/`      | Remove `<Compile Include>` entries in `.csproj` |

---

✨ _This documentation provides a full overview of your backend API setup — ready for team onboarding or open-source release!_ 🚀

```

</>

✅ **Copy tip:**
Just copy from the **first `# 🧠 Backend Documentation`** line to the end — it’s ready to paste into your `NOTES.md` file on GitHub with no formatting issues.
```
