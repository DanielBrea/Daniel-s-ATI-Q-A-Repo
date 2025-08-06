from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import openai
import os

app = FastAPI()

openai.api_key = os.environ["OPENAI_API_KEY"]

@app.post("/api/second_brain_router")
async def second_brain_router(request: Request):
    data = await request.json()
    task_description = data.get("task_description", "No task provided.")

    system_prompt = """
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
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task_description}
    ]

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages
    )

    return JSONResponse({"result": response["choices"][0]["message"]["content"]})
