# Complete Guide: Obtaining Alexa API Keys, Tokens & AWS Lambda Deployment

This guide explains step-by-step how to obtain all required Amazon Alexa tokens, credentials, and configure AWS Lambda or Alexa-hosted backend for **MailCraft**.

---

## 🔑 1. Alexa Credentials Overview

When developing an Alexa Skill and integrating it with REST APIs or automated tools, you interact with three core credential types:

| Credential | What it is | Where you get it |
| :--- | :--- | :--- |
| **Alexa Skill ID** | Unique identifier for your skill (`amzn1.ask.skill.xxxx`) | Alexa Developer Console |
| **AWS Lambda ARN** | Amazon Resource Name pointing to your backend code (`arn:aws:lambda:...`) | AWS Management Console |
| **Login with Amazon (LWA) Client ID & Secret** | OAuth 2.0 credentials for Alexa Skill Management API (SMAPI) | Amazon Developer Console -> Security Profiles |
| **SMAPI Access / Refresh Token** | Long-lived bearer token to programmatically create/deploy/update skills via CLI or REST API | Generated via ASK CLI (`ask configure`) or LWA OAuth flow |
| **Google Gemini API Key** | Used by MailCraft for deep reasoning, summarization, and draft generation | [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## 🛠️ Step 1: Create an Amazon Developer Account

1. Go to [Amazon Developer Portal](https://developer.amazon.com/).
2. Click **Sign In** (use your Amazon retail account or create a dedicated developer account).
3. Complete the free developer registration form.
4. Navigate to the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).

---

## 🎙️ Step 2: Create the "MailCraft" Custom Alexa Skill

1. In the **Alexa Developer Console**, click **Create Skill**.
2. **Skill Name**: `MailCraft`
3. **Primary Locale**: `English (US)` (or your preferred English locale).
4. **Choose a model**: Select **Custom**.
5. **Choose a hosting method**: Select **Alexa-hosted (Node.js)** *(zero credit card, zero AWS account)* or **Provision your own**.
6. Click **Create Skill** (top right) and choose the **Start from Scratch** template.

---

## 📝 Step 3: Get Your Skill ID & Import Interaction Model

### 3.1 Locate Skill ID
1. In the Alexa Developer Console, click on your skill.
2. In the top navigation or under **Skill List**, click **Copy Skill ID** (format: `amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. Save this ID in `server/.env` as `ALEXA_SKILL_ID`.

### 3.2 Import Interaction Model
1. In the left sidebar of the Alexa console, click **JSON Editor** (under *Interaction Model*).
2. Open the file `alexa/skill-package/interactionModels/custom/en-US.json` from this project.
3. Paste its contents into the JSON Editor text box.
4. Click **Save Model** at the top, then click **Build Model**.
5. Wait 30-60 seconds for the model build to succeed.

---

## 🔑 Step 4: How to Get Alexa API Token & Key (SMAPI / LWA)

If you want to use the **Alexa Skills Management API (SMAPI)** to interact with Alexa programmatically or integrate automated skill deployments, follow these steps:

### Option A: Using the ASK CLI (Fastest & Recommended)
1. Install the official Alexa Skills Kit CLI globally:
   ```bash
   npm install -g ask-cli
   ```
2. Initialize and authenticate with Amazon:
   ```bash
   ask configure
   ```
3. A browser window will open asking you to sign in with Amazon and authorize the Alexa Skills Kit CLI.
4. Once authorized, the CLI saves your **LWA Client ID, Client Secret, and Refresh Token** to:
   - **Windows**: `C:\Users\<YourUser>\.ask\cli_config`
   - **Mac/Linux**: `~/.ask/cli_config`
5. Open this file in a text editor to view your:
   - `client_id`
   - `client_secret`
   - `refresh_token`
   - `access_token`

### Option B: Generating LWA Security Profile Credentials Manually
1. Go to [Amazon Developer Console -> Login with Amazon](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html).
2. Click **Create a New Security Profile**.
   - **Name**: `MailCraft Alexa Management`
   - **Description**: `API token provider for MailCraft`
   - **Privacy Notice URL**: `https://example.com/privacy`
3. Click **Save**.
4. Hover over the gear icon next to your new profile and select **Web Settings**.
5. Note your **Client ID** and **Client Secret**.
6. In **Allowed Return URLs**, add: `http://127.0.0.1:9090/cb` or `https://amazon.com`.
7. You can now exchange authorization code for access and refresh tokens using standard OAuth 2.0 with the scope `alexa::ask:skills:readwrite`.

---

## ⚡ Step 5: Setting Up Backend Code

### For Alexa-Hosted Skill (Recommended - No Credit Card):
1. Click the **Code** tab in the Alexa Developer Console.
2. Paste the contents of `alexa/lambda/index.js` into `index.js`.
3. Click **Save** and **Deploy**.

### For AWS Lambda (Provision Your Own):
1. In the AWS Management Console, create a function: `MailCraftSkillHandler` (Runtime: Node.js 20.x).
2. Add trigger: **Alexa Skills Kit**, paste your Skill ID.
3. Zip `alexa/lambda/` and upload it.
4. Set Lambda ARN in Alexa Developer Console -> **Endpoint**.

---

## 🧪 Step 6: Testing Your Skill

### A. In Alexa Developer Console:
1. Click the **Test** tab at the top.
2. Under "Skill testing is enabled in", switch from **Off** to **Development**.
3. Type or speak:
   - *"open mail craft"*
   - *"ask mail craft to summarize my inbox"*
   - *"ask mail craft what are my deadlines"*
   - *"ask mail craft to draft a reply to Sarah"*
4. Check the JSON Input, JSON Output, and listen to the Alexa audio playback!

### B. In MailCraft Web Dashboard:
1. Run the React client (`npm run dev`).
2. Navigate to the **Alexa Voice Simulator** tab.
3. Click any of the one-click voice buttons or speak using your microphone.
4. Hear real speech synthesis and inspect the full Alexa request/response envelope in real time!
