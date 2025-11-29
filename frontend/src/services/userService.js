// frontend/src/services/userService.js
import api from "@/api/axios";

/**
 * Get all employees (used by Admin & Evaluator for assignment dropdowns)
 */
export async function getEmployees() {
  const { data } = await api.get("/users?role=Employee");
  return data;
}

/**
 * Get all users in the system (Admin only)
 */
export async function getAllUsers() {
  const { data } = await api.get("/users");
  return data;
}

/**
 * Get a single user by ID (public profile)
 */
export async function getUserById(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}