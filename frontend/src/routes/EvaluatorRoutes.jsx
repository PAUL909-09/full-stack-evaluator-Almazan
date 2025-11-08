// frontend/src/routes/EvaluatorRoutes.jsx
import { Route } from "react-router-dom";
import { EvaluatorOnly } from "@/components/RouteGuards";
import EvaluatorDashboard from "@/pages/Evaluator/EvaluatorDashboard";
import CreateProject from "@/pages/Evaluator/CreateProject";
// import CreateTask from "@/pages/Evaluator/CreateTask";
import ProjectTable from "@/pages/Evaluator/ProjectTable";
import PendingEvaluations from "@/pages/Evaluator/PendingEvaluations";
import AssignEmployeesToProject from "@/pages/Evaluator/AssignEmployeesToProject";
import ManageAssignments from "@/pages/Evaluator/ManageAssignments";
import TaskTable from "@/pages/Evaluator/TaskTable";

export default [
  <Route
    key="eval-dashboard"
    path="/evaluator/dashboard"
    element={
      <EvaluatorOnly>
        <EvaluatorDashboard />
      </EvaluatorOnly>
    }
  />,
  <Route
    key="create-project"
    path="/projects/create"
    element={
      <EvaluatorOnly>
        <CreateProject />
      </EvaluatorOnly>
    }
  />,
  // <Route
  //   key="create-task"
  //   path="/tasks/create"
  //   element={
  //     <EvaluatorOnly>
  //       <CreateTask />
  //     </EvaluatorOnly>
  //   }
  // />,
  <Route
    key="project-list"
    path="/evaluator/projects"
    element={
      <EvaluatorOnly>
        <ProjectTable />
      </EvaluatorOnly>
    }
  />,
  <Route path="/evaluator/tasks" element={<TaskTable />} />,
  <Route path="/evaluator/project/:projectId/tasks" element={<TaskTable />} />,
  <Route
    key="pending-evaluations"
    path="/evaluator/pending"
    element={
      <EvaluatorOnly>
        <PendingEvaluations />
      </EvaluatorOnly>
    }
  />,
  <Route
    key="assign-employees"
    path="/evaluator/assign-employees/:projectId?"
    element={
      <EvaluatorOnly>
        <AssignEmployeesToProject />
      </EvaluatorOnly>
    }
  />,
  <Route
    path="/evaluator/manage-assignments/:projectId"
    element={
      <EvaluatorOnly>
        <ManageAssignments />
      </EvaluatorOnly>
    }
  />,
];
