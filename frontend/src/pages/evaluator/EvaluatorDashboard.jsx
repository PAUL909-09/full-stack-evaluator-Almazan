// frontend/src/pages/Evaluator/EvaluatorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import api from "@/api/axios";
import { Button } from "@/components/ui/button"; // For the new button
import { toast } from "react-toastify";
import StatCard from "@/components/dashboard/StatCard"; // Added import
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react"; // Added icons

export default function EvaluatorDashboard() {
  const navigate = useNavigate(); // For navigating to TaskReviews
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingEvaluations: 0,
    approved: 0,
    needsRevision: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch all tasks (adjust if you have a dedicated stats endpoint)
      const tasksRes = await api.get("/tasks");
      const tasks = tasksRes.data;

      // Fetch evaluations for each task (or batch if backend supports)
      const evaluations = {};
      for (const task of tasks) {
        try {
          const evalRes = await api.get(`/evaluations/${task.id}`); // Updated to match your backend route
          evaluations[task.id] = evalRes.data;
        } catch {
          // Ignore if no evaluation
        }
      }

      // Compute stats
      const totalTasks = tasks.length;
      const pendingEvaluations = tasks.filter(
        (t) => t.status === "Submitted"
      ).length;
      const approved = Object.values(evaluations).filter(
        (e) => e?.status === "Approved"
      ).length;
      const needsRevision = Object.values(evaluations).filter(
        (e) => e?.status === "NeedsRevision"
      ).length;
      const rejected = Object.values(evaluations).filter(
        (e) => e?.status === "Rejected"
      ).length;

      setStats({
        totalTasks,
        pendingEvaluations,
        approved,
        needsRevision,
        rejected,
      });
    } catch (err) {
      toast.error("Failed to load stats: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard stats…</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Evaluator Dashboard
        </h1>
        
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Briefcase}
          label="Total Tasks"
          value={stats.totalTasks}
          color="text-gray-800"
        />
        <StatCard
          icon={Clock}
          label="Pending Evaluations"
          value={stats.pendingEvaluations}
          color="text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          color="text-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Needs Revision"
          value={stats.needsRevision}
          color="text-orange-600"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="text-red-600"
        />
      </div>

      {/* Add more sections here, e.g., recent evaluations or charts */}
    </div>
  );
}
