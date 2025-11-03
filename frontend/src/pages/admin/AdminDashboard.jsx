// frontend/src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  // Fixed: Added 'toast' to dependency array
  useEffect(() => {
    api.get("/dashboard")
      .then(res => setStats(res.data))
      .catch(err => {
        toast({
          title: "Failed to load stats",
          description: err.message || "Please try again later.",
          variant: "destructive"
        });
      });
  }, [toast]); // ESLint satisfied

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        {/* Admins */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">{stats.admins}</p>
          </CardContent>
        </Card>

        {/* Evaluators */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Evaluators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.evaluators}</p>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{stats.employees}</p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-indigo-600">{stats.projects}</p>
          </CardContent>
        </Card>

        {/* Done Tasks */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Done Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-teal-600">{stats.doneTasks}</p>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}