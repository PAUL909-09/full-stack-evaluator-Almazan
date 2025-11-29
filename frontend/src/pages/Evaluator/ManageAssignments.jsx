// frontend/src/pages/Evaluator/ManageAssignments.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { getProjectById } from "@/services/projectService";
import { getEmployees } from "@/services/userService";
import {
  getAssignmentsByProject,
  assignEmployees,
  removeAssignment,
} from "@/services/projectAssignmentService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Users, Plus, Trash2, UserCheck, CheckCircle } from "lucide-react";
import ConfirmModal from "@/components/modals/ConfirmModal"; // Add this import

export default function ManageAssignments() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    assignmentId: null,
    employeeName: "",
  }); // Add state for modal

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [proj, allEmps, assigned] = await Promise.all([
        getProjectById(projectId),
        getEmployees(),
        getAssignmentsByProject(projectId),
      ]);
      setProject(proj);
      setEmployees(allEmps);
      setAssignments(assigned);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Filter out already assigned employees
  const unassignedEmployees = employees.filter(
    (e) => !assignments.some((a) => a.userId === e.id)
  );

  async function handleAssign() {
    if (!selectedEmployee) return toast.warn("Select an employee first!");
    try {
      await assignEmployees(projectId, [selectedEmployee]);
      toast.success("Employee assigned!");
      setSelectedEmployee("");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data || "Failed to assign");
    }
  }

  // Modified handleRemove to use ConfirmModal
  function handleRemove(assignmentId, employeeName) {
    setConfirmModal({ open: true, assignmentId, employeeName });
  }

  // Confirm removal
  async function confirmRemove() {
    try {
      await removeAssignment(confirmModal.assignmentId);
      toast.info("Removed assignment");
      loadAll();
    } catch {
      toast.error("Failed to remove assignment");
    } finally {
      setConfirmModal({ open: false, assignmentId: null, employeeName: "" });
    }
  }

  // Cancel removal
  function cancelRemove() {
    setConfirmModal({ open: false, assignmentId: null, employeeName: "" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <AnimatePresence>
        <motion.div
          className="container max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Users className="h-10 w-10" />
              Manage Assignments
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              {project ? `Project: ${project.name}` : "Loading project..."}
            </p>
          </motion.div>

          {loading ? (
            <motion.div
              className="flex items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Employee Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                      <Plus className="h-6 w-6 text-green-600" />
                      Add Employee
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Employee
                      </label>
                      <Select
                        value={selectedEmployee}
                        onValueChange={setSelectedEmployee}
                      >
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue
                            placeholder={
                              unassignedEmployees.length === 0
                                ? "All employees already assigned"
                                : "Choose an employee..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedEmployees.length === 0 ? (
                            <SelectItem value="none" disabled>
                              All employees already assigned to this project
                            </SelectItem>
                          ) : (
                            unassignedEmployees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name} ({e.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {unassignedEmployees.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          All available employees are already assigned to this
                          project.
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleAssign}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
                      disabled={
                        !selectedEmployee || unassignedEmployees.length === 0
                      }
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Assign Employee
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Assigned Employees Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                      <Users className="h-6 w-6 text-blue-600" />
                      Assigned Employees ({assignments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assignments.length === 0 ? (
                      <motion.p
                        className="text-center text-gray-500 dark:text-gray-400 py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        No employees assigned yet.
                      </motion.p>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {assignments.map((a, index) => (
                            <motion.div
                              key={a.id}
                              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">
                                    {a.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {a.email}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(a.id, a.name)} // Pass assignmentId and name
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Confirm Modal */}
          <ConfirmModal
            open={confirmModal.open}
            title="Remove Assignment"
            message={`Are you sure you want to remove ${confirmModal.employeeName} from this project? This action cannot be undone.`}
            type="error"
            onConfirm={confirmRemove}
            onCancel={cancelRemove}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
