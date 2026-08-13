#!/usr/bin/env python3
"""
Minimal flat-style badge SVG generator (a shields.io lookalike, rendered
locally). This repo is private, and shields.io's `img.shields.io/endpoint`
badge feature fetches the referenced JSON from its own server with no GitHub
auth — so it always 404s against a private repo's raw content. Rendering the
badge ourselves and embedding it by a relative path sidesteps that: GitHub
serves relative-path images through the viewer's own authenticated session,
same as it does for the README's private-repo content generally.

Usage: python3 scripts/render_badge.py <label> <message> <color> <output.svg>
color is a shields.io color name (green/yellow/red/lightgrey/blue/...) or a
literal #hex.
"""
import sys

COLORS = {
    "green": "#4c1",
    "yellow": "#dfb317",
    "red": "#e05d44",
    "lightgrey": "#9f9f9f",
    "blue": "#007ec6",
}


def _text_width(s):
    # Rough average glyph width for Verdana 11px — good enough for a badge,
    # not trying to be pixel-perfect.
    return sum(7 if c.isupper() else 6 for c in s) + 10


def render(label, message, color_name):
    color = COLORS.get(color_name, color_name if color_name.startswith("#") else COLORS["lightgrey"])
    label_w = _text_width(label)
    msg_w = _text_width(message)
    total_w = label_w + msg_w
    height = 20
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{total_w}" height="{height}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="{total_w}" height="{height}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="{label_w}" height="{height}" fill="#555"/>
    <rect x="{label_w}" width="{msg_w}" height="{height}" fill="{color}"/>
    <rect width="{total_w}" height="{height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
    <text x="{label_w / 2}" y="14">{label}</text>
    <text x="{label_w + msg_w / 2}" y="14">{message}</text>
  </g>
</svg>'''


if __name__ == "__main__":
    label, message, color_name, out_path = sys.argv[1:5]
    with open(out_path, "w") as f:
        f.write(render(label, message, color_name))
