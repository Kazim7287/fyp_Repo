import {
  createContext,
  useState,
} from "react";

import {
  login,
  logout,
} from "../api/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const handleLogin = async (
    email,
    password
  ) => {
    const data = await login({
      email,
      password,
    });

    setUser(data.user);

    return data;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};