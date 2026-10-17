(function () {
  "use strict";
  const SUPABASE_URL = "https://rfqiffvudbmphvklxetf.supabase.co";
  const SUPABASE_KEY = "sb_publishable_FZQzfS0NBm0wZCSzV6dyvg_7mNUW-65";
  const menuDefaults = {home:true,columns:true,news:true,gundem:true,dunya:true,files:true,about:true};
  const map = {
    "index.html":"home",
    "kose-yazilari.html":"columns",
    "haberler.html":"news",
    "gundem.html":"gundem",
    "karsi-gundem.html":"gundem",
    "dunya.html":"dunya",
    "dosyalar.html":"files",
    "hakkimizda.html":"about"
  };
  // Ana sayfadaki içerik sütunları da aynı görünürlük ayarını izler.
  const sectionSelectors = {
    news: [".column-news", '[data-menu-section="news"]']
  };
  function loadLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  async function applyMenu() {
    try {
      await loadLibrary();
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const {data, error} = await client.from("ayarlar").select("menu_gorunurlugu").eq("id",1).maybeSingle();
      if (error || !data) return;
      const visibility = Object.assign({}, menuDefaults, data.menu_gorunurlugu || {});
      document.querySelectorAll("nav a[href]").forEach(function (link) {
        const file = (new URL(link.getAttribute("href"), window.location.href)).pathname.split("/").pop();
        const key = map[file];
        if (!key) return;
        link.hidden = visibility[key] === false;
        link.setAttribute("aria-hidden", visibility[key] === false ? "true" : "false");
      });
      Object.keys(sectionSelectors).forEach(function (key) {
        const hidden = visibility[key] === false;
        sectionSelectors[key].forEach(function (selector) {
          document.querySelectorAll(selector).forEach(function (section) {
            section.hidden = hidden;
            section.setAttribute("aria-hidden", hidden ? "true" : "false");
          });
        });
      });
    } catch (error) {
      console.warn("Site menüsü ayarları yüklenemedi; varsayılan menü korunuyor.", error);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyMenu);
  else applyMenu();
})();
