import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  console.log('API URL:', apiUrl);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    console.log('loadUser: Token found:', !!token);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: { 'x-auth-token': token },
      });
      console.log('loadUser: User loaded:', res.data);
      setUser(res.data);
    } catch (err) {
      console.error('Auth Me Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const register = async (formData) => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/register`, formData);
      console.log('Register Response:', res.data);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return res.data; // { token, role }
    } catch (err) {
      console.error('Register Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw new Error(err.response?.data?.msg || 'Registration failed');
    }
  };

  const login = async (formData) => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, formData);
      console.log('Login Response:', res.data);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return res.data; // { token, role }
    } catch (err) {
      console.error('Login Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw new Error(err.response?.data?.msg || 'Login failed');
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};