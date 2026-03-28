"""Sherlock username enumeration wrapper.

Runs `sherlock <username>` as a subprocess, parses the output into
structured account findings.
"""

import json
import logging
import subprocess
import tempfile
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def run_sherlock(username: str, timeout: int | None = None) -> dict:
    """Run sherlock-project against a username.

    Returns:
        {
            "username": str,
            "accounts": [
                {"site": str, "url": str, "detail": str, "confidence": int}
            ],
            "total_found": int,
        }
    """
    timeout = timeout or settings.OSINT_TIMEOUT
    accounts = []

    with tempfile.TemporaryDirectory() as tmpdir:
        output_file = Path(tmpdir) / f"{username}.json"
        cmd = [
            "sherlock",
            username,
            "--json", str(output_file),
            "--timeout", "15",
            "--print-found",
        ]

        # Add proxy if configured
        if settings.PROXY_URL:
            cmd.extend(["--proxy", settings.PROXY_URL])

        logger.info(f"[Sherlock] Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tmpdir,
            )

            # Parse JSON output if it exists
            if output_file.exists():
                with open(output_file) as f:
                    raw = json.load(f)

                # Sherlock JSON format: { "SiteName": {"url_user": "...", "status": "Claimed"}, ... }
                for site_name, data in raw.items():
                    if isinstance(data, dict) and data.get("status") == "Claimed":
                        accounts.append({
                            "site": site_name,
                            "url": data.get("url_user", ""),
                            "detail": f"Username '{username}' found on {site_name}",
                            "confidence": 80,
                        })
            else:
                # Fallback: parse stdout
                for line in result.stdout.splitlines():
                    line = line.strip()
                    if line.startswith("[+]") or "http" in line:
                        # [+] SiteName: https://example.com/user
                        parts = line.replace("[+]", "").strip().split(":", 1)
                        if len(parts) == 2:
                            site = parts[0].strip()
                            url = parts[1].strip()
                            accounts.append({
                                "site": site,
                                "url": url,
                                "detail": f"Username '{username}' found on {site}",
                                "confidence": 75,
                            })

            if result.returncode != 0 and not accounts:
                logger.warning(f"[Sherlock] Non-zero exit ({result.returncode}): {result.stderr[:500]}")

        except subprocess.TimeoutExpired:
            logger.warning(f"[Sherlock] Timeout after {timeout}s for username '{username}'")
        except FileNotFoundError:
            logger.error("[Sherlock] sherlock binary not found — install with: pip install sherlock-project")
            return {"username": username, "accounts": [], "total_found": 0, "error": "sherlock not installed"}

    return {
        "username": username,
        "accounts": accounts,
        "total_found": len(accounts),
    }
