"""Maigret username enumeration wrapper.

Maigret checks 2500+ sites (vs Sherlock's ~400).
Runs `maigret <username>` as subprocess, parses JSON/CSV output.
"""

import csv
import json
import logging
import subprocess
import tempfile
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def run_maigret(username: str, timeout: int | None = None) -> dict:
    """Run maigret against a username.

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
        cmd = [
            "maigret",
            username,
            "--json", "simple",
            "--folderoutput", tmpdir,
            "--timeout", "15",
            "--no-color",
            "--retries", "1",
        ]

        if settings.PROXY_URL:
            cmd.extend(["--proxy", settings.PROXY_URL])

        logger.info(f"[Maigret] Running: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tmpdir,
            )

            # Look for JSON output file
            json_files = list(Path(tmpdir).glob("*.json"))
            if json_files:
                with open(json_files[0]) as f:
                    raw = json.load(f)

                # Maigret JSON: list of dicts or dict of dicts
                items = raw if isinstance(raw, list) else raw.values() if isinstance(raw, dict) else []
                for item in items:
                    if isinstance(item, dict):
                        site = item.get("sitename", item.get("site", "unknown"))
                        url = item.get("url", item.get("link", ""))
                        if url:
                            accounts.append({
                                "site": site,
                                "url": url,
                                "detail": f"Username '{username}' found on {site}",
                                "confidence": 75,
                                "tags": item.get("tags", []),
                            })
            else:
                # Fallback: parse CSV output
                csv_files = list(Path(tmpdir).glob("*.csv"))
                if csv_files:
                    with open(csv_files[0]) as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            url = row.get("url", row.get("link", ""))
                            if url:
                                accounts.append({
                                    "site": row.get("site", "unknown"),
                                    "url": url,
                                    "detail": f"Username '{username}' found on {row.get('site', 'unknown')}",
                                    "confidence": 70,
                                })
                else:
                    # Last resort: parse stdout
                    for line in result.stdout.splitlines():
                        if "[+]" in line and "http" in line:
                            parts = line.split("[+]")[-1].strip().split(":", 1)
                            if len(parts) >= 2:
                                accounts.append({
                                    "site": parts[0].strip(),
                                    "url": parts[1].strip().split()[0] if parts[1].strip() else "",
                                    "detail": f"Username '{username}' found on {parts[0].strip()}",
                                    "confidence": 65,
                                })

            if result.returncode != 0 and not accounts:
                logger.warning(f"[Maigret] Non-zero exit ({result.returncode}): {result.stderr[:500]}")

        except subprocess.TimeoutExpired:
            logger.warning(f"[Maigret] Timeout after {timeout}s for username '{username}'")
        except FileNotFoundError:
            logger.error("[Maigret] maigret binary not found — install with: pip install maigret")
            return {"username": username, "accounts": [], "total_found": 0, "error": "maigret not installed"}

    return {
        "username": username,
        "accounts": accounts,
        "total_found": len(accounts),
    }
