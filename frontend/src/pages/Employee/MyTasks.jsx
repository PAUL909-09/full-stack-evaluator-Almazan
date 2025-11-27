// frontend/src/pages/Employee/MyTasks.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import employeeService from "@/services/employeeService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import  Badge  from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Upload, FileText } from "lucide-react";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resubmitTaskId, setResubmitTaskId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await employeeService.getMyTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, PNG allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be < 5MB");
      return;
    }

    setSelectedFile(file);
    toast.success(`Selected: ${file.name}`);
  };

  const handleResubmit = async (taskId) => {
    if (!selectedFile) {
      toast.error("Please select a new proof file");
      return;
    }

    try {
      await employeeService.updateTaskStatus(taskId, "Submitted", selectedFile);
      toast.success("Task re-submitted successfully!");
      setResubmitTaskId(null);
      setSelectedFile(null);
      loadTasks();
    } catch (err) {
      toast.error("Re-submit failed: " + (err.response?.data || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">My Tasks</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const evalStatus = task.evaluation?.status;
          const isNeedsRevision = evalStatus === "NeedsRevision";

          return (
            <Card key={task.id} className={`hover:shadow-xl transition-shadow ${isNeedsRevision ? "ring-2 ring-orange-500" : ""}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge variant={isNeedsRevision ? "destructive" : "secondary"}>
                    {evalStatus || task.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{task.description || "No description"}</p>

                {/* Evaluator Feedback */}
                {task.evaluation?.comments && (
                  <div className={`p-4 rounded-lg border-l-4 ${isNeedsRevision ? "bg-orange-50 border-orange-500" : "bg-blue-50 border-blue-500"}`}>
                    <p className="font-semibold flex items-center gap-2">
                      {isNeedsRevision ? <AlertCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      {isNeedsRevision ? "Needs Revision" : "Evaluator Feedback"}
                    </p>
                    <p className="mt-2 italic text-gray-700">"{task.evaluation.comments}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      — {task.evaluation.evaluatorName}, {new Date(task.evaluation.evaluatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* RE-SUBMIT SECTION — ONLY WHEN NeedsRevision */}
                {isNeedsRevision && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="font-semibold text-orange-800 mb-3">Ready to re-submit?</p>

                    {resubmitTaskId === task.id ? (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                        />
                        {selectedFile && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-green-700">Selected: {selectedFile.name}</p>
                            <div className="space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setResubmitTaskId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleResubmit(task.id)}>
                                <Upload className="w-4 h-4 mr-1" /> Submit
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => setResubmitTaskId(task.id)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Re-Submit Task
                      </Button>
                    )}
                  </div>
                )}

                {/* Normal status buttons (optional) */}
                {!isNeedsRevision && task.status !== "Submitted" && task.status !== "Approved" && (
                  <div className="flex gap-2 flex-wrap">
                    {["InProgress", "Done"].map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        onClick={() => employeeService.updateTaskStatus(task.id, s).then(loadTasks)}
                      >
                        Mark as {s}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}