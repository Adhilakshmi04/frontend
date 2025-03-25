import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  const sessionStart = localStorage.getItem("sessionStart");
  const sessionDuration = 60 * 60 * 1000;
  const isSessionValid = sessionStart && (Date.now() - parseInt(sessionStart) < sessionDuration);
  
  if (token && isSessionValid) {
    try {
      const user = JSON.parse(atob(token.split(".")[1]));
      if (user.role === "admin") {
        return <Navigate to="/dashboard/admin" replace />;
      } else if (user.role === "faculty") {
        return <Navigate to="/dashboard/faculty" replace />;
      } else {
        return <Navigate to="/dashboard/student" replace />;
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionStart");
    }
  }
  
  return element;
};

export default PublicRoute;