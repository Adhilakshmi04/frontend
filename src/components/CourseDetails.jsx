import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  BookOpen,
  Star,
  Calendar,
  Bell,
  User,
  FileText,
  Search,
  Bookmark,
  Plus,
  Menu,
  X,
  ArrowLeft,
  Book,
  Clock,
  MessageCircle
} from "lucide-react";
import Chat from "./Chat.jsx";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCO, setExpandedCO] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [contentKey, setContentKey] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const jwtToken = localStorage.getItem("token");

  function decodeJwtPayload(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    const payload = parts[1];
    const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(base64Payload);
    const payloadObject = JSON.parse(decodedPayload);
    return payloadObject;
  }

  const decodedPayload = jwtToken ? decodeJwtPayload(jwtToken) : null;

  useEffect(() => {
    if (decodedPayload) {
      setStudentId(decodedPayload.id);
    }
  }, [decodedPayload]);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const courseResponse = await fetch(`http://localhost:5000/api/student/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const courseData = await courseResponse.json();

        if (!courseData.success) {
          setError(courseData.message);
          return;
        }

        setCourse(courseData.message);
        setCourseName(courseData.message.title);
        if (courseData.message.assignments && Array.isArray(courseData.message.assignments)) {
          setAssignments(courseData.message.assignments);
        } else {
          setAssignments([]);
        }

        const materialsResponse = await fetch(`http://localhost:5000/api/student/course-materials/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const materialsData = await materialsResponse.json();

        if (materialsData.success) {
          setMaterials(materialsData.materials || []);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/student/details/${decodedPayload.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setStudentName(data.student.name);
        } else {
          toast.error(data.message || "Failed to fetch Student Details");
        }
      } catch (error) {
        console.error("Error fetching Student details:", error);
        toast.error("Failed to fetch Student details.", { position: "top-right" });
      }
    };

    if (courseId) fetchStudent();
  }, [courseId, decodedPayload]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      if (desktop && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const getMaterialsByCO = (co) => {
    if (!materials.length) return [];
    const formattedCO = co.replace(" ", "-");
    return materials.filter(material => material.CO && material.CO.toLowerCase() === formattedCO.toLowerCase());
  };

  const getAssignmentsByCO = (co) => {
    if (!assignments.length) return [];
    const formattedCO = co.replace(" ", "-");
    return assignments.filter(assignment => assignment.co && assignment.co.toLowerCase() === formattedCO.toLowerCase());
  };

  const toggleCO = (co) => {
    setExpandedCO(expandedCO === co ? null : co);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const changeSection = (section) => {
    setActiveSection(section);
    setContentKey(prevKey => prevKey + 1);
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#080D27] z-50">
          <img src="/Studying-GIF-by-AUF-CCS-unscreen.gif" alt="Loading" className="w-40 h-40" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#080D27]">
        <div className="p-6 bg-[#12182B] rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Course</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full py-2 bg-[#2158D2] text-white rounded-lg hover:bg-[#1a46a8] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const SidebarItem = ({ icon, text, active, section }) => (
    <div
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active
          ? "bg-[#2158D2] text-white"
          : "text-white hover:bg-[#101a3b]"
      }`}
      onClick={() => changeSection(section)}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="ml-3 overflow-hidden whitespace-nowrap transition-opacity duration-200">{text}</span>
    </div>
  );

  const Sidebar = () => {
    const sidebarClasses = isDesktop
      ? `fixed left-0 h-full z-40 bg-[#080D27] w-64 transition-all duration-300 ease-in-out`
      : `fixed h-full z-50 bg-[#080D27] transition-all duration-300 ease-in-out
         ${sidebarOpen ? 'left-0 w-64' : '-left-64 w-64'}`;

    return (
      <>
        {!isDesktop && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className={sidebarClasses}>
          <div className="relative w-full h-full p-4 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 opacity-10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <svg className="w-10 h-10 text-white mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h2 className="text-xl font-bold text-white overflow-hidden transition-opacity duration-200 whitespace-nowrap">
                  EduSpace
                </h2>
              </div>
              <nav className="space-y-2 mb-8">
                <SidebarItem
                  icon={<Book size={20} />}
                  text="Course Overview"
                  active={activeSection === "overview"}
                  section="overview"
                />
                <SidebarItem
                  icon={<FileText size={20} />}
                  text="Course Materials"
                  active={activeSection === "materials"}
                  section="materials"
                />
                <SidebarItem
                  icon={<Calendar size={20} />}
                  text="Assignments"
                  active={activeSection === "assignments"}
                  section="assignments"
                />
              </nav>
            </div>
          </div>
        </div>
      </>
    );
  };

  const Header = () => (
    <div className="flex justify-between items-center mb-4 p-4 bg-[#080D27] shadow-md">
      <div className="flex items-center">
        {!isDesktop && (
          <button
            className="mr-3 text-white"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
        )}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white truncate">
            {course.title}
          </h1>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-[#2158D2] text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[#1a46a8] shadow-lg px-3 py-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );

  const CourseOverview = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold text-black mb-4">Course Overview</h2>
      <p className="text-gray-700 mb-6">{course.description || "No description available."}</p>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Department</h3>
          <p className="text-gray-700">{course.department || "Not specified"}</p>
        </div>
  
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Instructor</h3>
          <p className="text-gray-700">{course.facultyName || "Faculty ID: " + course.faculty}</p>
        </div>
  
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Course Code</h3>
          <p className="text-gray-700">{course.code || "Not available"}</p>
        </div>
  
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Credits</h3>
          <p className="text-gray-700">{course.credits || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
  
  
  const Materials = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold text-black mb-4">Course Materials</h2>
  
      {materials.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700">No course materials available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {["CO 1", "CO 2", "CO 3", "CO 4", "CO 5"].map((co) => {
            const materialsList = getMaterialsByCO(co);
            if (!materialsList.length) return null;
  
            return (
              <div key={`materials-${co}`} className="border border-gray-300 rounded-md overflow-hidden">
                <div
                  className={`flex justify-between items-center p-4 cursor-pointer ${expandedCO === `materials-${co}` ? "bg-gray-100" : "bg-gray-200"}`}
                  onClick={() => toggleCO(`materials-${co}`)}
                >
                  <h3 className="text-md font-medium text-black">{co}</h3>
                  <button className="text-gray-600">
                    {expandedCO === `materials-${co}` ? <span className="text-xl">−</span> : <span className="text-xl">+</span>}
                  </button>
                </div>
                {expandedCO === `materials-${co}` && (
                  <div className="p-4 bg-white">
                    <ul className="space-y-3">
                      {materialsList.map((material, index) => (
                        <li key={index} className="p-3 bg-gray-100 rounded-md">
                          <div className="flex flex-col">
                            <h4 className="font-medium text-gray-800">{material.title}</h4>
                            {material.description && <p className="text-sm text-gray-700 mt-1">{material.description}</p>}
                            <p className="text-xs text-gray-600 mt-1">Uploaded: {formatDate(material.createdAt || new Date())}</p>
                            <div className="mt-3">
                              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-300 text-black rounded-md hover:bg-gray-400 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </a>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  
  const Assignments = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold text-black mb-4">Assignments</h2>
      {assignments.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700">No assignments available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {["CO 1", "CO 2", "CO 3", "CO 4", "CO 5"].map((co) => {
            const assignmentsList = getAssignmentsByCO(co);
            if (!assignmentsList.length) return null;
  
            return (
              <div key={`assignments-${co}`} className="border border-gray-300 rounded-md overflow-hidden">
                <div
                  className={`flex justify-between items-center p-4 cursor-pointer ${expandedCO === `assignments-${co}` ? "bg-gray-100" : "bg-gray-200"}`}
                  onClick={() => toggleCO(`assignments-${co}`)}
                >
                  <h3 className="text-md font-medium text-black">{co}</h3>
                  <button className="text-gray-600">
                    {expandedCO === `assignments-${co}` ? <span className="text-xl">−</span> : <span className="text-xl">+</span>}
                  </button>
                </div>
                {expandedCO === `assignments-${co}` && (
                  <div className="p-4 bg-white">
                    <ul className="space-y-3">
                      {assignmentsList.map((assignment, index) => (
                        <li key={index} className="p-3 bg-gray-100 rounded-md">
                          <div className="flex flex-col">
                            <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                            {assignment.description && <p className="text-sm text-gray-700 mt-1">{assignment.description}</p>}
                            <p className="text-xs text-gray-600 mt-1">Due: {formatDate(assignment.dueDate || new Date())}</p>
                            {assignment.fileUrl && (
                              <div className="mt-3">
                                <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-300 text-black rounded-md hover:bg-gray-400 transition">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#080D27] via-[#080D27] to-[#080D27] text-white overflow-hidden">
      <Sidebar />
      <div className={`flex-1 overflow-auto relative bg-white ${isDesktop ? 'ml-64' : ''}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-4xl bg-blue-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 opacity-5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <Header />
          <main className="px-4 pb-20" key={contentKey}>
            {activeSection === "overview" && <CourseOverview />}
            {activeSection === "materials" && <Materials />}
            {activeSection === "assignments" && <Assignments />}
          </main>
        </div>
      </div>
      {/* Chat Icon */}
      <button
        className="fixed bottom-4 right-4 bg-[#2158D2] text-white p-3 rounded-full shadow-lg hover:bg-[#1a46a8] transition-colors duration-300"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <MessageCircle size={24} />
      </button>
      {/* Chat Component */}
      {isChatOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-[#12182B] shadow-lg p-4 z-50 transform transition-transform duration-300">
          <Chat
            userId={studentId}
            courseName={courseName}
            username={studentName}
            room={courseId}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CourseDetails;