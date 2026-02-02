from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON, Integer
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class DecisionRecord(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True)
    ticker = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Decision data
    action = Column(String)  # BUY, SELL, HOLD
    confidence = Column(Float)
    reasoning = Column(JSON)
    
    # Validation data
    risk_score = Column(Float)
    uav_validated = Column(Boolean, default=False)
    multiversal_trace = Column(JSON, nullable=True)
    
    # Outcome tracking
    price_at_decision = Column(Float)
    price_1h_later = Column(Float, nullable=True)
    price_24h_later = Column(Float, nullable=True)
    outcome_roi = Column(Float, nullable=True)
    outcome_status = Column(String, default="PENDING")  # PENDING, PROFIT, LOSS, NEUTRAL

class RealityStats(Base):
    __tablename__ = "stats"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    total_decisions = Column(Integer, default=0)
    total_time_saved = Column(Float, default=0.0)
    average_accuracy = Column(Float, default=0.0)
    total_roi = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
