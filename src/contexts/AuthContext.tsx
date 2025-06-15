
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  name: string;
  mobile_number: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (mobileNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on app load
    const storedUser = localStorage.getItem('visiona_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('visiona_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (mobileNumber: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid mobile number or password",
          variant: "destructive",
        });
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        name: data.name || 'Admin',
        mobile_number: data.mobile_number,
        role: data.role || 'admin'
      };

      setUser(authUser);
      localStorage.setItem('visiona_auth_user', JSON.stringify(authUser));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${authUser.name}!`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('visiona_auth_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
