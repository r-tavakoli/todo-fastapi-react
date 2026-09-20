from datetime import datetime, timezone

from redis.asyncio import Redis

from app.config import db_settings

_token_black_list = Redis.from_url(db_settings.REDIS_URL())

async def add_jti_to_blacklist(jti: str):
    await _token_black_list.hset(
        f"blacklist:{jti}",
        mapping={
            "id": jti,
            "status": "blacklisted",     
            "created_at": datetime.now(timezone.utc).isoformat(),                   
        }
    )
    
async def jti_is_blacklisted(jti: str) -> bool:
    return await _token_black_list.exists(f"blacklist:{jti}")