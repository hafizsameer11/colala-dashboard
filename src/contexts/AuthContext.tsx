import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser, logoutUser } from '../utils/mutations/auth';
import { getCurrentUserPermissions } from '../utils/queries/rbac';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  permissions: string[];
  roles: Role[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

interface User {
  email: string;
  name: string;
  role: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
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
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user permissions
  const fetchPermissions = async () => {
    try {
      const response = await getCurrentUserPermissions();
      if (response?.data) {
        setPermissions(response.data.permissions || []);
        setRoles(response.data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Don't throw error, just log it - permissions are optional
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = Cookies.get('authToken');
      const userData = Cookies.get('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Fetch permissions after authentication
          await fetchPermissions();
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
        
        // Fetch permissions after successful login
        await fetchPermissions();
        
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

  const logout = async () => {
    try {
      // Call logout API endpoint
      await logoutUser();
    } catch (error) {
      // Even if API call fails, we should still clear local auth data
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data regardless of API call result
      Cookies.remove('authToken');
      Cookies.remove('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setPermissions([]);
      setRoles([]);
    }
  };

  const refreshPermissions = async () => {
    if (isAuthenticated) {
      await fetchPermissions();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    permissions,
    roles,
    login,
    logout,
    loading,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
