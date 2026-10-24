import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  Send, 
  Mail, 
  MailOpen, 
  Plus, 
  Volume2, 
  Clock, 
  Tag, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function InboxView({ 
  emails, 
  onSelectEmail, 
  onSummarize, 
  onExtractActions, 
  onDraftReply, 
  onToggleRead,
  onAddEmail,
  onRefresh,
  loading 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmailData, setNewEmailData] = useState({
    sender: '',
    senderEmail: '',
    subject: '',
    body: '',
    priority: 'high'
  });

  const filteredEmails = emails.filter(e => {
    if (filterUnreadOnly && !e.unread) return false;
    if (filterPriority !== 'all' && e.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inSub = e.subject.toLowerCase().includes(q);
      const inSender = e.sender.toLowerCase().includes(q);
      const inBody = e.body.toLowerCase().includes(q);
      if (!inSub && !inSender && !inBody) return false;
    }
    return true;
  });

  const handleCreateEmail = (e) => {
    e.preventDefault();
    if (!newEmailData.subject || !newEmailData.body) return;
    onAddEmail(newEmailData);
    setShowAddModal(false);
    setNewEmailData({
      sender: '',
      senderEmail: '',
      subject: '',
      body: '',
      priority: 'high'
    });
  };

  const playVoiceBriefing = () => {
    const unread = emails.filter(e => e.unread);
    const count = unread.length;
    let text = `You have ${count} unread emails. `;
    if (count > 0) {
      text += `Your highest priority email is from ${unread[0].sender} regarding ${unread[0].subject}. Final slides are due this Friday.`;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Banner / Actions Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Workplace Action Inbox
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
            Select an email to extract deadlines, run executive summaries, or generate tone-tailored replies.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={playVoiceBriefing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(0, 202, 238, 0.12)',
              border: '1px solid rgba(0, 202, 238, 0.3)',
              color: '#00caee',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            title="Read out audio briefing via Text-to-Speech"
          >
            <Volume2 size={16} />
            <span>Hear Alexa Briefing</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>Simulate Incoming Email</span>
          </button>

          <button
            onClick={onRefresh}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Refresh inbox"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: '#0b0f19',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          minWidth: '280px'
        }}>
          <Search size={16} color="#6b7280" />
          <input
            type="text"
            placeholder="Search sender, subject, or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>

        {/* Priority Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginRight: '0.25rem' }}>
            Priority:
          </span>
          {['all', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                background: filterPriority === p ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                color: filterPriority === p ? '#a5b4fc' : '#94a3b8',
                border: filterPriority === p ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '0.5rem',
              background: filterUnreadOnly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: filterUnreadOnly ? '#fca5a5' : '#94a3b8',
              border: filterUnreadOnly ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {filterUnreadOnly ? '● Unread Only' : 'Show All Read/Unread'}
          </button>
        </div>
      </div>

      {/* Email List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredEmails.length === 0 ? (
          <div style={{
            background: '#111827',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            padding: '3rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <Mail size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>No matching emails found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try clearing filters or search query.</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isUrgent = email.priority === 'high';
            const isMedium = email.priority === 'medium';
            const priorityClass = isUrgent ? 'badge-urgent' : isMedium ? 'badge-medium' : 'badge-low';

            return (
              <div
                key={email.id}
                style={{
                  background: '#111827',
                  border: email.unread ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                className="glow-hover"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  {/* Left Column: Avatar & Meta */}
                  <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: email.unread 
                        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
                        : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      flexShrink: 0
                    }}>
                      {email.sender.slice(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                          {email.sender}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          &lt;{email.senderEmail}&gt;
                        </span>
                        {email.unread && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.4)'
                          }}>
                            ● UNREAD
                          </span>
                        )}
                        <span className={priorityClass} style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {email.priority}
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectEmail(email)}
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#f1f5f9',
                          cursor: 'pointer',
                          marginBottom: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        {email.subject}
                      </h3>

                      <p style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '0.75rem'
                      }}>
                        {email.body}
                      </p>

                      {/* Tags & Action Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {email.tags && email.tags.map((t, idx) => (
                          <span key={idx} style={{
                            fontSize: '0.7rem',
                            color: '#94a3b8',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.07)'
                          }}>
                            #{t}
                          </span>
                        ))}

                        {email.actionExtracted && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#34d399',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✓ Action Items Extracted
                          </span>
                        )}

                        {email.drafts && email.drafts.length > 0 && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#a5b4fc',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            📝 Draft Ready ({email.drafts.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => onExtractActions(email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        cursor: 'pointer'
                      }}
                      title="Extract tasks, assignees, and deadlines"
                    >
                      <Clock size={13} />
                      <span>Extract Deadlines</span>
                    </button>

                    <button
                      onClick={() => onSummarize(email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: '#818cf8',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Summarize</span>
                    </button>

                    <button
                      onClick={() => onDraftReply(email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={13} />
                      <span>Draft Reply</span>
                    </button>

                    <button
                      onClick={() => onToggleRead(email.id, !email.unread)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        background: 'transparent',
                        color: '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      {email.unread ? <MailOpen size={12} /> : <Mail size={12} />}
                      <span>{email.unread ? 'Mark as Read' : 'Mark as Unread'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Simulate Email Modal */}
      {showAddModal && (
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
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Simulate New Incoming Email
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmail}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Sender Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={newEmailData.sender}
                    onChange={(e) => setNewEmailData({ ...newEmailData, sender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: '#0b0f19',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Sender Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@fintech.co"
                    value={newEmailData.senderEmail}
                    onChange={(e) => setNewEmailData({ ...newEmailData, senderEmail: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: '#0b0f19',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Audit Sign-off Needed by Thursday 3 PM"
                  value={newEmailData.subject}
                  onChange={(e) => setNewEmailData({ ...newEmailData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Email Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste or write email text with deliverables and deadlines..."
                  value={newEmailData.body}
                  onChange={(e) => setNewEmailData({ ...newEmailData, body: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Priority</label>
                <select
                  value={newEmailData.priority}
                  onChange={(e) => setNewEmailData({ ...newEmailData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="high">High (Urgent)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Inject Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
