// frontend/src/pages/Employee/EmployeeDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  useEffect(() => {
    api.get("/employees/tasks")  // Ensure this matches your backend route
      .then(res => setTasks(res.data))
      .catch(err => toast.error("Error loading tasks: " + (err.message || "Try again later")));
  }, []);

  const updateStatus = async (id, status) => {
    if (status === "Submitted") {
      if (!selectedFile) {
        setPendingSubmission(id);
        toast.info("Please select a proof file (PDF or image) to submit.");
        return;
      }
      // Additional client-side validation
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Unsupported file type. Only PDF, JPG, or PNG allowed.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max size is 5MB.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("status", status);
    if (status === "Submitted" && selectedFile) {
      formData.append("proofFile", selectedFile);
    }

    try {
      const res = await api.put(`/employees/tasks/${id}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Status updated successfully!");
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
      setSelectedFile(null);
      setPendingSubmission(null);
    } catch (err) {
      console.error("Upload error:", err);  // ✅ Log full error for debugging
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      toast.error("Failed: " + errorMsg);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported file type. Only PDF, JPG, or PNG allowed.");
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max size is 5MB.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      toast.success("File selected: " + file.name);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">My Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-lg">No tasks yet — enjoy the calm!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold text-blue-600">{task.title}</h3>
              <p className="text-gray-600 mt-2">{task.description || "No description"}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${task.status === "Done" ? "bg-green-100 text-green-800" :
                    task.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                    task.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"}`}>
                  {task.status}
                </span>
              </div>

              {/* Show submission details if submitted */}
              {task.submittedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on: {new Date(task.submittedAt).toLocaleString()}
                </p>
              )}

              {/* File upload for submission */}
              {pendingSubmission === task.id && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Proof (PDF or Image):
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="text-xs text-green-600 mt-1">Selected: {selectedFile.name}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-5">
                {["Todo", "InProgress", "Done", "Submitted"].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={task.status === s ? "default" : "outline"}
                    onClick={() => updateStatus(task.id, s)}
                    disabled={task.status === s}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
