// frontend/src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { authService } from "@/api/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  return { user, loading };
}