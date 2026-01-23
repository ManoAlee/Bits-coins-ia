from itertools import cycle
from loguru import logger
import os

class KeyManager:
    """
    The Fuel Injector.
    Rotates through a swarm of API keys to maintain infinite energy.
    """
    _instance = None
    _keys = []
    _iterator = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KeyManager, cls).__new__(cls)
            cls._instance._load_keys()
        return cls._instance

    def _load_keys(self):
        try:
            with open("openai_keys.list", "r") as f:
                self._keys = [line.strip() for line in f if line.strip()]
            
            if not self._keys:
                logger.warning("KEY VAULT EMPTY. OPERATING ON LOW POWER.")
                return

            self._iterator = cycle(self._keys)
            logger.info(f">> KEY MANAGER INITIALIZED. {len(self._keys)} KEYS LOADED.")
            logger.info(">> INFINITE ENERGY MODE: ENABLED.")
            
        except FileNotFoundError:
            logger.error("KEY VAULT NOT FOUND (openai_keys.list).")

    def get_next_key(self) -> str:
        """
        Returns the next active key from the swarm.
        """
        if not self._keys:
            return os.getenv("OPENAI_API_KEY", "")
        
        key = next(self._iterator)
        logger.debug(f"ROTATING KEY: {key[:8]}...***")
        return key

    @property
    def total_keys(self) -> int:
        return len(self._keys)
