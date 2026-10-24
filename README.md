# ✉️ MailCraft — Email Action Agent

> **Problem**: People waste valuable hours reading messy workplace emails and identifying what actually requires action.  
> **Solution**: An AI agent that analyzes emails, extracts actionable tasks & deadlines, and drafts tone-customized replies — accessible via a modern React web dashboard and voice-controlled via **Amazon Alexa**.

---

## 🏗️ Tech Stack

- **Voice Assistant**: Amazon Alexa & Alexa Skills Kit (ASK SDK v2)
- **Cloud Function**: AWS Lambda / Alexa-Hosted (`Node.js 20.x`)
- **Backend / REST API**: Node.js & Express.js
- **Frontend Dashboard**: React 19, Vite, Tailwind-inspired design & Lucide Icons
- **AI Reasoning**: Google Gemini API (Gemini 1.5 Flash via `@google/generative-ai`)
- **Agent Protocol**: Model Context Protocol (MCP) stdio & REST tools
- **Voice Synthesis / Recognition**: Web Speech API & Alexa SSML

---

## 🌟 Key Features

1. **Intelligent Email Summaries**: Get 2-sentence executive summaries and key bullet points powered by Gemini.
2. **Action Item & Deadline Extraction**: Automatically parse deliverables, due dates, urgency ratings, and assignees into a visual Kanban matrix.
3. **Smart Tone-Tailored Replies**: Generate contextual replies in Professional, Concise, Warm, or Urgent tones with custom instructions.
4. **Amazon Alexa Voice Integration**: Hands-free voice commands to ask Alexa for inbox briefings, upcoming deadlines, or ready-to-send draft replies.
5. **Interactive In-Browser Alexa Voice Simulator**: Test Alexa voice queries directly in your browser with real-time text-to-speech, microphone recognition, and Echo visual feedback.
6. **Model Context Protocol (MCP) Server**: Exposes 6 standardized MCP tools (`list_emails`, `get_email`, `summarize_email`, `extract_deadlines`, `draft_reply`, `get_voice_briefing`) ready for any MCP client or LLM host.

---

## 📁 Project Structure

```text
mailcraft/
├── server/                         # Express.js REST API + Alexa Webhook + MCP Server
│   ├── server.js                   # REST API routes & Alexa webhook endpoint
│   ├── package.json
│   ├── .env.example
│   ├── services/
│   │   ├── emailService.js         # Inbox manager, sample workplace emails & store
│   │   ├── gemini.js               # Gemini 1.5 Flash reasoning agent
│   │   └── alexaSkillHandler.js    # Alexa Skills Kit (ASK) request handler
│   ├── mcp/
│   │   └── index.js                # Model Context Protocol (MCP) server & tool runner
│   ├── data/
│   │   └── sampleEmails.json       # Realistic workplace emails with urgent deadlines
│   └── test-endpoints.js           # Comprehensive test suite
├── alexa/                          # Alexa Skills Kit artifacts & AWS Lambda
│   ├── skill-package/
│   │   ├── skill.json              # Alexa Skill Manifest
│   │   └── interactionModels/custom/
│   │       └── en-US.json          # Complete Interaction Model (Intents & Utterances)
│   └── lambda/
│       ├── index.js                # AWS Lambda handler using ask-sdk-core
│       └── package.json
├── client/                         # React 19 Frontend Dashboard
│   ├── src/
│   │   ├── App.jsx                 # Main application state & router
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation & Gemini key modal
│   │   │   ├── InboxView.jsx       # Email list, search, filters & email injector
│   │   │   ├── EmailDetailModal.jsx# Full email viewer, summary & draft composer
│   │   │   ├── ActionItemsBoard.jsx# Kanban board of deadlines & tasks
│   │   │   ├── AlexaSimulator.jsx  # Interactive Alexa voice console with TTS
│   │   │   ├── McpInspector.jsx    # Live MCP tools testbed & JSON-RPC runner
│   │   │   └── SetupGuide.jsx      # Visual Alexa key & AWS Lambda guide
│   └── vite.config.js
├── docs/
│   └── ALEXA_API_KEY_GUIDE.md      # Detailed Amazon Alexa API Key & Token Guide
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
*(Optional)* Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).  
*(Note: If you don't have a Gemini API key immediately, MailCraft includes high-quality intelligent fallback parsing so the entire system works instantly!)*

### 3. Start the Backend Server
```bash
cd server
npm start
```
The server will start on `http://localhost:5000` exposing:
- REST API: `http://localhost:5000/api`
- Alexa Webhook: `http://localhost:5000/api/alexa`
- Health check: `http://localhost:5000/api/health`

### 4. Start the React Frontend Dashboard
In a second terminal:
```bash
cd client
npm run dev
```
Open your browser at: **`http://localhost:5173`**

### 5. Run the Test Suite
```bash
npm test
```
All 6 layers (Email store, Gemini summarizer, Deadline extractor, Draft generator, MCP tools, and Alexa Request Handler) will be validated.

---

## 🔑 How to Get Alexa API Tokens, Keys & Setup AWS Lambda

For full in-depth instructions, see [docs/ALEXA_API_KEY_GUIDE.md](docs/ALEXA_API_KEY_GUIDE.md). Here is the concise summary:

### 1. Register Amazon Developer Account & Create Skill
1. Go to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Click **Create Skill**, name it `MailCraft`, select **Custom**, and choose **Alexa-hosted (Node.js)** or **Provision your own**.
3. Under **Interaction Model** -> **JSON Editor**, copy and paste the contents of `alexa/skill-package/interactionModels/custom/en-US.json`.
4. Click **Save Model** then **Build Model**.
5. Copy your **Skill ID** (`amzn1.ask.skill.xxxxxxxx-xxxx-...`) from the console and save it in `server/.env` as `ALEXA_SKILL_ID`.

### 2. Obtain Alexa API Keys / Tokens (SMAPI & LWA)
To manage skills programmatically via the **Alexa Skills Management API (SMAPI)**:
- **Fastest method**:
  ```bash
  npm install -g ask-cli
  ask configure
  ```
  Authorize your Amazon account in the browser. ASK CLI automatically stores your **Client ID, Client Secret, and Refresh Token** in `~/.ask/cli_config` (or `C:\Users\<User>\.ask\cli_config` on Windows).
- **Web Security Profile method**: Go to [Login with Amazon Console](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html), create a Security Profile, and note your Client ID and Client Secret for OAuth 2.0 with scope `alexa::ask:skills:readwrite`.

### 3. Deploy AWS / Alexa-Hosted Lambda Handler
1. Click the **Code** tab in the Alexa Developer Console.
2. Paste the contents of `alexa/lambda/index.js` into `index.js`.
3. Click **Save** and **Deploy**.

---

## 🎙️ Testing Voice Commands

You can test voice commands in:
1. **MailCraft Web Dashboard**: Navigate to the **Alexa Voice Console** tab, speak into your mic or click any of the preset utterance buttons to hear live Alexa speech synthesis.
2. **Alexa Developer Console**: Under the **Test** tab, enable development testing and type:
   - `"Alexa, open Mail Craft"`
   - `"Alexa, ask Mail Craft to summarize my inbox"`
   - `"Alexa, ask Mail Craft what are my deadlines"`
   - `"Alexa, ask Mail Craft to draft a reply to Sarah"`
3. **Echo Devices**: Any Amazon Echo logged into your Amazon developer account will respond to *"Alexa, open Mail Craft"*.

---

## 🛠️ Model Context Protocol (MCP) Integration

MailCraft implements the Model Context Protocol specification:
```bash
# Run standalone MCP stdio server
node server/mcp/index.js
```
Exposed tools:
- `list_emails`: Filter emails by unread status or priority
- `get_email`: Retrieve full email body and headers
- `summarize_email`: Executive summary using Gemini AI
- `extract_deadlines`: Discover action items and due dates
- `draft_reply`: Draft replies with specified tone and guidance
- `get_voice_briefing`: Produce spoken audio briefing for Alexa
