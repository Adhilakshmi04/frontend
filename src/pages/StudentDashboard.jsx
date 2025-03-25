import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock
} from "lucide-react";

const StudentDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeSection, setActiveSection] = useState("courses");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [studentProfile, setStudentProfile] = useState({
    name: "Student Name",
    email: "student@example.com",
    department: "Computer Science",
    year: "3rd Year"
  });

  useEffect(() => {
    // Animation effect when component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      // Close mobile sidebar when screen size changes to desktop
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
        const response = await fetch("http://localhost:5000/api/student/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setCourses(data.courses);
          
          // Load favorites from localStorage
          const storedFavorites = JSON.parse(localStorage.getItem("favoriteCourses") || "[]");
          setFavorites(storedFavorites);
        } else {
          setError(data.message);
          toast.error(data.message);
        }
      } catch (err) {
        setError("Failed to fetch courses. Please try again later.");
        toast.error("Failed to fetch courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setStudentProfile(data.student);
        }
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    fetchCourses();
    fetchStudentProfile();
  }, []);

  const toggleFavorite = (course) => {
    const isFavorite = favorites.some(fav => fav.id === course._id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== course._id);
      toast.success(`${course.title} removed from favorites`);
    } else {
      updatedFavorites = [...favorites, { id: course._id, title: course.title }];
      toast.success(`${course.title} added to favorites`);
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteCourses", JSON.stringify(updatedFavorites));
  };

  const navigateToCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filtered courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateRandomProgressData = () => {
    return {
      completed: Math.floor(Math.random() * 100),
      assignments: Math.floor(Math.random() * 10) + 1,
      quizzes: Math.floor(Math.random() * 5) + 1,
      resources: Math.floor(Math.random() * 15) + 5
    };
  };

  // Get upcoming deadlines (mock data)
  const upcomingDeadlines = [
    { id: 1, title: "Algorithm Design Assignment", course: "Data Structures", due: "Tomorrow, 11:59 PM" },
    { id: 2, title: "Midterm Exam", course: "Calculus II", due: "Feb 28, 10:00 AM" },
    { id: 3, title: "Project Proposal", course: "Software Engineering", due: "Mar 3, 5:00 PM" }
  ];

  const Sidebar = () => {
    // For desktop: always open
    // For mobile: fully hidden by default, opens as overlay when toggled
    const sidebarClasses = isDesktop
      ? `fixed left-0 h-full z-40 bg-[#080D27] w-64 transition-all duration-300 ease-in-out`
      : `fixed h-full z-50 bg-[#080D27] transition-all duration-300 ease-in-out
         ${sidebarOpen ? 'left-0 w-64' : '-left-64 w-64'}`;

    return (
      <>
        {/* Mobile sidebar overlay */}
        {!isDesktop && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={sidebarClasses}>
          <div className="relative w-full h-full p-4 overflow-hidden">
            {/* Background nebula effect */}
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
              
              <div className="mb-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500 mb-3 flex items-center justify-center text-white text-xl font-bold">
                    {studentProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold text-white">{studentProfile.name}</h3>
                  <p className="text-xs text-gray-400">{studentProfile.department}</p>
                </div>
              </div>
              
              <nav className="space-y-2 mb-8">
                <SidebarItem 
                  icon={<Home size={20} />} 
                  text="Dashboard" 
                  active={activeSection === "courses"}
                  onClick={() => {
                    setActiveSection("courses");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<BookOpen size={20} />} 
                  text="My Courses" 
                  active={activeSection === "courses"}
                  onClick={() => {
                    setActiveSection("courses");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<Calendar size={20} />} 
                  text="Schedule" 
                  active={activeSection === "schedule"}
                  onClick={() => {
                    setActiveSection("schedule");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<Star size={20} />} 
                  text="Favorites" 
                  active={activeSection === "favorites"}
                  onClick={() => {
                    setActiveSection("favorites");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<Bell size={20} />} 
                  text="Notifications" 
                  active={activeSection === "notifications"}
                  onClick={() => {
                    setActiveSection("notifications");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
                <SidebarItem 
                  icon={<User size={20} />} 
                  text="Profile" 
                  active={activeSection === "profile"}
                  onClick={() => {
                    setActiveSection("profile");
                    if (!isDesktop) setSidebarOpen(false);
                  }} 
                />
              </nav>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Quick Access</h3>
                </div>
                <nav className="space-y-2">
                  <SidebarItem 
                    icon={<FileText size={20} />} 
                    text="Assignments" 
                    active={false}
                    onClick={() => {}} 
                  />
                  <SidebarItem 
                    icon={<Bookmark size={20} />} 
                    text="Resources" 
                    active={false}
                    onClick={() => {}} 
                  />
                </nav>
              </div>
            </div>
            
            {/* Version badge */}
            <div className="absolute bottom-4 left-4 bg-[#2158D2] bg-opacity-30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg z-10">
              <p className="text-white text-sm flex items-center">
                <span className="text-xl mr-2">👨‍🎓</span> Student Portal
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const SidebarItem = ({ icon, text, active, onClick }) => (
    <div 
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active ? "bg-[#2158D2] text-white" : "text-white hover:bg-[#101a3b]"
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
          <h1 className="text-xl font-bold text-white mr-3 truncate">
            {activeSection === "courses" 
              ? "My Enrolled Courses" 
              : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
        </div>
      </div>
      
      <div className={`flex items-center space-x-4 transform transition-all duration-500 delay-200 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-600 placeholder-opacity-50 w-full sm:w-48"
          />
        </div>
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

  const PlaceholderView = ({ title }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">This section is under development</p>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => {
    const progress = generateRandomProgressData();
    const isFavorite = favorites.some(fav => fav.id === course._id);
    
    return (
      <div className="bg-white rounded-lg border border-gray-400 overflow-hidden transition-all duration-300 cursor-pointer transform relative shadow-sm hover:shadow-md"
           onClick={() => navigateToCourse(course._id)}>
        <div className="h-32 relative flex items-center justify-center bg-triangle-pattern">
          <span className="absolute top-2 left-2 px-2 py-1 bg-white bg-opacity-70 text-[#080D27] rounded-full text-sm truncate max-w-[60%]">
            {course.department || "General"}
          </span>
          <button 
            className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(course);
            }}
          >
            <Star size={16} className={isFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-600"} />
          </button>
          <div className="absolute bottom-2 right-2 bg-[#080D27] bg-opacity-80 text-white px-2 py-1 rounded-full text-xs">
            {`${progress.completed}% Complete`}
          </div>
        </div>
        <div className="p-3 text-gray-800">
          <h3 className="text-base font-semibold mb-1 truncate">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2 truncate">Instructor: {course.instructor?.name || "Professor"}</p>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-1 flex-shrink-0" />
            <span>Updated recently</span>
          </div>
        </div>
      </div>
    );
  };

  const FavoritesView = () => (
    <div className={`p-4 transform transition-all duration-500 delay-300 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Favorite Courses</h2>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses
            .filter(course => favorites.some(fav => fav.id === course._id))
            .map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl border border-gray-400 shadow-xl">
          <Star size={32} className="text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No favorite courses yet</h3>
          <p className="text-gray-600 text-center">Click the star icon on a course to add it to favorites.</p>
        </div>
      )}
    </div>
  );

  const MainContent = () => {
    switch (activeSection) {
      case "favorites":
        return <FavoritesView />;
      case "schedule":
        return <PlaceholderView title="Course Schedule" />;
      case "notifications":
        return <PlaceholderView title="Notifications" />;
      case "profile":
        return <PlaceholderView title="Student Profile" />;
      default:
        return (
          <div className={`p-4 transform transition-all duration-500 delay-500 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Stats cards */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Enrolled Courses</h3>
                <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Upcoming Deadlines</h3>
                <p className="text-2xl font-bold text-gray-800">{upcomingDeadlines.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Average Progress</h3>
                <p className="text-2xl font-bold text-gray-800">67%</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
                <h3 className="text-gray-600 text-sm font-medium mb-2">New Resources</h3>
                <p className="text-2xl font-bold text-gray-800">12</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Upcoming deadlines */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-400">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.map(deadline => (
                      <div key={deadline.id} className="border-l-4 border-[#2158D2] bg-gray-100 p-3 rounded-r-lg">
                        <p className="font-medium text-gray-800">{deadline.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{deadline.course}</p>
                        <p className="text-xs text-[#2158D2] mt-1 font-semibold">Due: {deadline.due}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Courses */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-400">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">My Courses</h3>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2158D2]"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 p-4 rounded-lg text-red-800">
                      <p>{error}</p>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    searchTerm ? (
                      <p className="text-gray-600 p-4">No courses match your search criteria.</p>
                    ) : (
                      <p className="text-gray-600 p-4">You are not enrolled in any courses yet.</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      {filteredCourses.map(course => (
                        <div
                          key={course._id}
                          className="p-3 bg-gray-100 rounded-lg border border-gray-400 hover:bg-gray-200 transition-colors cursor-pointer flex justify-between items-center"
                          onClick={() => navigateToCourse(course._id)}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{course.title}</p>
                            <p className="text-sm text-gray-600">Instructor: {course.instructor?.name || "Professor"}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(course);
                            }}
                            className="p-2 hover:bg-gray-300 rounded-full transition-colors"
                          >
                            <Star 
                              size={18} 
                              className={favorites.some(fav => fav.id === course._id) 
                                ? "fill-yellow-500 text-yellow-500" 
                                : "text-gray-600"}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">All Courses</h2>
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2158D2]"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 p-4 rounded-lg text-red-800">
                  <p>{error}</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                searchTerm ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl border border-gray-400 shadow-xl">
                    <Search size={32} className="text-gray-400 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No results found</h3>
                    <p className="text-gray-600 text-center">No courses match your search criteria.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl border border-gray-400 shadow-xl">
                    <BookOpen size={32} className="text-gray-400 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No courses found</h3>
                    <p className="text-gray-600 text-center">You are not enrolled in any courses yet.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map(course => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout successfully");
    navigate('/'); // Adjust the path to your login page
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#080D27] via-[#080D27] to-[#080D27] text-white overflow-hidden">
      <Sidebar />
      
      <div className={`flex-1 overflow-auto relative bg-white text-gray-800 ${isDesktop ? 'ml-64' : ''}`}>
        {/* Background nebula effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-4xl bg-blue-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-200 opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Header />
          
          <main>
            <MainContent />
          </main>
        </div>

        {/* Help button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button className="bg-[#2158D2] hover:bg-[#1a46a8] text-white p-3 rounded-full transition-all shadow-lg transform hover:scale-105">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;