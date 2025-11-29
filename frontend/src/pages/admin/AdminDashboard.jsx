// frontend/src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import adminService from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import StatCard from "@/components/dashboard/StatCard";

import {
  Users,
  Briefcase,
  CheckSquare,
  UserPlus,
  Clock,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [analyticsData, projectsData] = await Promise.all([
          adminService.getAdminAnalytics(),
          adminService.getAllProjects(),
        ]);

        setData(analyticsData);
        setProjects(projectsData || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-xl text-gray-400">
        Loading system overview...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-red-600 text-lg">
        Backend not responding
      </div>
    );
  }

  const { summary, userStats, taskStats } = data;

  const completedProjects = projects.filter(
    (p) => p.status === "Completed" || p.Status === "Completed"
  ).length;

  const totalProjects = projects.length || summary.totalProjects || 0;
  const pendingApproval =
    taskStats.find((s) => s.status === "Submitted")?.count || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Admin Command Center
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time system health, task flow & operational metrics
          </p>
        </div>
        <Button onClick={() => (window.location.href = "/admin/invite")}>
          <UserPlus className="w-5 h-5 mr-2" /> Invite User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={summary.totalUsers}
          color="text-violet-600"
        />

        <StatCard
          icon={Briefcase}
          label="Total Projects"
          value={totalProjects}
          color="text-blue-600"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed Projects"
          value={completedProjects}
          color="text-emerald-600"
          badge={
            completedProjects === totalProjects && totalProjects > 0
              ? "All Done!"
              : null
          }
        />

        <StatCard
          icon={CheckSquare}
          label="Total Tasks"
          value={summary.totalTasks}
          color="text-green-600"
        />

        <StatCard
          icon={ThumbsUp}
          label="Evaluations"
          value={summary.totalEvaluations}
          color="text-emerald-600"
        />

        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={pendingApproval}
          color="text-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-[#0A66B3] mb-4">
            Current User Roles
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={userStats}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ role, count }) => `${role}: ${count}`}
              >
                {userStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[#0A66B3] mb-4">
            Task Lifecycle Status
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={taskStats}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                label
              >
                {taskStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm pt-8">
        Last updated: {new Date().toLocaleString()} • Powered by .NET 9 + React + Vite
      </div>
    </div>
  );
}
