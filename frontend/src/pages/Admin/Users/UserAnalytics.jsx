// frontend/src/pages/Admin/Users/UserAnalytics.jsx

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminService from "@/services/adminService";
import { motion } from "framer-motion";
import DataTable from "@/components/table/DataTable";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function UserAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getAdminAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-lg">
        Loading analytics…
      </div>
    );
  }

  const {
    summary,
    userStats,
    projectStats,
    taskStats,
    evaluationStats,
    evaluatorDetails,
    employeeDetails,
  } = data;

  return (
    <div className="space-y-14">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold text-[#0A66B3]">
          User Analytics Dashboard
        </h1>
        <p className="text-gray-500">
          A detailed insight into users, tasks, evaluations & performance
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: summary.totalUsers },
          { label: "Projects", value: summary.totalProjects },
          { label: "Tasks", value: summary.totalTasks },
          { label: "Evaluations", value: summary.totalEvaluations },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.04 }}
            className="
              bg-gradient-to-br from-[#EAF6FF] to-[#ffffff]
              border border-[#A0DCFC]/50 shadow-md rounded-2xl
              p-6 text-center transition-all
            "
          >
            <p className="text-sm text-[#0A66B3]">{item.label}</p>
            <h2 className="text-4xl font-bold text-[#0A66B3]">
              {item.value}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* User Role Pie */}
        <ChartCard title="User Distribution by Role">
          <PieChart>
            <Pie dataKey="count" data={userStats} outerRadius={110} label>
              {userStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        {/* Task Status */}
        <ChartCard title="Task Status Breakdown">
          <PieChart>
            <Pie dataKey="count" data={taskStats} outerRadius={110} label>
              {taskStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        {/* Projects Bar */}
        <ChartCard title="Tasks per Project">
          <BarChart data={projectStats}>
            <XAxis dataKey="project" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taskCount" fill="#3b82f6" />
          </BarChart>
        </ChartCard>

        {/* Evaluations Pie */}
        <ChartCard title="Evaluation Status Breakdown">
          <PieChart>
            <Pie dataKey="count" data={evaluationStats} outerRadius={110} label>
              {evaluationStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>

      {/* Evaluator Table */}
      <DataTable
        title="Evaluator Performance Report"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "assignedTasks", label: "Tasks Created" },
          { key: "evaluationsGiven", label: "Evaluations Done" },
        ]}
        data={evaluatorDetails}
      />

      {/* Employee Table */}
      <DataTable
        title="Employee Task Activity Report"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "tasksAssigned", label: "Total Tasks" },
          { key: "completedTasks", label: "Completed" },
          { key: "pendingTasks", label: "Pending" },
        ]}
        data={employeeDetails}
      />
    </div>
  );
}

/* Reusable Chart Card Component */
function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="
        bg-white border border-[#A0DCFC]/50 rounded-2xl shadow-lg
        p-6 backdrop-blur-sm
      "
    >
      <h3 className="text-lg font-semibold text-[#0A66B3] mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </motion.div>
  );
}
