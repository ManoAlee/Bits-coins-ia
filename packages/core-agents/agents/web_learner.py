"""
Web Learning Agent - Autonomous Knowledge Acquisition
Aprende continuamente pesquisando na internet
"""

from loguru import logger
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import httpx
import json
import os


class LearningEntry(BaseModel):
    """Entrada de aprendizado"""
    topic: str
    query: str
    knowledge: str
    sources: List[str]
    confidence: float
    learned_at: datetime = datetime.now()
    last_used: Optional[datetime] = None
    use_count: int = 0


class WebLearningAgent:
    """
    Agente de Aprendizado Web Autônomo
    
    Capacidades:
    1. Pesquisa automática na web
    2. Extração de conhecimento
    3. Armazenamento de aprendizados
    4. Aplicação de conhecimento em decisões
    5. Atualização contínua
    """
    
    def __init__(self, knowledge_base_path: str = "knowledge_base.json"):
        self.knowledge_base_path = knowledge_base_path
        self.knowledge: Dict[str, LearningEntry] = self._load_knowledge()
        self.perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
        logger.info("🧠 WEB LEARNING AGENT INITIALIZED - AUTONOMOUS MODE")
    
    def _load_knowledge(self) -> Dict[str, LearningEntry]:
        """Carrega base de conhecimento"""
        if os.path.exists(self.knowledge_base_path):
            try:
                with open(self.knowledge_base_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {
                        k: LearningEntry(**v) for k, v in data.items()
                    }
            except Exception as e:
                logger.error(f"Error loading knowledge base: {e}")
        return {}
    
    def _save_knowledge(self):
        """Salva base de conhecimento"""
        try:
            data = {
                k: v.model_dump(mode='json') for k, v in self.knowledge.items()
            }
            with open(self.knowledge_base_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            logger.info(f"💾 Knowledge base saved: {len(self.knowledge)} entries")
        except Exception as e:
            logger.error(f"Error saving knowledge base: {e}")
    
    async def learn_about(self, topic: str, force_refresh: bool = False) -> LearningEntry:
        """
        Aprende sobre um tópico pesquisando na web
        
        Args:
            topic: Tópico para aprender
            force_refresh: Força nova pesquisa mesmo se já souber
        
        Returns:
            LearningEntry com conhecimento adquirido
        """
        # Verifica se já sabe (e não precisa atualizar)
        if topic in self.knowledge and not force_refresh:
            entry = self.knowledge[topic]
            
            # Atualiza se conhecimento está desatualizado (>24h)
            age = datetime.now() - entry.learned_at
            if age < timedelta(hours=24):
                logger.info(f"📚 Using cached knowledge: {topic}")
                entry.use_count += 1
                entry.last_used = datetime.now()
                self._save_knowledge()
                return entry
        
        logger.info(f"🔍 LEARNING ABOUT: {topic}")
        
        # Pesquisa na web
        knowledge_data = await self._research_topic(topic)
        
        # Cria entrada de aprendizado
        entry = LearningEntry(
            topic=topic,
            query=knowledge_data["query"],
            knowledge=knowledge_data["knowledge"],
            sources=knowledge_data["sources"],
            confidence=knowledge_data["confidence"]
        )
        
        # Armazena conhecimento
        self.knowledge[topic] = entry
        self._save_knowledge()
        
        logger.info(f"✅ LEARNED: {topic} (Confidence: {entry.confidence*100:.1f}%)")
        
        return entry
    
    async def _research_topic(self, topic: str) -> Dict[str, Any]:
        """Pesquisa um tópico na web usando Perplexity"""
        query = f"Explain {topic} in the context of financial markets and trading. Include key facts, current trends, and actionable insights."
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.perplexity_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "sonar-pro",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a financial research expert. Provide accurate, well-sourced information with citations."
                            },
                            {
                                "role": "user",
                                "content": query
                            }
                        ],
                        "return_citations": True
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                
                knowledge = data['choices'][0]['message']['content']
                citations = data.get('citations', [])
                
                return {
                    "query": query,
                    "knowledge": knowledge,
                    "sources": citations,
                    "confidence": 0.9 if citations else 0.7
                }
        
        except Exception as e:
            logger.error(f"Research failed: {e}")
            return {
                "query": query,
                "knowledge": f"Failed to learn about {topic}: {str(e)}",
                "sources": [],
                "confidence": 0.0
            }
    
    async def apply_knowledge(self, context: str) -> Dict[str, Any]:
        """
        Aplica conhecimento relevante a um contexto
        
        Args:
            context: Contexto da decisão (ex: "analyzing AAPL")
        
        Returns:
            Conhecimento relevante aplicado
        """
        # Identifica tópicos relevantes
        relevant_topics = self._identify_relevant_topics(context)
        
        # Aprende sobre tópicos que não conhece
        knowledge_entries = []
        for topic in relevant_topics:
            entry = await self.learn_about(topic)
            knowledge_entries.append(entry)
        
        # Combina conhecimentos
        combined_knowledge = self._combine_knowledge(knowledge_entries)
        
        return {
            "context": context,
            "relevant_topics": relevant_topics,
            "knowledge": combined_knowledge,
            "sources": [s for e in knowledge_entries for s in e.sources],
            "confidence": sum(e.confidence for e in knowledge_entries) / len(knowledge_entries) if knowledge_entries else 0.0
        }
    
    def _identify_relevant_topics(self, context: str) -> List[str]:
        """Identifica tópicos relevantes no contexto"""
        context_lower = context.lower()
        
        # Tópicos base sempre relevantes
        topics = []
        
        # Detecta ticker
        words = context.split()
        for word in words:
            if word.isupper() and len(word) <= 5:
                topics.append(f"{word} stock analysis")
        
        # Detecta conceitos financeiros
        financial_concepts = {
            "sentiment": "market sentiment analysis",
            "volatility": "market volatility",
            "risk": "risk management",
            "technical": "technical analysis",
            "fundamental": "fundamental analysis",
            "earnings": "earnings reports",
            "dividend": "dividend investing"
        }
        
        for keyword, topic in financial_concepts.items():
            if keyword in context_lower:
                topics.append(topic)
        
        return topics[:3]  # Limita a 3 tópicos mais relevantes
    
    def _combine_knowledge(self, entries: List[LearningEntry]) -> str:
        """Combina múltiplas entradas de conhecimento"""
        if not entries:
            return "No relevant knowledge available"
        
        combined = "**Relevant Knowledge:**\n\n"
        for entry in entries:
            combined += f"**{entry.topic}**\n{entry.knowledge}\n\n"
        
        return combined
    
    def get_learning_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas de aprendizado"""
        if not self.knowledge:
            return {"total_topics": 0}
        
        total = len(self.knowledge)
        avg_confidence = sum(e.confidence for e in self.knowledge.values()) / total
        most_used = max(self.knowledge.values(), key=lambda e: e.use_count)
        
        return {
            "total_topics": total,
            "average_confidence": avg_confidence,
            "most_used_topic": most_used.topic,
            "most_used_count": most_used.use_count,
            "total_sources": sum(len(e.sources) for e in self.knowledge.values())
        }
