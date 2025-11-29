/* eslint-disable no-unused-vars */
// frontend/src/pages/Admin/Projects/ProjectAnalytics.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { getStatusConfig } from "@/config/taskStatusConfig";
import { markProjectAsCompleted } from "@/services/projectService"; // ← NEW
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
import { Button } from "@/components/ui/button"; // ← NEW
import { Trophy, User, Calendar, CheckCircle2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function ProjectAnalytics() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProjectAnalytics();
      setProjects(data);
    } catch {
      toast.error("Failed to load project analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async (projectId, projectName) => {
    if (!confirm(`Mark "${projectName}" as completed?`)) return;

    try {
      await markProjectAsCompleted(projectId);
      toast.success(`"${projectName}" marked as completed!`);

      // Update local state instantly
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, status: "Completed" } : p
        )
      );
    } catch {
      toast.error("Failed to complete project");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-xl">Loading project analytics...</div>;

  if (projects.length === 0)
    return <div className="p-10 text-center text-gray-500">No projects found</div>;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-5xl font-bold text-[#0A66B3]">
          Project Analytics Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Real-time performance & completion control
        </p>
      </motion.div>

      {projects.map((project, idx) => {
        const pieData = [
          { name: "Done", value: project.done, status: "Done" },
          { name: "Submitted", value: project.submitted, status: "Submitted" },
          { name: "Approved", value: project.approved, status: "Approved" },
          { name: "Needs Revision", value: project.needsRevision, status: "NeedsRevision" },
          { name: "Rejected", value: project.rejected, status: "Rejected" },
        ].filter(d => d.value > 0);

        const isCompleted = project.status === "Completed";

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{project.name}</h2>
                  <div className="flex items-center gap-2 mt-3 text-lg opacity-90">
                    <User className="w-5 h-5" />
                    {project.createdBy} ({project.createdByEmail})
                  </div>
                </div>

                {/* COMPLETED BADGE + BUTTON */}
                <div className="flex flex-col items-end gap-3">
                  {isCompleted ? (
                    <div className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                      Completed
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCompleteProject(project.id, project.name)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary Stats */}
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-gray-800">Project Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Total Tasks" value={project.totalTasks} icon="Tasks" />
                  <StatCard label="In Progress" value={project.inProgress} icon="Progress" color="text-blue-600" />
                  <StatCard label="Done" value={project.done} icon="Done" color="text-green-600" />
                  <StatCard label="Approved" value={project.approved} icon="Approved" color="text-emerald-600" />
                </div>

                {project.topPerformer && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 flex items-center gap-4 shadow-md">
                    <Trophy className="w-12 h-12 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Top Performer</p>
                      <p className="text-xl font-bold text-yellow-800">
                        {project.topPerformer}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div>
                <h3 className="font-bold text-xl mb-4 text-gray-800">Task Evaluation Status</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={110}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={getStatusConfig(entry.status)?.color.replace("bg-", "#") || COLORS[i]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-16">No evaluated tasks yet</p>
                )}
              </div>

              {/* Bar Chart */}
              <div>
                <h3 className="font-bold text-xl mb-4 text-gray-800">Task Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "To Do", value: project.todo },
                    { name: "In Progress", value: project.inProgress },
                    { name: "Done", value: project.done },
                    { name: "Submitted", value: project.submitted },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
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
    <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200 shadow-sm">
      <div className="text-4xl mb-2">{icon}</div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-2">{label}</p>
    </div>
  );
}