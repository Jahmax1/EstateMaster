import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Axios interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Axios Request:', {
      url: config.url,
      method: config.method,
      data: JSON.stringify(config.data, null, 2),
    });
    return config;
  },
  (error) => {
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  console.log('API URL:', API_URL);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token },
        })
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Auth Me Error:', err.response?.data || err);
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (formData) => {
    console.log('Register Payload:', JSON.stringify(formData, null, 2));
    const res = await axios.post(`${API_URL}/api/auth/register`, formData);
    localStorage.setItem('token', res.data.token);
    setUser({ role: res.data.role });
    return res.data;
  };

  const login = async (formData) => {
    console.log('Login Payload:', JSON.stringify(formData, null, 2));
    const res = await axios.post(`${API_URL}/api/auth/login`, formData);
    localStorage.setItem('token', res.data.token);
    setUser({ role: res.data.role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};