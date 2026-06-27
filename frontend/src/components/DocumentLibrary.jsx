import React from 'react';

const DocumentLibrary = ({ documents, onDelete, darkMode }) => {
  const dm = darkMode;

  return (
    <div style={{
      background: dm ? '#1a1a1f' : '#ffffff',
      border: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
      borderRadius: '16px',
      padding: '24px',
      width: '100%',
    }}>
      <h2 style={{ fontSize: '15px', fontWeight: '600', color: dm ? '#e1e1f0' : '#1f2937', margin: '0 0 16px' }}>
        Your files
      </h2>

      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: dm ? '#55556a' : '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
          <p style={{ fontSize: '14px', margin: 0 }}>No documents uploaded yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: dm ? '#12121a' : '#f9fafb', borderRadius: '8px' }}>
                {['Filename', 'Size', 'Upload Date', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontWeight: '600',
                    fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: dm ? '#6b6b7a' : '#6b7280',
                    borderBottom: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr
                  key={doc.id}
                  style={{
                    borderBottom: idx < documents.length - 1
                      ? `1px solid ${dm ? '#1e1e28' : '#f3f4f6'}`
                      : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = dm ? '#1e1e28' : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', color: dm ? '#d1d1e0' : '#1f2937', fontWeight: '500' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📄</span>
                      {doc.filename}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: dm ? '#6b6b7a' : '#6b7280' }}>
                    {doc.size} MB
                  </td>
                  <td style={{ padding: '12px 14px', color: dm ? '#6b6b7a' : '#6b7280' }}>
                    {doc.uploadDate}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => onDelete(doc.id)}
                      style={{
                        background: dm ? '#2a1515' : '#fff1f2',
                        border: `1px solid ${dm ? '#5a2020' : '#fecdd3'}`,
                        color: '#f87171', fontSize: '12px', fontWeight: '500',
                        padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={e => e.currentTarget.style.background = dm ? '#2a1515' : '#fff1f2'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary;
