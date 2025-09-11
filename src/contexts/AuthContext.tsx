
/**
 * Authentication Context for Visiona Admin System
 * 
 * This context provides secure authentication functionality using Supabase
 * with bcrypt password hashing and RLS-protected database access.
 * 
 * Security Features:
 * - Passwords are hashed using bcrypt before storage
 * - Database access is restricted via Row Level Security (RLS)
 * - Authentication uses a secure server-side function (authenticate_user)
 * - Session persistence via localStorage
 * 
 * @author Lovable AI Assistant
 * @version 1.0.0 - Security Enhanced
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Authenticated user interface
 */
interface AuthUser {
  id: string;
  name: string;
  mobile_number: string;
  role: string;
}

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: AuthUser | null;
  login: (mobileNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Local storage key for session persistence
const SESSION_STORAGE_KEY = 'visiona_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to child components.
 * Handles session persistence and automatic logout on invalid sessions.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Initialize authentication state from localStorage on app load
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Secure login function using Supabase RPC with bcrypt password verification
   * 
   * @param mobileNumber - User's mobile number
   * @param password - Plain text password (will be hashed server-side)
   * @returns Promise<boolean> - Success status
   */
  const login = async (mobileNumber: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call secure authentication function (server-side password verification)
      const { data, error } = await supabase
        .rpc('authenticate_user', {
          input_mobile_number: mobileNumber,
          input_password: password
        });

      if (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Login Failed",
          description: "Authentication service error. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Login Failed",
          description: "Invalid mobile number or password",
          variant: "destructive",
        });
        return false;
      }

      // Extract user data from secure response
      const userData = data[0];
      const authUser: AuthUser = {
        id: userData.user_id,
        name: userData.user_name || 'Admin',
        mobile_number: userData.mobile_number,
        role: userData.user_role || 'admin'
      };

      // Update state and persist session
      setUser(authUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${authUser.name}!`,
      });

      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function - clears user state and session storage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
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

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
