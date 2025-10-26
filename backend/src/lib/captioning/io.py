"""Media download and probing helpers."""
from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Dict

import requests


def download_to_temp(source: str) -> str:
    """Download a URL or copy a local file to a temporary path."""

    path = Path(source)
    if path.exists():
        suffix = path.suffix
        tmp = tempfile.NamedTemporaryFile("wb", suffix=suffix, delete=False)
        with tmp, path.open("rb") as src:
            shutil.copyfileobj(src, tmp)
        return tmp.name

    try:
        response = requests.get(source, timeout=20, stream=True)
    except requests.RequestException as exc:  # pragma: no cover - network error reporting
        raise RuntimeError(f"Failed to download {source!r}: {exc}") from exc

    with response:
        if response.status_code != 200:
            raise RuntimeError(
                f"Failed to download {source!r}: HTTP {response.status_code}"
            )

        suffix = Path(Path(source).name).suffix or ""
        tmp = tempfile.NamedTemporaryFile("wb", suffix=suffix, delete=False)
        with tmp:
            for chunk in response.iter_content(chunk_size=64 * 1024):
                if chunk:
                    tmp.write(chunk)
    return tmp.name


def ffprobe_json(src_url: str) -> Dict[str, object]:
    """Run ffprobe and return the parsed JSON output."""

    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_streams",
        "-show_format",
        src_url,
    ]
    try:
        completed = subprocess.run(
            cmd,
            check=True,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            close_fds=True,
        )
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr[-500:]
        raise RuntimeError(f"ffprobe failed: {stderr}") from exc
    try:
        return json.loads(completed.stdout or "{}")
    except json.JSONDecodeError as exc:  # pragma: no cover - unexpected ffprobe output
        raise ValueError("ffprobe produced invalid JSON") from exc
