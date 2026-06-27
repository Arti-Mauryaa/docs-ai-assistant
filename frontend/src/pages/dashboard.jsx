import React, { useState, useEffect, useRef } from 'react';
import DocumentUploader from '../components/DocumentUploader';
import DocumentLibrary from '../components/DocumentLibrary';
import ChatInterface from '../components/ChatInterface';
import { endpoints, apiFetch, uploadFile, BASE_URL } from '../config/api';

const endpointsChat = {
  createSession: endpoints.createChatSession || `${BASE_URL}/chat/sessions`,
  sendMessage: (sessionId) => `${BASE_URL}/chat/sessions/${sessionId}/messages`,
};

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(endpoints.getDocuments, {}, token);
      setDocuments(
        (res.documents || []).map(doc => ({
          id: doc._id,
          filename: doc.filename,
          size: (doc.metadata?.fileSize / 1024 / 1024).toFixed(2),
          uploadDate: doc.createdAt?.slice(0, 10),
          previewUrl: '#',
        }))
      );
    } catch (err) {
      setError(err.error || 'Failed to fetch documents');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const res = await apiFetch(endpoints.getChatSessions, {}, token);
      setChatSessions(res.sessions || []);
    } catch (err) {
      setError(err.error || 'Failed to fetch chat sessions');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this chat session?')) return;
    try {
      await apiFetch(endpoints.deleteChatSession(sessionId), { method: 'DELETE' }, token);
      if (chatSessionId === sessionId) {
        setChatSessionId(null);
        setChatMessages([]);
      }
      await fetchChatSessions();
    } catch (err) {
      setError(err.error || 'Failed to delete chat session');
    }
  };

  const handleEditSessionTitle = async (sessionId, oldTitle) => {
    const newTitle = window.prompt('Edit chat title:', oldTitle);
    if (!newTitle || newTitle === oldTitle) return;
    try {
      await apiFetch(`${endpoints.getChatSessions}/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle }),
        headers: { 'Content-Type': 'application/json' }
      }, token);
      await fetchChatSessions();
    } catch (err) {
      setError(err.error || 'Failed to edit chat title');
    }
  };

  const loadChatHistory = async (sessionId) => {
    setChatLoading(true);
    try {
      const res = await apiFetch(endpoints.getChatHistory(sessionId), {}, token);
      setChatSessionId(res._id || res.id);
      setChatMessages(res.messages || []);
    } catch (err) {
      setError(err.error || 'Failed to load chat history');
    }
    setChatLoading(false);
  };

  const handleUpload = async (files) => {
    setLoading(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadFile(endpoints.uploadDocument, file, token);
      }
      await fetchDocuments();
    } catch (err) {
      setError(err.error || 'Upload failed');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(endpoints.deleteDocument(id), { method: 'DELETE' }, token);
      await fetchDocuments();
    } catch (err) {
      setError(err.error || 'Delete failed');
    }
    setLoading(false);
  };

  const createChatSession = async () => {
    setChatLoading(true);
    try {
      const res = await apiFetch(endpointsChat.createSession, { method: 'POST' }, token);
      setChatSessionId(res._id || res.id);
      setChatMessages([]);
      await fetchChatSessions();
    } catch (err) {
      setError(err.error || 'Failed to start chat session');
    }
    setChatLoading(false);
  };

  const handleSendMessage = async (message) => {
    if (!chatSessionId) return;
    setChatLoading(true);
    try {
      const res = await apiFetch(
        endpointsChat.sendMessage(chatSessionId),
        { method: 'POST', body: JSON.stringify({ message }) },
        token
      );
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: res.message, citation: res.sources?.map(s => s.filename).join(', ') }
      ]);
    } catch (err) {
      setError(err.error || 'Failed to send message');
    }
    setChatLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: darkMode ? '#0f0f11' : '#f3f4f6', fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background 0.3s' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: darkMode ? '#1a1a1f' : '#ffffff',
        borderRight: `1px solid ${darkMode ? '#2a2a35' : '#e5e7eb'}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${darkMode ? '#2a2a35' : '#e5e7eb'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px'
            }}>🧠</div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: darkMode ? '#f1f1f3' : '#1f2937' }}>DocsAI</span>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                marginLeft: 'auto', background: darkMode ? '#2a2a3a' : '#f3f4f6',
                border: `1px solid ${darkMode ? '#3a3a55' : '#e5e7eb'}`,
                borderRadius: '20px', padding: '4px 10px', cursor: 'pointer',
                fontSize: '14px', transition: 'all 0.2s',
              }}
              title="Toggle dark mode"
            >{darkMode ? '☀️' : '🌙'}</button>
          </div>
          <p style={{ fontSize: '12px', color: darkMode ? '#6b6b7a' : '#9ca3af', margin: '0', paddingLeft: '42px' }}>RAG-powered assistant</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px' }}>
          {[
            { key: 'documents', label: 'Documents', icon: '📄' },
            { key: 'chat', label: 'Chat', icon: '💬' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '14px', fontWeight: '500',
                marginBottom: '4px',
                background: activeTab === item.key ? (darkMode ? '#2a2a3a' : '#eef2ff') : 'transparent',
                color: activeTab === item.key ? '#6366f1' : darkMode ? '#8888a0' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.key === 'documents' && documents.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: '600',
                  background: darkMode ? '#2a2a3a' : '#eef2ff', color: '#6366f1',
                  padding: '2px 7px', borderRadius: '10px',
                  border: '1px solid #c7d2fe'
                }}>{documents.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Chat sessions */}
        {activeTab === 'chat' && (
          <div style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <button
              onClick={createChatSession}
              disabled={chatLoading}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1px solid #3a3a55', background: 'transparent',
                color: '#6366f1', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '6px', justifyContent: 'center', marginBottom: '16px',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span> New chat
            </button>

            <p style={{ fontSize: '11px', fontWeight: '600', color: darkMode ? '#55556a' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 4px' }}>Recent</p>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chatSessions.length === 0 && (
                <p style={{ fontSize: '13px', color: darkMode ? '#55556a' : '#9ca3af', padding: '8px 4px' }}>No chats yet</p>
              )}
              {chatSessions.map(session => (
                <div key={session._id} style={{ position: 'relative', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={() => loadChatHistory(session._id)}
                      style={{
                        flex: 1, textAlign: 'left', padding: '8px 10px',
                        borderRadius: '7px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        background: chatSessionId === session._id ? (darkMode ? '#2a2a3a' : '#eef2ff') : 'transparent',
                        color: chatSessionId === session._id ? '#6366f1' : (darkMode ? '#8888a0' : '#6b7280'),
                        transition: 'all 0.15s',
                      }}
                    >{session.title}</button>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === session._id ? null : session._id)}
                      style={{ background: 'transparent', border: 'none', color: darkMode ? '#55556a' : '#9ca3af', cursor: 'pointer', padding: '4px 6px', fontSize: '16px', borderRadius: '4px' }}
                    >⋯</button>
                  </div>
                  {menuOpenId === session._id && (
                    <div ref={menuRef} style={{
                      position: 'absolute', right: '0', top: '36px', zIndex: 20,
                      background: darkMode ? '#1e1e28' : '#ffffff', border: `1px solid ${darkMode ? '#2a2a3a' : '#e5e7eb'}`, borderRadius: '10px',
                      padding: '6px', minWidth: '150px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}>
                      <button onClick={() => { setMenuOpenId(null); handleEditSessionTitle(session._id, session.title); }}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: darkMode ? '#c0c0d0' : '#374151', fontSize: '13px', cursor: 'pointer' }}>
                        ✏️ Rename
                      </button>
                      <button onClick={() => { setMenuOpenId(null); handleDeleteSession(session._id); }}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#f87171', fontSize: '13px', cursor: 'pointer' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom - logout */}
        <div style={{ padding: '16px 12px', borderTop: `1px solid ${darkMode ? '#2a2a35' : '#e5e7eb'}`, marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #2a2a35', background: 'transparent',
              color: '#6b6b7a', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '32px', minHeight: '100vh' }}>
        
        {activeTab === 'documents' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: darkMode ? '#f1f1f3' : '#1f2937', margin: '0 0 6px' }}>Document library</h1>
              <p style={{ fontSize: '14px', color: darkMode ? '#6b6b7a' : '#6b7280', margin: 0 }}>Upload files to power your AI assistant with domain knowledge</p>
            </div>

            {error && (
              <div style={{ background: darkMode ? '#2a1515' : '#fff1f2', border: `1px solid ${darkMode ? '#5a2020' : '#fecdd3'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
              <DocumentUploader onUpload={handleUpload} error={error} loading={loading} darkMode={darkMode} />
              <DocumentLibrary documents={documents} onDelete={handleDelete} darkMode={darkMode} />
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: darkMode ? '#f1f1f3' : '#1f2937', margin: '0 0 6px' }}>Ask your documents</h1>
              <p style={{ fontSize: '14px', color: darkMode ? '#6b6b7a' : '#6b7280', margin: 0 }}>Powered by RAG — answers grounded in your uploaded files</p>
            </div>

            {!chatSessionId ? (
              <div style={{
                background: darkMode ? '#1a1a1f' : '#ffffff', border: `1px solid ${darkMode ? '#2a2a35' : '#e5e7eb'}`, borderRadius: '16px',
                padding: '60px 32px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: darkMode ? '#e1e1f0' : '#1f2937', margin: '0 0 8px' }}>Start a conversation</h2>
                <p style={{ fontSize: '14px', color: darkMode ? '#6b6b7a' : '#6b7280', margin: '0 0 24px' }}>
                  {documents.length === 0
                    ? 'Upload a document first, then start a chat'
                    : `${documents.length} document${documents.length > 1 ? 's' : ''} ready to query`}
                </p>
                <button
                  onClick={createChatSession}
                  disabled={chatLoading || documents.length === 0}
                  style={{
                    padding: '11px 28px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', fontSize: '14px',
                    fontWeight: '500', cursor: documents.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: documents.length === 0 ? 0.5 : 1,
                  }}
                >
                  {chatLoading ? 'Starting...' : 'New chat'}
                </button>
                {documents.length === 0 && (
                  <p style={{ fontSize: '12px', color: darkMode ? '#55556a' : '#9ca3af', marginTop: '12px' }}>
                    <button onClick={() => setActiveTab('documents')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' }}>
                      Upload a document
                    </button> to get started
                  </p>
                )}
              </div>
            ) : (
              <div style={{ background: darkMode ? '#1a1a1f' : '#ffffff', border: `1px solid ${darkMode ? '#2a2a35' : '#e5e7eb'}`, borderRadius: '16px', overflow: 'hidden' }}>
                <ChatInterface
                  onSend={handleSendMessage}
                  messages={chatMessages}
                  loading={chatLoading}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

