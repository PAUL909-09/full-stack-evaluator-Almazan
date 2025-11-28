// frontend/src/config/taskStatusConfig.js
import {
    Clock,
    CheckCircle2,
    Upload,
    Check,
    AlertTriangle,
    AlertCircle,
    CircleHelp,   // ← NEW & BETTER fallback icon
  } from "lucide-react";
  
  const TASK_STATUS_CONFIG = {
    Todo: {
      label: "To Do",
      color: "bg-gray-500",
      icon: Clock,
      description: "Not started yet",
    },
    InProgress: {
      label: "In Progress",
      color: "bg-blue-500",
      icon: Clock,
      description: "You're working on it",
    },
    Done: {
      label: "Done",
      color: "bg-green-500",
      icon: CheckCircle2,
      description: "Ready for submission",
    },
    Submitted: {
      label: "Submitted",
      color: "bg-purple-500",
      icon: Upload,
      description: "Waiting for review",
    },
    Approved: {
      label: "Approved",
      color: "bg-emerald-500",
      icon: Check,
      description: "Great job!",
    },
    NeedsRevision: {
      label: "Needs Revision",
      color: "bg-orange-500",
      icon: AlertTriangle,
      description: "Please fix and resubmit",
    },
    Rejected: {
      label: "Rejected",
      color: "bg-red-500",
      icon: AlertCircle,
      description: "Not accepted",
    },
  };
  
  export const getStatusConfig = (status) => {
    return TASK_STATUS_CONFIG[status] || {
      label: status || "Unknown",
      color: "bg-gray-400",
      icon: CircleHelp,           // ← Much nicer than FileText!
      description: "Unknown status",
    };
  };
  
  export default TASK_STATUS_CONFIG;