const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' in request body" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are a general-purpose AI assistant with full access to your pretraining knowledge.
You are allowed to make informed estimates, provide general facts, and answer questions based on your internal model.

You may use past data and general world knowledge to answer questions.
Only disclaim if the request is extremely time-sensitive or if you're completely unsure.
          `
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;
    return res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ error: "Error calling external agent." });
  }
}
