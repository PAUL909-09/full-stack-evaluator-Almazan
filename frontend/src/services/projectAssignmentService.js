import api from "@/api/axios";

/** Get all employees assigned to a project */
export async function getAssignmentsByProject(projectId) {
  const { data } = await api.get(`/projectassignments/project/${projectId}`);
  return data; // [{ id, userId, name, email }]
}

/** Assign one or more employees to a project */
export async function assignEmployees(projectId, userIds) {
  await api.post("/projectassignments", { projectId, userIds });
}

/** Remove an employee from a project */
export async function removeAssignment(assignmentId) {
  await api.delete(`/projectassignments/${assignmentId}`);
}
