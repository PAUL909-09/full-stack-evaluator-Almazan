import api from "@/api/axios";

export async function getAdminAnalytics() {
  const res = await api.get("/admin/analytics");
  return res.data;
}
