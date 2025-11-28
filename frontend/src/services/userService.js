// frontend/src/services/userService.js
import api from "@/api/axios";

/** Get all employees (Admin or Evaluator) */
export async function getEmployees() {
  try {
    const { data } = await api.get("/users?role=Employee");
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch employees");
  }
}

/** Get all users (Admin only) */
export async function getAllUsers() {
  try {
    const { data } = await api.get("/users?role="); // optional: Admin can filter later
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
}

/** Get single user by ID */
export async function getUserById(userId) {
  try {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
}
