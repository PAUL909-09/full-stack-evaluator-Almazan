// frontend/src/pages/Admin/Projects/ProjectAnalytics.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { getStatusConfig } from "@/config/taskStatusConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Trophy, User, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function ProjectAnalytics() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getProjectAnalytics()
      .then(setProjects)
      .catch(() => toast.error("Failed to load project analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading project analytics...</div>;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl font-bold text-[#0A66B3]">
          Project Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Complete performance breakdown per project
        </p>
      </motion.div>

      {projects.map((project, idx) => {
        const pieData = [
          { name: "Done", value: project.done, status: "Done" },
          { name: "Submitted", value: project.submitted, status: "Submitted" },
          { name: "Approved", value: project.approved, status: "Approved" },
          {
            name: "Needs Revision",
            value: project.needsRevision,
            status: "NeedsRevision",
          },
          { name: "Rejected", value: project.rejected, status: "Rejected" },
        ].filter((d) => d.value > 0);

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] p-6 text-white">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm opacity-90">
                <User className="w-4 h-4" />
                Created by <strong>{project.createdBy}</strong> (
                {project.createdByEmail})
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary Stats */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  Project Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    label="Total Tasks"
                    value={project.totalTasks}
                    icon="📋"
                  />
                  <StatCard
                    label="In Progress"
                    value={project.inProgress}
                    icon="⚡"
                  />
                  <StatCard
                    label="Done"
                    value={project.done}
                    icon="✅"
                    color="text-green-600"
                  />
                  <StatCard
                    label="Approved"
                    value={project.approved}
                    icon="🏆"
                    color="text-emerald-600"
                  />
                </div>

                {project.topPerformer && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Top Performer</p>
                      <p className="font-bold text-yellow-800">
                        {project.topPerformer}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Pie Chart */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  Task Evaluation Status
                </h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              getStatusConfig(entry.status)?.color.replace(
                                "bg-",
                                "#"
                              ) || COLORS[i]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    No evaluated tasks yet
                  </p>
                )}
              </div>

              {/* Bar Chart: Progress Breakdown */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  Task Progress
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { name: "To Do", value: project.todo },
                      { name: "In Progress", value: project.inProgress },
                      { name: "Done", value: project.done },
                      { name: "Submitted", value: project.submitted },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-gray-700" }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center border">
      <div className="text-3xl mb-1">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}
