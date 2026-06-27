import React, { useState } from 'react';

const DocumentUploader = ({ onUpload, error: parentError, loading, darkMode }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !loading) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading || loading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setError(null);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    setError(null);
    for (let i = 1; i <= 100; i += 10) {
      setTimeout(() => setProgress(i), i * 10);
    }
    if (onUpload) {
      try {
        await onUpload(files);
      } catch (err) {
        setError(err?.error || 'Upload failed');
      }
    }
    setTimeout(() => {
      setUploading(false);
      setProgress(100);
      setFiles([]);
    }, 1200);
  };

  const dm = darkMode;

  return (
    <div
      style={{
        background: dm ? '#1a1a1f' : '#ffffff',
        border: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 style={{ fontSize: '15px', fontWeight: '600', color: dm ? '#e1e1f0' : '#1f2937', margin: '0 0 16px' }}>
        Upload document
      </h2>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && !loading && document.getElementById('fileInput').click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#6366f1' : dm ? '#3a3a55' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragActive
            ? dm ? '#1e1e3a' : '#eef2ff'
            : dm ? '#12121a' : '#f9fafb',
          transition: 'all 0.2s',
          marginBottom: '16px',
        }}
        tabIndex={0}
        role="button"
        aria-label="Drag and drop files here or click to select"
      >
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading || loading}
        />
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
        <p style={{ fontSize: '14px', fontWeight: '500', color: dm ? '#a0a0b8' : '#4b5563', margin: '0 0 4px' }}>
          Drag &amp; drop files here
        </p>
        <p style={{ fontSize: '13px', color: dm ? '#55556a' : '#9ca3af', margin: 0 }}>
          or <span style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: '500' }}>click to select</span>
        </p>
        {files.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: dm ? '#a78bfa' : '#6366f1', fontWeight: '500' }}>
            Selected: {files.map(f => f.name).join(', ')}
          </div>
        )}
      </div>

      {(error || parentError) && (
        <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error || parentError}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || loading || files.length === 0}
        style={{
          width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
          background: files.length > 0 && !uploading && !loading
            ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
            : dm ? '#2a2a35' : '#e5e7eb',
          color: files.length > 0 && !uploading && !loading ? '#fff' : dm ? '#55556a' : '#9ca3af',
          fontSize: '14px', fontWeight: '500',
          cursor: files.length > 0 && !uploading && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        {uploading ? 'Uploading...' : loading ? 'Processing...' : 'Upload'}
      </button>

      {uploading && (
        <div style={{ marginTop: '12px', background: dm ? '#2a2a35' : '#e5e7eb', borderRadius: '999px', height: '6px' }}>
          <div style={{
            width: `${progress}%`, height: '6px', borderRadius: '999px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
