import os
import json
from typing import Any, Optional


class CacheManager:
    def __init__(self, cache_dir: str = "/app/cache", cache_file: str = "cache.json"):
        self.cache_dir = cache_dir
        self.cache_path = os.path.join(cache_dir, cache_file)
        os.makedirs(self.cache_dir, exist_ok=True)

        if not os.path.exists(self.cache_path):
            self._write_cache({})

    def _read_cache(self) -> dict:
        try:
            with open(self.cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_cache(self, data: dict):
        with open(self.cache_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def set(self, key: str, value: Any):
        data = self._read_cache()
        data[key] = value
        self._write_cache(data)

    def get(self, key: str) -> Optional[Any]:
        return self._read_cache().get(key)

    def delete(self, key: str) -> bool:
        data = self._read_cache()
        if key in data:
            del data[key]
            self._write_cache(data)
            return True
        return False

    def clear(self):
        self._write_cache({})

    def keys(self):
        return list(self._read_cache().keys())

    def has(self, key: str) -> bool:
        return key in self._read_cache()
