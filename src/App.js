import React, { useState, useEffect } from "react";
import axios from "axios";

// 🔧 Replace with your live ngrok URL when you deploy
const API_BASE = "http://192.168.0.169:8000";

/* --------------------------------------------------
   📁 Reusable FileTree component – recursive, collapsible
-----------------------------------------------------*/
const FileTree = ({ files }) => {
  const [open, setOpen] = useState({});

  const toggle = (path) => setOpen((p) => ({ ...p, [path]: !p[path] }));

  return (
    <ul className="pl-4 space-y-1">
      {files.map((f) => (
        <li key={f.path}>
          {f.type === "folder" ? (
            <>
              <button
                onClick={() => toggle(f.path)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 focus:outline-none"
              >
                <span className="mr-1">
                  {open[f.path] ? "📂" : "📁"}
                </span>
                <span className="font-medium">{f.name}</span>
              </button>
              {open[f.path] && f.children?.length > 0 && (
                <FileTree files={f.children} />
              )}
            </>
          ) : (
            <a
              href={`${API_BASE}/download/${f.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-700 hover:text-indigo-600"
            >
              <span className="mr-1">📄</span>
              {f.name}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
};

/* --------------------------------------------------
   🗂️ Main App component
-----------------------------------------------------*/
export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  /* ------------------------- API helpers ------------------------ */
  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/files`);
      setFiles(data.files || []);
    } catch (err) {
      setError("Failed to load files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      await axios.post(`${API_BASE}/upload`, form);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------- lifecycle ----------------------- */
  useEffect(() => {
    fetchFiles();
  }, []);

  /* ---------------------------- render -------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center">
          <span className="mr-2">🗂️</span> Bhonge File Browser
        </h1>

        {/* Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-8">
          <input
            type="file"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 flex-1 mb-4 sm:mb-0"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button
            onClick={uploadFile}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}
        {loading ? (
          <div className="text-gray-600">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-gray-500">No files found. Upload something ✨</div>
        ) : (
          <FileTree files={files} />
        )}
      </div>
    </div>
  );
}
