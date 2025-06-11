import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://9472-203-192-204-172.ngrok-free.app";

function FileTree({ files }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <ul className="file-tree">
      {files.map((file) => (
        <li key={file.path} className="file-item">
          {file.type === "folder" ? (
            <>
              <span className="folder-name" onClick={() => toggle(file.path)}>
                <span className="folder-icon">📁</span> {file.name}
              </span>
              {expanded[file.path] && file.children && (
                <FileTree files={file.children} />
              )}
            </>
          ) : (
            <a
              href={`${API_BASE}/download/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              <span className="file-icon">📄</span> {file.name}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (res.data && Array.isArray(res.data.files)) {
        setFiles(res.data.files);
      } else {
        console.error("Invalid response from API:", res.data);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      setFile(null);
      await fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🗂️ Bhonge File Browser</h1>
      </header>

      <section className="upload-section">
        <div className="upload-container">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
          <button
            onClick={uploadFile}
            className="upload-button"
            disabled={!file || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </section>

      <section className="files-section">
        <h2 className="files-title">📁 Files</h2>
        {files.length === 0 ? (
          <div className="empty-state">
            <p>No files found. Upload a file to get started!</p>
          </div>
        ) : (
          <FileTree files={files} />
        )}
      </section>
    </div>
  );
}

export default App;
