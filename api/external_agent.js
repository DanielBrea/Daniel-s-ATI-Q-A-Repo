const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing query in request body" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are a general-purpose AI assistant with access to your full pretraining and general world knowledge.
Feel free to draw from your internal model, factual understanding, or past training data.
If the user is asking for something current (e.g., “latest” or “2025” or “this week”), answer to the best of your ability with a disclaimer if unsure.

This is the only agent in the system allowed to hallucinate, generalize, or reason based on your own training. Act smart and helpful.
          `
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    const result = response.choices[0].message.content;
    return res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({ error: "Something went wrong calling the external agent." });
  }
}
