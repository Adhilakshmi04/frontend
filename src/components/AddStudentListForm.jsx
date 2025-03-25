import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { UploadCloud } from 'lucide-react'; // Ensure you have the lucide-react library installed

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

export default AddStudentListForm;
