import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://4cd8-203-192-204-172.ngrok-free.app";

function FileTree({ files }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <ul style={{ listStyle: "none", paddingLeft: "1rem" }}>
      {files.map((file) => (
        <li key={file.path} style={{ marginBottom: "0.5rem" }}>
          {file.type === "folder" ? (
            <>
              <span
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => toggle(file.path)}
              >
                📁 {file.name}
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
            >
              📄 {file.name}
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

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files`);
      setFiles(res.data.files);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${API_BASE}/upload`, formData);
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>🗂️ My File Browser</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={uploadFile} style={{ marginLeft: "10px", padding: "0.4rem 1rem" }}>
          Upload
        </button>
      </div>

      <div>
        <h3>📁 Files:</h3>
        {files.length === 0 ? (
          <p>No files found.</p>
        ) : (
          <FileTree files={files} />
        )}
      </div>
    </div>
  );
}

export default App;
