// import React, { useEffect, useState } from "react";
// import api from "@/api/axios"; // For fetching tasks/evaluations
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { toast } from "react-toastify";

// export default function EvaluatorDashboard() {
//   const [stats, setStats] = useState({
//     totalTasks: 0,
//     pendingEvaluations: 0,
//     approved: 0,
//     needsRevision: 0,
//     rejected: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       // Fetch all tasks (adjust if you have a dedicated stats endpoint)
//       const tasksRes = await api.get("/tasks");
//       const tasks = tasksRes.data;

//       // Fetch evaluations for each task (or batch if backend supports)
//       const evaluations = {};
//       for (const task of tasks) {
//         try {
//           const evalRes = await api.get(`/tasks/${task.id}/evaluations`);
//           evaluations[task.id] = evalRes.data;
//         } catch {
//           // Ignore if no evaluation
//         }
//       }

//       // Compute stats
//       const totalTasks = tasks.length;
//       const pendingEvaluations = tasks.filter((t) => t.status === "Submitted").length;
//       const approved = Object.values(evaluations).filter((e) => e?.status === "Approved").length;
//       const needsRevision = Object.values(evaluations).filter((e) => e?.status === "NeedsRevision").length;
//       const rejected = Object.values(evaluations).filter((e) => e?.status === "Rejected").length;

//       setStats({ totalTasks, pendingEvaluations, approved, needsRevision, rejected });
//     } catch (err) {
//       toast.error("Failed to load stats: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="p-8">Loading dashboard stats…</div>;

//   return (
//     <div className="p-8 max-w-6xl mx-auto">
//       <h1 className="text-4xl font-bold mb-8 text-gray-800">Evaluator Dashboard</h1>

//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{stats.totalTasks}</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Pending Evaluations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-blue-600">{stats.pendingEvaluations}</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Approved</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Needs Revision</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-orange-600">{stats.needsRevision}</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Rejected</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Add more sections here, e.g., recent evaluations or charts */}
//     </div>
//   );
// }
// frontend/src/pages/Evaluator/EvaluatorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import api from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For the new button
import { toast } from "react-toastify";

export default function EvaluatorDashboard() {
  const navigate = useNavigate(); // For navigating to TaskReviews
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingEvaluations: 0,
    approved: 0,
    needsRevision: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch all tasks (adjust if you have a dedicated stats endpoint)
      const tasksRes = await api.get("/tasks");
      const tasks = tasksRes.data;

      // Fetch evaluations for each task (or batch if backend supports)
      const evaluations = {};
      for (const task of tasks) {
        try {
          const evalRes = await api.get(`/evaluations/${task.id}`); // Updated to match your backend route
          evaluations[task.id] = evalRes.data;
        } catch {
          // Ignore if no evaluation
        }
      }

      // Compute stats
      const totalTasks = tasks.length;
      const pendingEvaluations = tasks.filter(
        (t) => t.status === "Submitted"
      ).length;
      const approved = Object.values(evaluations).filter(
        (e) => e?.status === "Approved"
      ).length;
      const needsRevision = Object.values(evaluations).filter(
        (e) => e?.status === "NeedsRevision"
      ).length;
      const rejected = Object.values(evaluations).filter(
        (e) => e?.status === "Rejected"
      ).length;

      setStats({
        totalTasks,
        pendingEvaluations,
        approved,
        needsRevision,
        rejected,
      });
    } catch (err) {
      toast.error("Failed to load stats: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard stats…</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Evaluator Dashboard
        </h1>
        <Button
          onClick={() => navigate("/evaluator/task-reviews")}
          variant="outline"
        >
          View Task Reviews
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {stats.pendingEvaluations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Revision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {stats.needsRevision}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => navigate("/evaluator/evaluation-history")}
        variant="outline"
      >
        View Evaluation History
      </Button>

      {/* Add more sections here, e.g., recent evaluations or charts */}
    </div>
  );
}
