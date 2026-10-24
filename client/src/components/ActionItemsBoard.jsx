import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Mail, 
  User, 
  Sparkles 
} from 'lucide-react';

export default function ActionItemsBoard({ emails, onSelectEmail, onExtractAll }) {
  // Aggregate all tasks across emails
  const allTasks = [];
  emails.forEach(email => {
    if (email.actions && Array.isArray(email.actions.tasks)) {
      email.actions.tasks.forEach((t, idx) => {
        allTasks.push({
          ...t,
          id: `${email.id}-task-${idx}`,
          emailId: email.id,
          emailSubject: email.subject,
          sender: email.sender
        });
      });
    }
  });

  const highPriority = allTasks.filter(t => t.urgency === 'high');
  const mediumPriority = allTasks.filter(t => t.urgency === 'medium');
  const lowPriority = allTasks.filter(t => t.urgency !== 'high' && t.urgency !== 'medium');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
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
            Action Items & Deadlines Matrix
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
            Intelligently parsed deliverables, due dates, and assignments across all emails.
          </p>
        </div>

        <button
          onClick={onExtractAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Sparkles size={16} />
          <span>Batch Extract All Inbox Deadlines</span>
        </button>
      </div>

      {allTasks.length === 0 ? (
        <div style={{
          background: '#111827',
          borderRadius: '12px',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#f59e0b' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            No Deadlines Extracted Yet
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            Click "Batch Extract All Inbox Deadlines" above or click "Extract Deadlines" on any individual email in your inbox to populate this dashboard.
          </p>
          <button
            onClick={onExtractAll}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              background: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Extract Deadlines Now
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Urgent / High Priority Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fca5a5' }}>
                  Urgent & High Priority
                </span>
              </div>
              <span style={{
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: '999px'
              }}>
                {highPriority.length}
              </span>
            </div>

            {highPriority.map(task => (
              <TaskCard key={task.id} task={task} emails={emails} onSelectEmail={onSelectEmail} border="#ef4444" />
            ))}
          </div>

          {/* Medium Priority Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fde68a' }}>
                  Medium Priority
                </span>
              </div>
              <span style={{
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#fde68a',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: '999px'
              }}>
                {mediumPriority.length}
              </span>
            </div>

            {mediumPriority.map(task => (
              <TaskCard key={task.id} task={task} emails={emails} onSelectEmail={onSelectEmail} border="#f59e0b" />
            ))}
          </div>

          {/* Low / Follow-up Priority Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a7f3d0' }}>
                  Standard & Follow-ups
                </span>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#a7f3d0',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: '999px'
              }}>
                {lowPriority.length}
              </span>
            </div>

            {lowPriority.map(task => (
              <TaskCard key={task.id} task={task} emails={emails} onSelectEmail={onSelectEmail} border="#10b981" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, emails, onSelectEmail, border }) {
  const parentEmail = emails.find(e => e.id === task.emailId);

  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderLeft: `4px solid ${border}`,
      borderRadius: '10px',
      padding: '1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    }} className="glow-hover">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
          <Calendar size={13} />
          <span>{task.deadline}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
          {task.assignee || 'You'}
        </span>
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>
        {task.task}
      </h4>

      {task.context && (
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
          {task.context}
        </p>
      )}

      {task.suggestedAction && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.45rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.78rem',
          color: '#cbd5e1'
        }}>
          💡 Action: <strong style={{ color: '#34d399' }}>{task.suggestedAction}</strong>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '0.75rem'
      }}>
        <span style={{ color: '#6b7280' }}>
          From: <strong style={{ color: '#94a3b8' }}>{task.sender}</strong>
        </span>

        {parentEmail && (
          <button
            onClick={() => onSelectEmail(parentEmail)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'none',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <span>View Email</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
