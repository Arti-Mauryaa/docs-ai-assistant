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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef();
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
      // Close sidebar on outside click (mobile)
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);

  const token = localStorage.getItem('token');
  const dm = darkMode;

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
    setSidebarOpen(false);
    setActiveTab('chat');
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
    setSidebarOpen(false);
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

  const navItems = [
    { key: 'documents', label: 'Documents', icon: '📄' },
    { key: 'chat', label: 'Chat', icon: '💬' },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: dm ? '#0f0f11' : '#f3f4f6',
      fontFamily: "'Inter', -apple-system, sans-serif",
      transition: 'background 0.3s',
      position: 'relative',
    }}>

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 19,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        style={{
          width: '260px',
          background: dm ? '#1a1a1f' : '#ffffff',
          borderRight: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'fixed',
          top: 0, bottom: 0,
          left: 0,
          zIndex: 20,
          /* slide in/out on mobile */
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
        /* on desktop always visible via media-query override below */
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
            }}>🧠</div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: dm ? '#f1f1f3' : '#1f2937' }}>DocsAI</span>
          </div>
          <p style={{ fontSize: '12px', color: dm ? '#6b6b7a' : '#9ca3af', margin: 0, paddingLeft: '42px' }}>RAG-powered assistant</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px' }} className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '14px', fontWeight: '500', marginBottom: '4px',
                background: activeTab === item.key ? (dm ? '#2a2a3a' : '#eef2ff') : 'transparent',
                color: activeTab === item.key ? '#6366f1' : dm ? '#8888a0' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.key === 'documents' && documents.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: '600',
                  background: dm ? '#2a2a3a' : '#eef2ff', color: '#6366f1',
                  padding: '2px 7px', borderRadius: '10px', border: '1px solid #c7d2fe'
                }}>{documents.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Chat sessions list */}

        <div style={{ padding: '0 10px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <button
            onClick={createChatSession}
            disabled={chatLoading}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #3a3a55', background: 'transparent',
              color: '#6366f1', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', justifyContent: 'center', marginBottom: '14px',
            }}
          >
            <span style={{ fontSize: '16px' }}>+</span> New chat
          </button>
          <p style={{ fontSize: '11px', fontWeight: '600', color: dm ? '#55556a' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 4px' }}>Recent</p>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chatSessions.length === 0 && (
              <p style={{ fontSize: '13px', color: dm ? '#55556a' : '#9ca3af', padding: '8px 4px' }}>No chats yet</p>
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
                      background: chatSessionId === session._id ? (dm ? '#2a2a3a' : '#eef2ff') : 'transparent',
                      color: chatSessionId === session._id ? '#6366f1' : (dm ? '#8888a0' : '#6b7280'),
                    }}
                  >{session.title}</button>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === session._id ? null : session._id)}
                    style={{ background: 'transparent', border: 'none', color: dm ? '#55556a' : '#9ca3af', cursor: 'pointer', padding: '4px 6px', fontSize: '16px', borderRadius: '4px' }}
                  >⋯</button>
                </div>
                {menuOpenId === session._id && (
                  <div ref={menuRef} style={{
                    position: 'absolute', right: 0, top: '36px', zIndex: 30,
                    background: dm ? '#1e1e28' : '#ffffff',
                    border: `1px solid ${dm ? '#2a2a3a' : '#e5e7eb'}`,
                    borderRadius: '10px', padding: '6px', minWidth: '150px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}>
                    <button onClick={() => { setMenuOpenId(null); handleEditSessionTitle(session._id, session.title); }}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'transparent', color: dm ? '#c0c0d0' : '#374151', fontSize: '13px', cursor: 'pointer' }}>
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

        {/* Sign out */}
        <div style={{ padding: '14px 10px', borderTop: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`, marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: '1px solid #2a2a35', background: 'transparent',
              color: '#6b6b7a', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >🚪 Sign out</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}
        className="dashboard-main">

        {/* ── Mobile top bar ── */}
        <header
          className="mobile-topbar"
          style={{
            display: 'none', /* shown via CSS class below */
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: dm ? '#1a1a1f' : '#ffffff',
            borderBottom: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
            position: 'sticky', top: 0, zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: dm ? '#d1d1e0' : '#374151', fontSize: '22px',
              padding: '4px', lineHeight: 1,
            }}
          >☰</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px'
            }}>🧠</div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: dm ? '#f1f1f3' : '#1f2937' }}>DocsAI</span>
          </div>

          {/* Tab pills */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  padding: '6px 12px', borderRadius: '20px', border: 'none',
                  fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                  background: activeTab === item.key ? '#6366f1' : (dm ? '#2a2a3a' : '#f3f4f6'),
                  color: activeTab === item.key ? '#fff' : (dm ? '#8888a0' : '#6b7280'),
                }}
              >{item.label}</button>
            ))}
          </div>

          <button
            onClick={() => setDarkMode(!dm)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '16px', padding: '4px',
            }}
          >{dm ? '☀️' : '🌙'}</button>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, padding: '24px 16px' }} className="page-content">

          {activeTab === 'documents' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: dm ? '#f1f1f3' : '#1f2937', margin: '0 0 4px' }}>Document library</h1>
                <p style={{ fontSize: '13px', color: dm ? '#6b6b7a' : '#6b7280', margin: 0 }}>Upload files to power your AI assistant with domain knowledge</p>
              </div>

              {error && (
                <div style={{ background: dm ? '#2a1515' : '#fff1f2', border: `1px solid ${dm ? '#5a2020' : '#fecdd3'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* Stack on mobile, side-by-side on desktop */}
              <div className="doc-grid">
                <DocumentUploader onUpload={handleUpload} error={error} loading={loading} darkMode={dm} />
                <DocumentLibrary documents={documents} onDelete={handleDelete} darkMode={dm} />
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: dm ? '#f1f1f3' : '#1f2937', margin: '0 0 4px' }}>Ask your documents</h1>
                <p style={{ fontSize: '13px', color: dm ? '#6b6b7a' : '#6b7280', margin: 0 }}>Powered by RAG — answers grounded in your uploaded files</p>
              </div>

              {!chatSessionId ? (
                <div style={{
                  background: dm ? '#1a1a1f' : '#ffffff',
                  border: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
                  borderRadius: '16px', padding: '48px 24px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '44px', marginBottom: '14px' }}>🧠</div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: dm ? '#e1e1f0' : '#1f2937', margin: '0 0 8px' }}>Start a conversation</h2>
                  <p style={{ fontSize: '13px', color: dm ? '#6b6b7a' : '#6b7280', margin: '0 0 24px' }}>
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
                  >{chatLoading ? 'Starting...' : 'New chat'}</button>

                  {documents.length === 0 && (
                    <p style={{ fontSize: '12px', color: dm ? '#55556a' : '#9ca3af', marginTop: '12px' }}>
                      <button onClick={() => setActiveTab('documents')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px' }}>
                        Upload a document
                      </button>{' '}to get started
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  background: dm ? '#1a1a1f' : '#ffffff',
                  border: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
                  borderRadius: '16px', overflow: 'hidden'
                }}>
                  <ChatInterface
                    onSend={handleSendMessage}
                    messages={chatMessages}
                    loading={chatLoading}
                    darkMode={dm}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Responsive CSS ── */}
      <style>{`
        /* Desktop: sidebar always visible, main shifted */
        @media (min-width: 768px) {
          aside {
            transform: translateX(0) !important;
          }
          .dashboard-main {
            margin-left: 260px;
          }
          .mobile-topbar {
            display: none !important;
          }
          .page-content {
            padding: 32px 32px !important;
          }
          .doc-grid {
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 24px;
            align-items: start;
          }
        }

        /* Mobile: sidebar hidden behind hamburger */
        @media (max-width: 767px) {
          .dashboard-main {
            margin-left: 0 !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
          .doc-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .sidebar-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
