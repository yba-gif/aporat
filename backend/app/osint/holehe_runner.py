"""Holehe email enumeration wrapper.

Holehe checks if an email address is registered on 120+ websites
without sending any notification to the target.
"""

import json
import logging
import subprocess
import tempfile
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def run_holehe(email: str, timeout: int | None = None) -> dict:
    """Run holehe against an email address.

    Returns:
        {
            "email": str,
            "accounts": [
                {"site": str, "url": str, "detail": str, "confidence": int, "exists": bool}
            ],
            "total_found": int,
        }
    """
    timeout = timeout or settings.OSINT_TIMEOUT
    accounts = []

    with tempfile.TemporaryDirectory() as tmpdir:
        output_file = Path(tmpdir) / "holehe_output.json"

        # Holehe can be run as: holehe email@example.com
        # or via Python: python -m holehe email@example.com
        cmd = [
            "holehe",
            email,
            "--only-used",
            "--no-color",
        ]

        logger.info(f"[Holehe] Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tmpdir,
            )

            # Parse stdout — holehe outputs lines like:
            # [+] example.com
            # [-] othersite.com
            for line in result.stdout.splitlines():
                line = line.strip()

                if line.startswith("[+]"):
                    # Email is registered on this site
                    site = line.replace("[+]", "").strip()
                    # Clean up any ANSI codes
                    site = _strip_ansi(site)
                    if site:
                        accounts.append({
                            "site": site,
                            "url": f"https://{site}",
                            "detail": f"Email '{email}' is registered on {site}",
                            "confidence": 85,
                            "exists": True,
                        })

            if result.returncode != 0 and not accounts:
                logger.warning(f"[Holehe] Non-zero exit ({result.returncode}): {result.stderr[:500]}")

        except subprocess.TimeoutExpired:
            logger.warning(f"[Holehe] Timeout after {timeout}s for email '{email}'")
        except FileNotFoundError:
            logger.error("[Holehe] holehe binary not found — install with: pip install holehe")
            return {"email": email, "accounts": [], "total_found": 0, "error": "holehe not installed"}

    return {
        "email": email,
        "accounts": accounts,
        "total_found": len(accounts),
    }


def _strip_ansi(text: str) -> str:
    """Remove ANSI escape codes from text."""
    import re
    return re.sub(r"\x1b\[[0-9;]*m", "", text).strip()
