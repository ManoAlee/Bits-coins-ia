from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn
from contextlib import asynccontextmanager
from agents.researcher import ResearchAgent
from agents.quant import QuantitativeAgent
from agents.market_data import MarketDataAgent
from pydantic import BaseModel

research_agent = None
quant_agent = None

class ResearchQuery(BaseModel):
    query: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the Swarm
    global research_agent, quant_agent
    logger.info(">> OMNI-ARCHITECT CORE: NEURAL PATHWAYS ACTIVE.")
    research_agent = ResearchAgent()
    quant_agent = QuantitativeAgent()
    yield
    # Shutdown
    logger.info(">> OMNI-ARCHITECT CORE: ENTERING STASIS.")
    if research_agent:
        await research_agent.close()

app = FastAPI(
    title="Omni-Architect Core",
    description="Financial Multiverse Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "system": "OMNI-ARCHITECT",
        "status": "OPERATIONAL",
        "directive": "MAXIMIZE_ENTROPY_REDUCTION"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/research")
async def conduct_research(query: ResearchQuery):
    """
    Direct Interface to the Perplexity Oracle.
    """
    if not research_agent:
        return {"error": "Research Agent not initialized"}
    
    return await research_agent.query_intelligence(query.query)

@app.post("/quant/analyze")
async def quant_analysis(data: dict):
    """
    Triggers the Quantitative Agent (Infinite Energy Swarm).
    """
    if not quant_agent:
        return {"error": "Quant Agent not initialized"}
    
    # Mock text input
    text = data.get("text", "Bitcoin market structure analysis")
    return await quant_agent.analyze_sentiment(text)

@app.get("/market/price/{ticker}")
async def get_price(ticker: str):
    """
    Real-time sensor reading.
    """
    agent = MarketDataAgent()
    return await agent.fetch_price(ticker)

@app.get("/quant/chart/{ticker}")
async def get_chart_data(ticker: str):
    """
    Returns high-fidelity chart data from the Math Wizard.
    """
    if not quant_agent:
        return {"error": "Quant Agent not fully materialized"}
    return await quant_agent.get_market_chart(ticker)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
