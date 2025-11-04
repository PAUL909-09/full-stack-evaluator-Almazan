// // frontend/src/pages/Admin/AdminDashboard.jsx
// import React, { useEffect, useState } from "react";
// import api from "@/api/axios";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";

// export default function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const { toast } = useToast();

//   // Fixed: Added 'toast' to dependency array
//   useEffect(() => {
//     api.get("/dashboard")
//       .then(res => setStats(res.data))
//       .catch(err => {
//         toast({
//           title: "Failed to load stats",
//           description: err.message || "Please try again later.",
//           variant: "destructive"
//         });
//       });
//   }, [toast]); // ESLint satisfied

//   if (!stats) {
//     return (
//       <div className="p-8 flex items-center justify-center min-h-screen">
//         <div className="text-lg text-gray-600">Loading dashboard...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Total Users */}
//         <Card className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium text-gray-700">Total Users</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
//           </CardContent>
//         </Card>

//         {/* Evaluators */}
//         <Card className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium text-gray-700">Evaluators</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold text-green-600">{stats.evaluators}</p>
//           </CardContent>
//         </Card>

//         {/* Employees */}
//         <Card className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium text-gray-700">Employees</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold text-orange-600">{stats.employees}</p>
//           </CardContent>
//         </Card>

//         {/* Projects */}
//         <Card className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium text-gray-700">Projects</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold text-indigo-600">{stats.projects}</p>
//           </CardContent>
//         </Card>

//         {/* Done Tasks */}
//         <Card className="hover:shadow-lg transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-lg font-medium text-gray-700">Done Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold text-teal-600">{stats.doneTasks}</p>
//           </CardContent>
//         </Card>

        
//       </div>
//     </div>
//   );
// }

// frontend/src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setStats(res.data))
      .catch(err =>
        toast({
          title: "Failed to load stats",
          description: err.message || "Please try again later.",
          variant: "destructive",
        })
      );
  }, [toast]);

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // Chart data
  const roleData = [
    { name: "Evaluators", value: stats.evaluators },
    { name: "Employees", value: stats.employees },
  ];

  const COLORS = ["#4F46E5", "#10B981"];

  const projectData = [
    { name: "Projects", value: stats.projects },
    { name: "Done Tasks", value: stats.doneTasks },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value={stats.totalUsers} color="text-blue-600" />
        <DashboardCard title="Evaluators" value={stats.evaluators} color="text-green-600" />
        <DashboardCard title="Employees" value={stats.employees} color="text-orange-600" />
        <DashboardCard title="Projects" value={stats.projects} color="text-indigo-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Projects & Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 🧩 Reusable dashboard card
function DashboardCard({ title, value, color }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-gray-700 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
