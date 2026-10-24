import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailService from './services/emailService.js';
import geminiAgent from './services/gemini.js';
import AlexaSkillHandler from './services/alexaSkillHandler.js';
import { MCP_TOOLS_DEFINITIONS, handleMcpToolCall } from './mcp/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- System & Config Routes ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MailCraft Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  const emails = emailService.getAllEmails();
  const unread = emails.filter(e => e.unread);
  const actions = emailService.getAllActions();

  res.json({
    geminiConfigured: geminiAgent.isConfigured(),
    alexaSkillEnabled: true,
    mcpToolsCount: MCP_TOOLS_DEFINITIONS.length,
    stats: {
      totalEmails: emails.length,
      unreadEmails: unread.length,
      totalActionItems: actions.length
    }
  });
});

app.post('/api/config/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }
  geminiAgent.setApiKey(apiKey.trim());
  res.json({
    success: true,
    geminiConfigured: geminiAgent.isConfigured(),
    message: 'Gemini API key updated successfully!'
  });
});

// --- Email REST Endpoints ---
app.get('/api/emails', (req, res) => {
  const { unread, priority, search } = req.query;
  const emails = emailService.getAllEmails({ unread, priority, search });
  res.json(emails);
});

app.get('/api/emails/:id', (req, res) => {
  const email = emailService.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  res.json(email);
});

app.post('/api/emails', (req, res) => {
  const { sender, senderEmail, subject, body, priority, tags } = req.body;
  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }
  const email = emailService.addEmail({ sender, senderEmail, subject, body, priority, tags });
  res.status(201).json(email);
});

app.patch('/api/emails/:id/read', (req, res) => {
  const { unread } = req.body;
  const updated = emailService.markAsRead(req.params.id, unread);
  if (!updated) {
    return res.status(404).json({ error: 'Email not found' });
  }
  res.json(updated);
});

// --- AI Action Endpoints (Gemini) ---
app.post('/api/emails/:id/summarize', async (req, res) => {
  const email = emailService.getEmailById(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  try {
    const summary = await geminiAgent.summarizeEmail(email);
    res.json({ emailId: email.id, ...summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/emails/:id/extract-actions', async (req, res) => {
  const email = emailService.getEmailById(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  try {
    const actions = await geminiAgent.extractDeadlinesAndTasks(email);
    emailService.updateActionExtraction(email.id, actions);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/emails/:id/draft', async (req, res) => {
  const email = emailService.getEmailById(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  const { tone = 'professional', userGuidance = '' } = req.body;

  try {
    const draft = await geminiAgent.draftReply(email, { tone, userGuidance });
    emailService.saveDraft(email.id, draft.body, tone);
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/actions', (req, res) => {
  const actions = emailService.getAllActions();
  res.json(actions);
});

app.get('/api/briefing', async (req, res) => {
  const unread = emailService.getAllEmails({ unread: true });
  const speech = await geminiAgent.generateVoiceBriefing(unread);
  res.json({ briefing: speech, unreadCount: unread.length });
});

// --- Model Context Protocol (MCP) Endpoints ---
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    tools: MCP_TOOLS_DEFINITIONS
  });
});

app.post('/api/mcp/call', async (req, res) => {
  const { name, arguments: args } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tool "name" is required.' });
  }

  try {
    const result = await handleMcpToolCall(name, args || {});
    res.json({
      success: true,
      tool: name,
      result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      tool: name,
      error: err.message
    });
  }
});

// --- Amazon Alexa Skills Kit Endpoints ---
app.post('/api/alexa', async (req, res) => {
  try {
    const alexaEnvelope = req.body;
    const response = await AlexaSkillHandler.handleRequest(alexaEnvelope);
    res.json(response);
  } catch (err) {
    console.error('Alexa webhook error:', err);
    res.status(500).json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'MailCraft encountered a processing error. Please try again.'
        },
        shouldEndSession: true
      }
    });
  }
});

app.post('/api/alexa/simulate', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const clean = command.toLowerCase().trim();
  let intentName = 'SummarizeInboxIntent';
  let slots = {};

  if (clean.includes('deadline') || clean.includes('action') || clean.includes('task') || clean.includes('due')) {
    intentName = 'ExtractDeadlinesIntent';
  } else if (clean.includes('latest') || clean.includes('recent') || clean.includes('last email')) {
    intentName = 'LatestEmailIntent';
  } else if (clean.includes('draft') || clean.includes('reply') || clean.includes('respond')) {
    intentName = 'DraftReplyIntent';
    const names = ['sarah', 'marcus', 'elena', 'david', 'devops'];
    for (const name of names) {
      if (clean.includes(name)) {
        slots.SenderName = { name: 'SenderName', value: name };
        break;
      }
    }
  } else if (clean.includes('help')) {
    intentName = 'AMAZON.HelpIntent';
  } else if (clean.includes('stop') || clean.includes('cancel') || clean.includes('bye')) {
    intentName = 'AMAZON.StopIntent';
  } else if (clean === 'open mail craft' || clean === 'open mailcraft' || clean === 'launch mailcraft' || clean === 'open inbox pilot' || clean === 'open') {
    const mockLaunchReq = {
      version: '1.0',
      request: {
        type: 'LaunchRequest',
        requestId: 'sim-req-' + Date.now(),
        timestamp: new Date().toISOString()
      }
    };
    const alexaResponse = await AlexaSkillHandler.handleRequest(mockLaunchReq);
    return res.json({
      matchedIntent: 'LaunchRequest',
      envelope: mockLaunchReq,
      alexaResponse
    });
  }

  const mockIntentReq = {
    version: '1.0',
    request: {
      type: 'IntentRequest',
      requestId: 'sim-req-' + Date.now(),
      timestamp: new Date().toISOString(),
      intent: {
        name: intentName,
        confirmationStatus: 'NONE',
        slots
      }
    }
  };

  const alexaResponse = await AlexaSkillHandler.handleRequest(mockIntentReq);
  res.json({
    matchedIntent: intentName,
    envelope: mockIntentReq,
    alexaResponse
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 MailCraft Server is running on port ${PORT}`);
  console.log(`📡 Alexa Webhook URL: http://localhost:${PORT}/api/alexa`);
  console.log(`🧠 Gemini AI Agent: ${geminiAgent.isConfigured() ? 'Connected' : 'Fallback / Demo Mode (Set GEMINI_API_KEY to activate)'}`);
  console.log(`🛠️ MCP Server: Ready with ${MCP_TOOLS_DEFINITIONS.length} tools`);
  console.log(`===============================================`);
});
