// frontend/src/components/modals/UserDetailsModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function UserDetailsModal({ user, type, details, loading, onClose }) {
  if (!user) return null;

  const isEvaluator = type === "Evaluator";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 overflow-y-auto" 
      /* z-[9999] ensures overlay always sits above every layout element */
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] rounded-t-3xl p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-8 text-white/80 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>
          <h2 className="text-4xl font-black">{user.name}</h2>
          <p className="text-xl opacity-90 mt-2">
            {isEvaluator ? "Project Ownership & Delivery" : "Task Execution History"}
          </p>
          <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-lg font-semibold mt-3">
            {type}
          </span>
        </div>

        {/* Body */}
        <div className="p-8 pt-6">
          {loading ? (
            <div className="text-center py-20 text-xl text-gray-500">
              Loading details...
            </div>
          ) : isEvaluator ? (
            <>
              <h3 className="text-2xl font-bold text-[#0A66B3] mb-6">
                Owned Projects ({details.projects.length})
              </h3>

              {details.projects.length === 0 ? (
                <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                  No projects owned
                </p>
              ) : (
                <div className="space-y-6">
                  {details.projects.map((project) => {
                    const daysStatus =
                      project.status === "Completed"
                        ? "Completed"
                        : project.isOverdue
                        ? `Overdue by ${Math.abs(project.daysStatus)} days`
                        : project.daysStatus
                        ? `${project.daysStatus} days left`
                        : "No deadline";

                    return (
                      <div
                        key={project.id}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900">
                              {project.name}
                            </h4>
                            {project.description && (
                              <p className="text-gray-600 mt-1 text-sm">
                                {project.description}
                              </p>
                            )}
                          </div>

                          <div className="ml-6 text-right">
                            {project.status === "Completed" ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Completed
                              </span>
                            ) : project.isOverdue ? (
                              <span className="text-red-600 font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {daysStatus}
                              </span>
                            ) : project.deadline ? (
                              <span className="text-blue-600 font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {daysStatus}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">No deadline</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-blue-100 rounded-xl p-4 text-center">
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Total Tasks
                            </p>
                            <p className="text-3xl font-bold text-blue-800 mt-1">
                              {project.taskCount}
                            </p>
                          </div>

                          <div className="bg-emerald-100 rounded-xl p-4 text-center">
                            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                              Completed
                            </p>
                            <p className="text-3xl font-bold text-emerald-800 mt-1">
                              {project.completedTasks}
                            </p>
                          </div>

                          <div className="bg-purple-100 rounded-xl p-4 text-center">
                            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">
                              Rate
                            </p>
                            <p className="text-3xl font-bold text-purple-800 mt-1">
                              {project.completionRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-emerald-700 mb-6">
                Task History ({details.tasks.length} tasks)
              </h3>

              {details.tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                  No tasks assigned yet
                </p>
              ) : (
                <div className="space-y-4">
                  {details.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-50 rounded-xl p-5 border-l-4 border-emerald-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">
                            {task.title}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Project:{" "}
                            <span className="font-medium">{task.projectName}</span>
                          </p>

                          {task.projectDeadline && (
                            <p className="text-xs text-gray-500 mt-2">
                              Deadline: {format(new Date(task.projectDeadline), "PPP")}
                            </p>
                          )}
                        </div>

                        <div className="ml-6">
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                              ["Done", "Approved"].includes(task.status)
                                ? "bg-emerald-100 text-emerald-800"
                                : task.status === "Submitted"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "InProgress"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
