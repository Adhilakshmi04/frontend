import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Menu, X, BookOpen, ClipboardList, Users, Plus, UserPlus, Trash, ArrowLeft } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { MessageCircle } from "lucide-react"; // Import the message icon
import AddCourseMaterial from "./AddCourseMaterial";
import AssignmentForm from "./AssignmentForm";
import AddStudentListForm from "./AddStudentListForm"; // Import the AddStudentListForm component
import Chat from "./Chat.jsx";

const CourseManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState("");
  const { courseId } = useParams();
  const navigate = useNavigate(); // Import useNavigate hook
  const [course, setCourse] = useState(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("students");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [contentKey, setContentKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [facultyId, setFacultyId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // State to control chat visibility
  const [addMethod, setAddMethod] = useState("individual"); // State to track which method to use for adding students

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/faculty/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setCourse(data.course || {});
          setFacultyId(data.course.faculty);
          setStudents(data.course.students || []);
          setCourseName(data.course.title);
        } else {
          toast.error(data.message || "Failed to fetch course details.", { position: "top-right" });
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to fetch course details.", { position: "top-right" });
      }
    };

    fetchCourse();
  }, [courseId]);
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/faculty/batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setBatches(data.batches);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, []);

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

  const handleAddStudent = async () => {
    const emailArray = studentEmail.split(",").map((email) => email.trim());
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/faculty/course/${courseId}/add-student`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailArray }),
        }
      );
      const data = await response.json();
      emailArray.forEach((email) => {
        const successEntry = data.addedStudents.find((entry) => entry.email === email);
        const errorEntry = data.errors.find((entry) => entry.email === email);

        if (successEntry) {
          toast.success(successEntry.message, { position: "top-right" });
          setStudents((prevStudents) => [...prevStudents, successEntry.student]);
        } else if (errorEntry) {
          toast.error(`Error with ${email}: ${errorEntry.message}`, { position: "top-right" });
        }
      });

      setStudentEmail("");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student(s).", { position: "top-right" });
    }
  };

 // Replace your handleDeleteStudent function with this:
const handleDeleteStudent = async (studentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/faculty/course/${courseId}/remove-student/${studentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.success) {
      toast.success(data.message, { position: "top-right" });
      // Update the students state with filtered array
      setStudents(students.filter((student) => student._id !== studentId));
    } else {
      toast.error(data.message || "Failed to remove student from course.", { position: "top-right" });
    }
  } catch (error) {
    console.error("Error removing student from course:", error);
    toast.error("Failed to remove student from course. Please check the console for details.", { position: "top-right" });
  }
};

  // Handler for students added via AddStudentListForm
  const handleBulkStudentsAdded = (newStudents) => {
    if (newStudents && newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setIsModalOpen(false);
    }
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

  // Handle back button click to navigate to the faculty dashboard
  const handleBackClick = () => {
    navigate('/dashboard/faculty');
  };

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
                  icon={<BookOpen size={20} />}
                  text="Add Material"
                  active={activeSection === "material"}
                  section="material"
                />
                <SidebarItem
                  icon={<ClipboardList size={20} />}
                  text="Assignments"
                  active={activeSection === "assignments"}
                  section="assignments"
                />
                <SidebarItem
                  icon={<Users size={20} />}
                  text="Enrolled Students"
                  active={activeSection === "students"}
                  section="students"
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
        {/* Back button */}
        <button
          className="mr-3 text-white hover:text-gray-300 transition-colors"
          onClick={handleBackClick}
        >
          <ArrowLeft size={24} />
        </button>
        
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
            Course Management - {course?.title}
          </h1>
        </div>
      </div>
      <div className={`flex items-center ${!isDesktop ? 'pr-2' : ''}`}>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2158D2] text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[#1a46a8] shadow-lg"
          style={{ padding: isDesktop ? '0.375rem 0.5rem' : '0.5rem' }}
        >
          {isDesktop ? (
            <>
              <Plus className="mr-1" size={16} />
              <span>Manage Students</span>
            </>
          ) : (
            <Users size={20} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#080D27] via-[#080D27] to-[#080D27] text-white overflow-hidden">
      <Sidebar />
      <div className={`flex-1 overflow-auto relative bg-white text-black ${isDesktop ? 'ml-64' : ''}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-4xl bg-blue-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 opacity-5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <Header />
          <main className="px-4 pb-20" key={contentKey}>
            {activeSection === "students" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Enrolled Students</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name || "Unnamed Student"}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <button onClick={() => handleDeleteStudent(student._id)} className="text-red-500 hover:text-red-700">
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr> 
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
            {activeSection === "material" && <AddCourseMaterial courseId={courseId} />}
            {activeSection === "assignments" && <AssignmentForm courseId={courseId} />}
          </main>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-5 rounded-lg shadow-2xl relative border border-gray-300 transform transition-all duration-300 scale-100 opacity-100 min-h-[500px] flex flex-col">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                <X size={20} />
              </button>
              <div className="flex items-center justify-center mb-6">
                <UserPlus size={28} className="text-[#2158D2] mr-2" />
                <h3 className="text-xl font-bold text-gray-800">Add Students</h3>
              </div>

              {/* Tabs for choosing addition method */}
              <div className="flex border-b border-gray-300 mb-4">
                <button
                  className={`py-2 px-4 ${addMethod === 'individual' ? 'text-[#2158D2] border-b-2 border-[#2158D2] font-medium' : 'text-gray-600'}`}
                  onClick={() => setAddMethod('individual')}
                >
                  Individual
                </button>
                <button
                  className={`py-2 px-4 ${addMethod === 'bulk' ? 'text-[#2158D2] border-b-2 border-[#2158D2] font-medium' : 'text-gray-600'}`}
                  onClick={() => setAddMethod('bulk')}
                >
                  Bulk
                </button>
              </div>

              {/* Individual student addition form */}
              {addMethod === 'individual' && (
                <div className="flex-1">
                  <div className="mb-4">
                    <label className="block text-base font-semibold text-gray-800 mb-2">Email</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="Student email(s), comma-separated"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={handleAddStudent}
                      className="w-full bg-[#2158D2] text-white py-2 rounded-md shadow-md hover:bg-[#1a46a8] transition-colors duration-200 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Student"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Bulk student addition form */}
              {addMethod === 'bulk' && (
                <div className="flex-1">
                  <AddStudentListForm
                    courseId={courseId}
                    onStudentsAdded={handleBulkStudentsAdded}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Icon */}
      <button
        className="fixed bottom-4 right-4 bg-[#2158D2] text-white p-3 rounded-full shadow-lg hover:bg-[#1a46a8] transition-colors duration-300 z-50"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Component */}
      {isChatOpen && (
      <div
      className={`fixed top-0 right-0 h-full w-96 bg-[#12182B] shadow-lg p-4 z-50 transform transition-transform ease-in-out duration-[1000ms] ${
        isChatOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <Chat
        userId={facultyId}
        courseName={courseName}
        username={facultyName}
        room={courseId}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
    
      )}
    </div>
  );
};

export default CourseManagement;