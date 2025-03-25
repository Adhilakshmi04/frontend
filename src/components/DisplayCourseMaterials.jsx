import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const DisplayCourseMaterials = ({ courseId, refreshTrigger }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCO, setExpandedCO] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Course outcomes array - to ensure we display all COs even if they have no content
  const courseOutcomes = ["CO 1", "CO 2", "CO 3", "CO 4", "CO 5"];

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    
    fetchCourseMaterials();
  }, [courseId, refreshTrigger]);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/faculty/course-materials/${courseId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setMaterials(data.materials || []);
      } else {
        toast.error(data.message || "Failed to fetch course materials", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error fetching course materials:", error);
      toast.error("An error occurred while fetching course materials", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      setDeleting(materialId);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/faculty/delete-material/${courseId}/${materialId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Material deleted successfully", { position: "top-right" });
        // Update the local state to remove the deleted material
        setMaterials(materials.filter(material => material._id !== materialId));
      } else {
        toast.error(data.message || "Failed to delete material", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("An error occurred while deleting material", { position: "top-right" });
    } finally {
      setDeleting(null);
    }
  };

  // Group materials by CO
  const getMaterialsByCO = (co) => {
    if (!materials || !materials.length) return [];
    
    // Format CO to match the expected format (e.g., "CO 1" to "CO-1")
    const formattedCO = co.replace(" ", "-");
    
    return materials.filter(material => 
      material.CO.toLowerCase() === formattedCO.toLowerCase());
  };

  const toggleCO = (co) => {
    if (expandedCO === co) {
      setExpandedCO(null);
    } else {
      setExpandedCO(co);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-700">Course Outcomes (COs)</h2>
      
      <div className="space-y-3">
        {courseOutcomes.map((co) => {
          const materialsList = getMaterialsByCO(co);
          const hasContent = materialsList.length > 0;
          
          return (
            <div key={co} className="border rounded-md overflow-hidden">
              <div 
                className={`flex justify-between items-center p-4 cursor-pointer ${
                  expandedCO === co ? "bg-indigo-100" : "bg-gray-50"
                }`}
                onClick={() => toggleCO(co)}
              >
                <h3 className="text-md font-medium text-gray-700">{co}</h3>
                <button className="text-indigo-600">
                  {expandedCO === co ? (
                    <span className="text-xl">−</span>
                  ) : (
                    <span className="text-xl">+</span>
                  )}
                </button>
              </div>
              
              {expandedCO === co && (
                <div className="p-4 bg-white">
                  {!hasContent ? (
                    <p className="text-gray-500 text-center py-4">No documents or files available for {co}</p>
                  ) : (
                    <ul className="space-y-3">
                      {materialsList.map((material, index) => (
                        <li key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <h4 className="font-medium text-indigo-700">{material.title}</h4>
                              {material.description && (
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded: {formatDate(material.createdAt || new Date())}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4 mr-1" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                                  />
                                </svg>
                                Download
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMaterial(material._id);
                                }}
                                disabled={deleting === material._id}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-400"
                              >
                                {deleting === material._id ? (
                                  <svg 
                                    className="animate-spin h-4 w-4 mr-1" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                  >
                                    <circle 
                                      className="opacity-25" 
                                      cx="12" 
                                      cy="12" 
                                      r="10" 
                                      stroke="currentColor" 
                                      strokeWidth="4"
                                    ></circle>
                                    <path 
                                      className="opacity-75" 
                                      fill="currentColor" 
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-4 w-4 mr-1" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={2} 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                    />
                                  </svg>
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayCourseMaterials;