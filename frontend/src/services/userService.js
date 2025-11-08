// import api from "@/api/axios";

// /**
//  * Fetch all users (optionally filter by role)
//  * Example: getUsers("Employee")
//  */
// export async function getUsers(role) {
//   const { data } = await api.get(`/users${role ? `?role=${role}` : ""}`);
//   return data; // [{ id, name, email, role }]
// }

// /**
//  * Shortcut – fetch only employees
//  */
// export async function getEmployees() {
//   return getUsers("Employee");
// }

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

