import importlib
import pkgutil
from pathlib import Path

from fastapi import APIRouter

v1_router = APIRouter()


endpoints_path = Path(__file__).parent / "endpoints"
for module_info in pkgutil.iter_modules([str(endpoints_path)]):
    if module_info.name == "__init__":
        continue    
    try:
        module = importlib.import_module(f".endpoints.{module_info.name}", package=__package__)
        if hasattr(module, "router"):
            prefix = getattr(module, "prefix", f"/{module_info.name}")
            tags = getattr(module, "tags", [module_info.name.capitalize()])
            
            v1_router.include_router(module.router, prefix=prefix, tags=tags)
    except ImportError as e:
        print(e) # change it to log