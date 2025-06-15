
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: { id: string; name: string; mobile_number: string; role?: string } | null;
  login: (mobile_number: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({}),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  useEffect(() => {
    // Try load session from localStorage (persist session)
    const stored = localStorage.getItem("veda_auth");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (mobile_number: string, password: string) => {
    // Query Supabase for user
    const { data, error } = await supabase
      .from("authorized_users")
      .select("id, name, mobile_number, role, is_active")
      .eq("mobile_number", mobile_number)
      .eq("password", password)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return { error: "Invalid credentials or user inactive." };
    }
    const authuser = {
      id: data.id,
      name: data.name || "",
      mobile_number: data.mobile_number,
      role: data.role || undefined,
    };
    setUser(authuser);
    localStorage.setItem("veda_auth", JSON.stringify(authuser));
    return {};
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("veda_auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
