import api from "@/api/axios";

/* -------------------------------------------------------------------------- */
/*  PROJECT CRUD (aligned with .NET 9 controller)                           */
/* -------------------------------------------------------------------------- */

/**
 * Get **all** projects the current user is allowed to see.
 * - Admin → every project
 * - Evaluator → only own projects
 * - Employee → only projects with assigned tasks
 *
 * Uses the new `/api/projects/my` endpoint (most common case).
 */
export async function getMyProjects() {
  const { data } = await api.get("/projects/my");
  return data; // [] or Project[]
}

/**
 * Admin-only – list **every** project in the system.
 */
export async function getAllProjects() {
  const { data } = await api.get("/projects");
  return data;
}

/**
 * Get a **single** project by its GUID.
 * @param {string} projectId – GUID
 */
export async function getProjectById(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}

/**
 * Create a new project (Evaluator only).
 * @param {{ name: string, description?: string }} payload
 */
export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data; // created Project
}

/**
 * Update an existing project (Evaluator only – must own it).
 * @param {string} projectId
 * @param {{ name?: string, description?: string }} payload
 */
export async function updateProject(projectId, payload) {
  const { data } = await api.put(`/projects/${projectId}`, payload);
  return data;
}

/**
 * Delete a project (Evaluator only – must own it).
 * @param {string} projectId
 */
export async function deleteProject(projectId) {
  await api.delete(`/projects/${projectId}`);
}

/* -------------------------------------------------------------------------- */
/*  USER-PROJECT RELATIONSHIP (Admin only)                                   */
/* -------------------------------------------------------------------------- */

/**
 * Admin – fetch **all** projects for any user (owned or assigned via tasks).
 * @param {string} userId – GUID
 */
export async function getUserProjects(userId) {
  const { data } = await api.get(`/projects/user/${userId}`);
  return data;
}

/* -------------------------------------------------------------------------- */
/*  EMPLOYEES – GLOBAL & PER-PROJECT (keep existing, just fix URLs)          */
/* -------------------------------------------------------------------------- */

/**
 * Get **all employees** – used for assignment dropdown.
 */
export async function getAllEmployees() {
  // Adjust the endpoint to whatever you expose for employees
  const { data } = await api.get("/users?role=Employee");
  return data;
}

/**
 * Get employees **already assigned** to a project.
 * (If you implement `/api/projects/{id}/assignments` on the backend, keep it.
 * Otherwise you can fall back to the legacy `getEmployeesByProject`.)
 */
export async function getAssignedEmployees(projectId) {
  try {
    const { data } = await api.get(`/projects/${projectId}/assignments`);
    return data.map((a) => a.employeeId);
  } catch (err) {
    // fallback – derive from tasks inside the project
    return getEmployeesByProject(projectId);
  }
}

/**
 * Legacy – derive employees from tasks inside a project.
 * Kept for backward compatibility.
 */
export async function getEmployeesByProject(projectId) {
  const project = await getProjectById(projectId);
  const tasks = project.tasks || [];
  return tasks
    .filter((t) => t.assignedTo)
    .map((t) => ({
      id: t.assignedTo.id,
      name: t.assignedTo.name,
      email: t.assignedTo.email,
      taskTitle: t.title,
      status: t.status,
    }));
}

/* -------------------------------------------------------------------------- */
/*  ASSIGNMENT – POST (keep if you implement the endpoint)                  */
/* -------------------------------------------------------------------------- */

/**
 * Assign one or more employees to a project.
 * @param {string} projectId
 * @param {string[]} employeeIds
 */
export async function assignEmployeesToProject(projectId, employeeIds) {
  await api.post(`/projects/${projectId}/assign`, { employeeIds });
}

/* -------------------------------------------------------------------------- */
/*  DEPRECATED / LEGACY (remove later)                                      */
/* -------------------------------------------------------------------------- */

/**
 * @deprecated Use `getMyProjects()` instead.
 */
export async function getEvaluatorProjects() {
  console.warn("getEvaluatorProjects() is deprecated – use getMyProjects()");
  return getMyProjects();
}