import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Home, Share2, Archive, FileText, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [recentCourses, setRecentCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeSection, setActiveSection] = useState("courses"); // "courses", "recents", "shared", "archived", "templates"

  useEffect(() => {
    // Load recent courses from localStorage
    const storedRecents = JSON.parse(localStorage.getItem("recentCourses") || "[]");
    setRecentCourses(storedRecents);
    
    // Load favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem("favoriteCourses") || "[]");
    setFavorites(storedFavorites);
    
    // Fetch existing courses
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/faculty/my-courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
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
    const token = localStorage.getItem("token");
    try {
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
        // Add new course to the list
        setCourses([...courses, data.course]);
        
        // Reset form and close modal
        setFormData({ title: "", description: "", department: "" });
        setIsModalOpen(false);
        
        // Optional: Show success message
        alert(data.message);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const toggleFavorite = (course) => {
    const isFavorite = favorites.some(fav => fav.id === course.id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== course.id);
      // Show toast if you have a toast library implemented
      // toast.success(`${course.title} removed from favorites`);
    } else {
      updatedFavorites = [...favorites, course];
      // toast.success(`${course.title} added to favorites`);
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem("favoriteCourses", JSON.stringify(updatedFavorites));
  };

  const navigateToCourse = (courseId) => {
    // Add to recent courses
    const courseToAdd = courses.find(c => c.id === courseId);
    if (courseToAdd) {
      const storedRecents = JSON.parse(localStorage.getItem("recentCourses") || "[]");
      const updatedRecents = [
        { id: courseToAdd.id, title: courseToAdd.title },
        ...storedRecents.filter(c => c.id !== courseToAdd.id)
      ].slice(0, 5); // Keep only the 5 most recent
      
      localStorage.setItem("recentCourses", JSON.stringify(updatedRecents));
      setRecentCourses(updatedRecents);
    }
    
    navigate(`/dashboard/faculty/course/${courseId}`);
  };

  const SidebarItem = ({ icon, text, onClick, isActive }) => (
    <div 
      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer ${
        isActive ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-3">{text}</span>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 p-4 h-full">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <img src="/login_page_image.ico" alt="Logo" className="w-8 h-8 mr-2" />
          <h2 className="text-xl font-bold">Learning Content</h2>
        </div>
        
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Home size={20} />} 
            text="My Courses" 
            onClick={() => setActiveSection("courses")}
            isActive={activeSection === "courses"}
          />
          <SidebarItem 
            icon={<Home size={20} />} 
            text="Recents" 
            onClick={() => setActiveSection("recents")}
            isActive={activeSection === "recents"}
          />
          <SidebarItem 
            icon={<Share2 size={20} />} 
            text="Shared Content"
            onClick={() => setActiveSection("shared")}
            isActive={activeSection === "shared"}
          />
          <SidebarItem 
            icon={<Archive size={20} />} 
            text="Archived"
            onClick={() => setActiveSection("archived")}
            isActive={activeSection === "archived"}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            text="Templates"
            onClick={() => setActiveSection("templates")}
            isActive={activeSection === "templates"}
          />
        </nav>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Favorites</h3>
          <span className="text-gray-400">{favorites.length}</span>
        </div>
        <nav className="space-y-2">
          {favorites.length > 0 ? (
            favorites.map(fav => (
              <div key={fav.id} className="flex justify-between items-center group">
                <SidebarItem 
                  icon={<Star size={20} className="text-yellow-400" />} 
                  text={fav.title}
                  onClick={() => navigateToCourse(fav.id)}
                />
                <button 
                  className="hidden group-hover:block p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(fav);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 px-3 py-2">No favorites yet</p>
          )}
        </nav>
      </div>
    </div>
  );

  const RecentCoursesView = () => (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recently Viewed Courses</h2>
      {recentCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCourses.map(recentCourse => (
            <div 
              key={recentCourse.id} 
              className="bg-white shadow-md rounded-lg p-6 border hover:border-green-300 cursor-pointer group relative"
              onClick={() => navigateToCourse(recentCourse.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold mb-2">{recentCourse.title}</h3>
                <button 
                  className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recentCourse);
                  }}
                >
                  <Star 
                    size={20} 
                    className={favorites.some(fav => fav.id === recentCourse.id) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : ""}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last viewed: {new Date().toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No recent courses found.</p>
      )}
    </div>
  );

  const PlaceholderView = ({ title }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-400">{title}</h2>
        <p className="text-gray-400 mt-2">This section is under development</p>
      </div>
    </div>
  );

  const CourseListView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus className="mr-2" size={20} /> Add Course
        </button>
      </div>

      {/* Course List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="bg-white shadow-md rounded-lg p-6 border hover:border-green-300 cursor-pointer relative group"
            onClick={() => navigateToCourse(course.id)}
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(course);
                }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Star 
                  size={20} 
                  className={favorites.some(fav => fav.id === course.id) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : ""}
                />
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-2">{course.department}</p>
            <p className="text-sm text-gray-500">{course.description}</p>
          </div>
        ))}
      </div>
    </>
  );

  const MainContent = () => {
    switch (activeSection) {
      case "recents":
        return <RecentCoursesView />;
      case "shared":
        return <PlaceholderView title="Shared Content" />;
      case "archived":
        return <PlaceholderView title="Archived Content" />;
      case "templates":
        return <PlaceholderView title="Templates" />;
      default:
        return <CourseListView />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <MainContent />
        </div>
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] max-w-[90%] p-8 rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <div className="flex items-center justify-center mb-6">
              <BookOpen 
                size={36} 
                className="mr-3 text-green-600" 
              />
              <h3 className="text-3xl font-bold text-gray-800">
                Create Course
              </h3>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Course Title:
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Course Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Department:
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;