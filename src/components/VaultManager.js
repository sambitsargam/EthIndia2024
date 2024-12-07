/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import './VaultManager.css';  // Ensure this CSS file exists in the same directory

const API_BASE_URL = "http://localhost:8000";  // Replace with your API base URL

const VaultManager = () => {
  const [bucketName, setBucketName] = useState("");
  const [file, setFile] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(""); // Selected bucket for file upload
  const [filesInBucket, setFilesInBucket] = useState([]); // Files in the selected bucket
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all buckets when component mounts
  useEffect(() => {
    fetchBuckets();
  }, []);

  // Fetch buckets from the API
  const fetchBuckets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/buckets`);
      console.log(response.data); // Log the full response to inspect
  
      // Check if the response is successful and contains the 'data' key as an array
      if (response.data.success && Array.isArray(response.data.data)) {
        setBuckets(response.data.data);  // Set the buckets array
        if (response.data.data.length > 0) {
          setSelectedBucket(response.data.data[0].Name); // Set default selected bucket to the first one
          fetchFilesInBucket(response.data.data[0].Name); // Fetch files for the first bucket
        }
      } else {
        setMessage("Unexpected response format");
        setBuckets([]);  // Reset buckets
      }
    } catch (error) {
      console.error("Error fetching buckets:", error);
      setMessage("Error fetching buckets");
    }
  };

  // Fetch files in the selected bucket
  const fetchFilesInBucket = async (bucketName) => {
    if (!bucketName) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/buckets/${bucketName}/files`);
      console.log(response.data); // Log the full response to inspect
      if (response.data.success && Array.isArray(response.data.data)) {
        setFilesInBucket(response.data.data); // Set files in the selected bucket
      } else {
        setMessage("Error fetching files");
        setFilesInBucket([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setMessage("Error fetching files");
    }
  };

  // Handle bucket creation
  const createBucket = async () => {
    if (!bucketName) {
      setMessage("Bucket name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/buckets`, { bucketName });
      setMessage(`Bucket "${bucketName}" created successfully!`);
      console.log(response.data); // Log the full response to inspect
      fetchBuckets();  // Reload buckets list
      setBucketName(""); // Clear input
    } catch (error) {
      console.error("Error creating bucket:", error);
      setMessage("Failed to create bucket.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file change
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Upload file to the selected bucket
  const uploadFile = async () => {
    if (!selectedBucket || !file) {
      setMessage("Please select a bucket and a file to upload.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/buckets/${selectedBucket}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data); // Log the full response to inspect
      setMessage(`File "${file.name}" uploaded to bucket "${selectedBucket}"!`);
      fetchFilesInBucket(selectedBucket); // Reload files list after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  // Download file from the selected bucket
  const downloadFile = async (fileName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/buckets/${selectedBucket}/files/${fileName}/download`,
        { responseType: "blob" }
      );
      const blob = response.data;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Set the downloaded file's name
      document.body.appendChild(a);
      a.click();
      setMessage(`File "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading file:", error);
      setMessage("Failed to download file.");
    }
  };

  return (
    <div className="container">
      <h1>Vault Manager</h1>

      {/* Bucket Creation Section */}
      <div className="section">
        <h2>Create a New Bucket</h2>
        <input
          type="text"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          placeholder="Enter Bucket Name"
        />
        <button onClick={createBucket} disabled={loading}>
          {loading ? "Creating..." : "Create Bucket"}
        </button>
      </div>

      {/* Message display */}
      {message && <div className="response-message">{message}</div>}

      {/* List Existing Buckets and Select */}
      <div className="section">
        <h2>Select Bucket for File Upload</h2>
        {buckets.length > 0 ? (
          <select
            value={selectedBucket}
            onChange={(e) => {
              setSelectedBucket(e.target.value);
              fetchFilesInBucket(e.target.value); // Fetch files whenever bucket is changed
            }}
          >
            {buckets.map((bucket) => (
              <option key={bucket.ID} value={bucket.Name}>
                {bucket.Name}
              </option>
            ))}
          </select>
        ) : (
          <p>No buckets available.</p>
        )}
      </div>

      {/* File Upload Section */}
      <div className="section">
        <h2>Upload File to Selected Bucket</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFile} disabled={loading || !selectedBucket || !file}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Files in the Selected Bucket */}
      <div className="section">
        <h2>Files in Selected Bucket</h2>
        {filesInBucket.length > 0 ? (
          <ul>
            {filesInBucket.map((file) => (
              <li key={file.ID}>
                <strong>{file.Name}</strong> -{" "}
                <button onClick={() => downloadFile(file.Name)}>
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No files available in this bucket.</p>
        )}
      </div>
    </div>
  );
};

export default VaultManager;
