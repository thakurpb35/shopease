import React, { createContext, useContext, useEffect, useState } from "react";
import { api, clearSession, getToken, getUser, setSession, storeUser } from "../api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [ready, setReady] = useState(!getToken());

  // On start, ask the server who we are (also picks up a changed role)
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then(({ user }) => {
        storeUser(user);
        setUser(user);
      })
      .catch((err) => {
        if (err.status === 401) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    setSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
