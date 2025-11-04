import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";
import DataTable from "@/components/table/DataTable"; // Added: Import DataTable component

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for create or edit
  const openModal = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setFormData({ name: project.name, description: project.description });
    } else {
      setSelectedProject(null);
      setFormData({ name: "", description: "" });
    }
    setModalOpen(true);
  };

  // Save (Create or Update)
  // In handleSave function
  const handleSave = async () => {
    try {
      if (selectedProject) {
        // Update
        await axios.put(
          `http://localhost:5000/api/projects/${selectedProject.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create
        await axios.post("http://localhost:5000/api/projects", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      // Show specific error message
      const message = error.response?.data || "Failed to save project.";
      alert(message); // Or use your toast system
    }
  };

  // Delete project
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
  
    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${selectedProject.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirmOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      if (error.response?.status === 403) {
        alert("You are not authorized to delete this project.");
      } else if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert("Failed to delete project. Please try again.");
      }
    }
  };
  

  // Define columns for DataTable
  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ];

  // Define actions for DataTable (Edit and Delete buttons)
  const actions = (project) => (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={() => openModal(project)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          setSelectedProject(project);
          setConfirmOpen(true);
        }}
      >
        Delete
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => openModal()}>+ New Project</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          title="Projects" // Added: Table title
          columns={columns} // Added: Column definitions
          data={projects} // Added: Data array
          actions={actions} // Added: Action buttons for each row
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        title={selectedProject ? "Edit Project" : "Create Project"}
        description={
          selectedProject
            ? "Update the details below."
            : "Fill in the details below to create a new project."
        }
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saveLabel={selectedProject ? "Update" : "Create"}
      >
        <div className="space-y-2">
          <Input
            name="name"
            placeholder="Project Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmOpen}
        message={`Are you sure you want to delete "${selectedProject?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProjectList;
