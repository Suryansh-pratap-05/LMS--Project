import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await authAPI.login({ email: normalizedEmail, password });
    localStorage.setItem('token', res.data.access_token);

    try {
      const userRes = await authAPI.getMe();
      setUser(userRes.data);
      return res.data;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const signup = async (email, username, password) => {
    const res = await authAPI.signup({
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password,
    });
    console.log('AuthContext signup success:', res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
