// frontend/src/pages/Evaluator/ProjectList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ← ADD THIS
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Folder, Users  } from "lucide-react"; // ← ADD EyeView Tasks
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ConfirmModal";
import DataTable from "@/components/table/DataTable";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/projectService";

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
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (!selectedProject?.id) return;

    try {
      await deleteProject(selectedProject.id);
      setConfirmOpen(false);
      await fetchProjects();
      toast.success("Project deleted successfully.");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  const handleSaveProject = async (formData, isEdit) => {
    try {
      if (isEdit && createModal.project?.id) {
        await updateProject(createModal.project.id, formData);
      } else {
        await createProject(formData);
      }

      setCreateModal({ open: false, project: null });
      await fetchProjects();
      toast.success(`Project ${isEdit ? "updated" : "created"} successfully.`);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project.");
    }
  };

  // ── TABLE COLUMNS ─────────────────────────────────────
  const columns = [
    { key: "name", label: "Project Name" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Folder className="h-8 w-8 text-[#0A66B3]" />
          <h1 className="text-3xl font-bold text-[#0A66B3] tracking-tight">
            My Projects
          </h1>
        </div>

        <Button
          onClick={() => setCreateModal({ open: true, project: null })}
          className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg flex items-center gap-2 shadow-md transition-all duration-200 px-4 py-2"
        >
          <Plus className="h-5 w-5" />
          Create Project
        </Button>
      </div>

      {/* Loading / Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 animate-pulse">
          Loading projects...
        </div>
      ) : (
        <DataTable
          title="Projects Overview"
          columns={columns}
          data={projects}
          actions={(project) => (
            <div className="flex justify-center items-center space-x-2">
              {/* View Tasks */}
              {/* <Link
                to={`/evaluator/project-tasks/${project.id}`}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md transition"
                title="View Tasks"
              >
                <Eye className="h-4 w-4" />
              </Link> */}
              {/* Manage Assignments */}
              <Link
                to={`/evaluator/manage-assignments/${project.id}`}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition"
                title="Manage Assignments"
              >
                <Users className="h-4 w-4" />
              </Link>

              {/* Edit */}
              <button
                onClick={() => setCreateModal({ open: true, project })}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition"
                title="Edit Project"
              >
                <Edit className="h-4 w-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  setSelectedProject(project);
                  setConfirmOpen(true);
                }}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition"
                title="Delete Project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      {/* Create / Edit Modal */}
      <CreateProjectModal
        open={createModal.open}
        onClose={() => setCreateModal({ open: false, project: null })}
        project={createModal.project}
        onSave={handleSaveProject}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProjectTable;
