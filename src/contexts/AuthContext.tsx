import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser } from '../utils/mutations/auth';
import Cookies from 'js-cookie';

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
      const token = Cookies.get('authToken');
      const userData = Cookies.get('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          Cookies.remove('authToken');
          Cookies.remove('userData');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await loginUser({ email, password });
      
      console.log('Login response:', response); // Debug log
      
      if (response && response.status === 'success' && response.data && response.data.token) {
        const userData: User = {
          email: response.data.user?.email || email,
          name: response.data.user?.full_name || response.data.user?.user_name || 'Administrator',
          role: response.data.user?.role || 'Admin'
        };
        
        // Store auth data in cookies
        Cookies.set('authToken', response.data.token, { expires: 7 }); // 7 days
        Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
        
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        console.log('Login failed - invalid response structure:', response);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Clear auth data
    Cookies.remove('authToken');
    Cookies.remove('userData');
    setUser(null);
    setIsAuthenticated(false);
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
