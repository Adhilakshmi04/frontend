import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
export const BatchSelector = ({ onSelectBatch,courseId }) => { 
    const token=localStorage.getItem("token");
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [emails, setEmails] = useState([]);
    useEffect(() => {
      const fetchBatches = async () => {
        try {
          const response=await fetch("http://localhost:5000/api/batches/students",{
            headers:{Authorization:`Bearer ${token}`},
          });
          const data= await response.json();
          setBatches(data);
        } catch (error) {
          console.error("Error fetching batches", error);
        }
      };

      fetchBatches();
    }, []);

    const handleChange =async(event) => {
      const batchName = event.target.value;
      setSelectedBatch(batchName);
      onSelectBatch(event.target.value);
       if (batchName) {
         try {
             const response=await fetch(`http://localhost:5000/api/students/emails/${batchName}`,{
               headers:{Authorization:`Bearer ${token}`},
             });
             const data=await response.json();
             setEmails(data.emails);
            } catch (error) {
                console.error("Error fetching emails", error);
            }
       }
       else {
        setEmails([]);
       }
    }


    useEffect(() => {
      const addToCourse = async () => {
        if (emails && emails.length > 0) {
          const emailString = emails.join(", ");
          const emailArray = emailString.split(",").map((email) => email.trim());
    
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
            console.log(data);          
          } catch (error) {
            console.error("Error adding student:", error);
            toast.error("Failed to add student(s).", { position: "top-right" });
          }
        }
      };
    
      addToCourse();
    }, [emails]);
    

    return (
      <div>
        <label>Select Batch:</label>
        <select value={selectedBatch} onChange={handleChange}>
          <option value="">Select a batch</option>
          {batches.map((batch) => (
            <option key={batch._id} value={batch.batchName}>
              {batch.batchName}
            </option>
          ))}
        </select>
      </div>
    );
}