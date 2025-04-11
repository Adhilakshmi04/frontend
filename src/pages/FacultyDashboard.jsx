import React, { useEffect, useState } from "react";
import { Plus, Search, Clock, Home, BookOpen, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import '../index.css';
import { toast } from 'react-hot-toast';

const FacultyDashboard = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    batch: "" // Add batch field
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
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

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/faculty/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);

          const storedRecents = localStorage.getItem("recentCourses");
          if (storedRecents) {
            const parsedRecents = JSON.parse(storedRecents);
            const uniqueRecents = Array.from(new Set(parsedRecents.map(course => course._id)))
              .map(id => parsedRecents.find(course => course._id === id));
            setRecentCourses(uniqueRecents);
            localStorage.setItem("recentCourses", JSON.stringify(uniqueRecents));
          } else {
            const recents = [...data.courses].sort((a, b) =>
              new Date(b.updatedAt) - new Date(a.updatedAt)
            ).slice(0, 3);
            setRecentCourses(recents);
            localStorage.setItem("recentCourses", JSON.stringify(recents));
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/faculty/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        const newCourse = data.course;
        setCourses([...courses, newCourse]);

        const updatedRecents = [newCourse, ...recentCourses.slice(0, 2)];
        setRecentCourses(updatedRecents);
        localStorage.setItem("recentCourses", JSON.stringify(updatedRecents));

        setIsModalOpen(false);
        setFormData({ title: "", description: "", department: "", batch: "" });
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleCourseClick = (courseId) => {
    setIsLoading(true); // Set loading to true
    const clickedCourse = courses.find(course => course._id === courseId);
    if (clickedCourse) {
      const filteredRecents = recentCourses.filter(course => course._id !== courseId);
      const updatedRecents = [clickedCourse, ...filteredRecents.slice(0, 2)];
      setRecentCourses(updatedRecents);
      localStorage.setItem("recentCourses", JSON.stringify(updatedRecents));
    }

    // Simulate a delay for loading
    setTimeout(() => {
      setIsLoading(false); // Set loading to false before navigating
      navigate(`/faculty/course/${courseId}`);
    }, 2000);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
                  icon={<Home size={20} />}
                  text="All Courses"
                  active={activeSection === "all"}
                  onClick={() => {
                    setActiveSection("all");
                    if (!isDesktop) setSidebarOpen(false);
                  }}
                />
                <SidebarItem
                  icon={<Clock size={20} />}
                  text="Recents"
                  active={activeSection === "recents"}
                  onClick={() => {
                    setActiveSection("recents");
                    if (!isDesktop) setSidebarOpen(false);
                  }}
                />
              </nav>
            </div>
          </div>
        </div>
      </>
    );
  };

  const SidebarItem = ({ icon, text, active, onClick }) => (
    <div
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active ? "bg-[#080D27] text-white" : "text-white hover:bg-[#101a3b]"
      }`}
      onClick={onClick}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="ml-3 overflow-hidden whitespace-nowrap transition-opacity duration-200">{text}</span>
    </div>
  );

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

        <div className={`flex items-center transform transition-all duration-500 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-xl font-bold text-white mr-3 truncate">Faculty Dashboard</h1>
        </div>
      </div>

      <div className={`flex items-center space-x-4 transform transition-all duration-500 delay-200 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 bg-[#2158D2] text-white rounded-lg flex items-center transition-all duration-300 transform shadow-lg hover:bg-[#1a46a8]"
        >
          <Plus className="mr-2 flex-shrink-0" size={20} />
          <span className="hidden sm:inline">Add New Course</span>
          <span className="sm:hidden">Add</span>
        </button>
        <button
  onClick={handleLogout}
  className="flex items-center text-white transition-all duration-300 transform hover:text-gray-300"
>
  <span className="hidden sm:inline">Logout</span>
  <svg
    className="ml-2 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
</button>

      </div>
    </div>
  );

  const CourseCard = ({ course }) => {
    return (
      <div
        className="bg-white rounded-lg border border-gray-400 overflow-hidden transition-all duration-300 cursor-pointer transform relative shadow-sm"
        onClick={() => handleCourseClick(course._id)}
      >
        <div className="h-32 relative flex items-center justify-center bg-triangle-pattern">
          <span className="absolute top-2 left-2 px-2 py-1 bg-white bg-opacity-70 text-[#080D27] rounded-full text-sm truncate max-w-[60%]">
            {course.department}
          </span>
        </div>
        <div className="p-3 text-gray-800">
          <h3 className="text-base font-semibold mb-1 truncate">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-1 flex-shrink-0" />
            <span>Edited 2h ago</span>
          </div>
        </div>
      </div>
    );
  };

  const getDisplayedCourses = () => {
    if (activeSection === "recents") {
      return recentCourses;
    } else {
      return courses;
    }
  };

  const displayedCourses = getDisplayedCourses()
    .filter(course => course?.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getSectionTitle = () => {
    if (activeSection === "recents") return "Recent Courses";
    return "All Courses";
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout successfully!")
    navigate('/'); // Adjust the path to your login page
  };


  return (
    <div className="flex h-screen bg-gradient-to-br from-[#080D27] via-[#080D27] to-[#080D27] text-white overflow-hidden">
      <Sidebar />

      <div className={`flex-1 overflow-auto relative bg-white text-gray-800 ${isDesktop ? 'ml-64' : ''}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-4xl bg-blue-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Header />

          <main className="px-4 pb-20">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className={`text-lg font-bold text-gray-800 transform transition-all duration-500 delay-300 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {getSectionTitle()}
              </h2>

              <div className={`relative w-full sm:w-auto transform transition-all duration-500 delay-400 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-3 py-1 bg-gray-100 border border-gray-400 rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-800 placeholder-gray-600 placeholder-opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {displayedCourses.length > 0 ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transform transition-all duration-500 delay-500 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {displayedCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl border border-gray-400 shadow-xl transform transition-all duration-500 delay-500 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <img src="/login_page_image.webp" alt="No courses" className="w-16 h-16 mb-2 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No courses found</h3>
                <p className="text-gray-600 mb-4 text-center max-w-sm">
                  {activeSection === "all" ? "You haven't created any courses yet." :
                   activeSection === "recents" ? "You haven't viewed any courses recently." :
                   "No content available in this section."}
                </p>
                {activeSection === "all" && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-[#2158D2] text-white rounded-lg flex items-center transition-all duration-300 shadow-lg hover:bg-[#1a46a8]"
                  >
                    <Plus className="mr-2" size={20} />
                    Create Your First Course
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[360px] sm:max-w-[380px] p-6 sm:p-8 rounded-lg shadow-2xl relative border border-gray-400 transform transition-all duration-300 scale-100 opacity-100 min-h-[480px] flex flex-col justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <BookOpen size={24} className="text-[#2158D2] mr-2 mt-1" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Create Course</h3>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-base font-semibold text-gray-800">
                    Course Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-semibold text-gray-800">
                    Course Description:
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-semibold text-gray-800">
                    Department:
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-semibold text-gray-800">
                    Batch:
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-800"
                  />
                </div>

                <div className="mt-9 mb-5">
                  <button
                    type="submit"
                    className="w-full bg-[#2158D2] text-white py-3 rounded-md transition-all duration-300 shadow-lg hover:bg-[#1a46a8]"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#080D27] z-50">
            <img src="/Studying-GIF-by-AUF-CCS-unscreen.gif" alt="Loading" className="w-40 h-40" />
          </div>
        )} {/* Render the loading screen when isLoading is true */}
      </div>
    </div>
  );
};

export default FacultyDashboard;
