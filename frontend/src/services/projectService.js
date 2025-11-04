// frontend/src/services/projectService.js
import api from "@/api/axios";

/**
 * 🧭 Get all projects (Admin + Evaluator)
 */
export async function getAllProjects() {
  const res = await api.get("/projects");
  return res.data;
}

/**
 * 👥 Get all employees assigned to a specific project
 * @param {string} projectId - The ID of the project
 */
export async function getEmployeesByProject(projectId) {
  const res = await api.get(`/projects/${projectId}`);
  // We include employees through project tasks (AssignedTo)
  const tasks = res.data.tasks || [];
  const employees = tasks
    .filter(t => t.assignedTo)
    .map(t => ({
      id: t.assignedTo.id,
      name: t.assignedTo.name,
      email: t.assignedTo.email,
      taskTitle: t.title,
      status: t.status
    }));

  return employees;
}

/**
 * 📊 Get all projects belonging to a specific user (Evaluator or Employee)
 * @param {string} userId
 */
export async function getUserProjects(userId) {
  const res = await api.get(`/projects/user/${userId}`);
  return res.data;
}
