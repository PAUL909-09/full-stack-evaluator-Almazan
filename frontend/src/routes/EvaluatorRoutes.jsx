// frontend/src/routes/EvaluatorRoutes.jsx
import { Route } from "react-router-dom";
import { EvaluatorOnly } from "@/components/RouteGuards";
import EvaluatorDashboard from "@/pages/Evaluator/EvaluatorDashboard";
import CreateProject from "@/pages/CreateProject";
import CreateTask from "@/pages/CreateTask";
import ProjectList from "@/pages/Evaluator/ProjectList";

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
  <Route
    key="create-task"
    path="/tasks/create"
    element={
      <EvaluatorOnly>
        <CreateTask />
      </EvaluatorOnly>
    }
  />,
  <Route
    key="project-list"
    path="/evaluator/projects"
    element={
      <EvaluatorOnly>
        <ProjectList />
      </EvaluatorOnly>
    }
  />,
];
