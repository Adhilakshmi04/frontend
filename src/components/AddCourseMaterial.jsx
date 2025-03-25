import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import DisplayCourseMaterials from "./DisplayCourseMaterials";

const AddCourseMaterial = ({ courseId }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    courseId,
    CO: "",
    title: "",
    description: "",
    fileUrl: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkdata, setLinkData] = useState("");
  const [refreshMaterials, setRefreshMaterials] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check if the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        toast.error("PDF files are not allowed", { position: "top-right" });
        return;
      }

      setFormData({
        ...formData,
        fileUrl: selectedFile
      });

      setUploadProgress(0);
      console.log("Selected file:", selectedFile.name,
                  "Size:", (selectedFile.size / 1024).toFixed(2) + " KB",
                  "Type:", selectedFile.type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const selectedFile = files[0];

      // Check if the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        toast.error("PDF files are not allowed", { position: "top-right" });
        return;
      }

      setFormData({
        ...formData,
        fileUrl: selectedFile
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseId) {
      toast.error("Course ID is missing", { position: "top-right" });
      return;
    }

    if (!formData.fileUrl) {
      toast.error("Please select a file to upload", { position: "top-right" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("courseId", formData.courseId);
      formDataToSend.append("CO", formData.CO);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("fileUrl", formData.fileUrl);

      console.log("Sending form data with file:", formData.fileUrl.name);

      setUploadProgress(30);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/faculty/add-materials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      setUploadProgress(90);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        console.log(data.material);
        setLinkData(data.material.fileUrl);
        toast.success(data.message, { position: "top-right" });

        setFormData({
          courseId,
          CO: "",
          title: "",
          description: "",
          fileUrl: null
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setRefreshMaterials(prev => !prev);
      } else {
        toast.error(data.message, { position: "top-right" });
        console.error("Server error details:", data.details || data.error);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.error("An error occurred during upload. Please try again.", { position: "top-right" });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Course Material</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="co" className="block text-sm font-medium text-gray-700">Course Outcome (CO)</label>
          <input id="co" type="text"
            name="CO"
            placeholder="CO (e.g., CO-1)"
            value={formData.CO}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Material Title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Material Description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">Upload File</label>
          <div
            className={`mt-1 block w-full p-6 border-2 border-dashed rounded-md text-center transition-colors duration-300
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-500'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="fileUrl"
              type="file"
              name="fileUrl"
              accept="*/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              required
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">All file types except PDF</p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>

        {formData.fileUrl && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-4">
            <p>Selected file: <span className="font-medium">{formData.fileUrl.name}</span></p>
            <p>Size: {(formData.fileUrl.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-white bg-[#2158D2] hover:bg-[#1a46a8] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload Material"}
        </button>
      </form>
      <DisplayCourseMaterials courseId={courseId} refreshTrigger={refreshMaterials} />
    </div>
  );
};

export default AddCourseMaterial;
