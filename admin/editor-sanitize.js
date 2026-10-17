/* KARŞIDAN: zengin metin HTML temizleyicisi.
   İstemci tarafı savunma katmanıdır; veritabanı RLS/yetkilendirmesinin yerini tutmaz. */
(function () {
  "use strict";

  const allowedTags = new Set([
    "P", "BR", "STRONG", "B", "EM", "I", "U", "S",
    "UL", "OL", "LI", "BLOCKQUOTE", "A", "SPAN",
    "DIV", "H2", "H3", "FONT", "IMG"
  ]);
  const blockedTags = new Set([
    "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM",
    "INPUT", "BUTTON", "TEXTAREA", "SELECT", "OPTION",
    "VIDEO", "AUDIO", "SOURCE", "META", "LINK",
    "BASE", "SVG", "MATH", "TEMPLATE"
  ]);
  const allowedStyles = new Set([
    "color", "background-color", "font-family", "font-size",
    "font-weight", "font-style", "text-decoration", "text-align"
  ]);

  function cleanStyle(value) {
    return String(value || "").split(";").reduce(function (result, item) {
      const index = item.indexOf(":");
      if (index < 1) return result;
      const property = item.slice(0, index).trim().toLowerCase();
      const content = item.slice(index + 1).trim();
      if (!allowedStyles.has(property) || !content || content.length > 120) return result;
      if (/url\s*\(|expression\s*\(|javascript\s*:|@import|[<>]/i.test(content)) return result;
      result.push(property + ":" + content);
      return result;
    }, []).join(";");
  }

  function sanitize(html) {
    const parsed = new DOMParser().parseFromString(String(html == null ? "" : html), "text/html");
    const root = parsed.body;

    function walk(parent) {
      Array.from(parent.children).forEach(function (element) {
        const tag = element.tagName.toUpperCase();

        if (blockedTags.has(tag)) {
          element.remove();
          return;
        }

        if (tag === "IMG") {
          const rawSrc = element.getAttribute("src") || "";
          let safeUrl = null;
          try {
            const parsed = new URL(rawSrc, window.location.href);
            const allowedPath = parsed.pathname.startsWith("/storage/v1/object/public/kose-yazilari/") || parsed.pathname.startsWith("/storage/v1/object/public/haber-fotograflari/");
            if (parsed.protocol === "https:" && parsed.origin === "https://rfqiffvudbmphvklxetf.supabase.co" && allowedPath) safeUrl = parsed.href;
          } catch (_) {}
          if (!safeUrl) { element.remove(); return; }
          const alt = (element.getAttribute("alt") || "").slice(0, 180);
          Array.from(element.attributes).forEach(function (attribute) { element.removeAttribute(attribute.name); });
          element.setAttribute("src", safeUrl);
          element.setAttribute("alt", alt);
          element.setAttribute("loading", "lazy");
          element.setAttribute("decoding", "async");
          element.setAttribute("style", "display:block;max-width:100%;height:auto;margin:18px auto");
          return;
        }

        if (!allowedTags.has(tag)) {
          walk(element);
          while (element.firstChild) parent.insertBefore(element.firstChild, element);
          element.remove();
          return;
        }

        if (tag === "FONT") {
          const color = element.getAttribute("color");
          const face = element.getAttribute("face");
          const size = element.getAttribute("size");
          Array.from(element.attributes).forEach(function (attribute) {
            element.removeAttribute(attribute.name);
          });
          if (color && /^(#[0-9a-f]{3,8}|[a-z]{1,24}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\))$/i.test(color.trim())) {
            element.setAttribute("color", color.trim());
          }
          if (face && /^[\w\s,'"-]{1,100}$/.test(face.trim()) && !/url\s*\(/i.test(face)) {
            element.setAttribute("face", face.trim());
          }
          if (size && /^[1-7]$/.test(size.trim())) element.setAttribute("size", size.trim());
        } else {
          const style = cleanStyle(element.getAttribute("style"));
          const originalHref = tag === "A" ? element.getAttribute("href") : null;
          const classes = (element.getAttribute("class") || "").split(/\s+/)
            .filter(function (name) { return name === "vurgulu-metin" || name === "vurgulu-kutu"; });

          Array.from(element.attributes).forEach(function (attribute) {
            element.removeAttribute(attribute.name);
          });

          if (style) element.setAttribute("style", style);
          if (classes.length) element.setAttribute("class", Array.from(new Set(classes)).join(" "));

          if (tag === "A" && originalHref) {
            try {
              const url = new URL(originalHref.trim(), window.location.href);
              if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
                element.setAttribute("href", url.href);
                if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== window.location.origin) {
                  element.setAttribute("target", "_blank");
                  element.setAttribute("rel", "noopener noreferrer");
                }
              }
            } catch (_) {
              /* Geçersiz bağlantı temizlenmiş olarak bırakılır. */
            }
          }
        }
        walk(element);
      });
    }

    walk(root);
    return root.innerHTML;
  }

  window.editorHTMLGuvende = sanitize;
})();