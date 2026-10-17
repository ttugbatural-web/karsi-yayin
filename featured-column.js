(function () {
  "use strict";

  const SUPABASE_URL = "https://rfqiffvudbmphvklxetf.supabase.co";
  const SUPABASE_KEY = "sb_publishable_FZQzfS0NBm0wZCSzV6dyvg_7mNUW-65";

  const style = document.createElement("style");
  style.textContent = `
    .featured-column{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:0;margin:0 0 30px;background:#111;color:#fff;border-bottom:4px solid #c40000;min-width:0}
    .featured-column[hidden]{display:none}
    .featured-column--text-only{grid-template-columns:1fr}
    .featured-column__image{width:100%;height:100%;min-height:240px;object-fit:cover;display:block;background:#292929}
    .featured-column__body{padding:clamp(22px,4vw,38px);display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
    .featured-column__eyebrow{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#ff6565;margin-bottom:12px}
    .featured-column__title{font:700 clamp(25px,3.2vw,38px)/1.16 Georgia,"Times New Roman",serif;margin:0 0 13px}
    .featured-column__title a{color:#fff;text-decoration:none}
    .featured-column__title a:hover{text-decoration:underline;text-decoration-color:#c40000;text-decoration-thickness:3px;text-underline-offset:4px}
    .featured-column__summary{font:15px/1.65 Georgia,"Times New Roman",serif;color:#d1d1d1;margin:0 0 17px}
    .featured-column__meta{font-size:12px;color:#aaa;margin-bottom:20px}
    .featured-column__read{display:inline-block;background:#c40000;color:#fff;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.8px;padding:12px 15px}
    .featured-column__read:hover{background:#a50000}
    @media(max-width:700px){.featured-column{grid-template-columns:1fr}.featured-column__image{height:220px;min-height:0}.featured-column__body{padding:23px}.featured-column__title{font-size:29px}}
    @media(prefers-reduced-motion:reduce){.featured-column *{scroll-behavior:auto!important}}
  `;
  document.head.appendChild(style);

  function element(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = String(text);
    return item;
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(String(value || ""));
      return url.protocol === "https:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  }

  function removeDuplicateFromColumn(slug) {
    const list = document.getElementById("koseList");
    if (!list || !slug) return;
    list.querySelectorAll('a[href*="kose-yazisi.html"]').forEach(function (link) {
      try {
        const linkSlug = new URL(link.href, window.location.href).searchParams.get("slug");
        if (linkSlug === slug) link.remove();
      } catch (_) {}
    });
  }

  async function renderSpotlight() {
    const intro = document.querySelector(".home-intro");
    if (!intro || !window.supabase || !window.supabase.createClient) return;

    const section = element("section", "featured-column");
    section.hidden = true;
    section.setAttribute("aria-label", "En yeni köşe yazısı");
    intro.insertAdjacentElement("afterend", section);

    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await db
      .from("kose_yazilari")
      .select("id,baslik,ozet,slug,kategori,yayin_tarihi,kapak_fotografi_url,yazarlar(ad_soyad)")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.slug || !data.baslik) {
      section.remove();
      if (error) console.warn("En yeni köşe yazısı gösterilemedi:", error.message);
      return;
    }

    const url = "kose-yazisi.html?slug=" + encodeURIComponent(data.slug);
    const imageUrl = safeImageUrl(data.kapak_fotografi_url);
    if (imageUrl) {
      const image = element("img", "featured-column__image");
      image.src = imageUrl;
      image.alt = data.baslik;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () { image.remove(); section.classList.add("featured-column--text-only"); }, { once: true });
      section.appendChild(image);
    } else {
      section.classList.add("featured-column--text-only");
    }

    const body = element("div", "featured-column__body");
    body.appendChild(element("div", "featured-column__eyebrow", "En yeni köşe yazısı"));
    const heading = element("h2", "featured-column__title");
    const titleLink = element("a", "", data.baslik);
    titleLink.href = url;
    heading.appendChild(titleLink);
    body.appendChild(heading);

    if (data.ozet) body.appendChild(element("p", "featured-column__summary", data.ozet));

    const metaParts = [];
    if (data.yazarlar && data.yazarlar.ad_soyad) metaParts.push(data.yazarlar.ad_soyad);
    const date = formatDate(data.yayin_tarihi);
    if (date) metaParts.push(date);
    if (metaParts.length) body.appendChild(element("div", "featured-column__meta", metaParts.join(" · ")));

    const read = element("a", "featured-column__read", "YAZIYI OKU →");
    read.href = url;
    body.appendChild(read);
    section.appendChild(body);
    section.hidden = false;

    removeDuplicateFromColumn(data.slug);
    const list = document.getElementById("koseList");
    if (list) {
      const observer = new MutationObserver(function () {
        removeDuplicateFromColumn(data.slug);
        const links = Array.from(list.querySelectorAll('a[href*="kose-yazisi.html"]'));
        const duplicateRemains = links.some(function (link) {
          try { return new URL(link.href, window.location.href).searchParams.get("slug") === data.slug; }
          catch (_) { return false; }
        });
        if (list.querySelectorAll("a.home-item").length > 0 && !duplicateRemains) observer.disconnect();
      });
      observer.observe(list, { childList: true, subtree: true });
      const existingLinks = Array.from(list.querySelectorAll('a[href*="kose-yazisi.html"]'));
      const duplicateAlreadyRemoved = !existingLinks.some(function (link) {
        try { return new URL(link.href, window.location.href).searchParams.get("slug") === data.slug; }
        catch (_) { return false; }
      });
      if (list.querySelectorAll("a.home-item").length > 0 && duplicateAlreadyRemoved) observer.disconnect();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSpotlight, { once: true });
  } else {
    renderSpotlight();
  }
})();