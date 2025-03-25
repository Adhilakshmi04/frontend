import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash, Download } from 'lucide-react';
// import './index.css'; // Import the CSS file

const DisplayAssignments = ({ courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCO, setExpandedCO] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const courseOutcomes = ["CO-1", "CO-2", "CO-3", "CO-4", "CO-5"];

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authorization token not found", { position: "top-right" });
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/faculty/course-assignments/${courseId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        toast.error(data.message || "Failed to fetch assignments", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("An error occurred while fetching assignments", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }
    try {
      setDeleting(assignmentId);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authorization token not found", { position: "top-right" });
        setDeleting(null);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/faculty/delete-assignment/${courseId}/${assignmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Assignment deleted successfully", { position: "top-right" });
        setAssignments((prevAssignments) =>
          prevAssignments.filter((assignment) => assignment._id !== assignmentId)
        );
      } else {
        toast.error(data.message || "Failed to delete assignment", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("An error occurred while deleting assignment", { position: "top-right" });
    } finally {
      setDeleting(null);
    }
  };

  const getAssignmentsByCO = (co) => {
    return assignments.filter((assignment) =>
      assignment.co && assignment.co.toLowerCase() === co.toLowerCase()
    );
  };

  const toggleCO = (co) => {
    if (expandedCO === co) {
      setExpandedCO(null);
    } else {
      setExpandedCO(co);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    if (date.$date && date.$date.$numberLong) {
      return new Date(Number(date.$date.$numberLong)).toLocaleDateString();
    }
    return 'N/A';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Assignments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {courseOutcomes.map((co) => (
            <div key={co}>
              <div
                className="co-container"
                onClick={() => toggleCO(co)}
              >
                <span className="co-text">{co}</span>
                <Plus size={16} className="co-icon" />
              </div>
              {expandedCO === co && (
                <div className="assignments-container">
                  {getAssignmentsByCO(co).length > 0 ? (
                    getAssignmentsByCO(co).map((assignment) => (
                      <div key={assignment._id} className="assignment-item">
                        <div>
                          <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">{assignment.description}</p>
                          <p className="text-gray-700">Due: {formatDate(assignment.dueDate)}</p>
                        </div>
                        <div className="assignment-actions">
                          {assignment.fileUrl && (
                            <a
                              href={assignment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <Download size={16} className="mr-1" />
                              Download
                            </a>
                          )}
                          <button
                            onClick={() => deleteAssignment(assignment._id)}
                            disabled={deleting === assignment._id}
                            className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash size={16} className="mr-1" />
                            {deleting === assignment._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 ">No assignments available for {co}.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayAssignments;
