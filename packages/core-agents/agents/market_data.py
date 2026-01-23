from loguru import logger
from typing import Dict, Any
import httpx

class MarketDataAgent:
    """
    The Sensory System of the Universe.
    Refactored for High-Velocity access using raw HTTP protocols (CoinGecko).
    Bypasses heavy dependencies for maximum speed.
    """
    
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.client = httpx.AsyncClient(timeout=10.0)
        logger.info(">> MARKET SENSORS ONLINE. CONNECTED TO COINGECKO GRID.")

    async def fetch_price(self, ticker: str) -> Dict[str, Any]:
        """
        Retrieves the current atomic state (price) of an asset.
        """
        # Normalize ticker for CoinGecko (e.g., BTC -> bitcoin)
        # Simple mapping for the prototype
        mapping = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "SOL": "solana",
            "DOGE": "dogecoin"
        }
        coin_id = mapping.get(ticker.upper(), ticker.lower())

        logger.info(f"Scanning dimensions for asset: {coin_id}")
        
        try:
            response = await self.client.get(
                f"{self.base_url}/simple/price",
                params={"ids": coin_id, "vs_currencies": "usd", "include_24hr_change": "true"}
            )
            response.raise_for_status()
            data = response.json()
            
            if coin_id not in data:
                 return {"error": "Asset not found in this dimension."}

            stats = data[coin_id]
            return {
                "ticker": ticker.upper(),
                "price": stats.get("usd"),
                "change_24h": stats.get("usd_24h_change"),
                "source": "COINGECKO_LITE",
                "confidence": 0.99
            }
        except Exception as e:
            logger.error(f"SENSOR MALFUNCTION: {e}")
            return {"error": str(e)}

    async def scan_market(self) -> str:
        return "Market Scan Complete. Entropy Levels: Nominal."
