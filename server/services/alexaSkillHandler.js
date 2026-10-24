import emailService from './emailService.js';
import geminiAgent from './gemini.js';

export class AlexaSkillHandler {
  static async handleRequest(alexaRequestEnvelope) {
    const request = alexaRequestEnvelope.request || {};
    const requestType = request.type;

    console.log(`[Alexa Skill Handler] Received Request Type: ${requestType}`);

    if (requestType === 'LaunchRequest') {
      return this.handleLaunch();
    }

    if (requestType === 'IntentRequest') {
      const intentName = request.intent?.name;
      console.log(`[Alexa Skill Handler] Processing Intent: ${intentName}`);

      switch (intentName) {
        case 'SummarizeInboxIntent':
          return await this.handleSummarizeInbox();

        case 'ExtractDeadlinesIntent':
          return await this.handleExtractDeadlines();

        case 'LatestEmailIntent':
          return await this.handleLatestEmail();

        case 'DraftReplyIntent': {
          const senderSlot = request.intent?.slots?.SenderName?.value;
          return await this.handleDraftReply(senderSlot);
        }

        case 'AMAZON.HelpIntent':
          return this.handleHelp();

        case 'AMAZON.CancelIntent':
        case 'AMAZON.StopIntent':
          return this.handleStop();

        case 'AMAZON.FallbackIntent':
          return this.handleFallback();

        default:
          return this.buildResponse(
            "I heard that, but I'm not sure how to help with that yet. Try asking: what are my upcoming deadlines, or summarize my inbox.",
            false
          );
      }
    }

    if (requestType === 'SessionEndedRequest') {
      return this.buildResponse('Session ended. Have a productive day!', true);
    }

    return this.buildResponse("MailCraft is ready. What would you like me to check?", false);
  }

  static handleLaunch() {
    const unreadCount = emailService.getAllEmails({ unread: true }).length;
    const speechText = `Welcome to MailCraft! You have ${unreadCount} unread email${unreadCount === 1 ? '' : 's'}. You can say: summarize my inbox, what are my deadlines, or read the latest email.`;
    const reprompt = 'Would you like to hear your inbox summary or extract deadlines?';
    return this.buildResponse(speechText, false, reprompt, 'MailCraft Activated');
  }

  static async handleSummarizeInbox() {
    const unread = emailService.getAllEmails({ unread: true });
    if (unread.length === 0) {
      return this.buildResponse("Great news! You have no unread emails requiring attention right now.", true);
    }

    const briefing = await geminiAgent.generateVoiceBriefing(unread);
    const cardTitle = `Inbox Summary (${unread.length} Unread)`;
    const cardContent = unread.map(e => `• ${e.sender}: ${e.subject}`).join('\n');

    return this.buildResponse(
      briefing,
      false,
      "Would you like me to read the latest email or extract the deadlines?",
      cardTitle,
      cardContent
    );
  }

  static async handleExtractDeadlines() {
    const unread = emailService.getAllEmails({ unread: true });
    const allActions = [];

    for (const email of unread) {
      const actions = await geminiAgent.extractDeadlinesAndTasks(email);
      emailService.updateActionExtraction(email.id, actions);
      if (actions.tasks && actions.tasks.length > 0) {
        allActions.push({
          sender: email.sender,
          tasks: actions.tasks
        });
      }
    }

    if (allActions.length === 0) {
      return this.buildResponse("I scanned your unread emails and found no critical deadlines pending.", true);
    }

    // Compose spoken summary
    const deadlineStatements = allActions.slice(0, 3).map(item => {
      const firstTask = item.tasks[0];
      return `From ${item.sender}: ${firstTask.task}, due ${firstTask.deadline}.`;
    });

    const speech = `Here are your priority deadlines: ${deadlineStatements.join(' ')} Would you like me to draft a reply to any of these?`;
    const cardContent = allActions.map(a => `${a.sender}:\n` + a.tasks.map(t => `- [${t.deadline}] ${t.task}`).join('\n')).join('\n\n');

    return this.buildResponse(
      speech,
      false,
      "Say: draft a reply to Sarah, or say stop.",
      "Extracted Deadlines & Action Items",
      cardContent
    );
  }

  static async handleLatestEmail() {
    const emails = emailService.getAllEmails();
    if (emails.length === 0) {
      return this.buildResponse("Your inbox is empty.", true);
    }

    const latest = emails[0];
    const summary = await geminiAgent.summarizeEmail(latest);
    const speech = `Your latest email is from ${latest.sender} regarding "${latest.subject}". Here is the summary: ${summary.summary} Would you like me to draft a quick reply?`;

    return this.buildResponse(
      speech,
      false,
      "Would you like me to draft a reply?",
      `Latest: ${latest.subject}`,
      `From: ${latest.sender}\nSummary: ${summary.summary}\n\nUrgency: ${summary.urgencyLevel}`
    );
  }

  static async handleDraftReply(senderName) {
    const emails = emailService.getAllEmails();
    let targetEmail = emails[0];

    if (senderName) {
      const found = emails.find(e => e.sender.toLowerCase().includes(senderName.toLowerCase()));
      if (found) targetEmail = found;
    }

    const draft = await geminiAgent.draftReply(targetEmail, { tone: 'professional' });
    emailService.saveDraft(targetEmail.id, draft.body, 'professional');

    const speech = `I have drafted a professional reply to ${targetEmail.sender}. Here is a preview: "${draft.body.split('\n')[2] || draft.body.slice(0, 80)}...". I have saved this draft in your MailCraft dashboard for your final review.`;

    return this.buildResponse(
      speech,
      false,
      "Would you like to hear another email or are you finished?",
      `Drafted Reply to ${targetEmail.sender}`,
      draft.body
    );
  }

  static handleHelp() {
    const speech = "MailCraft helps you manage your emails hands-free. You can say: summarize my inbox, what are my deadlines, read my latest email, or draft a reply to Sarah. What would you like to do?";
    return this.buildResponse(speech, false, speech, "MailCraft Help");
  }

  static handleStop() {
    return this.buildResponse("Goodbye from MailCraft. Have a great day!", true);
  }

  static handleFallback() {
    const speech = "Sorry, I didn't catch that. You can ask: summarize my inbox, or what are my deadlines.";
    return this.buildResponse(speech, false, speech);
  }

  static buildResponse(speechText, shouldEndSession = false, repromptText = null, cardTitle = null, cardContent = null) {
    const response = {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: speechText
        },
        shouldEndSession
      }
    };

    if (repromptText) {
      response.response.reprompt = {
        outputSpeech: {
          type: 'PlainText',
          text: repromptText
        }
      };
    }

    if (cardTitle) {
      response.response.card = {
        type: 'Simple',
        title: cardTitle,
        content: cardContent || speechText
      };
    }

    return response;
  }
}

export default AlexaSkillHandler;
