// frontend/src/api/projectAssignmentService.js
import api from "@/api/axios";

/**
 * Get all employee assignments for a specific project
 */
export async function getAssignmentsByProject(projectId) {
  if (!projectId) throw new Error("Project ID is required");

  try {
    const { data } = await api.get(`/projectassignments/project/${projectId}`);
    return data;
  } catch (error) {
    const message =
      error.response?.status === 404
        ? "Project not found"
        : error.response?.data?.message || "Failed to load assignments";
    throw new Error(message);
  }
}

/**
 * Assign (or replace) employees to a project
 */
export async function assignEmployees(projectId, userIds) {
  if (!projectId) throw new Error("Project ID is required");
  if (!userIds?.length) throw new Error("At least one employee must be selected");

  try {
    const { data } = await api.post("/projectassignments", {
      projectId,
      userIds,
    });
    return data;
  } catch (error) {
    const message =
      error.response?.status === 404
        ? "Project not found"
        : error.response?.data?.message || "Failed to assign employees";
    throw new Error(message);
  }
}

/**
 * Remove an employee from a project (by assignment ID)
 */
export async function removeAssignment(assignmentId) {
  if (!assignmentId) throw new Error("Assignment ID is required");

  try {
    await api.delete(`/projectassignments/${assignmentId}`);
  } catch (error) {
    const message =
      error.response?.status === 404
        ? "Assignment not found"
        : error.response?.data?.message || "Failed to remove assignment";
    throw new Error(message);
  }
}