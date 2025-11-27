import api from "@/api/axios";

/** Get all employees */
export async function getEmployees() {
  const { data } = await api.get("/users?role=Employee");
  return data;
}

/** Get all users (Admin) */
export async function getAllUsers() {
  const { data } = await api.get("/users");
  return data;
}

