"""
Pings the live health endpoints, appends the result to status/history.json,
and regenerates a badge SVG + an SVG uptime graph from that history. Run on a
schedule by .github/workflows/uptime.yml (self-hosted, same pattern as the
coverage badges — no third-party uptime-monitor account).

The badge is rendered locally via render_badge.py rather than shields.io's
`img.shields.io/endpoint` feature: this repo is private, and shields.io fetches
the referenced JSON from its own server with no GitHub auth, so it always
404s against private raw content. A self-rendered SVG, referenced by the
README via a relative path, renders fine for any authenticated viewer instead.

Usage: python scripts/update_status.py
"""
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_badge import render as render_badge_svg  # noqa: E402

STATUS_DIR = Path(__file__).resolve().parent.parent / "status"
HISTORY_FILE = STATUS_DIR / "history.json"
MAX_HISTORY = 288  # 10-minute interval x 288 = 48 hours

TARGETS = [
    {"name": "backend", "url": "https://backend-production-cfcf.up.railway.app/api/health/"},
    {"name": "frontend", "url": "https://frontend-production-dbcf.up.railway.app/api/health"},
]


def check(url, timeout=10):
    start = time.monotonic()
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            latency_ms = round((time.monotonic() - start) * 1000)
            return resp.status == 200, latency_ms, resp.status
    except urllib.error.HTTPError as e:
        return False, round((time.monotonic() - start) * 1000), e.code
    except Exception:
        return False, None, None


def load_history():
    if HISTORY_FILE.exists():
        return json.loads(HISTORY_FILE.read_text())
    return {t["name"]: [] for t in TARGETS}


def save_history(history):
    STATUS_DIR.mkdir(exist_ok=True)
    HISTORY_FILE.write_text(json.dumps(history, indent=2))


def uptime_pct(entries):
    if not entries:
        return None
    return round(100 * sum(1 for e in entries if e["ok"]) / len(entries), 1)


def badge_color(pct):
    if pct is None:
        return "lightgrey"
    if pct >= 99:
        return "green"
    if pct >= 95:
        return "yellow"
    return "red"


def write_badge(name, pct):
    color = badge_color(pct)
    message = "unknown" if pct is None else f"{pct}%"
    (STATUS_DIR / f"uptime-{name}.svg").write_text(render_badge_svg(f"{name} uptime", message, color))


def write_graph_svg(name, entries):
    """A simple bar strip — one bar per check, green=up/red=down. No charting
    library needed; this is the same idea as a GitHub contributions graph."""
    width, height, bar_w, gap = 600, 60, 3, 1
    recent = entries[-120:]
    bars = []
    x = 0
    for e in recent:
        color = "#22c55e" if e["ok"] else "#ef4444"
        bars.append(f'<rect x="{x}" y="10" width="{bar_w}" height="40" fill="{color}"/>')
        x += bar_w + gap
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'
        f'<rect width="{width}" height="{height}" fill="#0d1117"/>'
        f'{"".join(bars)}'
        f'<text x="4" y="55" font-family="monospace" font-size="9" fill="#8b949e">{name}</text>'
        f"</svg>"
    )
    (STATUS_DIR / f"graph-{name}.svg").write_text(svg)


def main():
    history = load_history()
    now = int(time.time())

    for target in TARGETS:
        ok, latency_ms, http_status = check(target["url"])
        entries = history.setdefault(target["name"], [])
        entries.append({"t": now, "ok": ok, "latency_ms": latency_ms, "status": http_status})
        history[target["name"]] = entries[-MAX_HISTORY:]

        write_badge(target["name"], uptime_pct(history[target["name"]]))
        write_graph_svg(target["name"], history[target["name"]])
        print(f"{target['name']}: ok={ok} status={http_status} latency={latency_ms}ms")

    save_history(history)


if __name__ == "__main__":
    main()
