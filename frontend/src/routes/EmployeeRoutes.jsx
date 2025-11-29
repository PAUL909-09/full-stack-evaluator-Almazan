// frontend/src/routes/EmployeeRoutes.jsx
import { Route } from "react-router-dom";
import { EmployeeOnly } from "@/components/RouteGuards";
import EmployeeDashboard from "@/pages/Employee/EmployeeDashboard";
import TaskDetails from "@/pages/TaskDetails";
import MyTasks from "@/pages/Employee/MyTasks";

export default [
  <Route
    key="emp-dashboard"
    path="/employee/dashboard"
    element={
      <EmployeeOnly>
        <EmployeeDashboard />
      </EmployeeOnly>
    }
  />,

  <Route key="task-details" path="/tasks/:id" element={<TaskDetails />} />,
  <Route
    path="/employee/tasks"
    element={
      <EmployeeOnly>
        <MyTasks /> {/* Old interactive page moved here */}
      </EmployeeOnly>
    }
  />,
];
