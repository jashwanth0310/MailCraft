import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Layers, 
  Code,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

export default function McpInspector() {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolArgs, setToolArgs] = useState({});
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await axios.get('/api/mcp/tools');
      const toolList = res.data?.tools || [];
      setTools(toolList);
      if (toolList.length > 0 && !selectedTool) {
        selectTool(toolList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch MCP tools:', err);
    }
  };

  const selectTool = (tool) => {
    setSelectedTool(tool);
    // Initialize default arguments
    const defaults = {};
    if (tool.name === 'get_email' || tool.name === 'summarize_email' || tool.name === 'extract_deadlines' || tool.name === 'draft_reply') {
      defaults.emailId = 'email-101';
    }
    if (tool.name === 'draft_reply') {
      defaults.tone = 'professional';
      defaults.userGuidance = 'Confirm on track for Friday 5 PM';
    }
    if (tool.name === 'list_emails') {
      defaults.unread = true;
    }
    setToolArgs(defaults);
    setExecutionResult(null);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setLoading(true);
    setExecutionResult(null);

    try {
      const res = await axios.post('/api/mcp/call', {
        name: selectedTool.name,
        arguments: toolArgs
      });
      setExecutionResult(res.data);
    } catch (err) {
      setExecutionResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Model Context Protocol (MCP) Explorer
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Standard MCP Tools
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
            Standardized tools exposed to AI agents and voice assistants conforming to the Model Context Protocol specification.
          </p>
        </div>

        <div style={{
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <CheckCircle2 size={15} />
          <span>MCP Server Online ({tools.length} Tools Loaded)</span>
        </div>
      </div>

      {/* Main Grid: Tool List (Left) + Execution Sandbox (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: '1.5rem'
      }}>
        {/* Left: Tools Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Available MCP Tools
          </span>
          {tools.map(tool => {
            const isSelected = selectedTool?.name === tool.name;
            return (
              <div
                key={tool.name}
                onClick={() => selectTool(tool)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#111827',
                  border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="glow-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: isSelected ? '#a5b4fc' : '#f8fafc'
                  }}>
                    {tool.name}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    color: '#94a3b8'
                  }}>
                    Tool
                  </span>
                </div>
                <p style={{
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Tool Execution & Result Workspace */}
        {selectedTool ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tool Schema & Inputs Panel */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    marginBottom: '0.25rem'
                  }}>
                    {selectedTool.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {selectedTool.description}
                  </p>
                </div>

                <button
                  onClick={handleExecuteTool}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: '#4f46e5',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                  }}
                >
                  <Play size={15} />
                  <span>{loading ? 'Executing Tool...' : 'Execute Tool'}</span>
                </button>
              </div>

              {/* Dynamic Arguments Builder */}
              <div style={{
                background: '#0b0f19',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Input Parameters
                </h4>

                {selectedTool.inputSchema?.properties ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(selectedTool.inputSchema.properties).map(([propKey, propVal]) => (
                      <div key={propKey}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>
                            {propKey}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            ({propVal.type})
                          </span>
                          {selectedTool.inputSchema.required?.includes(propKey) && (
                            <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>*required</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={toolArgs[propKey] !== undefined ? toolArgs[propKey] : ''}
                          onChange={(e) => setToolArgs({ ...toolArgs, [propKey]: e.target.value })}
                          placeholder={propVal.description || ''}
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
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>No arguments required for this tool.</p>
                )}
              </div>

              {/* JSON Schema Accordion */}
              <details style={{ fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer' }}>
                <summary style={{ outline: 'none', userSelect: 'none' }}>View Input JSON Schema</summary>
                <pre style={{
                  background: '#05070e',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(selectedTool.inputSchema, null, 2)}
                </pre>
              </details>
            </div>

            {/* Execution Result Box */}
            <div style={{
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.5rem',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={18} color="#818cf8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    MCP Execution Output (JSON-RPC 2.0)
                  </span>
                </div>

                {executionResult && (
                  <button
                    onClick={handleCopyJson}
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
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', gap: '0.5rem' }}>
                  <Sparkles size={20} className="animate-spin" />
                  <span>Executing {selectedTool.name} through MCP Agent...</span>
                </div>
              ) : executionResult ? (
                <pre style={{
                  flex: 1,
                  background: '#05070e',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  color: executionResult.success !== false ? '#34d399' : '#fca5a5',
                  overflowY: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                  Click "Execute Tool" above to call this MCP tool and inspect its structured JSON return.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
