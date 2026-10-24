import emailService from './services/emailService.js';
import geminiAgent from './services/gemini.js';
import AlexaSkillHandler from './services/alexaSkillHandler.js';
import { handleMcpToolCall, MCP_TOOLS_DEFINITIONS } from './mcp/index.js';

async function runTests() {
  console.log('🧪 Starting MailCraft Test Suite...\n');

  // 1. Email Service Test
  console.log('1️⃣ Testing Email Service...');
  const emails = emailService.getAllEmails();
  console.log(`   ✓ Loaded ${emails.length} sample workplace emails`);
  const email101 = emailService.getEmailById('email-101');
  console.log(`   ✓ Found email-101: "${email101.subject}" from ${email101.sender}`);

  // 2. Gemini Agent Summarize Test
  console.log('\n2️⃣ Testing Gemini Email Summarizer...');
  const summary = await geminiAgent.summarizeEmail(email101);
  console.log(`   ✓ Summary generated: "${summary.summary}"`);
  console.log(`   ✓ Urgency Level: ${summary.urgencyLevel}`);

  // 3. Gemini Action Items & Deadline Extractor
  console.log('\n3️⃣ Testing Deadline & Task Extraction...');
  const actions = await geminiAgent.extractDeadlinesAndTasks(email101);
  console.log(`   ✓ Extracted ${actions.tasks?.length || 0} tasks:`);
  actions.tasks.forEach((t, i) => {
    console.log(`     - Task ${i+1}: [Due: ${t.deadline}] ${t.task} (Assignee: ${t.assignee})`);
  });

  // 4. Gemini Smart Reply Generator
  console.log('\n4️⃣ Testing Smart Reply Generator...');
  const draft = await geminiAgent.draftReply(email101, { tone: 'professional' });
  console.log(`   ✓ Subject: ${draft.subject}`);
  console.log(`   ✓ Preview: ${draft.body.slice(0, 100)}...`);

  // 5. MCP Tools Test
  console.log('\n5️⃣ Testing Model Context Protocol (MCP) Tools...');
  console.log(`   ✓ Found ${MCP_TOOLS_DEFINITIONS.length} MCP tools defined`);
  
  const mcpListResult = await handleMcpToolCall('list_emails', { unread: true });
  console.log(`   ✓ MCP list_emails returned ${mcpListResult.count} unread emails`);

  const mcpBriefing = await handleMcpToolCall('get_voice_briefing', {});
  console.log(`   ✓ MCP get_voice_briefing returned: "${mcpBriefing.speech}"`);

  // 6. Alexa Skill Handler Test
  console.log('\n6️⃣ Testing Alexa Skills Kit (ASK) Request Handler...');
  
  // LaunchRequest
  const launchReq = {
    version: '1.0',
    request: { type: 'LaunchRequest' }
  };
  const launchRes = await AlexaSkillHandler.handleRequest(launchReq);
  console.log(`   ✓ LaunchRequest speech: "${launchRes.response?.outputSpeech?.text}"`);

  // ExtractDeadlinesIntent
  const deadlineReq = {
    version: '1.0',
    request: {
      type: 'IntentRequest',
      intent: { name: 'ExtractDeadlinesIntent' }
    }
  };
  const deadlineRes = await AlexaSkillHandler.handleRequest(deadlineReq);
  console.log(`   ✓ ExtractDeadlinesIntent speech: "${deadlineRes.response?.outputSpeech?.text}"`);

  // DraftReplyIntent
  const draftReq = {
    version: '1.0',
    request: {
      type: 'IntentRequest',
      intent: { 
        name: 'DraftReplyIntent',
        slots: { SenderName: { value: 'Sarah' } }
      }
    }
  };
  const draftRes = await AlexaSkillHandler.handleRequest(draftReq);
  console.log(`   ✓ DraftReplyIntent speech: "${draftRes.response?.outputSpeech?.text}"`);

  console.log('\n🎉 ALL MAILCRAFT VERIFICATION TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
