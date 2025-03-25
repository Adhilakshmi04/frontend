import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const sessionStart = localStorage.getItem("sessionStart"); 
  const sessionDuration = 60*60*1000; 
  const location = useLocation();
  const isSessionValid = sessionStart && (Date.now() - parseInt(sessionStart) < sessionDuration);
  
  if (!token || !isSessionValid) {
    localStorage.removeItem("token");
    localStorage.removeItem("sessionStart");
    alert("Session expired. Please log in again.");
    return <Navigate to="/" state={{ from: location }} />;
  }
  
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;
  
  if (allowedRoles?.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  localStorage.setItem("sessionStart", Date.now().toString());
  return element;
};

export default ProtectedRoute;