// frontend/src/components/RouteGuards.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Authenticating...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;

  return children;
};

// Shortcuts
export const AdminOnly = ({ children }) => <Protected roles={["Admin"]}>{children}</Protected>;
export const EvaluatorOnly = ({ children }) => <Protected roles={["Evaluator"]}>{children}</Protected>;
export const EmployeeOnly = ({ children }) => <Protected roles={["Employee"]}>{children}</Protected>;