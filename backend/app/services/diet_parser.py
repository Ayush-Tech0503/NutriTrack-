from __future__ import annotations

import json
import re
from typing import Any
from app.core.config import get_settings

settings = get_settings()

GEMINI_PROMPT_TEMPLATE = """You are a professional nutrition assistant.

Analyze the user's meal: "{user_text}"

Estimate realistic nutrition values.

Return ONLY valid JSON.

JSON format:
{{
  "foods": [
    {{
      "name": "",
      "quantity": "",
      "calories": 0,
      "protein": 0,
      "carbohydrates": 0,
      "fat": 0,
      "fibre": 0
    }}
  ],
  "total": {{
    "calories": 0,
    "protein": 0,
    "carbohydrates": 0,
    "fat": 0,
    "fibre": 0
  }}
}}

Do not return Markdown.

Do not explain anything.

Return JSON only."""


def analyze_meal_with_gemini(raw_text: str) -> dict[str, Any]:
    api_key = settings.gemini_api_key or settings.antigravity_api_key
    if not api_key:
        return {
            "success": False,
            "error": "We couldn't analyze this meal. Please provide a little more detail.",
        }

    models_to_try = [
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-pro-latest",
    ]

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        prompt = GEMINI_PROMPT_TEMPLATE.format(user_text=raw_text)

        res = None
        last_error = None
        for model in models_to_try:
            try:
                res = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )
                if res and res.text:
                    break
            except Exception as err:
                last_error = err
                continue

        if not res or not res.text:
            print(f"Gemini API Analysis Error: {last_error}")
            return {
                "success": False,
                "error": "We couldn't analyze this meal. Please provide a little more detail.",
            }

        text_resp = res.text.strip()
        if "```" in text_resp:
            text_resp = re.sub(r"```(?:json)?", "", text_resp).strip()

        data = json.loads(text_resp)
        if isinstance(data, dict) and "foods" in data and "total" in data:
            if not data["foods"]:
                return {
                    "success": False,
                    "error": "We couldn't analyze this meal. Please provide a little more detail.",
                }
            return {
                "success": True,
                "foods": data.get("foods", []),
                "total": data.get("total", {
                    "calories": 0,
                    "protein": 0,
                    "carbohydrates": 0,
                    "fat": 0,
                    "fibre": 0,
                }),
            }
    except Exception as e:
        print(f"Gemini API Analysis Error: {e}")

    return {
        "success": False,
        "error": "We couldn't analyze this meal. Please provide a little more detail.",
    }
