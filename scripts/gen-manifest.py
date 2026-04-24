#!/usr/bin/env python3
"""Generate latest.json for Tauri updater from a published GitHub release."""
import json, os
import urllib.request

REPO  = os.environ["GITHUB_REPOSITORY"]
TAG   = os.environ["GITHUB_REF_NAME"]
TOKEN = os.environ.get("GITHUB_TOKEN", "")

BASE    = "https://api.github.com"
HEADERS = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
if TOKEN:
    HEADERS["Authorization"] = f"Bearer {TOKEN}"


def fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def fetch_text(url: str) -> str:
    h = {**HEADERS, "Accept": "application/octet-stream"}
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req) as r:
        return r.read().decode()


release = fetch(f"{BASE}/repos/{REPO}/releases/tags/{TAG}")
assets  = {a["name"]: a for a in release["assets"]}

PLATFORM_SUFFIXES = [
    ("darwin-aarch64", "aarch64.app.tar.gz"),
    ("darwin-x86_64",  "x64.app.tar.gz"),
    ("linux-x86_64",   "amd64.AppImage.tar.gz"),
    ("windows-x86_64", "x64-setup.nsis.zip"),
]

platforms: dict = {}
for platform, suffix in PLATFORM_SUFFIXES:
    tar_key = next((k for k in assets if k.endswith(suffix)), None)
    if not tar_key:
        continue
    sig_key = tar_key + ".sig"
    if sig_key not in assets:
        continue
    signature = fetch_text(assets[sig_key]["url"])
    platforms[platform] = {
        "signature": signature.strip(),
        "url": assets[tar_key]["browser_download_url"],
    }

manifest = {
    "version": TAG,
    "notes":   release.get("body", ""),
    "pub_date": release.get("published_at", ""),
    "platforms": platforms,
}

print(json.dumps(manifest, indent=2))
