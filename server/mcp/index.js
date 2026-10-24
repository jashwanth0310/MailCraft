/**
 * Model Context Protocol (MCP) Server for MailCraft
 * Standard JSON-RPC 2.0 / MCP Tools Implementation
 *
 * Exposes:
 * - list_emails: Query emails with status/search filter
 * - get_email: Fetch email by ID
 * - summarize_email: Generate executive summary using Gemini AI
 * - extract_deadlines: Extract key tasks and deadlines using Gemini AI
 * - draft_reply: Create smart context-aware drafts
 * - mark_as_read: Mark emails as read/unread
 * - get_voice_briefing: Generate spoken briefing for Alexa
 */

import emailService from '../services/emailService.js';
import geminiAgent from '../services/gemini.js';

export const MCP_TOOLS_DEFINITIONS = [
  {
    name: 'list_emails',
    description: 'Retrieve emails from the inbox with optional filtering by read status or priority.',
    inputSchema: {
      type: 'object',
      properties: {
        unread: {
          type: 'boolean',
          description: 'Filter for unread emails (true) or read emails (false).'
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Filter emails by priority level.'
        },
        search: {
          type: 'string',
          description: 'Keyword search across subject, sender, and email body.'
        }
      }
    }
  },
  {
    name: 'get_email',
    description: 'Fetch the full details, body, and metadata of a specific email by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'The unique ID of the email (e.g. "email-101").'
        }
      },
      required: ['emailId']
    }
  },
  {
    name: 'summarize_email',
    description: 'Use Gemini AI to generate an executive summary, key takeaways, and urgency rating for an email.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'The ID of the email to summarize.'
        }
      },
      required: ['emailId']
    }
  },
  {
    name: 'extract_deadlines',
    description: 'Extract action items, due dates, assignees, and urgent deliverables from an email using Gemini AI.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'The ID of the email to extract action items from.'
        }
      },
      required: ['emailId']
    }
  },
  {
    name: 'draft_reply',
    description: 'Draft a contextual, professional reply to an email with customizable tone and guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: {
          type: 'string',
          description: 'The ID of the email being replied to.'
        },
        tone: {
          type: 'string',
          enum: ['professional', 'concise', 'warm', 'urgent'],
          description: 'The desired tone of the drafted response.'
        },
        userGuidance: {
          type: 'string',
          description: 'Specific points or instructions to include in the reply.'
        }
      },
      required: ['emailId']
    }
  },
  {
    name: 'get_voice_briefing',
    description: 'Generates a concise audio-ready briefing optimized for Alexa speech output.',
    inputSchema: {
      type: 'object',
      properties: {
        maxWords: {
          type: 'number',
          description: 'Target maximum word count for the audio speech.'
        }
      }
    }
  }
];

export async function handleMcpToolCall(name, args = {}) {
  switch (name) {
    case 'list_emails': {
      const emails = emailService.getAllEmails(args);
      return {
        count: emails.length,
        emails: emails.map(e => ({
          id: e.id,
          sender: e.sender,
          subject: e.subject,
          priority: e.priority,
          unread: e.unread,
          date: e.date,
          snippet: e.snippet
        }))
      };
    }

    case 'get_email': {
      const email = emailService.getEmailById(args.emailId);
      if (!email) {
        throw new Error(`Email with ID "${args.emailId}" not found.`);
      }
      return email;
    }

    case 'summarize_email': {
      const email = emailService.getEmailById(args.emailId);
      if (!email) throw new Error(`Email with ID "${args.emailId}" not found.`);
      const summary = await geminiAgent.summarizeEmail(email);
      return { emailId: email.id, subject: email.subject, sender: email.sender, ...summary };
    }

    case 'extract_deadlines': {
      const email = emailService.getEmailById(args.emailId);
      if (!email) throw new Error(`Email with ID "${args.emailId}" not found.`);
      const actions = await geminiAgent.extractDeadlinesAndTasks(email);
      emailService.updateActionExtraction(email.id, actions);
      return actions;
    }

    case 'draft_reply': {
      const email = emailService.getEmailById(args.emailId);
      if (!email) throw new Error(`Email with ID "${args.emailId}" not found.`);
      const draft = await geminiAgent.draftReply(email, {
        tone: args.tone || 'professional',
        userGuidance: args.userGuidance || ''
      });
      emailService.saveDraft(email.id, draft.body, args.tone);
      return draft;
    }

    case 'get_voice_briefing': {
      const emails = emailService.getAllEmails({ unread: true });
      const speech = await geminiAgent.generateVoiceBriefing(emails);
      return { speech, unreadCount: emails.length };
    }

    default:
      throw new Error(`Unknown MCP Tool: ${name}`);
  }
}

// Stdio JSON-RPC runner if run directly via command line: `node server/mcp/index.js`
if (process.argv[1] && process.argv[1].endsWith('mcp/index.js')) {
  import('readline').then(({ createInterface }) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', async (line) => {
      try {
        if (!line.trim()) return;
        const req = JSON.parse(line);
        if (req.method === 'tools/list') {
          const res = {
            jsonrpc: '2.0',
            id: req.id,
            result: { tools: MCP_TOOLS_DEFINITIONS }
          };
          console.log(JSON.stringify(res));
        } else if (req.method === 'tools/call') {
          const { name, arguments: args } = req.params;
          const result = await handleMcpToolCall(name, args);
          const res = {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
            }
          };
          console.log(JSON.stringify(res));
        }
      } catch (err) {
        console.error(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: err.message } }));
      }
    });
  });
}
