import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Send, 
  CheckCircle2, 
  Copy, 
  AlertCircle,
  FileText,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function EmailDetailModal({ 
  email, 
  onClose, 
  onSummarize, 
  onExtractActions, 
  onDraftReply, 
  onSaveDraft 
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, actions, reply
  const [summaryData, setSummaryData] = useState(email.summary || null);
  const [actionData, setActionData] = useState(email.actions || null);
  const [draftReplyData, setDraftReplyData] = useState(null);
  const [tone, setTone] = useState('professional');
  const [userGuidance, setUserGuidance] = useState('');
  const [draftText, setDraftText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const handleRunSummarize = async () => {
    setLoadingAction('summarize');
    try {
      const res = await onSummarize(email);
      setSummaryData(res);
    } finally {
      setLoadingAction('');
    }
  };

  const handleRunExtract = async () => {
    setLoadingAction('extract');
    try {
      const res = await onExtractActions(email);
      setActionData(res);
    } finally {
      setLoadingAction('');
    }
  };

  const handleGenerateDraft = async () => {
    setLoadingAction('draft');
    try {
      const res = await onDraftReply(email, tone, userGuidance);
      setDraftReplyData(res);
      setDraftText(res.body);
    } finally {
      setLoadingAction('');
    }
  };

  const handleCopyDraft = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCurrentDraft = () => {
    if (!draftText) return;
    onSaveDraft(email.id, draftText, tone);
    alert('Draft saved to email history!');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className={email.priority === 'high' ? 'badge-urgent' : 'badge-medium'} style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}>
                {email.priority} Priority
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {new Date(email.date).toLocaleString()}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
              {email.subject}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
              From: <strong style={{ color: '#f8fafc' }}>{email.sender}</strong> &lt;{email.senderEmail}&gt;
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0b0f19',
          padding: '0 1.75rem'
        }}>
          {[
            { id: 'overview', label: 'Email Content & Summary', icon: FileText },
            { id: 'actions', label: 'Extracted Tasks & Deadlines', icon: Clock, count: actionData?.tasks?.length },
            { id: 'reply', label: 'Smart Reply Generator', icon: Send, badge: 'Gemini AI' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  color: active ? '#818cf8' : '#94a3b8',
                  borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(245, 158, 11, 0.25)',
                    color: '#fbbf24',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px'
                  }}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#c7d2fe',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* AI Summary Banner */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="#818cf8" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      Executive Summary (Gemini AI)
                    </span>
                  </div>
                  <button
                    onClick={handleRunSummarize}
                    disabled={loadingAction === 'summarize'}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#4f46e5',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {loadingAction === 'summarize' ? 'Analyzing...' : summaryData ? 'Re-generate Summary' : 'Generate Summary'}
                  </button>
                </div>

                {summaryData ? (
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {summaryData.summary}
                    </p>
                    {summaryData.keyTakeaways && (
                      <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {summaryData.keyTakeaways.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Click "Generate Summary" to have Gemini create a 2-sentence executive summary with key takeaways.
                  </p>
                )}
              </div>

              {/* Raw Email Text */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Original Message Body
                </h4>
                <div style={{
                  background: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  fontSize: '0.9rem',
                  color: '#e2e8f0',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {email.body}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIONS & DEADLINES */}
          {activeSubTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Deadlines and deliverables extracted by Gemini AI via Model Context Protocol:
                </p>
                <button
                  onClick={handleRunExtract}
                  disabled={loadingAction === 'extract'}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: '#d97706',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {loadingAction === 'extract' ? 'Scanning...' : actionData ? 'Re-scan Actions' : 'Extract Deadlines'}
                </button>
              </div>

              {actionData && actionData.tasks && actionData.tasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {actionData.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#0b0f19',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px',
                        padding: '1.1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: task.urgency === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: task.urgency === 'high' ? '#fca5a5' : '#fde68a',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: task.urgency === 'high' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          {task.urgency ? task.urgency.toUpperCase() : 'ACTION'}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Calendar size={14} />
                          <span>{task.deadline}</span>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                        {task.task}
                      </h4>

                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                        Context: {task.context}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span>Assignee: <strong style={{ color: '#818cf8' }}>{task.assignee || 'You'}</strong></span>
                        <span>Suggested: <strong style={{ color: '#34d399' }}>{task.suggestedAction}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: '#0b0f19',
                  borderRadius: '10px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)'
                }}>
                  <Clock size={32} color="#6b7280" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>No action items extracted yet.</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Click "Extract Deadlines" to automatically discover milestones and deliverables.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SMART REPLY GENERATOR */}
          {activeSubTab === 'reply' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Controls */}
              <div style={{
                background: '#0b0f19',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                    Select Reply Tone:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['professional', 'concise', 'warm', 'urgent'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                          background: tone === t ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          color: tone === t ? '#a5b4fc' : '#94a3b8',
                          border: tone === t ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                    Custom User Guidance (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Confirm we are on track and attach the latest deck"
                    value={userGuidance}
                    onChange={(e) => setUserGuidance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleGenerateDraft}
                    disabled={loadingAction === 'draft'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '8px',
                      background: '#4f46e5',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{loadingAction === 'draft' ? 'Drafting...' : 'Generate AI Reply'}</span>
                  </button>
                </div>
              </div>

              {/* Draft Output Box */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                    Draft Response (Editable):
                  </label>
                  {draftText && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleCopyDraft}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: copied ? '#34d399' : '#cbd5e1',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                      </button>

                      <button
                        onClick={handleSaveCurrentDraft}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          color: '#34d399',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Save to Drafts
                      </button>
                    </div>
                  )}
                </div>

                <textarea
                  rows={8}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Click 'Generate AI Reply' above to draft a context-aware response..."
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Past Drafts History */}
              {email.drafts && email.drafts.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Saved Drafts History ({email.drafts.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {email.drafts.map((d, i) => (
                      <div
                        key={d.id || i}
                        style={{
                          background: '#0b0f19',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.82rem',
                          color: '#cbd5e1'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.72rem', color: '#6b7280' }}>
                          <span>Tone: {d.tone}</span>
                          <span>{new Date(d.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ whiteSpace: 'pre-line' }}>{d.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
