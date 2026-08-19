import { useState, useEffect } from "react";
import { authService } from "../services/api";

type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};
