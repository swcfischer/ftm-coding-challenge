const OpenAI = require("openai");
require("dotenv").config();

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

class AIAssistantService {
  constructor() {
    this.model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 500;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  async sendMessage(message, context = []) {
    if (!process.env.OPENAI_API_KEY || !openai) {
      throw new Error(
        "OpenAI API key not configured. Please add your OpenAI API key to the .env file."
      );
    }

    const startTime = Date.now();

    try {
      // System prompt to define the AI assistant's role
      const systemPrompt = {
        role: "system",
        content: `You are a helpful AI assistant for an internal team dashboard. 
Your role is to assist team members with questions about work, projects, tools, processes, and general knowledge.
Be concise but thorough in your responses. If you're unsure about something specific to the team or company, 
let them know you might need more context or suggest they check with relevant team members.
Keep responses professional but friendly.`,
      };

      // Build conversation context
      const messages = [systemPrompt];

      // Add conversation context if provided
      if (context && context.length > 0) {
        const contextMessages = context
          .slice(-5)
          .map((msg) => [
            { role: "user", content: msg.question },
            { role: "assistant", content: msg.answer },
          ])
          .flat();
        messages.push(...contextMessages);
      }

      // Add current message
      messages.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false,
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      return {
        response,
        tokensUsed,
        responseTime,
        model: this.model,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);

      if (error.code === "insufficient_quota") {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing."
        );
      } else if (error.code === "invalid_api_key") {
        throw new Error("Invalid OpenAI API key.");
      } else if (error.type === "rate_limit_error") {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      } else {
        throw new Error(
          "Failed to get response from AI assistant. Please try again."
        );
      }
    }
  }

  async moderateContent(text) {
    if (!process.env.OPENAI_API_KEY || !openai) {
      return { flagged: false, categories: {} };
    }

    try {
      const moderation = await openai.moderations.create({
        input: text,
      });

      const result = moderation.results[0];
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
      };
    } catch (error) {
      console.error("Content moderation error:", error);
      // Return safe default if moderation fails
      return { flagged: false, categories: {} };
    }
  }
}

module.exports = new AIAssistantService();
