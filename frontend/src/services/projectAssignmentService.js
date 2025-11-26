import api from "@/api/axios";

export async function getAssignmentsByProject(projectId) {
  try {
    const { data } = await api.get(`/projectassignments/project/${projectId}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get assignments");
  }
}

export async function assignEmployees(projectId, userIds) {
  try {
    await api.post("/projectassignments", { projectId, userIds });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to assign employees");
  }
}

export async function removeAssignment(assignmentId) {
  try {
    await api.delete(`/projectassignments/${assignmentId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove assignment");
  }
}