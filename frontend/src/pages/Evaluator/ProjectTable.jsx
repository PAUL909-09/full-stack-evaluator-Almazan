// frontend/src/pages/Evaluator/ProjectTable.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Folder, Users, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import DataTable from "@/components/table/DataTable";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { format } from "date-fns";

import { getMyProjects, deleteProject } from "@/services/projectService";

const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [createModal, setCreateModal] = useState({
    open: false,
    project: null,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getMyProjects();
      setProjects(data ?? []);
    } catch (error) {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => setProjects((p) => [...p]), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    if (!selectedProject?.id) return;
    try {
      await deleteProject(selectedProject.id);
      setConfirmOpen(false);
      await fetchProjects();
      toast.success("Project deleted!");
    } catch {
      toast.error("Delete failed.");
    }
  };

  // FIXED: DataTable expects `key` and `label`
  const columns = [
    { key: "name", label: "Project Name" },
    { key: "description", label: "Description" },
    { key: "tasks", label: "Tasks" },
    { key: "deadlineBadge", label: "Deadline" },
  ];

  // Transform project data to match DataTable rendering
  const mappedProjects = projects.map((p) => {
    // Deadline formatting
    let badge = "No deadline";
    let badgeClass =
      "bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold";

    if (p.deadline) {
      const date = new Date(p.deadline);
      const now = new Date();
      const diffDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
      const absDays = Math.abs(diffDays);

      const formatted = isNaN(date.getTime())
        ? "Invalid date"
        : format(date, "MMM dd, yyyy");

      if (!isNaN(date.getTime())) {
        if (diffDays < 0) {
          badge =
            absDays === 0
              ? "Overdue today"
              : `Overdue by ${absDays} day${absDays > 1 ? "s" : ""}`;
          badgeClass =
            "bg-red-100 text-red-700 border border-red-300 px-3 py-1 rounded-full text-xs font-bold";
        } else if (diffDays === 0) {
          badge = "Due today";
          badgeClass =
            "bg-orange-100 text-orange-700 border border-orange-300 px-3 py-1 rounded-full text-xs font-bold";
        } else if (diffDays <= 7) {
          badge = `${absDays} day${absDays > 1 ? "s" : ""} left`;
          badgeClass =
            "bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-full text-xs font-bold";
        } else {
          badge = `${absDays} days left`;
          badgeClass =
            "bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-xs font-bold";
        }
      }

      return {
        ...p,
        description: p.description || "—",
        tasks: p.tasks?.length || 0,

        // Shown in the cell
        deadlineBadge: (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{formatted}</span>
            </div>

            <span className={badgeClass}>{badge}</span>
          </div>
        ),
      };
    }

    return {
      ...p,
      description: p.description || "—",
      tasks: p.tasks?.length || 0,
      deadlineBadge: (
        <span className="text-gray-400 text-sm italic">No deadline</span>
      ),
    };
  });

  const actions = (project) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/evaluator/manage-assignments/${project.id}`}
        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition"
      >
        <Users className="h-4 w-4" />
      </Link>

      <button
        onClick={() => setCreateModal({ open: true, project })}
        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
      >
        <Edit className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          setSelectedProject(project);
          setConfirmOpen(true);
        }}
        className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Folder className="h-10 w-10 text-[#0A66B3]" />
          <div>
            <h1 className="text-4xl font-bold text-[#0A66B3]">My Projects</h1>
            <p className="text-gray-600">Track progress and deadlines</p>
          </div>
        </div>

        <Button
          onClick={() => setCreateModal({ open: true, project: null })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-3 shadow-lg text-lg px-6 py-3"
        >
          <Plus className="h-6 w-6" />
          Create Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
          Loading projects...
        </div>
      ) : mappedProjects.length === 0 ? (
        <div className="text-center py-20">
          <Folder className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">
            No projects yet. Create your first one!
          </p>
        </div>
      ) : (
        <DataTable data={mappedProjects} columns={columns} actions={actions} />
      )}

      <CreateProjectModal
        open={createModal.open}
        onClose={() => setCreateModal({ open: false, project: null })}
        project={createModal.project}
        onSubmit={async () => {
          setCreateModal({ open: false, project: null });
          await fetchProjects();
        }}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete Project"
        message={`Delete "${selectedProject?.name}" permanently?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProjectTable;
