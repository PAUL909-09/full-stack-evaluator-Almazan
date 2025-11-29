/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import adminService from "@/services/adminService";
import { getStatusConfig } from "@/config/taskStatusConfig";
import { markProjectAsCompleted } from "@/services/projectService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Trophy,
  User,
  Calendar,
  CheckCircle2,
  CheckCircle,
  ClipboardList,
  Clock,
  ThumbsUp,
} from "lucide-react";

import { toast } from "react-toastify";

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

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: "Completed" } : p
        )
      );
    } catch {
      toast.error("Failed to complete project");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl text-gray-600 animate-pulse">
        Loading project analytics...
      </div>
    );

  if (projects.length === 0)
    return (
      <div className="p-10 text-center text-gray-500">No projects found.</div>
    );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      {/* ---------------------------- HEADER ---------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] text-transparent bg-clip-text drop-shadow-sm">
          Project Analytics Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Real-time insights, performance tracking & completion control
        </p>
      </motion.div>

      {/* ---------------------------- CONTENT ---------------------------- */}
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

        const isCompleted = project.status === "Completed";

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-3xl shadow-xl bg-white/90 backdrop-blur-xl border border-gray-200 overflow-hidden"
          >
            {/* ---------------------------- PROJECT HEADER ---------------------------- */}
            <div className="bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {project.name}
                  </h2>

                  <div className="flex items-center gap-3 text-lg opacity-90">
                    <User className="w-5 h-5" />
                    {project.createdBy}
                    <span className="text-white/70">
                      ({project.createdByEmail})
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 bg-emerald-600 px-6 py-3 rounded-full text-white font-bold shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                      Completed
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleCompleteProject(project.id, project.name)
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-lg shadow-lg flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------- GRID LAYOUT ---------------------------- */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* ---------------------------- LEFT: STAT CARDS ---------------------------- */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Project Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    icon={<ClipboardList />}
                    label="Total Tasks"
                    value={project.totalTasks}
                  />
                  <StatCard
                    icon={<Clock />}
                    label="In Progress"
                    value={project.inProgress}
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={<CheckCircle />}
                    label="Done"
                    value={project.done}
                    color="text-green-600"
                  />
                  <StatCard
                    icon={<ThumbsUp />}
                    label="Approved"
                    value={project.approved}
                    color="text-emerald-600"
                  />
                </div>

                {project.topPerformer && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-5 flex items-center gap-4 shadow-md">
                    <Trophy className="w-12 h-12 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Top Performer
                      </p>
                      <p className="text-xl font-bold text-yellow-800">
                        {project.topPerformer}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ---------------------------- MIDDLE: PIE CHART ---------------------------- */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Task Evaluation Status
                </h3>

                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={115}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, i) => {
                          const cfg = getStatusConfig(entry.status);
                          return <Cell key={i} fill={cfg.hex} />; })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-16">
                    No evaluated tasks yet.
                  </p>
                )}
              </div>

              {/* ---------------------------- RIGHT: BAR CHART ---------------------------- */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Task Progress
                </h3>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={[
                      { name: "To Do", value: project.todo },
                      { name: "In Progress", value: project.inProgress },
                      { name: "Done", value: project.done },
                      { name: "Submitted", value: project.submitted },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#0A66B3"
                      radius={[10, 10, 0, 0]}
                    />
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

/* ---------------------------- STAT CARD COMPONENT ---------------------------- */
function StatCard({ label, value, icon, color = "text-gray-800" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
      <div className="text-gray-600 mb-2 flex justify-center">{icon}</div>
      <p className={`text-3xl font-extrabold text-center ${color}`}>{value}</p>
      <p className="mt-1 text-center text-sm text-gray-600">{label}</p>
    </div>
  );
}
