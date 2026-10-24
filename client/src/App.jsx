import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import InboxView from './components/InboxView';
import EmailDetailModal from './components/EmailDetailModal';
import ActionItemsBoard from './components/ActionItemsBoard';
import AlexaSimulator from './components/AlexaSimulator';
import McpInspector from './components/McpInspector';
import SetupGuide from './components/SetupGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [stats, setStats] = useState({ totalEmails: 0, unreadEmails: 0, totalActionItems: 0 });
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchEmails();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/config');
      setGeminiConfigured(res.data?.geminiConfigured || false);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/emails');
      setEmails(res.data || []);
      // Count unread
      const unreadCount = (res.data || []).filter(e => e.unread).length;
      setStats(prev => ({ ...prev, unreadEmails: unreadCount, totalEmails: (res.data || []).length }));
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGeminiKey = async (apiKey) => {
    const res = await axios.post('/api/config/gemini-key', { apiKey });
    setGeminiConfigured(res.data?.geminiConfigured || false);
    return res.data;
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleToggleRead = async (emailId, unread) => {
    try {
      const res = await axios.patch(`/api/emails/${emailId}/read`, { unread });
      setEmails(prev => prev.map(e => e.id === emailId ? res.data : e));
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail(res.data);
      }
      fetchConfig();
    } catch (err) {
      console.error('Failed to toggle read state:', err);
    }
  };

  const handleSummarize = async (email) => {
    try {
      const res = await axios.post(`/api/emails/${email.id}/summarize`);
      setEmails(prev => prev.map(e => {
        if (e.id === email.id) {
          return { ...e, summary: res.data };
        }
        return e;
      }));
      if (selectedEmail && selectedEmail.id === email.id) {
        setSelectedEmail(prev => ({ ...prev, summary: res.data }));
      }
      return res.data;
    } catch (err) {
      console.error('Summarize error:', err);
      throw err;
    }
  };

  const handleExtractActions = async (email) => {
    try {
      const res = await axios.post(`/api/emails/${email.id}/extract-actions`);
      setEmails(prev => prev.map(e => {
        if (e.id === email.id) {
          return { ...e, actionExtracted: true, actions: res.data };
        }
        return e;
      }));
      if (selectedEmail && selectedEmail.id === email.id) {
        setSelectedEmail(prev => ({ ...prev, actionExtracted: true, actions: res.data }));
      }
      fetchConfig();
      return res.data;
    } catch (err) {
      console.error('Action extraction error:', err);
      throw err;
    }
  };

  const handleBatchExtractAll = async () => {
    setLoading(true);
    try {
      for (const email of emails) {
        await axios.post(`/api/emails/${email.id}/extract-actions`);
      }
      await fetchEmails();
      await fetchConfig();
    } catch (err) {
      console.error('Batch extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftReply = async (email, tone = 'professional', userGuidance = '') => {
    try {
      const res = await axios.post(`/api/emails/${email.id}/draft`, {
        tone,
        userGuidance
      });
      fetchEmails();
      return res.data;
    } catch (err) {
      console.error('Draft error:', err);
      throw err;
    }
  };

  const handleSaveDraft = async (emailId, draftText, tone) => {
    try {
      await axios.post(`/api/emails/${emailId}/draft`, {
        tone,
        userGuidance: draftText
      });
      fetchEmails();
    } catch (err) {
      console.error('Save draft error:', err);
    }
  };

  const handleAddEmail = async (newEmail) => {
    try {
      const res = await axios.post('/api/emails', newEmail);
      setEmails(prev => [res.data, ...prev]);
      fetchConfig();
    } catch (err) {
      console.error('Add email error:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        geminiConfigured={geminiConfigured}
        onUpdateGeminiKey={handleUpdateGeminiKey}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'inbox' && (
          <InboxView
            emails={emails}
            onSelectEmail={handleSelectEmail}
            onSummarize={handleSummarize}
            onExtractActions={handleExtractActions}
            onDraftReply={(email) => {
              setSelectedEmail(email);
            }}
            onToggleRead={handleToggleRead}
            onAddEmail={handleAddEmail}
            onRefresh={fetchEmails}
            loading={loading}
          />
        )}

        {activeTab === 'actions' && (
          <ActionItemsBoard
            emails={emails}
            onSelectEmail={handleSelectEmail}
            onExtractAll={handleBatchExtractAll}
          />
        )}

        {activeTab === 'alexa' && (
          <AlexaSimulator />
        )}

        {activeTab === 'mcp' && (
          <McpInspector />
        )}

        {activeTab === 'setup' && (
          <SetupGuide />
        )}
      </main>

      {/* Email Detail / Action Drawer Modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onSummarize={handleSummarize}
          onExtractActions={handleExtractActions}
          onDraftReply={handleDraftReply}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
}
