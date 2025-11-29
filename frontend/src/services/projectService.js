// frontend/src/services/projectService.js
import api from "@/api/axios";

/* -------------------------------------------------------------------------- */
/*  PROJECTS – CORE CRUD                                                      */
/* -------------------------------------------------------------------------- */

// Get all projects the current user can see (my + assigned via tasks)
export async function getMyProjects() {
  const { data } = await api.get("/projects/my");
  return data.map(p => ({
    ...p,
    deadline: p.deadline ? new Date(p.deadline) : null
  }));
}

// Admin: Get every project in the system
export async function getAllProjects() {
  const { data } = await api.get("/projects");
  return data;
}

// Get a single project by ID
export async function getProjectById(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}

// Create a new project (evaluator only)
export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return {
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : null,
  };
}

// Update an existing project (evaluator only)
export async function updateProject(projectId, payload) {
  const { data } = await api.put(`/projects/${projectId}`, payload);
  return {
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : null,
  };
}

// Delete a project (evaluator only)
export async function deleteProject(projectId) {
  await api.delete(`/projects/${projectId}`);
}

/* -------------------------------------------------------------------------- */
/*  ADMIN – USER-PROJECT RELATIONSHIP                                         */
/* -------------------------------------------------------------------------- */

// Admin: Get all projects a specific user is involved in
export async function getUserProjects(userId) {
  const { data } = await api.get(`/projects/user/${userId}`);
  return data;
}

/* -------------------------------------------------------------------------- */
/*  EMPLOYEES – FETCHING & ASSIGNMENT                                         */
/* -------------------------------------------------------------------------- */

// Get all employees (for assignment dropdown)
export async function getAllEmployees() {
  const { data } = await api.get("/users?role=Employee");
  return data;
}

// Get employee IDs currently assigned to a project (preferred endpoint)
export async function getAssignedEmployees(projectId) {
  try {
    const { data } = await api.get(`/projects/${projectId}/assignments`);
    return data.map(a => a.employeeId || a.userId);
  } catch {
    // Fallback: derive from tasks if endpoint not available
    return getEmployeesByProject(projectId);
  }
}

// Legacy fallback: extract employees from project tasks
export async function getEmployeesByProject(projectId) {
  const project = await getProjectById(projectId);
  const tasks = project.tasks || [];
  return tasks
    .filter(t => t.assignedTo)
    .map(t => ({
      id: t.assignedTo.id,
      name: t.assignedTo.name,
      email: t.assignedTo.email,
      taskTitle: t.title,
      status: t.status,
    }));
}

// Assign/replace employees on a project (evaluator/admin)
export async function assignEmployeesToProject(projectId, employeeIds) {
  await api.post(`/projects/${projectId}/assign`, { employeeIds });
}

/* -------------------------------------------------------------------------- */
/*  PROJECT COMPLETION                                                        */
/* -------------------------------------------------------------------------- */

// Mark a project as completed (evaluator only)
export const markProjectAsCompleted = async (projectId) => {
  const { data } = await api.patch(`/projects/${projectId}/complete`);
  return data;
};

/* -------------------------------------------------------------------------- */
/*  DEPRECATED / LEGACY                                                       */
/* -------------------------------------------------------------------------- */

// Deprecated: use getMyProjects() instead
export async function getEvaluatorProjects() {
  console.warn("getEvaluatorProjects() is deprecated – use getMyProjects()");
  return getMyProjects();
}