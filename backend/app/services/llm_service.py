"""
SynapseOS — services/llm_service.py
Universal Asynchronous LLM Client supporting Groq and OpenRouter.
Provides genuine medical reasoning, structured clinical JSON parsing, and automatic failover.
"""

import json
import logging
import re
import httpx
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"


async def call_llm(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 400,
    json_mode: bool = False,
    timeout: float = 8.0
) -> Optional[str]:
    """
    Asynchronously invokes Groq or OpenRouter chat completion API.
    Uses the exact same high-speed model family as the Chatbot (Qwen-27B, GPT-OSS-120B, Compound-Mini)
    with automatic failover to prevent rate limits and hangs.
    """
    # 1. Try Groq first with multi-model fallback matching chatbot
    if settings.GROQ_API_KEY:
        # Models supported on this Groq key in order of preference
        groq_candidates = [
            settings.GROQ_MODEL or "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
            "groq/compound-mini"
        ]
        if model and model not in groq_candidates:
            groq_candidates.insert(0, model)

        # Cap max_tokens to 450 to strictly obey Groq's 1,000 OTPM ceiling
        safe_max_tokens = min(max_tokens, 450)

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "SynapseOS-Swarm/1.0"
        }

        for candidate_model in groq_candidates:
            payload: Dict[str, Any] = {
                "model": candidate_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": safe_max_tokens
            }
            if json_mode and "compound" not in candidate_model:
                payload["response_format"] = {"type": "json_object"}

            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    res = await client.post(GROQ_ENDPOINT, json=payload, headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        content = data["choices"][0]["message"]["content"]
                        if content and "error" not in content.lower() and "unreachable" not in content.lower():
                            return content
                    else:
                        logger.warning(f"Groq [{candidate_model}] returned {res.status_code}: {res.text[:120]}")
            except Exception as e:
                logger.warning(f"Groq [{candidate_model}] call error: {e}")

    # 2. Try OpenRouter as secondary fallback with verified active models
    if settings.OPENROUTER_API_KEY:
        openrouter_candidates = [
            "meta-llama/llama-3.3-70b-instruct",
            "qwen/qwen-2.5-72b-instruct"
        ]
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://synapseos.internal",
            "X-Title": "SynapseOS Swarm"
        }

        for or_model in openrouter_candidates:
            payload = {
                "model": or_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": min(max_tokens, 500)
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(OPENROUTER_ENDPOINT, json=payload, headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        content = data["choices"][0]["message"]["content"]
                        if content and "unreachable" not in content.lower() and "error" not in content.lower():
                            return content
                    else:
                        logger.warning(f"OpenRouter [{or_model}] returned {res.status_code}: {res.text[:120]}")
            except Exception as e:
                logger.warning(f"OpenRouter [{or_model}] failed: {e}")

    logger.debug("All LLM API requests failed or returned unreachable.")
    return None


async def call_llm_json(
    messages: List[Dict[str, str]],
    fallback_dict: Dict[str, Any],
    model: Optional[str] = None,
    temperature: float = 0.1
) -> Dict[str, Any]:
    """
    Executes an LLM request and guarantees a structured JSON dictionary output.
    Gracefully handles empty responses, markdown wrapping, code blocks, and failovers.
    """
    raw = await call_llm(messages=messages, model=model, temperature=temperature, json_mode=True)
    if not raw or not isinstance(raw, str) or not raw.strip():
        return fallback_dict
        
    try:
        # Strip potential markdown formatting if returned
        clean_text = raw.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        if not clean_text:
            return fallback_dict

        # 1. Attempt direct JSON parsing
        try:
            parsed = json.loads(clean_text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            # 2. Fallback: extract outermost JSON object {...} via regex
            match = re.search(r"(\{[\s\S]*\})", clean_text)
            if match:
                parsed = json.loads(match.group(1))
                if isinstance(parsed, dict):
                    return parsed
            raise
    except Exception as e:
        logger.warning(f"Error parsing LLM response as JSON: {e}")

    return fallback_dict
