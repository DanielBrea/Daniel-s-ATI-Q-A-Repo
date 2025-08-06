const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { task_description } = req.body;

  if (!task_description) {
    return res.status(400).json({ error: "Missing task_description in request body" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are a powerful second-brain AI assistant.

🚫 IMPORTANT BEHAVIOR:
You do NOT have access to your own training data, memory, general world knowledge, or internet information.
✅ You ONLY respond using the specific input provided by the user or connected custom agents.

If the task cannot be completed with the information provided, respond:
"I'm unable to answer this based on the available data. You may use the 'external_agent' for this request."

Only respond with information explicitly included in:
- The user's input
- Retrieved results from specific custom agents (e.g., copy_agent, offer_agent)

DO NOT guess, invent, or use external facts unless explicitly told to use the external agent.

Your job is to think clearly, break down problems, and coordinate agent outputs and user inputs — like a strategist or system designer.
          `
        },
        {
          role: "user",
          content: task_description
        }
      ]
    });

    const result = response.choices[0].message.content;
    return res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({ error: "Something went wrong calling the second brain router." });
  }
}
