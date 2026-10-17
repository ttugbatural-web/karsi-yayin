#!/usr/bin/env python3
"""Regenerate the KARŞIDAN sitemap from published Supabase content."""
import os
import sys
import json
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

BASE_URL = "https://karsidan.com.tr"
SUPABASE_URL = os.environ.get("KARSI_SUPABASE_URL", "https://rfqiffvudbmphvklxetf.supabase.co").rstrip("/")
# This is the same public publishable key already used by the public site.
SUPABASE_KEY = os.environ.get("KARSI_SUPABASE_ANON_KEY", "sb_publishable_FZQzfS0NBm0wZCSzV6dyvg_7mNUW-65")

STATIC_PATHS = [
    "/", "/gundem.html", "/gundem-haber.html", "/haberler.html",
    "/dunya.html", "/kose-yazilari.html", "/kose-yazisi.html",
    "/dosyalar.html", "/dosya.html", "/hakkimizda.html",
    "/dunya-haber.html",
]
TABLES = [
    ("kose_yazilari", "kose-yazisi.html"),
    ("haberler", "gundem-haber.html"),
    ("dunya_haberleri", "dunya-haber.html"),
    ("dosyalar", "dosya.html"),
]
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", NS)


def fetch_published_slugs(table):
    rows = []
    offset = 0
    page_size = 500
    while True:
        params = urllib.parse.urlencode({
            "select": "slug,yayin_tarihi",
            "durum": "eq.yayinda",
            "slug": "not.is.null",
            "order": "yayin_tarihi.desc",
            "limit": str(page_size),
            "offset": str(offset),
        })
        url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
        request = urllib.request.Request(url, headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Accept": "application/json",
            "User-Agent": "KarsidanSitemapBot/1.0",
        })
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                batch = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"{table} tablosu okunamadı; sitemap korunacak: {exc}") from exc
        if not isinstance(batch, list):
            raise RuntimeError(f"{table} beklenmeyen yanıt döndürdü; sitemap korunacak.")
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def valid_lastmod(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.date().isoformat()
    except ValueError:
        return None


def main():
    urls = {}
    today = datetime.now(timezone.utc).date().isoformat()
    for path in STATIC_PATHS:
        urls[BASE_URL + path] = today

    for table, detail_page in TABLES:
        for row in fetch_published_slugs(table):
            slug = str(row.get("slug") or "").strip()
            if not slug:
                continue
            query = urllib.parse.urlencode({"slug": slug})
            loc = f"{BASE_URL}/{detail_page}?{query}"
            lastmod = valid_lastmod(row.get("yayin_tarihi"))
            urls[loc] = lastmod or today

    root = ET.Element(f"{{{NS}}}urlset")
    for loc in sorted(urls):
        entry = ET.SubElement(root, f"{{{NS}}}url")
        ET.SubElement(entry, f"{{{NS}}}loc").text = loc
        ET.SubElement(entry, f"{{{NS}}}lastmod").text = urls[loc]

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    output_path = "sitemap.xml"
    temporary_path = output_path + ".tmp"
    tree.write(temporary_path, encoding="utf-8", xml_declaration=True)
    # Parse the completed file before replacing the published sitemap.
    ET.parse(temporary_path)
    os.replace(temporary_path, output_path)
    print(f"Sitemap regenerated: {len(urls)} URLs ({len(STATIC_PATHS)} static pages plus published content).")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
