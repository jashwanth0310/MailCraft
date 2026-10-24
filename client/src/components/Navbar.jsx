import React, { useState } from 'react';
import { 
  Inbox, 
  Clock, 
  Mic, 
  Terminal, 
  Key, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, geminiConfigured, onUpdateGeminiKey }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setIsSaving(true);
    setStatusMsg('');
    try {
      await onUpdateGeminiKey(keyInput.trim());
      setStatusMsg('Key updated successfully!');
      setTimeout(() => {
        setShowKeyModal(false);
        setStatusMsg('');
        setKeyInput('');
      }, 1200);
    } catch (err) {
      setStatusMsg('Failed to update key: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'inbox', label: 'Inbox & Emails', icon: Inbox, count: stats?.unreadEmails },
    { id: 'actions', label: 'Action Items & Deadlines', icon: Clock, count: stats?.totalActionItems },
    { id: 'alexa', label: 'Alexa Voice Console', icon: Mic, badge: 'Voice AI' },
    { id: 'mcp', label: 'MCP Explorer', icon: Terminal, badge: 'JSON-RPC' },
    { id: 'setup', label: 'Alexa & API Setup Guide', icon: Key }
  ];

  return (
    <>
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}>
              <Bot size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                  Mail<span style={{ color: '#818cf8' }}>Craft</span>
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.18)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  MCP + Alexa
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Email Action Agent • Deadline Extraction • Smart Replies
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive 
                      ? '1px solid rgba(99, 102, 241, 0.4)' 
                      : '1px solid transparent',
                    background: isActive 
                      ? 'rgba(99, 102, 241, 0.18)' 
                      : 'transparent',
                    color: isActive ? '#f8fafc' : '#94a3b8'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={16} color={isActive ? '#818cf8' : '#94a3b8'} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                      background: item.id === 'inbox' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(99, 102, 241, 0.3)',
                      color: item.id === 'inbox' ? '#fca5a5' : '#c7d2fe',
                      border: item.id === 'inbox' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)'
                    }}>
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: 'rgba(0, 202, 238, 0.15)',
                      color: '#67e8f9',
                      border: '1px solid rgba(0, 202, 238, 0.3)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Gemini Status & Key Modal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: geminiConfigured 
                  ? 'rgba(16, 185, 129, 0.12)' 
                  : 'rgba(245, 158, 11, 0.12)',
                color: geminiConfigured ? '#34d399' : '#fbbf24',
                border: geminiConfigured 
                  ? '1px solid rgba(16, 185, 129, 0.3)' 
                  : '1px solid rgba(245, 158, 11, 0.3)'
              }}
              title="Click to configure Google Gemini API key"
            >
              {geminiConfigured ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{geminiConfigured ? 'Gemini 1.5 Active' : 'Gemini: Demo Mode'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  Google Gemini API Key
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              MailCraft features intelligent fallback processing so you can explore all features right away. To enable live multimodal reasoning with Gemini 1.5 Flash, enter your free API key:
            </p>

            <form onSubmit={handleSaveKey}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                  autoFocus
                />
              </div>

              {statusMsg && (
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  background: statusMsg.includes('Failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: statusMsg.includes('Failed') ? '#fca5a5' : '#34d399',
                  border: statusMsg.includes('Failed') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {statusMsg}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: '#818cf8',
                    textDecoration: 'none'
                  }}
                >
                  Get free API key <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    style={{
                      padding: '0.55rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !keyInput.trim()}
                    style={{
                      padding: '0.55rem 1.25rem',
                      background: '#4f46e5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isSaving || !keyInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: isSaving || !keyInput.trim() ? 0.6 : 1
                    }}
                  >
                    {isSaving ? 'Connecting...' : 'Activate Gemini'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
