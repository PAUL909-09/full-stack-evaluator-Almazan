// frontend/src/pages/Admin/Users/UserAnalytics.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { getTasksByProject } from "@/services/tasksService";
import { getAllProjects } from "@/services/projectService";
import DataTable from "@/components/table/DataTable";
import { toast } from "react-toastify";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import StatCard from "@/components/dashboard/StatCard"; // Added import
import {
  Users,
  Briefcase,
  CheckCircle2,
  UserCheck,
  Target,
  Trophy,
} from "lucide-react";

export default function UserAnalytics() {
  const [evaluators, setEvaluators] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Open modal with deep details
  const openDetails = async (user, type) => {
    setSelectedUser({ ...user, type });
    setDetailsLoading(true);
    setUserDetails(null);

    try {
      if (type === "Evaluator") {
        const ownedProjects = allProjects.filter(
          p => p.evaluatorId === user.id || p.createdBy === user.id
        );

        const detailedProjects = await Promise.all(
          ownedProjects.map(async (project) => {
            const tasks = await getTasksByProject(project.id);
            const completed = tasks.filter(t =>
              ["Done", "Approved"].includes(t.status)
            ).length;

            const isOverdue =
              project.deadline &&
              project.status !== "Completed" &&
              new Date() > project.deadline;

            const daysStatus = project.status === "Completed"
              ? "Completed"
              : isOverdue
              ? Math.ceil((new Date() - project.deadline) / (1000 * 60 * 60 * 24))
              : project.deadline
              ? Math.ceil((project.deadline - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return {
              ...project,
              taskCount: tasks.length,
              completedTasks: completed,
              completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
              isOverdue,
              daysStatus,
            };
          })
        );

        setUserDetails({ projects: detailedProjects });
      } else {
        // Employee
        const tasksList = [];
        const projectSet = new Set();

        for (const project of allProjects) {
          const tasks = await getTasksByProject(project.id);
          const myTasks = tasks.filter(
            t => t.assignedTo === user.id || (t.assignedTo?.id === user.id)
          );

          if (myTasks.length > 0) {
            projectSet.add(project.id);
            tasksList.push(
              ...myTasks.map(t => ({
                ...t,
                projectName: project.name,
                projectDeadline: project.deadline,
              }))
            );
          }
        }

        setUserDetails({
          tasks: tasksList,
          projects: Array.from(projectSet).map(id =>
            allProjects.find(p => p.id === id)
          ),
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
    setDetailsLoading(false);
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        // Load all projects
        const projects = await getAllProjects();
        const normalizedProjects = projects.map(p => ({
          ...p,
          deadline: p.deadline ? new Date(p.deadline) : null,
          isCompleted: p.status === "Completed",
        }));
        setAllProjects(normalizedProjects);

        // Load admin analytics
        const analytics = await adminService.getAdminAnalytics();
        const { evaluatorDetails = [], employeeDetails = [] } = analytics;

        // Evaluators
        const evaluatorStats = await Promise.all(
          evaluatorDetails.map(async (evaluator) => {
            const owned = normalizedProjects.filter(
              p => p.evaluatorId === evaluator.id || p.createdBy === evaluator.id
            );

            let totalTasks = 0;
            let completedTasks = 0;

            for (const p of owned) {
              const tasks = await getTasksByProject(p.id);
              totalTasks += tasks.length;
              completedTasks += tasks.filter(t =>
                ["Done", "Approved"].includes(t.status)
              ).length;
            }

            return {
              ...evaluator,
              projectsOwned: owned.length,
              completedProjects: owned.filter(p => p.isCompleted).length,
              tasksCreated: totalTasks,
              tasksCompleted: completedTasks,
              completionRate:
                totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            };
          })
        );

        // Employees
        const employeeStats = await Promise.all(
          employeeDetails.map(async (emp) => {
            let assigned = 0;
            let done = 0;
            const projectsWorked = new Set();

            for (const p of normalizedProjects) {
              const tasks = await getTasksByProject(p.id);
              const mine = tasks.filter(
                t => t.assignedTo === emp.id || t.assignedTo?.id === emp.id
              );

              if (mine.length > 0) projectsWorked.add(p.id);
              assigned += mine.length;
              done += mine.filter(t =>
                ["Done", "Approved"].includes(t.status)
              ).length;
            }

            return {
              ...emp,
              projectsWorkedOn: projectsWorked.size,
              tasksAssigned: assigned,
              tasksCompleted: done,
              completionRate: assigned > 0 ? Math.round((done / assigned) * 100) : 0,
            };
          })
        );

        setEvaluators(evaluatorStats);
        setEmployees(employeeStats.sort((a, b) => b.completionRate - a.completionRate));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-xl text-gray-500">
        Loading workforce intelligence...
      </div>
    );
  }

  const totalCompletedProjects = allProjects.filter(p => p.isCompleted).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-12"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-6xl font-black bg-gradient-to-r from-[#0A66B3] to-[#1E88E5] bg-clip-text text-transparent">
          Workforce Intelligence Center
        </h1>
        <p className="text-2xl text-gray-600 mt-4">
          Click any name for complete performance details
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard icon={Briefcase} label="Projects" value={allProjects.length} color="text-blue-600" />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={totalCompletedProjects}
          color="text-emerald-600"
          badge={totalCompletedProjects === allProjects.length ? "All Done!" : null}
        />
        <StatCard icon={Users} label="Evaluators" value={evaluators.length} color="text-purple-600" />
        <StatCard icon={UserCheck} label="Employees" value={employees.length} color="text-teal-600" />
        <StatCard
          icon={Target}
          label="Tasks Created"
          value={evaluators.reduce((a, e) => a + e.tasksCreated, 0)}
          color="text-indigo-600"
        />
        <StatCard
          icon={Trophy}
          label="Tasks Delivered"
          value={employees.reduce((a, e) => a + e.tasksCompleted, 0)}
          color="text-green-600"
        />
      </div>

      {/* Evaluator Report */}
      <Section title="Evaluator Impact Report" gradient="from-blue-600 to-indigo-700">
        <DataTable
          columns={[
            { key: "name", label: "Evaluator" },
            { key: "projectsOwned", label: "Projects" },
            { key: "tasksCreated", label: "Tasks" },
            { key: "completionRate", label: "Delivery %" },
          ]}
          data={evaluators.map(e => ({
            id: e.id,
            name: (
              <button
                onClick={() => openDetails(e, "Evaluator")}
                className="text-lg font-bold text-blue-600 hover:underline transition"
              >
                {e.name} →
              </button>
            ),
            projectsOwned: <span className="text-2xl font-bold text-blue-600">{e.projectsOwned}</span>,
            tasksCreated: <span className="text-xl text-indigo-600">{e.tasksCreated}</span>,
            completionRate: (
              <span className={`text-2xl font-bold ${e.completionRate >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {e.completionRate}%
              </span>
            ),
          }))}
        />
      </Section>

      {/* Employee Report */}
      <Section title="Employee Delivery Report" gradient="from-emerald-600 to-teal-700">
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "projectsWorkedOn", label: "Projects" },
            { key: "tasksAssigned", label: "Assigned" },
            { key: "tasksCompleted", label: "Delivered" },
            { key: "completionRate", label: "Completion %" },
          ]}
          data={employees.map(e => ({
            id: e.id,
            name: (
              <button
                onClick={() => openDetails(e, "Employee")}
                className="text-lg font-bold text-emerald-600 hover:underline transition"
              >
                {e.name} →
              </button>
            ),
            projectsWorkedOn: <span className="text-xl text-purple-600">{e.projectsWorkedOn}</span>,
            tasksAssigned: <span className="text-xl text-indigo-600">{e.tasksAssigned}</span>,
            tasksCompleted: <span className="text-2xl font-bold text-emerald-600">{e.tasksCompleted}</span>,
            completionRate: (
              <span className={`text-2xl font-bold ${e.completionRate >= 90 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {e.completionRate}%
              </span>
            ),
          }))}
        />
      </Section>

      {/* Reusable Modal */}
      <UserDetailsModal
        user={selectedUser}
        type={selectedUser?.type}
        details={userDetails}
        loading={detailsLoading}
        onClose={closeModal}
      />
    </motion.div>
  );
}

// Reusable components
function Section({ title, gradient, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${gradient} p-8 text-white`}>
        <h2 className="text-4xl font-bold text-center">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
