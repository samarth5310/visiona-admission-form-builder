
import { useState, useEffect } from 'react';

interface User {
  id: string;
  mobile_number: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('visiona_admin');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('visiona_admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('visiona_admin');
    setUser(null);
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };
};
