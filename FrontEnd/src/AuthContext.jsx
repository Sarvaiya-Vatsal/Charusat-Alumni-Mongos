import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(true);
    checkUserType(); // Check user type whenever login state changes
  }

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  }

  // Function to check user type from localStorage
  const checkUserType = () => {
    const user = localStorage.getItem('user_type');
    console.log("Current user type:", user);
    
    if (user === 'admin') {
      setIsAdmin(true);
      setIsLoggedIn(true);
    } else if (user === 'alumnus') {
      setIsAdmin(false);
      setIsLoggedIn(true);
    } else {
      setIsAdmin(false);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    // Check on initial load
    checkUserType();

    // Also set up an interval to check periodically
    const interval = setInterval(checkUserType, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
