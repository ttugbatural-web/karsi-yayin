(function () {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    .kar-reading-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 22px;padding:12px 14px;background:#fff;border:1px solid #ddd;border-left:4px solid #c40000;font:13px/1.4 Arial,Helvetica,sans-serif}
    .kar-reading-tools__meta{color:#666}
    .kar-reading-tools__actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .kar-reading-tools button{border:1px solid #bbb;background:#fff;color:#111;padding:8px 10px;font:700 12px Arial,Helvetica,sans-serif;cursor:pointer}
    .kar-reading-tools button:hover{border-color:#c40000;color:#c40000}
    .kar-reading-tools button:focus-visible{outline:3px solid #c40000;outline-offset:2px}
    .kar-reading-tools a{display:inline-block;border:1px solid #bbb;background:#fff;color:#111;padding:8px 10px;font:700 12px Arial,Helvetica,sans-serif;text-decoration:none}
    .kar-reading-tools a:hover{border-color:#c40000;color:#c40000}
    .kar-reading-tools a:focus-visible{outline:3px solid #c40000;outline-offset:2px}
    .kar-reading-tools__status{width:100%;color:#246024;font-size:12px}
    @media(max-width:520px){.kar-reading-tools{align-items:flex-start}.kar-reading-tools__actions{width:100%}.kar-reading-tools button{flex:1}}
    @media(prefers-reduced-motion:reduce){.kar-reading-tools *{scroll-behavior:auto!important}}
  `;
  document.head.appendChild(style);

  function makeButton(label, title, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    button.addEventListener("click", handler);
    return button;
  }

  function setup(content) {
    if (!content || content.dataset.readingToolsReady === "true") return;
    content.dataset.readingToolsReady = "true";

    const titleElement = document.querySelector("#articleTitle, .article-title, h1");
    const title = titleElement ? titleElement.textContent.trim() : document.title;
    const toolbar = document.createElement("section");
    toolbar.className = "kar-reading-tools";
    toolbar.setAttribute("aria-label", "Okuma araçları");

    const meta = document.createElement("span");
    meta.className = "kar-reading-tools__meta";
    const actions = document.createElement("div");
    actions.className = "kar-reading-tools__actions";
    const status = document.createElement("span");
    status.className = "kar-reading-tools__status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    function updateReadingTime() {
      const text = (content.innerText || content.textContent || "").trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const minutes = Math.max(1, Math.ceil(words / 200));
      meta.textContent = "Yaklaşık " + minutes + " dk okuma";
    }

    let fontSize = parseFloat(window.getComputedStyle(content).fontSize);
    if (!Number.isFinite(fontSize)) fontSize = 18;
    fontSize = Math.min(26, Math.max(16, fontSize));

    actions.appendChild(makeButton("A−", "Yazı boyutunu küçült", function () {
      fontSize = Math.max(16, fontSize - 1);
      content.style.fontSize = fontSize + "px";
    }));
    actions.appendChild(makeButton("A+", "Yazı boyutunu büyüt", function () {
      fontSize = Math.min(26, fontSize + 1);
      content.style.fontSize = fontSize + "px";
    }));
    actions.appendChild(makeButton("Paylaş", "Bu yazıyı paylaş", async function () {
      status.textContent = "";
      const shareData = { title: title || "KARŞIDAN", text: title || "KARŞIDAN içeriği", url: window.location.href };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(window.location.href);
          status.textContent = "Bağlantı panoya kopyalandı.";
        } else {
          window.prompt("İçerik bağlantısını kopyalayın:", window.location.href);
        }
      } catch (error) {
        if (error && error.name !== "AbortError") status.textContent = "Paylaşım açılamadı. Bağlantıyı adres çubuğundan kopyalayabilirsiniz.";
      }
    }));

    const searchLink = document.createElement("a");
    searchLink.href = "arama.html";
    searchLink.textContent = "Ara";
    searchLink.setAttribute("aria-label", "KARŞIDAN arşivinde ara");
    actions.appendChild(searchLink);

    toolbar.appendChild(meta);
    toolbar.appendChild(actions);
    toolbar.appendChild(status);
    content.parentNode.insertBefore(toolbar, content);
    updateReadingTime();
  }

  function findArticleContent() {
    const path = window.location.pathname.toLowerCase();
    if (!/(kose-yazisi|gundem-haber|dunya-haber|dosya)\.html$/.test(path)) return;
    const content = document.querySelector("#articleContent, #articleBody, .article-content");
    if (content && content.offsetParent !== null) setup(content);
  }

  findArticleContent();
  const observer = new MutationObserver(function () {
    findArticleContent();
    if (document.querySelector(".kar-reading-tools")) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "class"] });
  window.addEventListener("load", findArticleContent, { once: true });
})();