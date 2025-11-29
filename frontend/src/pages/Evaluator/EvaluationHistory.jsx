// frontend/src/pages/Evaluator/EvaluationHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import evaluationService from "@/services/evaluationService";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/DataTable";
import Badge from "@/components/ui/badge";
import { toast } from "react-toastify";

import { History, ArrowLeft } from "lucide-react";

// NEW: Use your centralized status configuration
import { getStatusConfig } from "@/config/taskStatusConfig";

export default function EvaluationHistory() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Evaluator")) {
      toast.error("Access denied. Evaluators only.");
      navigate("/");
      return;
    }
  }, [user, authLoading, navigate]);

  // Load evaluation history
  useEffect(() => {
    if (authLoading || !user) return;

    const loadHistory = async () => {
      try {
        const data = await evaluationService.getMyEvaluationHistory();
        setEvaluations(data || []);

        if (!data || data.length === 0) {
          toast.info("No evaluations yet. Try evaluating a submitted task!");
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load evaluation history: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [authLoading, user]);

  // Table columns
  const columns = [
    { key: "taskTitle", label: "Task Title" },
    { key: "status", label: "Status" },
    { key: "comments", label: "Comments" },
    { key: "evaluatedAt", label: "Evaluated At" },
  ];

  // Map API result → DataTable-ready data
  const mappedEvaluations = evaluations.map((evaluation) => {
    const statusInfo = getStatusConfig(evaluation.status);
    const StatusIcon = statusInfo.icon; // lucide-react icon

    return {
      ...evaluation,
      status: (
        <Badge className={`${statusInfo.color} text-white flex items-center gap-2 px-3 py-1`}>
          <StatusIcon className="w-4 h-4" />
          {statusInfo.label}
        </Badge>
      ),
      comments: evaluation.comments || "—",
      evaluatedAt: new Date(evaluation.evaluatedAt).toLocaleString(),
    };
  });

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
        <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
          Loading your evaluation history...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <History className="h-10 w-10 text-[#0A66B3]" />
          <div>
            <h1 className="text-4xl font-bold text-[#0A66B3]">
              My Evaluation History
            </h1>
            <p className="text-gray-600">Review all tasks you've evaluated</p>
          </div>
        </div>

        <Button
          onClick={() => navigate(-1)}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center gap-3 shadow-lg text-lg px-6 py-3"
        >
          <ArrowLeft className="h-6 w-6" />
          Back
        </Button>
      </div>

      {/* Empty State */}
      {mappedEvaluations.length === 0 ? (
        <div className="text-center py-20">
          <History className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No evaluations found.</p>
          <p className="text-sm text-gray-400 mt-4">
            Tip: Go to "Pending Tasks" and evaluate a submitted task first!
          </p>
        </div>
      ) : (
        <DataTable title="Evaluation History" columns={columns} data={mappedEvaluations} />
      )}
    </div>
  );
}
