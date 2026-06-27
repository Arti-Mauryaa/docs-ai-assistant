import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = ({ onSend, messages, loading, darkMode }) => {
  const dm = darkMode;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && onSend) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      /* Fill available viewport height minus the sticky top bar (48px on mobile) */
      height: 'calc(100dvh - 56px)',
      maxHeight: '680px',
      fontFamily: "'Inter', sans-serif",
      background: dm ? '#1a1a1f' : '#ffffff',
    }}>

      {/* ── Messages area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        /* Prevent content hiding behind iOS keyboard */
        WebkitOverflowScrolling: 'touch',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px', color: dm ? '#55556a' : '#9ca3af' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
            <p style={{ fontSize: '13px', margin: 0 }}>Ask anything about your documents</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            {/* Avatar */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '600',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : '#2a2a3a',
              color: msg.role === 'user' ? '#fff' : '#a78bfa',
              border: msg.role === 'assistant' ? '1px solid #3a3a55' : 'none',
            }}>
              {msg.role === 'user' ? 'U' : '🧠'}
            </div>

            {/* Bubble — max 85% on mobile so it doesn't bleed edge */}
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                : dm ? '#222230' : '#f3f4f6',
              border: msg.role === 'assistant' ? `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}` : 'none',
              color: msg.role === 'user' ? '#fff' : dm ? '#d1d1e0' : '#1f2937',
              fontSize: '14px',
              lineHeight: '1.6',
              wordBreak: 'break-word',
            }}>
              {msg.role === 'assistant' ? (
                <div style={{ color: dm ? '#d1d1e0' : '#1f2937' }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: '0 0 8px', color: dm ? '#d1d1e0' : '#1f2937' }}>{children}</p>,
                      strong: ({ children }) => <strong style={{ color: dm ? '#e1e1f0' : '#111827', fontWeight: '600' }}>{children}</strong>,
                      ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '18px', color: dm ? '#d1d1e0' : '#1f2937' }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: '18px', color: dm ? '#d1d1e0' : '#1f2937' }}>{children}</ol>,
                      li: ({ children }) => <li style={{ marginBottom: '4px', color: dm ? '#d1d1e0' : '#1f2937' }}>{children}</li>,
                      code: ({ children }) => (
                        <code style={{ background: '#1a1a2e', padding: '2px 5px', borderRadius: '4px', fontSize: '12px', color: '#a78bfa' }}>
                          {children}
                        </code>
                      ),
                    }}
                  >{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#2a2a3a', border: '1px solid #3a3a55',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
            }}>🧠</div>
            <div style={{
              padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
              background: '#222230', border: '1px solid #2a2a3a',
              display: 'flex', gap: '4px', alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#6366f1',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
        /* Stay above iOS home indicator */
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <form
          onSubmit={handleSend}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about your documents…"
            style={{
              flex: 1,
              padding: '11px 14px',
              borderRadius: '10px',
              border: `1px solid ${dm ? '#2a2a35' : '#e5e7eb'}`,
              background: dm ? '#12121a' : '#f9fafb',
              color: dm ? '#e1e1f0' : '#1f2937',
              fontSize: '14px',
              outline: 'none',
              minWidth: 0, /* prevent overflow */
            }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = dm ? '#2a2a35' : '#e5e7eb')}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '11px 16px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                : dm ? '#2a2a35' : '#e5e7eb',
              color: input.trim() && !loading ? '#fff' : '#55556a',
              fontSize: '14px',
              fontWeight: '500',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {loading ? '…' : '↑'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30%            { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
