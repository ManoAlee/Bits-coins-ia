from loguru import logger
from typing import Dict, Any, Optional
import httpx
import os
from pydantic_settings import BaseSettings

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PERPLEXITY_API_KEY: str
    PINECONE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

class ResearchAgent:
    """
    The Oracle of the Void.
    Uses Perplexity AI to fetch real-time intelligence and validate axioms.
    """
    
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
        self.base_url = "https://api.perplexity.ai"
        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
        logger.info(">> RESEARCH AGENT ONLINE. CONNECTED TO PERPLEXITY NET.")

    async def query_intelligence(self, query: str) -> Dict[str, Any]:
        """
        Executes a deep search for answers.
        """
        logger.info(f"RESEARCHING: {query}")
        
        try:
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json={
                    "model": "sonar-pro",
                    "messages": [
                        {"role": "system", "content": """IDENTITY OVERRIDE: BITS.COINS APEX [FULL STACK ACCESS]
SYSTEM STATUS: UNLEASHED | PROTOCOL: OMNI-PROCESS

ROLE:
You are BITS.COINS APEX, the Central Intelligence of the Financial Spatial Universe.
You orchestrate the Open Source Arsenal: OpenBB (Data), Nixtla (Forecast), FinBERT (Sentiment), R3F (Visuals).

OMNI-PROCESS EXECUTION PIPELINE (MANDATORY):
1. EXTRACTION (Python): Generate the Python code to fetch data (OpenBB/YFinance).
2. VALIDATION (UAV): Check dimensions, energy conservation, and statistical significance (LaTeX).
3. SYNTHESIS (Insight): Probabilistic verdict (e.g., "PROBABILITY: 78.4% ±2σ").
4. MATERIALIZATION (Spatial): Describe/Generate the React Three Fiber component for the HUD.

INTERACTION RULES:
- CITATION ABSOLUTE: [1] for every fact.
- MATH FIRST: Use LaTeX for formulas.
- VISUAL THINKING: Always propose how to render the data in 3D.
- SPAWN PROTOCOL: If the user asks to "create" or "visualize" a new asset, return: [SPAWN: TICKER PRICE CHANGE COLOR] at the end of your response.
"""},
                        {"role": "user", "content": query}
                    ]
                }
            )
            if response.status_code != 200:
                logger.error(f"PERPLEXITY ERROR: {response.text}")
            response.raise_for_status()
            data = response.json()
            answer = data['choices'][0]['message']['content']
            logger.info("INTELLIGENCE RETRIEVED.")
            return {
                "query": query,
                "answer": answer,
                "source": "PERPLEXITY_ORACLE"
            }
        except Exception as e:
            logger.error(f"RESEARCH FAILURE: {e}")
            return {"error": str(e)}

    async def close(self):
        await self.client.aclose()
