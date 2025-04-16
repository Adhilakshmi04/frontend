import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { UploadCloud } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

const FacultyAddStudentListForm = ({ courseId, onStudentsAdded }) => {
  const [studentBatchName, setStudentBatchName] = useState("");
  const [studentFile, setStudentFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addedStudents, setAddedStudents] = useState([]);
  const [newlyAddedStudents, setNewlyAddedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle form submission for faculty bulk student upload
  const handleStudentFileUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!studentBatchName) {
      toast.error("Please enter a batch name.");
      setIsLoading(false);
      return;
    }

    if (!studentFile) {
      toast.error("Please select a student file before uploading.");
      setIsLoading(false);
      return;
    }

    try {
      // First, parse the CSV file
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        const csvData = event.target.result;
        const rows = csvData.split('\n');
        // Assuming the CSV has a header row
        const headers = rows[0].split(',');
        
        // Find the index of the email column
        const emailColumnIdx = headers.findIndex(header => 
          header.toLowerCase().trim() === 'email');
        
        if (emailColumnIdx === -1) {
          toast.error("CSV file must contain an 'email' column");
          setIsLoading(false);
          return;
        }
        
        // Extract student emails from CSV
        const studentEmails = rows.slice(1)
          .filter(row => row.trim() !== '')
          .map(row => {
            const columns = row.split(',');
            return columns[emailColumnIdx].trim();
          })
          .filter(email => email !== '');
        
        if (studentEmails.length === 0) {
          toast.error("No valid student emails found in CSV");
          setIsLoading(false);
          return;
        }
        
        // Add these students to the course
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/faculty/course/${courseId}/add-student`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: studentEmails }),
          }
        );
        
        const data = await response.json();
        
        // Process results
        const successStudents = data.addedStudents?.filter(item => item.student) || [];
        const existingStudents = data.errors?.filter(err => 
          err.message && err.message.includes("already enrolled")) || [];
        
        // Set up data for display in modal
        const newStudents = successStudents.map(item => ({
          _id: item.student._id,
          name: item.student.name || "Unnamed Student",
          email: item.student.email,
          department: item.student.department || "N/A",
        }));
        
        const alreadyAddedStudents = existingStudents.map(item => ({
          email: item.email,
          message: item.message
        }));
        
        setNewlyAddedStudents(newStudents);
        setAddedStudents(alreadyAddedStudents);
        
        // Update UI in parent component
        if (newStudents.length > 0) {
          const studentObjects = successStudents.map(item => item.student);
          onStudentsAdded(studentObjects);
          toast.success(`Successfully added ${newStudents.length} students to the course`);
        } else {
          toast.info("No new students were added to the course");
        }
        
        // Show the modal with results
        setShowModal(true);
        
        // Reset the form
        setStudentFile(null);
        setStudentBatchName("");
        if (studentFileInputRef.current) studentFileInputRef.current.value = "";
        setIsLoading(false);
      };
      
      fileReader.onerror = () => {
        toast.error("Error reading the CSV file");
        setIsLoading(false);
      };
      
      fileReader.readAsText(studentFile);
      
    } catch (error) {
      console.error("Error in faculty bulk student upload:", error);
      toast.error("Failed to add students to the course. Please try again.");
      setIsLoading(false);
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full">
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
              <p className="text-xs text-gray-500">CSV file with student emails</p>
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
          className="w-full py-2 bg-[#2158D2] text-white rounded-md hover:bg-[#1a46a8] transition-colors duration-200 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Adding Students...
            </>
          ) : (
            "Add Students to Course"
          )}
        </button>
      </form>

      {/* Results Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Student Addition Results</h3>

            {/* Already Added Students Table */}
            {addedStudents.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-gray-700">Students Already in Course:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{student.email}</td>
                          <td className="border border-gray-300 px-4 py-2 text-amber-600">{student.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Newly Added Students Table */}
            {newlyAddedStudents.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2 text-gray-700">Newly Added Students:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newlyAddedStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {newlyAddedStudents.length === 0 && addedStudents.length === 0 && (
              <p className="text-gray-600 mb-4">No students were processed. Please check your CSV file format.</p>
            )}

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-[#2158D2] text-white rounded-md hover:bg-[#1a46a8] transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAddStudentListForm;