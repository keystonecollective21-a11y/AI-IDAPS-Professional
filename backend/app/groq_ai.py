import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not configured in .env")

client = Groq(api_key=GROQ_API_KEY)


def analyze_threat(event: dict):
    prompt = f"""
You are an AI cybersecurity analyst for an Intrusion Detection
and Automated Prevention System (AI-IDAPS).

Analyze the following network security event.

Network Event:
{event}

Provide a concise security analysis containing:

1. Attack type
2. Risk level: LOW, MEDIUM, HIGH, or CRITICAL
3. Why this traffic is suspicious
4. Recommended mitigation
5. SOC analyst summary

Do not invent network information that is not present in the event.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert cybersecurity SOC analyst."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=500
    )

    return response.choices[0].message.content