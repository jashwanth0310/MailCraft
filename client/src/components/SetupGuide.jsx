import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Cloud, 
  Layers, 
  Cpu, 
  FileCode,
  Sparkles
} from 'lucide-react';

export default function SetupGuide() {
  const [copiedSection, setCopiedSection] = useState('');

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(''), 2500);
  };

  const sampleInteractionModel = `{
  "interactionModel": {
    "languageModel": {
      "invocationName": "mail craft",
      "intents": [
        { "name": "AMAZON.CancelIntent", "samples": ["cancel", "never mind"] },
        { "name": "AMAZON.HelpIntent", "samples": ["help", "what can you do"] },
        { "name": "AMAZON.StopIntent", "samples": ["stop", "goodbye"] },
        { "name": "SummarizeInboxIntent", "samples": ["summarize my inbox", "summarize my emails", "give me a briefing"] },
        { "name": "ExtractDeadlinesIntent", "samples": ["what are my deadlines", "what needs action", "what are my deliverables"] },
        { "name": "LatestEmailIntent", "samples": ["read my latest email", "what is my newest message"] },
        { "name": "DraftReplyIntent", "slots": [{ "name": "SenderName", "type": "AMAZON.FirstName" }], "samples": ["draft a reply", "draft a reply to {SenderName}", "reply to {SenderName}"] }
      ]
    }
  }
}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{
            padding: '0.45rem',
            borderRadius: '8px',
            background: 'rgba(0, 202, 238, 0.15)',
            color: '#00caee'
          }}>
            <Key size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Alexa API Key, Token & AWS Lambda Setup Guide
          </h1>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
          Complete, end-to-end instructions for provisioning Amazon Alexa API credentials, configuring the Alexa Skills Kit (ASK), setting up AWS Lambda, and connecting InboxPilot.
        </p>
      </div>

      {/* Architecture Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
          🧩 MailCraft Architecture Stack
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ background: '#0b0f19', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 202, 238, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#00caee', fontWeight: 700 }}>1. Alexa Voice</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>Alexa Skills Kit (ASK) Interaction Model</p>
          </div>
          <div style={{ background: '#0b0f19', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>2. Cloud Compute</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>AWS Lambda (Node.js 20.x, ask-sdk-core)</p>
          </div>
          <div style={{ background: '#0b0f19', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>3. Backend & MCP</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>Express.js REST API + Model Context Protocol</p>
          </div>
          <div style={{ background: '#0b0f19', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>4. AI Reasoning</span>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>Gemini 1.5 Flash via Google Gen AI SDK</p>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>1</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Register Amazon Developer Account & Create Skill
          </h2>
        </div>

        <ol style={{ paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>
            Go to <a href="https://developer.amazon.com/alexa/console/ask" target="_blank" rel="noreferrer" style={{ color: '#00caee', textDecoration: 'none', fontWeight: 600 }}>developer.amazon.com/alexa/console/ask <ExternalLink size={12} style={{ display: 'inline' }} /></a> and sign in.
          </li>
          <li>Click <strong>Create Skill</strong> in the top right corner.</li>
          <li>
            Enter Skill Name: <code style={{ color: '#38bdf8' }}>MailCraft</code> and choose Primary Locale: <code style={{ color: '#38bdf8' }}>English (US)</code>.
          </li>
          <li>Under <strong>Experience, Model, Hosting</strong>:
            <ul style={{ marginTop: '0.35rem', paddingLeft: '1.25rem' }}>
              <li>Model: Choose <strong>Custom</strong>.</li>
              <li>Hosting service: Choose <strong>Provision your own</strong> (to use AWS Lambda or your Express endpoint).</li>
            </ul>
          </li>
          <li>Click <strong>Create Skill</strong> and select the <strong>Start from Scratch</strong> template.</li>
        </ol>
      </section>

      {/* STEP 2 */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>2</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Import Interaction Model into Alexa Console
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1rem' }}>
          In the Alexa Developer Console, click <strong>JSON Editor</strong> under the <em>Interaction Model</em> sidebar, paste the JSON below, then click <strong>Save Model</strong> and <strong>Build Model</strong>:
        </p>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => copyToClipboard(sampleInteractionModel, 'model')}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: copiedSection === 'model' ? '#34d399' : '#cbd5e1',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {copiedSection === 'model' ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            <span>{copiedSection === 'model' ? 'Copied Model' : 'Copy JSON'}</span>
          </button>
          <pre style={{
            background: '#05070e',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.75rem',
            color: '#a5b4fc',
            overflowX: 'auto',
            maxHeight: '220px'
          }}>
            {sampleInteractionModel}
          </pre>
        </div>
      </section>

      {/* STEP 3 - How to get API tokens & keys */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>3</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            How to Get Alexa API Token & Keys (SMAPI & LWA)
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1rem' }}>
          Amazon provides two distinct credentials depending on whether you are verifying requests or managing skills programmatically:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Method A */}
          <div style={{
            background: '#0b0f19',
            border: '1px solid rgba(0, 202, 238, 0.25)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00caee', marginBottom: '0.5rem' }}>
              Method A: Generate Alexa SMAPI Tokens with ASK CLI (Fastest & Official)
            </h4>
            <ol style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.7 }}>
              <li>
                Install the official Alexa Skills Kit CLI globally:
                <pre style={{ background: '#05070e', padding: '0.45rem', borderRadius: '4px', margin: '4px 0', color: '#38bdf8' }}>npm install -g ask-cli</pre>
              </li>
              <li>
                Run the configure command:
                <pre style={{ background: '#05070e', padding: '0.45rem', borderRadius: '4px', margin: '4px 0', color: '#38bdf8' }}>ask configure</pre>
              </li>
              <li>A browser will open asking you to log in to Amazon and grant permissions.</li>
              <li>
                Once approved, ASK CLI generates your <strong>LWA Client ID, Client Secret, and Refresh Token</strong> in:
                <div style={{ background: '#05070e', padding: '0.45rem', borderRadius: '4px', margin: '4px 0', color: '#34d399', fontFamily: 'monospace' }}>
                  Windows: C:\Users\&lt;YourUser&gt;\.ask\cli_config<br />
                  Mac/Linux: ~/.ask/cli_config
                </div>
              </li>
            </ol>
          </div>

          {/* Method B */}
          <div style={{
            background: '#0b0f19',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.5rem' }}>
              Method B: Login with Amazon (LWA) Security Profile (For REST API / Webhooks)
            </h4>
            <ol style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.7 }}>
              <li>
                Go to <a href="https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Amazon Developer Portal &gt; Login with Amazon</a>.
              </li>
              <li>Click <strong>Create a New Security Profile</strong>: Name: <code>MailCraft Profile</code>.</li>
              <li>Under <strong>Web Settings</strong>, copy your <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
              <li>In Allowed Return URLs, enter <code>http://127.0.0.1:9090/cb</code>.</li>
              <li>Exchange the authorization code for an OAuth2 bearer token with scope <code>alexa::ask:skills:readwrite</code>.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* STEP 4: AWS Lambda Deployment */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>4</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Deploy AWS Lambda Function
          </h2>
        </div>

        <ol style={{ paddingLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <li>Open the <a href="https://console.aws.amazon.com/lambda" target="_blank" rel="noreferrer" style={{ color: '#fbbf24' }}>AWS Lambda Console</a> in region <strong>us-east-1 (N. Virginia)</strong>.</li>
          <li>Create function: <strong>MailCraftSkillHandler</strong> (Runtime: <code>Node.js 20.x</code>).</li>
          <li>
            Click <strong>+ Add trigger</strong>, select <strong>Alexa Skills Kit</strong>, and enter your Alexa Skill ID.
          </li>
          <li>
            Zip the contents of <code>alexa/lambda/</code> and upload the zip file in the Lambda code editor.
          </li>
          <li>
            Under Configuration &gt; Environment variables, set <code>INBOXPILOT_API_BASE</code> to your public server URL (or ngrok URL).
          </li>
          <li>Copy the <strong>Function ARN</strong> (e.g. <code>arn:aws:lambda:us-east-1:123456789012:function:InboxPilotSkillHandler</code>).</li>
          <li>Return to the Alexa Developer Console &gt; <strong>Endpoint</strong> &gt; select <strong>AWS Lambda ARN</strong> &gt; paste into Default Region.</li>
        </ol>
      </section>

      {/* STEP 5: Testing */}
      <section style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>5</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Testing Your Alexa Skill
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          In the Alexa Developer Console, click the <strong>Test</strong> tab, set testing to <strong>Development</strong>, and test with these utterances:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            'Alexa, open Mail Craft',
            'Alexa, ask Mail Craft to summarize my inbox',
            'Alexa, ask Mail Craft what are my deadlines',
            'Alexa, ask Mail Craft to read my latest email',
            'Alexa, ask Mail Craft to draft a reply to Sarah'
          ].map((phrase, idx) => (
            <div key={idx} style={{
              background: '#0b0f19',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              color: '#38bdf8',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              🗣️ "{phrase}"
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
