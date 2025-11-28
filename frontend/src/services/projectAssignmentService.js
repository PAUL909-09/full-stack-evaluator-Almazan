// //frontend\src\services\projectAssignmentService.js
// import api from "@/api/axios";

// export async function getAssignmentsByProject(projectId) {
//   try {
//     const { data } = await api.get(`/projectassignments/project/${projectId}`);
//     return data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || "Failed to get assignments");
//   }
// }

// export async function assignEmployees(projectId, userIds) {
//   try {
//     await api.post("/projectassignments", { projectId, userIds });
//   } catch (error) {
//     throw new Error(error.response?.data?.message || "Failed to assign employees");
//   }
// }

// export async function removeAssignment(assignmentId) {
//   try {
//     await api.delete(`/projectassignments/${assignmentId}`);
//   } catch (error) {
//     throw new Error(error.response?.data?.message || "Failed to remove assignment");
//   }
// }

// frontend/src/services/projectAssignmentService.js
import api from "@/api/axios";

/**
 * Get all employee assignments for a specific project
 * @param {string} projectId
 * @returns {Promise<Array>}
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
        : error.response?.data?.message || "Failed to get assignments";
    throw new Error(message);
  }
}

/**
 * Assign employees to a project
 * @param {string} projectId
 * @param {Array<string>} userIds
 */
export async function assignEmployees(projectId, userIds) {
  if (!projectId) throw new Error("Project ID is required");
  if (!userIds || userIds.length === 0)
    throw new Error("Please provide at least one employee ID");

  try {
    const payload = { projectId, userIds };
    const { data } = await api.post("/projectassignments", payload);
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
 * Remove an assignment
 * @param {string} assignmentId
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
