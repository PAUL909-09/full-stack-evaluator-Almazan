// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import employeeService from "@/services/employeeService";

// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import Badge from "@/components/ui/badge";
// import FilterDropdown from "@/components/FilterDropdown";

// import {
//   Upload,
//   ClipboardList,
//   Calendar,
//   Mail,
//   User,
//   Info,
//   Filter,
// } from "lucide-react";

// import { getStatusConfig } from "@/config/taskStatusConfig";

// export default function MyTasks() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [projects, setProjects] = useState([]);

//   const [submittingTaskId, setSubmittingTaskId] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);

//   // NEW FILTER STATES
//   const [filters, setFilters] = useState([]);

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       setLoading(true);
//       const res = await employeeService.getMyTasks();
//       setTasks(res.data || []);

//       // Extract unique projects
//       const projectList = [];
//       res.data.forEach((t) => {
//         if (t.project && !projectList.some((p) => p.id === t.project.id)) {
//           projectList.push(t.project);
//         }
//       });
//       setProjects(projectList);
//     } catch {
//       toast.error("Failed to load tasks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------
//   // FILTER LOGIC
//   // ----------------------------------------
//   const filteredTasks = tasks.filter((task) => {
//     if (filters.length === 0) return true;

//     return filters.some((f) => {
//       if (f === "todo") return task.status === "Todo";
//       if (f === "inprogress") return task.status === "InProgress";
//       if (f === "done") return task.status === "Done";
//       if (f === "submitted") return task.status === "Submitted";

//       if (f === "needsrevision")
//         return task?.evaluation?.status === "NeedsRevision";

//       return true;
//     });
//   });

//   // ----------------------------------------
//   // FILE SELECTION
//   // ----------------------------------------
//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const allowed = ["application/pdf", "image/jpeg", "image/png"];
//     if (!allowed.includes(file.type))
//       return toast.error("Only PDF, JPG, PNG allowed");
//     if (file.size > 5 * 1024 * 1024) return toast.error("File must be < 5MB");

//     setSelectedFile(file);
//     toast.success(`Selected: ${file.name}`);
//   };

//   // ----------------------------------------
//   // UPDATE STATUS
//   // ----------------------------------------
//   const updateStatus = async (taskId, newStatus, file = null) => {
//     setSubmittingTaskId(taskId);
//     try {
//       await employeeService.updateTaskStatus(taskId, newStatus, file);
//       toast.success(
//         `Task ${
//           newStatus === "Submitted" ? "submitted" : "updated"
//         } successfully!`
//       );
//       loadTasks();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Action failed");
//     } finally {
//       setSubmittingTaskId(null);
//       setSelectedFile(null);
//     }
//   };

//   if (loading)
//     return <p className="text-center mt-10 text-gray-500">Loading tasks...</p>;

//   return (
//     <div className="p-8 max-w-7xl mx-auto space-y-8">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-4xl font-bold">My Tasks</h1>

//         <div className="overflow-x-visible overflow-y-visible">
//           <FilterDropdown onChange={setFilters} />
//           <Button onClick={loadTasks} variant="outline" size="sm">
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* ---------------------------------------- */}
//       {/* TASK GRID                               */}
//       {/* ---------------------------------------- */}
//       <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//         {filteredTasks.map((task) => {
//           const evaluation = task.evaluation;
//           const evalStatus = evaluation?.status;

//           const displayStatus = evalStatus || task.status;
//           const status = getStatusConfig(displayStatus);
//           const StatusIcon = status.icon;

//           const isNeedsRevision = evalStatus === "NeedsRevision";
//           const isDone = task.status === "Done";
//           const isSubmitted = task.status === "Submitted" || !!evalStatus;

//           return (
//             <Card
//               key={task.id}
//               className={`relative overflow-hidden border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
//                 isNeedsRevision ? "ring-2 ring-orange-400" : ""
//               }`}
//             >
//               {/* RIBBON */}
//               <div
//                 className={`absolute top-0 left-0 right-0 py-2 text-white text-center text-sm font-semibold ${status.color}`}
//               >
//                 <StatusIcon className="inline-block w-4 h-4 mr-1" />
//                 {status.label}
//               </div>

//               <CardHeader className="mt-10">
//                 <CardTitle className="text-lg font-bold flex items-center gap-2">
//                   <ClipboardList className="w-5 h-5 text-indigo-600" />
//                   {task.title}
//                 </CardTitle>
//               </CardHeader>

//               <CardContent className="space-y-6">
//                 {/* Description */}
//                 <p className="text-sm text-gray-700">{task.description}</p>

//                 {/* Project */}
//                 <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
//                   <div className="flex items-center gap-2">
//                     <Info className="w-4 h-4 text-indigo-600" />
//                     <p className="text-sm font-semibold text-indigo-700">
//                       Project
//                     </p>
//                   </div>

//                   <p className="text-sm font-medium">{task.projectName}</p>

//                   {task.project?.deadline && (
//                     <p className="flex items-center gap-2 text-xs text-gray-600">
//                       <Calendar className="w-4 h-4" />
//                       Deadline:{" "}
//                       {new Date(task.project.deadline).toLocaleDateString()}
//                     </p>
//                   )}
//                 </div>

//                 {/* Evaluator */}
//                 {evaluation?.evaluatorName && (
//                   <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2">
//                     <div className="flex items-center gap-2">
//                       <User className="w-4 h-4 text-slate-700" />
//                       <p className="text-sm font-semibold text-slate-700">
//                         Evaluated by
//                       </p>
//                     </div>

//                     <p className="text-sm font-medium">
//                       {evaluation.evaluatorName}
//                     </p>

//                     {evaluation.evaluatorEmail && (
//                       <p className="flex items-center gap-2 text-xs text-gray-600">
//                         <Mail className="w-4 h-4" />
//                         {evaluation.evaluatorEmail}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* Feedback */}
//                 {evaluation?.comments && (
//                   <div
//                     className={`p-4 rounded-xl border-l-4 ${
//                       isNeedsRevision
//                         ? "bg-orange-50 border-orange-500"
//                         : "bg-green-50 border-green-500"
//                     }`}
//                   >
//                     <p className="font-semibold text-sm">Feedback</p>
//                     <p className="text-sm italic">"{evaluation.comments}"</p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="pt-3 border-t space-y-3">
//                   {/* Needs Revision */}
//                   {isNeedsRevision && (
//                     <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
//                       <p className="font-semibold text-orange-800">
//                         Re-submit with updated proof file
//                       </p>

//                       <input
//                         type="file"
//                         accept=".pdf,.jpg,.jpeg,.png"
//                         onChange={handleFileSelect}
//                         className="block w-full mt-2 text-sm"
//                       />

//                       {selectedFile && (
//                         <div className="flex justify-end mt-3 gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => setSelectedFile(null)}
//                           >
//                             Cancel
//                           </Button>

//                           <Button
//                             size="sm"
//                             className="bg-orange-600 hover:bg-orange-700"
//                             onClick={() =>
//                               updateStatus(task.id, "Submitted", selectedFile)
//                             }
//                             disabled={submittingTaskId === task.id}
//                           >
//                             {submittingTaskId === task.id
//                               ? "Submitting..."
//                               : "Re-submit"}
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Normal workflow */}
//                   {!isNeedsRevision && !isSubmitted && (
//                     <>
//                       {task.status === "Todo" && (
//                         <Button
//                           className="w-full"
//                           onClick={() => updateStatus(task.id, "InProgress")}
//                         >
//                           Start Working
//                         </Button>
//                       )}

//                       {task.status === "InProgress" && (
//                         <Button
//                           className="w-full bg-blue-600 hover:bg-blue-700"
//                           onClick={() => updateStatus(task.id, "Done")}
//                         >
//                           Mark as Done
//                         </Button>
//                       )}

//                       {isDone && (
//                         <div className="space-y-2">
//                           <p className="text-sm text-gray-600">
//                             Upload proof of completion
//                           </p>

//                           <input
//                             type="file"
//                             accept=".pdf,.jpg,.jpeg,.png"
//                             onChange={handleFileSelect}
//                             className="block w-full text-sm"
//                           />

//                           {selectedFile && (
//                             <Button
//                               className="w-full bg-green-600 hover:bg-green-700 mt-2"
//                               onClick={() =>
//                                 updateStatus(task.id, "Submitted", selectedFile)
//                               }
//                               disabled={submittingTaskId === task.id}
//                             >
//                               <Upload className="w-4 h-4 mr-2" />
//                               Submit for Review
//                             </Button>
//                           )}
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {/* Evaluation completed */}
//                   {isSubmitted && !isNeedsRevision && (
//                     <p className="text-center text-sm text-gray-500">
//                       {evalStatus
//                         ? "Evaluation complete"
//                         : "Submitted — awaiting evaluator review"}
//                     </p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// frontend\src\pages\Employee\MyTasks.jsx (Updated)
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import employeeService from "@/services/employeeService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import FilterDropdown from "@/components/FilterDropdown";
import {
  Upload,
  ClipboardList,
  Calendar,
  Mail,
  User,
  Info,
  Filter,
} from "lucide-react";
import { getStatusConfig } from "@/config/taskStatusConfig";
export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  // NEW FILTER STATES
  const [filters, setFilters] = useState([]);
  useEffect(() => {
    loadTasks();
  }, []);
  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getMyTasks();
      setTasks(res.data || []);
      // Extract unique projects
      const projectList = [];
      res.data.forEach((t) => {
        if (t.project && !projectList.some((p) => p.id === t.project.id)) {
          projectList.push(t.project);
        }
      });
      setProjects(projectList);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------
  // FILTER LOGIC
  // ----------------------------------------
  const filteredTasks = tasks.filter((task) => {
    if (filters.length === 0) return true;
    return filters.some((f) => {
      if (f === "todo") return task.status === "Todo";
      if (f === "inprogress") return task.status === "InProgress";
      if (f === "done") return task.status === "Done";
      if (f === "submitted") return task.status === "Submitted";
      if (f === "needsrevision")
        return task?.evaluation?.status === "NeedsRevision";
      return true;
    });
  });
  // ----------------------------------------
  // FILE SELECTION
  // ----------------------------------------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type))
      return toast.error("Only PDF, JPG, PNG allowed");
    if (file.size > 5 * 1024 * 1024) return toast.error("File must be < 5MB");
    setSelectedFile(file);
    toast.success(`Selected: ${file.name}`);
  };
  // ----------------------------------------
  // UPDATE STATUS
  // ----------------------------------------
  const updateStatus = async (taskId, newStatus, file = null) => {
    setSubmittingTaskId(taskId);
    try {
      await employeeService.updateTaskStatus(taskId, newStatus, file);
      toast.success(
        `Task ${
          newStatus === "Submitted" ? "submitted" : "updated"
        } successfully!`
      );
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setSubmittingTaskId(null);
      setSelectedFile(null);
    }
  };
  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading tasks...</p>;
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">My Tasks</h1>
        <div className="overflow-x-visible overflow-y-visible">
          <FilterDropdown onChange={setFilters} />
          <Button onClick={loadTasks} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>
      {/* ---------------------------------------- */}
      {/* TASK GRID */}
      {/* ---------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map((task) => {
          const evaluation = task.evaluation;
          const evalStatus = evaluation?.status;
          const displayStatus = evalStatus || task.status;
          const status = getStatusConfig(displayStatus);
          const StatusIcon = status.icon;
          const isNeedsRevision = evalStatus === "NeedsRevision";
          const isDone = task.status === "Done";
          const isSubmitted = task.status === "Submitted" || !!evalStatus;
          return (
            <Card
              key={task.id}
              className={`relative overflow-hidden border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
                isNeedsRevision ? "ring-2 ring-orange-400" : ""
              }`}
            >
              {/* RIBBON */}
              <div
                className={`absolute top-0 left-0 right-0 py-2 text-white text-center text-sm font-semibold ${status.color}`}
              >
                <StatusIcon className="inline-block w-4 h-4 mr-1" />
                {status.label}
              </div>
              <CardHeader className="mt-10">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  {task.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <p className="text-sm text-gray-700">{task.description}</p>
                {/* Project */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-semibold text-indigo-700">
                      Project
                    </p>
                  </div>
                  <p className="text-sm font-medium">{task.projectName}</p>
                  {task.project?.deadline && (
                    <p className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Project Deadline:{" "}
                      {new Date(task.project.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {/* Task Deadline (NEW) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-700">
                      Task Deadline
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline set"}
                  </p>
                </div>
                {/* Evaluator */}
                {evaluation?.evaluatorName && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-700" />
                      <p className="text-sm font-semibold text-slate-700">
                        Evaluated by
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {evaluation.evaluatorName}
                    </p>
                    {evaluation.evaluatorEmail && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-4 h-4" />
                        {evaluation.evaluatorEmail}
                      </p>
                    )}
                  </div>
                )}
                {/* Feedback */}
                {evaluation?.comments && (
                  <div
                    className={`p-4 rounded-xl border-l-4 ${
                      isNeedsRevision
                        ? "bg-orange-50 border-orange-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    <p className="font-semibold text-sm">Feedback</p>
                    <p className="text-sm italic">"{evaluation.comments}"</p>
                  </div>
                )}
                {/* Actions */}
                <div className="pt-3 border-t space-y-3">
                  {/* Needs Revision */}
                  {isNeedsRevision && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="font-semibold text-orange-800">
                        Re-submit with updated proof file
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="block w-full mt-2 text-sm"
                      />
                      {selectedFile && (
                        <div className="flex justify-end mt-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFile(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() =>
                              updateStatus(task.id, "Submitted", selectedFile)
                            }
                            disabled={submittingTaskId === task.id}
                          >
                            {submittingTaskId === task.id
                              ? "Submitting..."
                              : "Re-submit"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Normal workflow */}
                  {!isNeedsRevision && !isSubmitted && (
                    <>
                      {task.status === "Todo" && (
                        <Button
                          className="w-full"
                          onClick={() => updateStatus(task.id, "InProgress")}
                        >
                          Start Working
                        </Button>
                      )}
                      {task.status === "InProgress" && (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => updateStatus(task.id, "Done")}
                        >
                          Mark as Done
                        </Button>
                      )}
                      {isDone && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Upload proof of completion
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="block w-full text-sm"
                          />
                          {selectedFile && (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 mt-2"
                              onClick={() =>
                                updateStatus(task.id, "Submitted", selectedFile)
                              }
                              disabled={submittingTaskId === task.id}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Submit for Review
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {/* Evaluation completed */}
                  {isSubmitted && !isNeedsRevision && (
                    <p className="text-center text-sm text-gray-500">
                      {evalStatus
                        ? "Evaluation complete"
                        : "Submitted — awaiting evaluator review"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}