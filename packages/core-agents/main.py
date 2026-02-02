from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn
import asyncio
import random # Added for jitter
from contextlib import asynccontextmanager
from agents.researcher import ResearchAgent
from agents.quant import QuantitativeAgent
from agents.market_data import MarketDataAgent
from agents.decision_engine import DecisionEngine
from agents.execution_agent import ExecutionAgent # Added
from metrics.reality_tracker import RealityMetrics
from datetime import datetime
from database.db import init_db
from pydantic import BaseModel
from typing import Optional

research_agent = None
quant_agent = None
reality_metrics = None
market_agent = None
execution_agent = None

# Log buffer for the frontend terminal
logs_buffer = []

def add_log(msg: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    formatted_msg = f"[{timestamp}] {msg}"
    logs_buffer.append(formatted_msg)
    if len(logs_buffer) > 50:
        logs_buffer.pop(0)
    logger.info(msg)

class ResearchQuery(BaseModel):
    query: str

class DecisionRequest(BaseModel):
    ticker: str
    include_research: bool = False
    risk_tolerance: Optional[str] = "moderate"

class OutcomeUpdate(BaseModel):
    decision_id: str
    was_correct: bool
    actual_gain: Optional[float] = None

class ExecutionRequest(BaseModel):
    ticker: str
    action: str
    amount: float = 0.01

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Reality Architecture
    global research_agent, quant_agent, decision_engine, reality_metrics, market_agent
    add_log("🚀 REALITY ARCHITECT: INITIALIZING VALUE-DRIVEN INTELLIGENCE")
    await init_db()
    add_log("✅ Database Synchronized")
    
    # Initialize agents
    market_agent = MarketDataAgent()
    execution_agent = ExecutionAgent() # Added
    decision_engine = DecisionEngine()
    reality_metrics = decision_engine.metrics
    
    # Restore global agents for legacy endpoints
    research_agent = decision_engine.research_agent
    quant_agent = decision_engine.quant_agent
    
    # Start background outcome validator
    async def outcome_validator_loop():
        while True:
            await asyncio.sleep(60)
            try:
                await reality_metrics.check_pending_outcomes(market_agent)
            except Exception as e:
                logger.error(f"❌ Background Outcome Check failed: {e}")
                
    asyncio.create_task(outcome_validator_loop())
    
    # Start Autonomous Oracle (Market Scanner)
    async def oracle_scanner_loop():
        oracle_tickers = ["BTC", "ETH", "SOL"]
        while True:
            await asyncio.sleep(60) # Initial wait to let system settle
            add_log("🔮 ORACLE: Starting autonomous market scan...")
            for ticker in oracle_tickers:
                try:
                    await decision_engine.analyze_and_decide(
                        ticker=ticker,
                        include_research=False,
                        user_context={"risk_tolerance": "moderate", "autonomous": True}
                    )
                    add_log(f"🧠 ORACLE: Completed analysis for {ticker}")
                    # Delay between tickers to avoid rate limit
                    await asyncio.sleep(10) 
                except Exception as e:
                    add_log(f"❌ ORACLE: Failed to analyze {ticker}")
                    logger.error(f"❌ ORACLE: Failed to analyze {ticker}: {e}")
            
            await asyncio.sleep(900) # 15 minutes
                
    asyncio.create_task(oracle_scanner_loop())
    
    add_log("✅ All systems operational - Oracle is scanning markets")
    yield
    # Shutdown
    logger.info("🔌 REALITY ARCHITECT: SHUTTING DOWN")
    if decision_engine:
        await decision_engine.close()
    if research_agent:
        await research_agent.close()

app = FastAPI(
    title="Reality Architect Core",
    description="Value-Driven Financial Intelligence Engine",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "system": "Reality Architect",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "mission": "Generate measurable value through validated financial intelligence",
        "principles": [
            "Solve real problems",
            "Measure impact",
            "Validate decisions",
            "Explain reasoning"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

# ═══════════════════════════════════════════════════════════════
# REALITY ARCHITECTURE ENDPOINTS
# Focus: MEASURABLE VALUE, not just data
# ═══════════════════════════════════════════════════════════════

@app.post("/decide")
async def make_decision(request: DecisionRequest):
    """
    Main decision endpoint - combines all intelligence into validated decision.
    """
    if not decision_engine:
        return {"error": "Decision engine not initialized"}
    
    add_log(f"🎯 Manual request: Analyze {request.ticker}")
    user_context = {"risk_tolerance": request.risk_tolerance}
    
    decision = await decision_engine.analyze_and_decide(
        ticker=request.ticker,
        include_research=request.include_research,
        user_context=user_context
    )
    add_log(f"🧠 Decision for {request.ticker}: {decision.action} ({decision.confidence*100:.1f}%)")
    
    return {
        "decision_id": decision.decision_id,
        "ticker": decision.ticker,
        "action": decision.action,
        "confidence": round(decision.confidence, 3),
        "risk_score": round(decision.risk_score, 3),
        "reasoning": decision.reasoning,
        "validation": {
            "uav_validated": decision.uav_validated,
            "notes": decision.validation_notes
        },
        "value_metrics": {
            "estimated_time_saved_seconds": round(decision.estimated_time_saved, 1),
            "potential_value_dollars": decision.potential_value
        },
        "explanation": decision_engine.get_decision_explanation(decision)
    }

@app.post("/execute")
async def execute_trade(request: ExecutionRequest):
    """
    Actionable endpoint - executes the decision.
    """
    if not execution_agent:
        return {"error": "Execution agent not initialized"}
    
    add_log(f"🧨 Executing {request.action} for {request.ticker}...")
    result = await execution_agent.execute_trade(
        ticker=request.ticker,
        action=request.action,
        amount=request.amount
    )
    add_log(f"✅ Execution result: {result['status']} (Order: {result['order_id']})")
    
    return result

@app.post("/update-outcome")
async def update_decision_outcome(update: OutcomeUpdate):
    """
    Update decision with actual outcome for accuracy tracking.
    """
    if not reality_metrics:
        return {"error": "Metrics not initialized"}
    
    # Fetch current price if not provided in request (we'll use market_agent)
    data = await market_agent.fetch_price("bitcoin") # Should be ticker from decision
    current_price = data.get("price", 0.0)
    
    await reality_metrics.update_outcome(
        decision_id=update.decision_id,
        current_price=current_price
    )
    
    return {
        "status": "updated",
        "decision_id": update.decision_id,
        "message": "Outcome recorded for accuracy tracking"
    }

class ChatRequest(BaseModel):
    message: str
    ticker: Optional[str] = None

@app.post("/chat")
async def chat_with_engine(request: ChatRequest):
    """
    Direct communication with the Reality Intelligence.
    """
    if not decision_engine:
        raise HTTPException(status_code=500, detail="Decision engine not initialized")
    
    add_log(f"💬 Chat: {request.message[:40]}...")
    return await decision_engine.chat(request.message, ticker=request.ticker)

@app.get("/logs")
async def get_logs():
    """Returns the last 50 log messages for the UI terminal."""
    return {"logs": logs_buffer}

@app.get("/portfolio")
async def get_portfolio():
    """Mock portfolio endpoint for UI demonstration."""
    return {
        "balance_usd": 12540.50,
        "assets": [
            {"ticker": "BTC", "amount": 0.15, "value_usd": 6450.00},
            {"ticker": "ETH", "amount": 2.5, "value_usd": 5250.00},
            {"ticker": "SOL", "amount": 10.0, "value_usd": 840.50}
        ],
        "active_trades": 0
    }

@app.get("/metrics")
async def get_metrics():
    """
    Get REAL metrics that matter to users.
    
    Not technical metrics - VALUE metrics:
    - How much time saved?
    - How accurate are predictions?
    - What's the ROI?
    """
    if not reality_metrics:
        return {"error": "Metrics not initialized"}
    
    return await reality_metrics.get_aggregate_metrics(hours=24)

@app.get("/metrics/dashboard")
async def get_value_dashboard():
    return await reality_metrics.get_value_dashboard()

@app.get("/metrics/export")
async def export_metrics():
    """Export detailed metrics for analysis"""
    if not reality_metrics:
        return {"error": "Metrics not initialized"}
    
    filepath = "metrics_export.json"
    reality_metrics.export_metrics(filepath)
    
    return {
        "status": "exported",
        "filepath": filepath,
        "message": "Metrics exported successfully"
    }

# ═══════════════════════════════════════════════════════════════
# LEGACY ENDPOINTS (kept for backward compatibility)
# ═══════════════════════════════════════════════════════════════

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

