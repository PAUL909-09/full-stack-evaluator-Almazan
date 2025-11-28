import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DataTable from "@/components/table/DataTable";
import employeeService from "@/services/employeeService";

import {
  CheckCircle,
  Clock,
  Hourglass,
  CheckSquare,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        employeeService.getMyTasks(),
        employeeService.getMyStats(),
      ]);

      setTasks(tasksRes.data);
      setStats(statsRes);
    } catch (error) {
      console.error("Dashboard load failed:", error);
      setStats({});
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Tasks",
      value: stats?.total || 0,
      icon: <CheckSquare className="text-blue-600 w-6 h-6" />,
    },
    {
      label: "To Do",
      value: stats?.todo || 0,
      icon: <Clock className="text-yellow-600 w-6 h-6" />,
    },
    {
      label: "In Progress",
      value: stats?.inProgress || 0,
      icon: <Hourglass className="text-purple-600 w-6 h-6" />,
    },
    {
      label: "Submitted",
      value: stats?.submitted || 0,
      icon: <AlertTriangle className="text-blue-500 w-6 h-6" />,
    },
    {
      label: "Approved",
      value: stats?.approved || 0,
      icon: <CheckCircle className="text-green-600 w-6 h-6" />,
    },
    {
      label: "Needs Revision",
      value: stats?.needsRevision || 0,
      icon: <AlertTriangle className="text-orange-500 w-6 h-6" />,
    },
    {
      label: "Rejected",
      value: stats?.rejected || 0,
      icon: <XCircle className="text-red-600 w-6 h-6" />,
    },
  ];

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <motion.h1
        className="text-3xl font-bold text-[#0A66B3]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Employee Dashboard
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-5">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="p-5 rounded-2xl bg-white shadow-md border border-[#A0DCFC]/40 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-600 font-medium">{card.label}</p>
              {card.icon}
            </div>
            <p className="mt-3 text-3xl font-bold text-[#0A66B3]">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tasks Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          title="My Tasks"
          columns={[
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Status" },
          ]}
          data={tasks}
        />
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;
