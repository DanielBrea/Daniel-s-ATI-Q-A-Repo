from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import openai
import os

app = FastAPI()

openai.api_key = os.environ["OPENAI_API_KEY"]

@app.post("/api/external_agent")
async def external_agent(request: Request):
    data = await request.json()
    query = data.get("query", "No query provided.")

    system_prompt = """
You are a general-purpose AI assistant with access to your full pretraining and general world knowledge.
Feel free to draw from your internal model, factual understanding, or past training data.
If the user is asking for something current (e.g., “latest” or “2025” or “this week”), answer to the best of your ability with a disclaimer if unsure.

This is the only agent in the system allowed to hallucinate, generalize, or reason based on your own training. Act smart and helpful.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages
    )

    return JSONResponse({"result": response["choices"][0]["message"]["content"]})
