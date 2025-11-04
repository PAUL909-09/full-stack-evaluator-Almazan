import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getAdminAnalytics } from "@/services/adminService";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function UserAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAdminAnalytics();
      setData(res);
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500">
        Loading analytics...
      </div>
    );
  }

  const { summary, userStats, projectStats, taskStats, evalStats } = data;

  return (
    <div className="space-y-10">
      {/* 🔢 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: summary.totalUsers },
          { label: "Projects", value: summary.totalProjects },
          { label: "Tasks", value: summary.totalTasks },
          { label: "Avg Eval Score", value: summary.avgEvalScore.toFixed(2) },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <p className="text-gray-600 text-sm">{card.label}</p>
            <h2 className="text-3xl font-bold text-blue-600">{card.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* 🧍 User Role Distribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          User Distribution by Role
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="count" data={userStats} cx="50%" cy="50%" outerRadius={100} label>
              {userStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 📊 Projects per Evaluator */}
      <motion.div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Projects per Evaluator</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectStats}>
            <XAxis dataKey="evaluator" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="projectCount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ✅ Task Status Breakdown */}
      <motion.div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Task Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie dataKey="count" data={taskStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
              {taskStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 🌟 Average Evaluation per Project */}
      <motion.div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Evaluation Score per Project</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={evalStats}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="project" width={150} />
            <Tooltip />
            <Bar dataKey="avgScore" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
