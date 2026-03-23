import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from '../api/axios.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Computed helpers
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  useEffect(() => {
    const token = localStorage.getItem('devlok_token');
    if (!token) { setLoading(false); return; }
    axios.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('devlok_token'))
      .finally(() => setLoading(false));
  }, []);

  // Admin login (unchanged behaviour)
  const login = useCallback(async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('devlok_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  // Public signup — creates 'user' role account
  const signup = useCallback(async (name, email, password) => {
    const res = await axios.post('/auth/register-user', { name, email, password });
    localStorage.setItem('devlok_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('devlok_token');
    setUser(null);
  }, []);

  // Allow other parts of the app to update the user state (e.g. after bookmarking)
  const updateUser = useCallback((updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLoggedIn, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
