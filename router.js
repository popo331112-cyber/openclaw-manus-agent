import Groq from "groq-sdk";

// Initialize Groq client
// Uses Groq API key from environment, falling back to the one in the document if not set
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY" });

export async function routeIntent(message) {
    const prompt = `
You are an intent router for an autonomous AI agent. 
The agent has the following skills available:

1. "manage_oracle_vps": Executes shell commands on an Oracle Cloud VPS via SSH. Use this if the user asks about PM2 status, restarting the bot (sanwal-chatbot or whatsapp-jules-bridge), checking logs, or managing the VPS.
2. "download_video": Downloads a video using yt-dlp. Use this if the user asks to download a video or provides a video URL (like YouTube, TikTok, etc.) with a download intent.
3. "default": Use this for any other general conversation, coding tasks, or requests that don't fit the specific skills above. The agent has many built-in capabilities to handle general requests.

Analyze the user's message and determine the correct skill.

Respond ONLY with a valid JSON object in the following format:
{
  "skill": "manage_oracle_vps" | "download_video" | "default",
  "parameter": "string" // The command to run, the URL to download, or null for default
}

Rules for parameters:
- For "manage_oracle_vps": Extract or infer the exact command (e.g., "pm2 status", "pm2 restart sanwal-chatbot", "pm2 logs whatsapp-jules-bridge --lines 50").
- For "download_video": Extract the URL from the message.

User Message: "${message}"
`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Routing error:", error);
        return { skill: "default", parameter: null };
    }
}
