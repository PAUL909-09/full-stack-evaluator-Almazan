# NOTES - Full-Stack Evaluator (Updated)

Added:

- JWT-based authentication with AuthService and AuthController
- Role-based authorization on endpoints (e.g., Admin only for create/assign)
- Register endpoint (no Admin role allowed)
- Seeded single admin user (email: admin@example.com, pass: adminpassword)
- Frontend: authService, Login/Register components, token storage/interceptor
- Basic role checks in components

Missing / Next:

- Project entity/model (admin creates projects, assigns tasks to users in projects)
- Comments feature (admin comments on tasks)
- User status updates (users set status, admin sees)
- Full frontend routing and protected routes
- Adjust AssignedToUserId to perhaps Employee (since admin evaluates? Clarify if evaluators are separate)

Assumptions:

- Only 1 admin (seeded; no register for admins)
- Evaluators evaluate tasks assigned to them; adjust if admin is the evaluator
- Simple token storage in localStorage (not secure for prod; use httpOnly cookies later)

How to run (dev):

- Add Jwt:Secret to appsettings.json
- Backend: dotnet restore && dotnet ef migrations add AddAuthSeeding && dotnet ef database update && dotnet run
- Frontend: npm install react-router-dom && npm run dev

Testing:

- Register a user, login, create task (as admin), assign, evaluate (as evaluator)
