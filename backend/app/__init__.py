"""Mello AI Backend Application Package."""

import sys
import types
from pathlib import Path

# Ensure 'backend' package is always resolvable regardless of working directory
_app_dir = Path(__file__).resolve().parent
_backend_dir = _app_dir.parent
_repo_root = _backend_dir.parent

for _p in [str(_repo_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [str(_backend_dir)]
    sys.modules["backend"] = _pkg

__version__ = "0.1.0"
