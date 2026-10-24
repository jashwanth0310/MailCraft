import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/sampleEmails.json');

class EmailService {
  constructor() {
    this.emails = [];
    this.actionItems = [];
    this.loadEmails();
  }

  loadEmails() {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      this.emails = JSON.parse(data);
    } catch (err) {
      console.error('Error loading emails from JSON:', err.message);
      this.emails = [];
    }
  }

  saveEmails() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.emails, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving emails to JSON:', err.message);
    }
  }

  getAllEmails(filter = {}) {
    let result = [...this.emails];
    if (filter.unread !== undefined) {
      const isUnread = filter.unread === 'true' || filter.unread === true;
      result = result.filter(e => e.unread === isUnread);
    }
    if (filter.priority) {
      result = result.filter(e => e.priority.toLowerCase() === filter.priority.toLowerCase());
    }
    if (filter.search) {
      const query = filter.search.toLowerCase();
      result = result.filter(e => 
        e.subject.toLowerCase().includes(query) ||
        e.sender.toLowerCase().includes(query) ||
        e.body.toLowerCase().includes(query)
      );
    }
    return result;
  }

  getEmailById(id) {
    return this.emails.find(e => e.id === id);
  }

  markAsRead(id, unread = false) {
    const email = this.getEmailById(id);
    if (email) {
      email.unread = unread;
      this.saveEmails();
      return email;
    }
    return null;
  }

  saveDraft(id, draftText, tone = 'professional') {
    const email = this.getEmailById(id);
    if (email) {
      if (!email.drafts) email.drafts = [];
      const newDraft = {
        id: 'draft-' + Date.now(),
        text: draftText,
        tone,
        createdAt: new Date().toISOString()
      };
      email.drafts.unshift(newDraft);
      this.saveEmails();
      return newDraft;
    }
    return null;
  }

  updateActionExtraction(id, actionData) {
    const email = this.getEmailById(id);
    if (email) {
      email.actionExtracted = true;
      email.actions = actionData;
      this.saveEmails();
      return email;
    }
    return null;
  }

  getAllActions() {
    const items = [];
    for (const email of this.emails) {
      if (email.actions && Array.isArray(email.actions.tasks)) {
        for (const task of email.actions.tasks) {
          items.push({
            ...task,
            emailId: email.id,
            emailSubject: email.subject,
            sender: email.sender,
            senderEmail: email.senderEmail
          });
        }
      }
    }
    return items;
  }

  addEmail(newEmail) {
    const email = {
      id: 'email-' + Date.now(),
      sender: newEmail.sender || 'Unknown Sender',
      senderEmail: newEmail.senderEmail || 'unknown@example.com',
      recipient: 'you@company.com',
      subject: newEmail.subject || 'No Subject',
      date: new Date().toISOString(),
      snippet: (newEmail.body || '').substring(0, 100) + '...',
      body: newEmail.body || '',
      unread: true,
      priority: newEmail.priority || 'medium',
      tags: newEmail.tags || ['Custom'],
      actionExtracted: false,
      drafts: []
    };
    this.emails.unshift(email);
    this.saveEmails();
    return email;
  }

  resetToDefault() {
    this.loadEmails();
    return this.emails;
  }
}

export const emailService = new EmailService();
export default emailService;
