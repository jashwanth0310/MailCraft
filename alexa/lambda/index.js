/**
 * AWS / Alexa-Hosted Skill Handler for MailCraft
 * Built with ask-sdk-core & Node.js
 */

const Alexa = require('ask-sdk-core');

// Sample emails available directly inside Lambda (zero network crashes)
const sampleEmails = [
  {
    id: "email-101",
    sender: "Sarah Jenkins",
    subject: "URGENT: Q4 Product Strategy Slides & Board Review",
    deadline: "Friday at 5:00 PM EST",
    task: "Finalize 3 key product strategy slides and customer retention metrics",
    unread: true
  },
  {
    id: "email-102",
    sender: "Marcus Vance",
    subject: "Enterprise Contract Renewal & Tier Pricing",
    deadline: "Tuesday, October 29 at 3:00 PM EST",
    task: "Sign DocuSign agreement with 15% discount",
    unread: true
  },
  {
    id: "email-103",
    sender: "DevOps Incident Response",
    subject: "Incident #4492 Post-Mortem Review Meeting",
    deadline: "Tomorrow at 10:00 AM PST",
    task: "Review root cause analysis before team sync",
    unread: true
  }
];

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const unreadCount = sampleEmails.filter(e => e.unread).length;
    const speechText = `Welcome to MailCraft! You have ${unreadCount} unread emails requiring review. You can ask me to summarize your inbox, extract upcoming deadlines, or draft a reply.`;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Would you like me to summarize your emails or check for deadlines?')
      .withSimpleCard('MailCraft Activated', speechText)
      .getResponse();
  }
};

const SummarizeInboxIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SummarizeInboxIntent';
  },
  handle(handlerInput) {
    const speechText = "You have 3 unread emails. The most urgent is from Sarah Jenkins regarding the Q4 product strategy slides due this Friday at 5:00 PM EST. Marcus Vance also needs your contract renewal sign-off by next Tuesday. Would you like me to extract the deadlines or draft a reply?";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Would you like me to extract the deadlines or draft a reply?')
      .withSimpleCard('MailCraft Inbox Briefing', speechText)
      .getResponse();
  }
};

const ExtractDeadlinesIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExtractDeadlinesIntent';
  },
  handle(handlerInput) {
    const speech = "Here are your priority deadlines: First, from Sarah Jenkins: finalize Q4 product strategy slides, due Friday at 5:00 PM EST. Second, from Marcus Vance: sign enterprise renewal agreement, due Tuesday, October 29 at 3:00 PM. Third, from DevOps: review incident post-mortem doc, due tomorrow at 10:00 AM PST. Would you like me to prepare a draft reply?";

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('Say draft a reply to Sarah, or stop.')
      .withSimpleCard('Upcoming Action Deadlines', speech)
      .getResponse();
  }
};

const LatestEmailIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LatestEmailIntent';
  },
  handle(handlerInput) {
    const latest = sampleEmails[0];
    const speech = `Your newest email is from ${latest.sender} regarding "${latest.subject}". Sarah needs the finalized product strategy slides uploaded before Friday 5:00 PM. Would you like me to draft a reply?`;

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('Would you like to draft a reply?')
      .withSimpleCard(`Latest Email: ${latest.subject}`, speech)
      .getResponse();
  }
};

const DraftReplyIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DraftReplyIntent';
  },
  handle(handlerInput) {
    const senderSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'SenderName') || 'Sarah';
    const speech = `I have drafted a professional reply to ${senderSlot} confirming that the deliverables are on track and will be finalized before the deadline. I saved this draft to your MailCraft dashboard for your final review.`;

    return handlerInput.responseBuilder
      .speak(speech)
      .withSimpleCard(`Draft for ${senderSlot}`, speech)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask MailCraft: summarize my inbox, what are my deadlines, read my latest email, or draft a reply. What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye from MailCraft!';
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speechText = "Sorry, I didn't catch that. You can say summarize my inbox or what are my deadlines.";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);
    const speechText = 'Sorry, MailCraft encountered an issue handling your command. Please try again.';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SummarizeInboxIntentHandler,
    ExtractDeadlinesIntentHandler,
    LatestEmailIntentHandler,
    DraftReplyIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
