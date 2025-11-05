// frontend/src/pages/evaluator/ProjectList.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import { toast } from "react-toastify";  // ✅ Already imported, now fully used
import ConfirmModal from "@/components/ConfirmModal";
import DataTable from "@/components/table/DataTable";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [createModal, setCreateModal] = useState({ open: false, project: null });

  // 🔹 Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data || []);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      toast.error("Failed to load projects. Please try again.");  // ✅ Replaced alert with toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔹 Delete project
  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${selectedProject.id}`);
      setConfirmOpen(false);
      await fetchProjects(); // ✅ refresh after delete
      toast.success("Project deleted successfully.");  // ✅ Added success toast for better feedback
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");  // ✅ Replaced alert with toast
    }
  };

  // 🔹 Handle save (create or update)
  const handleSaveProject = async (formData, isEdit) => {
    try {
      if (isEdit && createModal.project) {
        await api.put(`/projects/${createModal.project.id}`, formData);
      } else {
        await api.post("/projects", formData);
      }
      setCreateModal({ open: false, project: null });
      await fetchProjects(); // ✅ ensure refresh after saving
      toast.success(`Project ${isEdit ? "updated" : "created"} successfully.`);  // ✅ Added success toast
    } catch (error) {
      console.error("❌ Error saving project:", error);
      toast.error("Failed to save project. Please try again.");  // ✅ Replaced alert with toast
    }
  };

  // 🔹 Table columns
  const columns = [
    { key: "name", label: "Project Name" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Folder className="h-8 w-8 text-[#0A66B3]" />
          <h1 className="text-3xl font-bold text-[#0A66B3] tracking-tight">
            Projects
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

      {/* Data Table Section */}
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
            <div className="flex justify-center space-x-3">
              {/* Edit Button */}
              <button
                onClick={() => setCreateModal({ open: true, project })}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition"
                title="Edit Project"
              >
                <Edit className="h-4 w-4" />
              </button>

              {/* Delete Button */}
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

      {/* 🧩 Create/Edit Project Modal */}
      <CreateProjectModal
        open={createModal.open}
        onClose={() => setCreateModal({ open: false, project: null })}
        project={createModal.project}
        onSave={handleSaveProject} // ✅ ensures fetchProjects is called inside
      />

      {/* 🗑️ Confirm Delete Modal */}
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

export default ProjectList;