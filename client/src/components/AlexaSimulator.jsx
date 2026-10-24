import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Terminal, 
  Sparkles, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Layers,
  Code
} from 'lucide-react';
import axios from 'axios';

export default function AlexaSimulator() {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [interactionHistory, setInteractionHistory] = useState([
    {
      id: 'init-1',
      command: 'Alexa, open Mail Craft',
      matchedIntent: 'LaunchRequest',
      speech: 'Welcome to MailCraft! You have 3 unread emails requiring review. You can ask me to summarize your inbox, extract upcoming deadlines, or draft a reply.',
      card: {
        title: 'MailCraft Activated',
        content: 'Welcome to MailCraft! Voice assistant activated.'
      },
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [lastPayloads, setLastPayloads] = useState(null);

  // Initialize Speech Recognition if supported in browser
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
        executeCommand(transcript);
      };

      recog.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.05;
    utterance.rate = 1.0;
    
    // Attempt to pick a smooth English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Google')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const executeCommand = async (cmdText) => {
    const finalCmd = (cmdText || command).trim();
    if (!finalCmd) return;
    setLoading(true);

    try {
      const res = await axios.post('/api/alexa/simulate', { command: finalCmd });
      const { matchedIntent, envelope, alexaResponse } = res.data;

      const outputSpeech = alexaResponse?.response?.outputSpeech?.text || 'Done.';
      const card = alexaResponse?.response?.card || null;

      const newInteraction = {
        id: 'interaction-' + Date.now(),
        command: finalCmd,
        matchedIntent,
        speech: outputSpeech,
        card,
        envelope,
        alexaResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setInteractionHistory(prev => [newInteraction, ...prev]);
      setLastPayloads({ request: envelope, response: alexaResponse });
      setCommand('');

      // Voice output
      speakText(outputSpeech);
    } catch (err) {
      console.error('Alexa simulate error:', err);
      const fallbackSpeech = "Sorry, I had trouble communicating with MailCraft backend.";
      speakText(fallbackSpeech);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!recognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge or type your command.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const presetUtterances = [
    { label: 'Summarize Inbox', query: 'Alexa, ask Mail Craft to summarize my inbox' },
    { label: 'What are my deadlines?', query: 'Alexa, ask Mail Craft what are my deadlines' },
    { label: 'Read latest email', query: 'Alexa, ask Mail Craft to read my latest email' },
    { label: 'Draft reply to Sarah', query: 'Alexa, ask Mail Craft to draft a reply to Sarah' },
    { label: 'Help instructions', query: 'Alexa, ask Mail Craft for help' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Amazon Alexa Voice Interactive Console
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(0, 202, 238, 0.15)',
              color: '#00caee',
              border: '1px solid rgba(0, 202, 238, 0.3)'
            }}>
              Alexa Skills Kit (ASK)
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
            Simulates genuine Amazon Echo voice interactions with Gemini AI reasoning & speech output.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: voiceEnabled ? 'rgba(0, 202, 238, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: voiceEnabled ? '1px solid rgba(0, 202, 238, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: voiceEnabled ? '#00caee' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{voiceEnabled ? 'Alexa Voice: ON' : 'Alexa Voice: MUTED'}</span>
          </button>

          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              background: showJsonInspector ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: showJsonInspector ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showJsonInspector ? '#a5b4fc' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Code size={15} />
            <span>ASK JSON Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Stage + History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showJsonInspector ? '1fr 1fr' : '1.1fr 0.9fr',
        gap: '1.5rem'
      }}>
        {/* Left: Interactive Voice Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Echo Device Visual Stage */}
          <div style={{
            background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(0, 202, 238, 0.25)',
            borderRadius: '16px',
            padding: '2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Luminous Alexa Glowing Ring */}
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: isSpeaking 
                  ? 'radial-gradient(circle, #00caee 0%, #0284c7 60%, transparent 80%)'
                  : isListening 
                    ? 'radial-gradient(circle, #ef4444 0%, #b91c1c 60%, transparent 80%)'
                    : 'radial-gradient(circle, rgba(0, 202, 238, 0.3) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 80%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem',
                boxShadow: isSpeaking 
                  ? '0 0 50px rgba(0, 202, 238, 0.7)' 
                  : isListening
                    ? '0 0 50px rgba(239, 68, 68, 0.7)'
                    : '0 0 20px rgba(0, 202, 238, 0.2)'
              }}
              className={isSpeaking ? 'alexa-glow-effect' : ''}
            >
              <div style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                background: '#0b0f19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mic size={30} color={isListening ? '#ef4444' : isSpeaking ? '#00caee' : '#64748b'} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: isSpeaking ? '#00caee' : isListening ? '#fca5a5' : '#94a3b8'
              }}>
                {isSpeaking ? 'Alexa is speaking...' : isListening ? 'Listening for speech...' : 'Echo Simulator Ready'}
              </span>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px' }}>
                Invocation Name: <strong style={{ color: '#00caee' }}>"mail craft"</strong>
              </p>
            </div>

            {/* Input Bar */}
            <div style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              alignItems: 'center',
              background: '#0b0f19',
              border: isListening ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '0.4rem 0.6rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <button
                onClick={toggleMic}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginRight: '0.5rem',
                  flexShrink: 0
                }}
                title={isListening ? 'Click to stop listening' : 'Click to speak voice command'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                placeholder="Type an Alexa command or click presets below..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.9rem'
                }}
              />

              <button
                onClick={() => executeCommand()}
                disabled={loading || !command.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: loading || !command.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !command.trim() ? 0.5 : 1
                }}
              >
                {loading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>

          {/* Quick Voice Utterance Presets */}
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              One-Click Alexa Utterance Presets
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {presetUtterances.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCommand(preset.query);
                    executeCommand(preset.query);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 202, 238, 0.4)';
                    e.currentTarget.style.background = 'rgba(0, 202, 238, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                >
                  <Play size={12} color="#00caee" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Echo Visual Display / Conversation Transcript OR JSON Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {showJsonInspector ? (
            <div style={{
              background: '#0b0f19',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '1.25rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>
                  Raw ASK Request & Response Envelopes
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>JSON-RPC / ASK v2</span>
              </div>
              <pre style={{
                flex: 1,
                overflowY: 'auto',
                fontSize: '0.75rem',
                color: '#34d399',
                background: '#05070e',
                padding: '1rem',
                borderRadius: '8px',
                maxHeight: '520px'
              }}>
                {JSON.stringify(lastPayloads || interactionHistory[0] || {}, null, 2)}
              </pre>
            </div>
          ) : (
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '620px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  Alexa Device Session History
                </span>
                <button
                  onClick={() => setInteractionHistory([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Clear</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {interactionHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#0b0f19',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {/* User Command */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                        🗣️ "{item.command}"
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {item.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
                      Matched Intent: <code>{item.matchedIntent}</code>
                    </div>

                    {/* Alexa Spoken Speech */}
                    <div style={{
                      background: 'rgba(0, 202, 238, 0.06)',
                      borderLeft: '3px solid #00caee',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#f0fdf4',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00caee', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Alexa Spoken Response:
                      </div>
                      {item.speech}
                    </div>

                    {/* Echo Screen Card (if present) */}
                    {item.card && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                          📱 Echo Card: {item.card.title}
                        </div>
                        <div style={{ color: '#94a3b8', whiteSpace: 'pre-line', fontSize: '0.78rem' }}>
                          {item.card.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
