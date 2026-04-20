import { useGetMe } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["/api/auth/me", token],
    },
  });

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.clear();
    setLocation("/login");
  };

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    login,
    logout,
  };
}