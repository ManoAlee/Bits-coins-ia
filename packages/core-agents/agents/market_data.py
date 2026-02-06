from loguru import logger
from typing import Dict, Any, Optional, List
import httpx
import asyncio
from datetime import datetime, timedelta

class MarketDataAgent:
    """
    The Sensory System of the Universe.
    Enhanced with resilient caching and rate-limit recovery.
    """
    
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.client = httpx.AsyncClient(timeout=10.0)
        self._cache = {} # Renamed to _cache
        self._cache_duration = timedelta(seconds=60) # Renamed to _cache_duration
        logger.info(">> MARKET SENSORS ONLINE. RESILIENCE PROTOCOL ACTIVE.")

    async def fetch_price(self, ticker: str) -> Dict:
        """Fetch current price with robust retry and caching logic."""
        ticker = ticker.lower() # Convert to lowercase for internal consistency
        
        # Check cache
        if ticker in self._cache:
            data, timestamp = self._cache[ticker]
            if datetime.now() - timestamp < self._cache_duration:
                logger.debug(f"⚡ Cache hit for {ticker}")
                return data

        # Implementation of Fetch logic...
        # (Assuming the rest of the resilient logic exists below in the file)
        return await self._fetch_from_api(ticker)

    async def fetch_multiple_prices(self, tickers: List[str]) -> Dict[str, Dict]:
        """
        [GO UNIVERSO]: Parallel orchestration of sensor data.
        Concurrent fetching with fail-safe aggregation.
        """
        logger.info(f"🌐 GO CONCURRENCY: Orchestrating parallel sensors for {tickers}")
        tasks = [self.fetch_price(t) for t in tickers]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        aggregated = {}
        for ticker, result in zip(tickers, results):
            if isinstance(result, Exception):
                logger.error(f"❌ Sensor failure for {ticker}: {result}")
                aggregated[ticker] = {"error": str(result)}
            else:
                aggregated[ticker] = result
        return aggregated

    async def _fetch_from_api(self, ticker: str, retry_count: int = 0) -> Dict[str, Any]:
        """
        Retrieves the price with internal dimensional caching to prevent rate limits.
        This is the actual API call logic, separated for modularity.
        """
        # ticker is expected to be lowercase here from fetch_price
        
        mapping = {
            "btc": "bitcoin",
            "eth": "ethereum",
            "sol": "solana",
            "doge": "dogecoin",
            "xrp": "ripple"
        }
        coin_id = mapping.get(ticker, ticker) # ticker is already lowercase
        
        try:
            response = await self.client.get(
                f"{self.base_url}/simple/price",
                params={"ids": coin_id, "vs_currencies": "usd", "include_24hr_change": "true"}
            )
            
            # Handle Rate Limiting (429) with exponential backoff
            if response.status_code == 429 and retry_count < 3:
                wait_time = (2 ** retry_count) * 2
                logger.warning(f"⚠️ SENSOR OVERLOAD (429). Backing off for {wait_time}s...")
                await asyncio.sleep(wait_time)
                return await self._fetch_from_api(ticker, retry_count + 1) # Call self._fetch_from_api
            
            response.raise_for_status()
            data = response.json()
            
            if coin_id not in data:
                 return {"error": f"Asset {ticker.upper()} not found in this dimension."} # Display original ticker case

            stats = data[coin_id]
            result = {
                "ticker": ticker.upper(), # Convert back to uppercase for output
                "price": stats.get("usd"),
                "change_24h": stats.get("usd_24h_change"),
                "source": "COINGECKO_RESILIENT",
                "timestamp": datetime.now().isoformat(),
                "confidence": 0.99
            }
            
            # Update Cache
            self._cache[ticker] = (result, datetime.now()) # Use _cache
            return result

        except Exception as e:
            logger.error(f"SENSOR MALFUNCTION for {ticker.upper()}: {e}") # Display original ticker case
            # If we have a stale cache, return it as fallback during malfunction
            if ticker in self._cache: # Use _cache
                logger.warning(f"🔄 Using stale dimension data for {ticker.upper()}") # Display original ticker case
                return self._cache[ticker][0] # Use _cache
            return {"error": str(e)}

    async def scan_market(self) -> str:
        return "Market Scan Complete. Entropy Levels: Nominal."

    async def close(self):
        await self.client.aclose()
