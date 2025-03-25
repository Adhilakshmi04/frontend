import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenRes = await fetch('http://localhost:5000/api/users/tokenIsValid', {
            method: 'POST',
            headers: { 'x-auth-token': token }
          });
          const tokenData = await tokenRes.json();
          
          if (tokenData) {
            const userRes = await fetch('http://localhost:5000/api/users/', {
              headers: { 'x-auth-token': token },
            });
            const userData = await userRes.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};