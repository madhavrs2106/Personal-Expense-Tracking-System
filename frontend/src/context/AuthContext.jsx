import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pets_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('pets_theme') || 'dark');
  const [currentPage, setCurrentPage] = useState(localStorage.getItem('pets_token') ? 'dashboard' : 'auth');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pets_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          setCurrentPage('dashboard');
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logout();
        }
      } else {
        setCurrentPage('auth');
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('pets_token', access_token);
    setToken(access_token);
    setUser(userData);
    setCurrentPage('dashboard');
    return userData;
  };

  const register = async (fullName, email, password) => {
    const res = await API.post('/auth/register', {
      full_name: fullName,
      email,
      password
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('pets_token', access_token);
    setToken(access_token);
    setUser(userData);
    setCurrentPage('dashboard');
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pets_token');
    setToken(null);
    setUser(null);
    setCurrentPage('auth');
  };

  const navigateTo = (page) => {
    if (!token && page !== 'auth') {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, theme, toggleTheme, currentPage, navigateTo }}>
      {children}
    </AuthContext.Provider>
  );
};
