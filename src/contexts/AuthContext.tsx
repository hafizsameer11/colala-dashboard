import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface User {
  email: string;
  name: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('AuthContext login check:', { 
      inputEmail: email, 
      inputPassword: password,
      expectedEmail: 'admin@admin.com',
      expectedPassword: 'admin',
      emailMatch: email === 'admin@admin.com',
      passwordMatch: password === 'admin'
    }); // Debug log
    
    // Check credentials
    if (email === 'admin@admin.com' && password === 'admin') {
      const userData: User = {
        email: 'admin@admin.com',
        name: 'Administrator',
        role: 'Admin'
      };
      
      // Store auth data
      localStorage.setItem('authToken', 'dummy-jwt-token-' + Date.now());
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } else {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout function called'); // Debug log
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    console.log('Logout completed - isAuthenticated:', false); // Debug log
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
