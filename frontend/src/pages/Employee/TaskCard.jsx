// frontend/src/pages/Employee/TaskCard.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import  Badge  from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const statusConfig = {
  Approved: { color: "bg-emerald-600", icon: CheckCircle2, label: "Approved" },
  Rejected: { color: "bg-red-600", icon: XCircle, label: "Rejected" },
  NeedsRevision: { color: "bg-orange-500", icon: AlertCircle, label: "Needs Revision" },
  Submitted: { color: "bg-blue-600", label: "Submitted" },
  InProgress: { color: "bg-yellow-500", label: "In Progress" },
  Todo: { color: "bg-gray-500", label: "To Do" },
};

export default function TaskCard({ task }) {
  const evaluation = task.evaluation;
  const currentStatus = evaluation?.status || task.status;
  const statusInfo = statusConfig[currentStatus] || statusConfig.Todo;

  const StatusIcon = statusInfo.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold leading-tight">
            {task.title}
          </CardTitle>
          <Badge className={`${statusInfo.color} text-white flex items-center gap-1.5`}>
            {StatusIcon && <StatusIcon className="w-4 h-4" />}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          {task.description || "No description provided."}
        </p>

        {/* Evaluator Feedback Box */}
        {evaluation?.comments && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              evaluation.status === "NeedsRevision"
                ? "bg-orange-50 border-orange-500"
                : evaluation.status === "Approved"
                ? "bg-emerald-50 border-emerald-500"
                : "bg-blue-50 border-blue-500"
            }`}
          >
            <p className="font-semibold text-gray-800 flex items-center gap-2">
              {evaluation.status === "NeedsRevision" && "Needs Revision"}
              {evaluation.status === "Approved" && "Approved!"}
              {evaluation.status === "Rejected" && "Feedback"}
            </p>
            <p className="mt-2 text-gray-700 italic">"{evaluation.comments}"</p>
            <p className="text-xs text-gray-500 mt-3">
              — {evaluation.evaluatorName || "Evaluator"}, {new Date(evaluation.evaluatedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Special Message for NeedsRevision */}
        {evaluation?.status === "NeedsRevision" && (
          <div className="bg-orange-100 text-orange-800 p-4 rounded-lg text-sm font-medium">
            Please review the feedback above, make the necessary changes, and{" "}
            <strong>re-submit</strong> with a new proof file.
          </div>
        )}

        {/* Celebration for Approved */}
        {evaluation?.status === "Approved" && (
          <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg text-sm font-medium text-center">
            Congratulations! This task has been approved.
          </div>
        )}
      </CardContent>
    </Card>
  );
}