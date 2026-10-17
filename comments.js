(function () {
  "use strict";

  const css = document.createElement("style");
  css.textContent = `
    .kar-comment-section{margin:30px 0 10px;padding:26px;background:#fff;border:1px solid #ddd;border-top:4px solid #c40000}
    .kar-comment-section h2{font:700 26px Georgia,"Times New Roman",serif;margin:0 0 8px}
    .kar-comment-intro{color:#666;font-size:14px;line-height:1.6;margin-bottom:20px}
    .kar-comment-list{display:grid;gap:12px;margin:0 0 24px}
    .kar-comment-item{padding:15px 16px;background:#f7f7f5;border-left:3px solid #bbb}
    .kar-comment-meta{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;margin-bottom:8px}
    .kar-comment-name{font-weight:700}
    .kar-comment-date{color:#777;font-size:12px}
    .kar-comment-text{line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
    .kar-comment-form{display:grid;gap:13px}
    .kar-comment-form label{display:grid;gap:6px;font-size:13px;font-weight:700}
    .kar-comment-form input,.kar-comment-form textarea{width:100%;padding:12px;border:1px solid #ccc;border-radius:0;font:inherit;background:#fff}
    .kar-comment-form textarea{min-height:130px;resize:vertical}
    .kar-comment-form button{justify-self:start;padding:13px 18px;border:0;background:#111;color:#fff;font-weight:700;cursor:pointer}
    .kar-comment-form button:disabled{opacity:.55;cursor:wait}
    .kar-comment-message{display:none;padding:12px 14px;font-size:13px;line-height:1.5}
    .kar-comment-message.is-visible{display:block}
    .kar-comment-message.is-error{background:#f7e4e4;color:#8b0000}
    .kar-comment-message.is-success{background:#e7f4e7;color:#246024}
    .kar-comment-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
    @media(max-width:600px){.kar-comment-section{padding:18px}.kar-comment-section h2{font-size:23px}}
  `;
  document.head.appendChild(css);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  window.renderArticleComments = async function (container, targetColumn, targetId) {
    if (!container || !["haber_id", "kose_yazisi_id"].includes(targetColumn) || !targetId || !window.supabaseClient) return;

    let settings;
    try {
      const result = await window.supabaseClient.from("ayarlar")
        .select("yorumlar_acik, yorumlar_otomatik_onay").eq("id", 1).maybeSingle();
      if (result.error || !result.data || result.data.yorumlar_acik !== true) return;
      settings = result.data;
    } catch (_) {
      return;
    }

    const section = el("section", "kar-comment-section");
    section.setAttribute("aria-labelledby", "kar-comment-title");
    section.innerHTML = `
      <h2 id="kar-comment-title">Okuyucu yorumları</h2>
      <p class="kar-comment-intro">Görüşünü paylaş. Yorumlar yayın ilkelerimize uygunluk açısından denetlenebilir.</p>
      <div class="kar-comment-list" aria-live="polite"><p>Yorumlar yükleniyor…</p></div>
      <div class="kar-comment-message" role="status" aria-live="polite"></div>
      <form class="kar-comment-form">
        <label>Adın
          <input name="ad_soyad" autocomplete="name" minlength="2" maxlength="80" required>
        </label>
        <label>E-posta (isteğe bağlı)
          <input name="eposta" type="email" autocomplete="email" maxlength="254">
        </label>
        <label>Yorumun
          <textarea name="icerik" minlength="5" maxlength="2000" required placeholder="Görüşünü saygılı bir dille yaz…"></textarea>
        </label>
        <label class="kar-comment-honeypot" aria-hidden="true">Web sitesi
          <input name="website" tabindex="-1" autocomplete="off">
        </label>
        <button type="submit">YORUMU GÖNDER</button>
      </form>`;
    container.appendChild(section);

    const list = section.querySelector(".kar-comment-list");
    const form = section.querySelector("form");
    const message = section.querySelector(".kar-comment-message");
    const submit = form.querySelector("button");

    function showMessage(text, isError) {
      message.textContent = text;
      message.className = "kar-comment-message is-visible " + (isError ? "is-error" : "is-success");
    }

    async function loadApproved() {
      const result = await window.supabaseClient.from("yorumlar")
        .select("id, ad_soyad, icerik, created_at")
        .eq(targetColumn, targetId).eq("durum", "onaylandi")
        .order("created_at", { ascending: true });
      if (result.error) {
        list.replaceChildren(el("p", "", "Yorumlar şu anda yüklenemiyor."));
        return;
      }
      list.replaceChildren();
      if (!result.data || !result.data.length) {
        list.appendChild(el("p", "", "Henüz yorum yok. İlk yorumu sen yazabilirsin."));
        return;
      }
      result.data.forEach(function (comment) {
        const item = el("article", "kar-comment-item");
        const meta = el("div", "kar-comment-meta");
        meta.appendChild(el("span", "kar-comment-name", comment.ad_soyad));
        const date = comment.created_at ? new Date(comment.created_at) : null;
        meta.appendChild(el("time", "kar-comment-date", date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("tr-TR", {year:"numeric",month:"long",day:"numeric"}) : ""));
        item.appendChild(meta);
        item.appendChild(el("p", "kar-comment-text", comment.icerik));
        list.appendChild(item);
      });
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      if (String(formData.get("website") || "").trim()) {
        showMessage("Yorumun gönderildi.", false);
        form.reset();
        return;
      }
      const name = String(formData.get("ad_soyad") || "").trim();
      const email = String(formData.get("eposta") || "").trim();
      const content = String(formData.get("icerik") || "").trim();
      if (name.length < 2 || name.length > 80 || content.length < 5 || content.length > 2000) {
        showMessage("Ad 2–80, yorum 5–2000 karakter arasında olmalı.", true);
        return;
      }
      submit.disabled = true;
      submit.textContent = "GÖNDERİLİYOR…";
      try {
        const insertData = {
          ad_soyad: name,
          eposta: email || null,
          icerik: content,
          durum: settings.yorumlar_otomatik_onay === true ? "onaylandi" : "bekliyor"
        };
        insertData[targetColumn] = targetId;
        const result = await window.supabaseClient.from("yorumlar").insert(insertData);
        if (result.error) throw result.error;
        form.reset();
        if (settings.yorumlar_otomatik_onay === true) {
          showMessage("Yorumun yayımlandı. Katkın için teşekkürler.", false);
          await loadApproved();
        } else {
          showMessage("Yorumun alındı. Yönetici onayından sonra burada görünecek.", false);
        }
      } catch (error) {
        console.error("Yorum gönderilemedi:", error);
        showMessage("Yorum gönderilemedi. Biraz sonra tekrar deneyebilirsin.", true);
      } finally {
        submit.disabled = false;
        submit.textContent = "YORUMU GÖNDER";
      }
    });

    await loadApproved();
  };
})();