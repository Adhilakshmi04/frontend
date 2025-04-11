import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; 
import PublicRoute from "./components/PublicRoute"; // Import the new component
import Toast from "./components/Toast";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseManagement from "./components/CourseManagement";
import CourseDetails from "./components/CourseDetails";
import AddCourse from "./components/AddCourse";

const App = () => {
  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      localStorage.removeItem("token"); 
      localStorage.removeItem("sessionStart");
      alert("Session expired. You have been logged out.");
      window.location.href = "/"; 
    }, 60*60*1000); 

    return () => clearTimeout(sessionTimeout); 
  }, []);
  
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/" element={
          <PublicRoute element={
            <>
              <Toast/>
              <Login/>
            </>
          } />
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute element={
            <>
              <Toast/>
              <ForgotPassword />
            </>
          } />
        } />
        
        <Route path="/reset-password/:token" element={
          <PublicRoute element={
            <>
              <Toast/>
              <ResetPassword />
            </>
          } />
        } />
        
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute
              element={
              <>
               <Toast/>
               <AdminDashboard />
              </>
              }
              allowedRoles={["admin"]} 
            />
          }
        />
        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute
              element={<FacultyDashboard />}
              allowedRoles={["faculty"]} 
            />
          }
        />
         <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute
              element={
              <>
               <Toast/>
               <CourseDetails/>
              </>
              }
              allowedRoles={["student"]} 
            />
          }
        />
         <Route
          path="/dashboard/create-course"
          element={
            <ProtectedRoute
              element={
              <>
                <Toast/>
                <AddCourse />
              </>
               }
              allowedRoles={["faculty"]} 
            />
          }
        /> 
        <Route path="/faculty/course/:courseId" element={
           <ProtectedRoute
           element={
           <>
             <Toast/>
             <CourseManagement/>
           </>
            }
           allowedRoles={["faculty"]} 
         />
        } />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute
              element={<StudentDashboard />}
              allowedRoles={["student"]} 
            />
          }
        /> 
      </Routes>
    </Router>
  );
};

export default App;