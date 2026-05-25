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
      const errors = error.response?.data;
      let errorMsg = "Invalid credentials. Please try again.";
      if (errors) {
        if (errors.detail) {
          const detail = errors.detail;
          if (typeof detail === 'string') {
            errorMsg = detail;
          } else if (Array.isArray(detail)) {
            errorMsg = detail
              .map((err) => {
                const field = err.loc && err.loc.length > 1 ? err.loc.slice(1).join('.') : '';
                return `${field ? field + ': ' : ''}${err.msg}`;
              })
              .join('\n');
          } else if (typeof detail === 'object') {
            errorMsg = Object.entries(detail)
              .map(([key, val]) => {
                const valStr = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : val);
                return `${key}: ${valStr}`;
              })
              .join('\n');
          }
        } else if (typeof errors === 'object') {
          errorMsg = Object.entries(errors)
            .map(([key, val]) => {
              const valStr = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : val);
              return `${key}: ${valStr}`;
            })
            .join('\n');
        } else if (typeof errors === 'string') {
          errorMsg = errors;
        }
      }
      return {
        success: false,
        error: errorMsg
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
      const errors = error.response?.data;
      let errorMsg = "Registration failed. Please check inputs.";
      if (errors) {
        if (errors.detail) {
          const detail = errors.detail;
          if (typeof detail === 'string') {
            errorMsg = detail;
          } else if (Array.isArray(detail)) {
            errorMsg = detail
              .map((err) => {
                const field = err.loc && err.loc.length > 1 ? err.loc.slice(1).join('.') : '';
                return `${field ? field + ': ' : ''}${err.msg}`;
              })
              .join('\n');
          } else if (typeof detail === 'object') {
            errorMsg = Object.entries(detail)
              .map(([key, val]) => {
                const valStr = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : val);
                return `${key}: ${valStr}`;
              })
              .join('\n');
          }
        } else if (typeof errors === 'object') {
          errorMsg = Object.entries(errors)
            .map(([key, val]) => {
              const valStr = Array.isArray(val) ? val.join(' ') : (typeof val === 'object' ? JSON.stringify(val) : val);
              return `${key}: ${valStr}`;
            })
            .join('\n');
        } else if (typeof errors === 'string') {
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
