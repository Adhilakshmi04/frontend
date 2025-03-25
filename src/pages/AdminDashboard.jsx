import React, { useState, useRef, useEffect } from "react";
import { Menu, X, Plus, UserPlus, FileText, UploadCloud, Users, FileUp, List, Search, Book, BookOpen, GraduationCap, Home, Clock } from "lucide-react";
import { toast } from "react-toastify";
import Toast from "../components/Toast";
import { TrashIcon } from "@heroicons/react/outline"; 
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [batchName, setBatchName] = useState("");
  const [studentBatchName, setStudentBatchName] = useState("");
  const fileInputRef = useRef(null);
  const studentFileInputRef = useRef(null);
  const [studentFormData, setStudentFormData] = useState({
    batchName: "",
    id: "",
    name: "",
    email: "",
    department: "",
  });
  const [facultyFormData, setFacultyFormData] = useState({
    id:"",
    name: "",
    email: "",
    department: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [bulkList, setBulkList] = useState([]);
  const [studentBulkList, setStudentBulkList] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  

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
    fetchFacultyList();
    fetchStudentList();
    fetchFacultyBatches();
    fetchStudentBatches();
  }, []);

  const fetchFacultyList = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/faculty-list", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch faculty list");
      const data = await response.json();
      setFacultyList(data);
    } catch (error) {
      console.error("Error fetching faculty list:", error);
    }
  };

  const fetchStudentList = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/student-list", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the error message from the response
        throw new Error(`Failed to fetch student list: ${errorText}`);
      }
  
      const data = await response.json();
      setStudentList(data);
    } catch (error) {
      console.error("Error fetching student list:", error.message);
    }
  };
  

  const fetchFacultyBatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/upload-facultyset", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch faculty batches");
      const data = await response.json();
      setBulkList(data);
    } catch (error) {
      console.error("Error fetching faculty batches:", error);
    }
  };
  
  const fetchStudentBatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/upload-studentbatch", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch student batches");
      const data = await response.json();
      setStudentBulkList(data);
    } catch (error) {
      console.error("Error fetching student batches:", error);
    }
  };
  

  const handleChange = (e) => {
    setStudentFormData({ ...studentFormData, [e.target.name]: e.target.value });
  };

  const handleFacultyInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentAddition = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/addStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(studentFormData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unknown error occurred.");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message, { position: "top-right" });
        setStudentList([...studentList, { ...studentFormData, timestamp: new Date() }]);
        setStudentFormData({ batchName: "", id: "", name: "", email: "", department: "" });
        setShowStudentModal(false);
      } else {
        toast.error(data.message, { position: "top-right" });
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message, { position: "top-right" });
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!facultyFormData.name || !facultyFormData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/addFaculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(facultyFormData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unknown error occurred.");
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message, { position: "top-right" });
        setFacultyList([...facultyList, { ...facultyFormData, timestamp: new Date() }]);
        setFacultyFormData({
          id:"",
          name: "",
          email: "",
          department: "",
        });
        setShowFacultyModal(false);
      } else {
        toast.error(data.message, { position: "top-right" });
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message, { position: "top-right" });
    }
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
                  Eduspace
                </h2>
              </div>

              <nav className="space-y-4 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase mb-2">Faculty</h3>
                  <SidebarItem
                    icon={<FileUp size={20} />}
                    text="Add Faculty List"
                    active={activeSection === "addFacultyList"}
                    onClick={() => setActiveSection("addFacultyList")}
                  />
                  <SidebarItem
                    icon={<Users size={20} />}
                    text="View Faculty List"
                    active={activeSection === "viewIndividualFaculty"}
                    onClick={() => setActiveSection("viewIndividualFaculty")}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase mb-2">Students</h3>
                  <SidebarItem
                    icon={<FileUp size={20} />}
                    text="Add Student List"
                    active={activeSection === "addStudentList"}
                    onClick={() => setActiveSection("addStudentList")}
                  />
                  <SidebarItem
                    icon={<BookOpen size={20} />}
                    text="View Student List"
                    active={activeSection === "viewIndividualStudent"}
                    onClick={() => setActiveSection("viewIndividualStudent")}
                  />
                </div>
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
          <h1 className="text-xl font-bold text-white mr-3 truncate">Admin Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowFacultyModal(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center transition-all duration-300 transform shadow-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 flex-shrink-0" size={20} />
          <span className="hidden sm:inline">Add Faculty</span>
        </button>
        <button
          onClick={() => setShowStudentModal(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center transition-all duration-300 transform shadow-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 flex-shrink-0" size={20} />
          <span className="hidden sm:inline">Add Student</span>
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


  const AddFacultyListForm = () => {
    const [file, setFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [addedFaculties, setAddedFaculties] = useState([]);
    const [newlyAddedFaculties, setNewlyAddedFaculties] = useState([]);
    const fileInputRef = useRef(null);
  
    // Handle file selection
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.type !== "text/csv") {
          toast.error("Only CSV files are allowed");
          return;
        }
        setFile(selectedFile);
      }
    };
  
    // Handle form submission
    const handleUpload = async (e) => {
      e.preventDefault();
  
      if (!file) {
        toast.error("Please select a faculty file before uploading.");
        return;
      }
  
      const formData = new FormData();
      formData.append("csvFile", file);
  
      try {
        const response = await fetch("http://localhost:5000/api/admin/upload-facultyset", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) throw new Error("Failed to upload faculty list");
  
        const data = await response.json();
        toast.success(data.message);
  
        // Set the added faculties data
        setAddedFaculties(data.error.filter(err => err.message === "User or faculty already exists") || []);
        setNewlyAddedFaculties(data.success || []);
        console.log("Response Data:", data);
        console.log("Added Faculties:", addedFaculties);
        console.log("Newly Added Faculties:", newlyAddedFaculties);
  
        // Show the modal
        setShowModal(true);
  
        // Reset state after successful upload
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        toast.error("Failed to upload faculty file. Please try again.");
      }
    };
  
    // Close the modal
    const closeModal = () => {
      setShowModal(false);
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Faculty List</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty CSV File</label>
            <div
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-blue-500" />
                <p className="mb-1 text-sm text-gray-500">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">CSV only (MAX. 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
  
            {/* Display selected file name */}
            {file && (
              <div className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </div>
            )}
          </div>
  
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload Faculty List
          </button>
        </form>
  
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
              <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
  
              {/* Already Added Faculties Table */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Already Added Faculties:</h4>
                {addedFaculties.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedFaculties.map((faculty, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{faculty.id}</td>
                          <td className="border border-gray-300 px-4 py-2">{faculty.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{faculty.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No faculties added yet.</p>
                )}
              </div>
  
              {/* Newly Added Faculties Table */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Newly Added Faculties:</h4>
                {newlyAddedFaculties.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newlyAddedFaculties.map((faculty, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{faculty.id}</td>
                          <td className="border border-gray-300 px-4 py-2">{faculty.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{faculty.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No new faculties added.</p>
                )}
              </div>
  
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  const AddStudentListForm = () => {
    const [studentBatchName, setStudentBatchName] = useState("");
    const [studentFile, setStudentFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [addedStudents, setAddedStudents] = useState([]);
    const [newlyAddedStudents, setNewlyAddedStudents] = useState([]);
    const studentFileInputRef = useRef(null);
  
    // Handle file selection
    const handleStudentFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.type !== "text/csv") {
          toast.error("Only CSV files are allowed");
          return;
        }
        setStudentFile(selectedFile);
      }
    };
  
    // Handle form submission
    const handleStudentFileUpload = async (e) => {
      e.preventDefault();
  
      if (!studentBatchName) {
        toast.error("Please enter a batch name.");
        return;
      }
  
      if (!studentFile) {
        toast.error("Please select a student file before uploading.");
        return;
      }
  
      const formData = new FormData();
      formData.append("csvFile", studentFile);
      formData.append("batchName", studentBatchName);
  
      try {
        const response = await fetch("http://localhost:5000/api/admin/upload-studentbatch", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) throw new Error("Failed to upload student list");
  
        const data = await response.json();
        toast.success(data.message);
  
        // Set the added students data
        setAddedStudents(data.error.filter(err => err.message === "User or student already exists."));
        setNewlyAddedStudents(data.success);
  
        // Show the modal
        setShowModal(true);
  
        // Reset state after successful upload
        setStudentFile(null);
        setStudentBatchName("");
        if (studentFileInputRef.current) studentFileInputRef.current.value = "";
      } catch (error) {
        toast.error("Failed to upload student file. Please try again.");
      }
    };
  
    // Close the modal
    const closeModal = () => {
      setShowModal(false);
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Student List</h2>
        <form onSubmit={handleStudentFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              placeholder="e.g., CS 2023"
              value={studentBatchName}
              onChange={(e) => setStudentBatchName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student CSV File</label>
            <div
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => studentFileInputRef.current.click()}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-blue-500" />
                <p className="mb-1 text-sm text-gray-500">
                  {studentFile ? studentFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">CSV only (MAX. 10MB)</p>
              </div>
              <input
                ref={studentFileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleStudentFileChange}
              />
            </div>
            {studentFile && (
              <div className="mt-2 text-sm text-gray-600">
                Selected file: {studentFile.name}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload Student List
          </button>
        </form>
  
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">Upload Results</h3>
  
              {/* Already Added Students Table */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Already Added Students:</h4>
                {addedStudents.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300 min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Email</th>
                        <th className="border border-gray-300 px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{student.id}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.email}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.department || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No students found that were already added.</p>
                )}
              </div>
  
              {/* Newly Added Students Table */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Newly Added Students:</h4>
                {newlyAddedStudents.length > 0 ? (
                  <table className="w-full border-collapse border border-gray-300 min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">ID</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Email</th>
                        <th className="border border-gray-300 px-4 py-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newlyAddedStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{student.id}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.email}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.department || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No new students added.</p>
                )}
              </div>
  
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  
  const FacultyModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showFacultyModal ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowFacultyModal(false)}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => setShowFacultyModal(false)}
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Add New Faculty</h2>
        </div>
        <form onSubmit={handleAddFaculty} className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              name="id"
              value={facultyFormData.id}
              onChange={handleFacultyInputChange}
              placeholder="Faculty ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={facultyFormData.name}
              onChange={handleFacultyInputChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={facultyFormData.email}
              onChange={handleFacultyInputChange}
              placeholder="Email Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={facultyFormData.department}
              onChange={handleFacultyInputChange}
              placeholder="e.g., Computer Science"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
      
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Faculty
          </button>
        </form>
      </div>
    </div>
  );

  const StudentModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showStudentModal ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowStudentModal(false)}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => setShowStudentModal(false)}
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Add New Student</h2>
        </div>
        <form onSubmit={handleStudentAddition} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input
              type="text"
              name="batchName"
              value={studentFormData.batchName}
              onChange={handleChange}
              placeholder="e.g., CS 2023"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              name="id"
              value={studentFormData.id}
              onChange={handleChange}
              placeholder="Student ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={studentFormData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={studentFormData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={studentFormData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Student
          </button>
        </form>
      </div>
    </div>
  );

  const ViewFacultyList = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
  
    // Fetch faculty list from backend
    useEffect(() => {
      const fetchFacultyList = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/admin/faculty-list");
          if (!response.ok) throw new Error("Failed to fetch faculty list");
  
          const data = await response.json();
          setFacultyList(data);
        } catch (error) {
          console.error("Error fetching faculty list:", error);
          toast.error("Failed to load faculty list");
        }
      };
  
      fetchFacultyList();
    }, []);
  
    // Filter faculty list based on search term (with fallback for undefined values)
    const filteredFacultyList = facultyList.filter(faculty =>
      (faculty?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty?.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty?.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Handle delete action
    const handleDelete = async (facultyId) => {
      if (!window.confirm("Are you sure you want to delete this faculty member?")) {
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authorization token not found", { position: "top-right" });
          return;
        }
  
        const response = await fetch(`http://localhost:5000/api/admin/delete-faculty/${facultyId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error('Failed to delete faculty member');
  
        const data = await response.json();
        if (data.success) {
          toast.success(data.message, { position: "top-right" });
          setFacultyList(facultyList.filter(faculty => faculty._id !== facultyId));
        } else {
          toast.error(data.message, { position: "top-right" });
        }
      } catch (error) {
        console.error('Error deleting faculty member:', error);
        toast.error('Failed to delete faculty member');
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Header and Search */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Faculty List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Head */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
  
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacultyList.length > 0 ? (
                filteredFacultyList.map((faculty, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faculty?.id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {faculty?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faculty?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {faculty?.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => handleDelete(faculty._id)}>
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No faculty found. Add faculty or adjust your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  
  const ViewStudentList = () => {
    const [studentList, setStudentList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
  
    // Fetch student list from backend
    useEffect(() => {
      const fetchStudentList = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/admin/student-list');
          if (!response.ok) throw new Error('Failed to fetch student list');
  
          const data = await response.json();
          setStudentList(data);
        } catch (error) {
          console.error('Error fetching student list:', error);
          toast.error('Failed to load student list');
        }
      };
  
      fetchStudentList();
    }, []);
  
    // Filter students based on search term (including batchName)
    const filteredStudentList = studentList.filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batchName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Handle delete action
    const handleDelete = async (studentId) => {
      if (!window.confirm("Are you sure you want to delete this student?")) {
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authorization token not found", { position: "top-right" });
          return;
        }
  
        const response = await fetch(`http://localhost:5000/api/admin/delete-student/${studentId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error('Failed to delete student');
  
        const data = await response.json();
        if (data.success) {
          toast.success(data.message, { position: "top-right" });
          setStudentList(studentList.filter(student => student._id !== studentId));
        } else {
          toast.error(data.message, { position: "top-right" });
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Header and Search */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Student List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
  
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Head */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
  
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudentList.length > 0 ? (
                filteredStudentList.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => handleDelete(student._id)}>
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found. Add students or adjust your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  
  
  const ViewStudentBatches = () => {
    const [studentBulkList, setStudentBulkList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
  
    // Fetch student batch list from backend
    useEffect(() => {
      const fetchStudentBatches = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/admin/student-batches');
          if (!response.ok) throw new Error('Failed to fetch student batches');
  
          const data = await response.json();
          setStudentBulkList(data);
        } catch (error) {
          console.error('Error fetching student batches:', error);
          toast.error('Failed to load student batches');
        }
      };
  
      fetchStudentBatches();
    }, []);
  
    // Filter student batch list based on search term
    const filteredStudentBulkList = studentBulkList.filter(item =>
      item.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Student Batches</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudentBulkList.length > 0 ? (
                filteredStudentBulkList.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.batchName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No student batches found. Upload a batch or adjust your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const Dashboard = () => {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Faculty</h3>
              <p className="text-2xl font-semibold">{facultyList.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Students</h3>
              <p className="text-2xl font-semibold">{studentList.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Batches</h3>
              <p className="text-2xl font-semibold">{bulkList.length + studentBulkList.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Faculty Uploads</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="pb-2 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="pb-2 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkList.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 text-sm">{item.batchName}</td>
                      <td className="py-3 text-sm text-gray-500">{item.date}</td>
                    </tr>
                  ))}
                  {bulkList.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-3 text-sm text-center text-gray-500">No faculty uploads yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Student Uploads</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="pb-2 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="pb-2 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {studentBulkList.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 text-sm">{item.batchName}</td>
                      <td className="py-3 text-sm text-gray-500">{item.date}</td>
                    </tr>
                  ))}
                  {studentBulkList.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-3 text-sm text-center text-gray-500">No student uploads yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout successfully!")
    navigate('/'); // Adjust the path to your login page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar />
      <div className={`flex-grow ${isDesktop ? 'ml-64' : ''}`}>
      <Header/>
        <div className="px-4 py-2">
          {activeSection === "addFacultyList" && <AddFacultyListForm />}
          {activeSection === "viewIndividualFaculty" && <ViewFacultyList />}
          {activeSection === "addStudentList" && <AddStudentListForm />}
          {activeSection === "viewIndividualStudent" && <ViewStudentList />}
          {activeSection === "viewStudentBatches" && <ViewStudentBatches />}
          {activeSection === "dashboard" && <Dashboard />}
        </div>
      </div>
      <FacultyModal />
      <StudentModal />
      <Toast />
    </div>
  );
};

export default AdminDashboard;
