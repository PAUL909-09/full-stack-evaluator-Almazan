/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DataTable from "@/components/table/DataTable";
import employeeService from "@/services/employeeService";
import StatCard from "@/components/dashboard/StatCard";
import { getStatusConfig } from "@/config/taskStatusConfig";
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
      icon: CheckSquare,
      color: "text-blue-600",
    },
    {
      label: "To Do",
      value: stats?.todo || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "In Progress",
      value: stats?.inProgress || 0,
      icon: Hourglass,
      color: "text-purple-600",
    },
    {
      label: "Submitted",
      value: stats?.submitted || 0,
      icon: AlertTriangle,
      color: "text-blue-500",
    },
    {
      label: "Approved",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Needs Revision",
      value: stats?.needsRevision || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      label: "Rejected",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
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
          >
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              color={card.color}
            />
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
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status" },
          ]}
          data={tasks.map((task) => {
            const statusConfig = getStatusConfig(task.status);
            const StatusIcon = statusConfig.icon;
            return {
              ...task,
              status: (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${statusConfig.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                >
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {statusConfig.label}
                </span>
              ),
              deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A",
            };
          })}
        />
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;