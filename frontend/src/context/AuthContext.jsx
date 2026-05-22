import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set auth interceptor
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Load user profile if token is present
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('auth/profile/');
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching profile", error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      const { access, user: userData } = response.data;
      localStorage.setItem('token', access);
      setToken(access);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid credentials. Please try again."
      };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      await api.post('auth/register/', { username, email, password, role });
      // Automate login after registering
      return await login(username, password);
    } catch (error) {
      console.error("Registration failed", error);
      // Return detailed error string
      const errors = error.response?.data;
      let errorMsg = "Registration failed. Please check inputs.";
      if (errors) {
        if (typeof errors === 'object') {
          errorMsg = Object.entries(errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join('\n');
        } else {
          errorMsg = errors;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
