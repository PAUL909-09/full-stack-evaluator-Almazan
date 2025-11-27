// frontend/src/pages/Employee/EmployeeDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import employeeService from "@/services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import  Badge  from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { FileText, CheckCircle, AlertCircle, XCircle, Clock, BarChart3 } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getMyStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>;

  const statCards = [
    { label: "Total Tasks", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "To Do", value: stats.todo, icon: Clock, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "In Progress", value: stats.inProgress, icon: BarChart3, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Submitted", value: stats.submitted, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Needs Revision", value: stats.needsRevision, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Welcome back, {user?.name?.split(" ")[0] || "Employee"}!</h1>
          <p className="text-gray-600 mt-2">Here's your task overview</p>
        </div>
        <Button onClick={() => navigate("/employee/tasks")} size="lg">
          Go to My Tasks →
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <p className="text-blue-100">Keep up the great work!</p>
            <p className="text-3xl font-bold mt-2">{stats.approved}</p>
            <p className="text-blue-100">Tasks approved so far</p>
          </CardContent>
        </Card>

        {stats.needsRevision > 0 && (
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <p className="text-orange-100">Action required</p>
              <p className="text-3xl font-bold mt-2">{stats.needsRevision}</p>
              <p className="text-orange-100">Tasks need revision</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">You're doing great!</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate("/employee/tasks")}>
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}