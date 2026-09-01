```javascript
/* ==================================================
   KARŞI — ADMIN AUTH
   Yönetim paneli ortak oturum sistemi
================================================== */


/* ==================================================
   SUPABASE AYARLARI
================================================== */

const SUPABASE_URL =
    "https://rfqiffvudbmphvklxetf.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_FZQzfS0NBm0wZCSzV6dyvg_7mNUW-65";


/* ==================================================
   SUPABASE CLIENT
================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ==================================================
   YÖNETİCİ OTURUMU KONTROL
================================================== */

async function yoneticiOturumuKontrolEt() {

    try {

        console.log(
            "KARŞI: Yönetici oturumu kontrol ediliyor..."
        );


        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        /* =========================
           HATA
        ========================= */

        if (error) {

            console.error(
                "KARŞI: Oturum kontrol hatası:",
                error
            );

            window.location.href =
                "giris.html";

            return null;
        }


        /* =========================
           OTURUM YOK
        ========================= */

        if (
            !data ||
            !data.session
        ) {

            console.warn(
                "KARŞI: Aktif yönetici oturumu bulunamadı."
            );

            window.location.href =
                "giris.html";

            return null;
        }


        /* =========================
           OTURUM VAR
        ========================= */

        console.log(
            "KARŞI: Yönetici oturumu aktif:",
            data.session.user.email
        );


        return data.session;

    }

    catch (error) {

        console.error(
            "KARŞI: Oturum kontrolünde beklenmeyen hata:",
            error
        );


        window.location.href =
            "giris.html";


        return null;
    }

}


/* ==================================================
   ÇIKIŞ YAP
================================================== */

async function cikisYap() {

    try {

        console.log(
            "KARŞI: Yönetici çıkışı yapılıyor..."
        );


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "KARŞI: Çıkış yapılamadı:",
                error
            );

            alert(
                "Çıkış yapılamadı: " +
                (
                    error.message ||
                    "Bilinmeyen hata."
                )
            );

            return;
        }


        console.log(
            "KARŞI: Yönetici çıkışı başarılı."
        );


        window.location.href =
            "giris.html";

    }

    catch (error) {

        console.error(
            "KARŞI: Çıkış sırasında beklenmeyen hata:",
            error
        );


        alert(
            "Çıkış sırasında bir hata oluştu."
        );
    }

}


/* ==================================================
   AUTH DURUMU DEĞİŞİNCE
================================================== */

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        console.log(
            "KARŞI: Auth durumu:",
            event
        );


        if (
            event === "SIGNED_OUT"
        ) {

            /*
             * Zaten giriş sayfasındaysak
             * tekrar yönlendirme yapma.
             */

            if (
                !window.location.pathname.endsWith(
                    "giris.html"
                )
            ) {

                window.location.href =
                    "giris.html";
            }

        }

    }
);


/* ==================================================
   GLOBAL ERİŞİM
================================================== */

window.supabaseClient =
    supabaseClient;

window.yoneticiOturumuKontrolEt =
    yoneticiOturumuKontrolEt;

window.cikisYap =
    cikisYap;


/* ==================================================
   HAZIR
================================================== */

console.log(
    "KARŞI: auth.js başarıyla yüklendi."
);
```
