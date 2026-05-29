import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'farmer' | 'agribusiness' | 'insurance' | 'government' | 'admin';
  subscription_tier: 'free' | 'farmer' | 'agribusiness' | 'insurance' | 'government';
  subscription_active: boolean;
  preferred_district: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, name: string, role: string, district: string, pass: string) => Promise<void>;
  logout: () => void;
  upgradeTier: (tier: 'free' | 'farmer' | 'agribusiness' | 'insurance' | 'government') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('agrosense_jwt');
    const savedUser = localStorage.getItem('agrosense_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Standard OAuth2 form request structure
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', pass);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('agrosense_jwt', access_token);
      setToken(access_token);

      // Fetch user profile info
      const profileResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const profileData = profileResponse.data;
      localStorage.setItem('agrosense_user', JSON.stringify(profileData));
      setUser(profileData);
    } catch (error) {
      localStorage.removeItem('agrosense_jwt');
      localStorage.removeItem('agrosense_user');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    name: string,
    role: string,
    district: string,
    pass: string
  ) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email,
        full_name: name,
        password: pass,
        role,
        preferred_district: district,
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('agrosense_jwt');
    localStorage.removeItem('agrosense_user');
    setToken(null);
    setUser(null);
  };

  // Mock tier upgrades locally for user experience testing
  const upgradeTier = (tier: 'free' | 'farmer' | 'agribusiness' | 'insurance' | 'government') => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription_tier: tier,
        subscription_active: tier !== 'free',
      };
      localStorage.setItem('agrosense_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        upgradeTier,
      }}
    >
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
