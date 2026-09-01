/* ==================================================
   KARŞI — ADMIN AUTH
   Yönetim paneli ortak oturum sistemi
================================================== */

(function () {

    "use strict";


    /* ==================================================
       SUPABASE AYARLARI
    ================================================== */

    const SUPABASE_URL =
        "https://rfqiffvudbmphvklxetf.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_FZQzfS0NBm0wZCSzV6dyvg_7mNUW-65";


    /* ==================================================
       SUPABASE KÜTÜPHANESİ KONTROLÜ
    ================================================== */

    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "KARŞI AUTH: Supabase kütüphanesi yüklenemedi."
        );

        alert(
            "Yönetim sistemi başlatılamadı. " +
            "Supabase bağlantısı yüklenemedi."
        );

        return;
    }


    /* ==================================================
       SUPABASE CLIENT
    ================================================== */

    const client =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    /* ==================================================
       GLOBAL CLIENT
       
       Diğer admin sayfaları bunu kullanabilir.
       auth.js dışında aynı isimle const oluşturulmamalı.
    ================================================== */

    window.supabaseClient =
        client;


    /* ==================================================
       YÖNETİCİ OTURUMU KONTROL
    ================================================== */

    async function yoneticiOturumuKontrolEt() {

        console.log(
            "KARŞI AUTH: Yönetici oturumu kontrol ediliyor..."
        );


        try {

            const {
                data,
                error
            } =
                await client.auth.getSession();


            /* =========================
               SUPABASE HATASI
            ========================= */

            if (error) {

                console.error(
                    "KARŞI AUTH: Oturum kontrol hatası:",
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
                    "KARŞI AUTH: Aktif yönetici oturumu bulunamadı."
                );

                window.location.href =
                    "giris.html";

                return null;
            }


            /* =========================
               OTURUM VAR
            ========================= */

            console.log(
                "KARŞI AUTH: Yönetici oturumu aktif:",
                data.session.user.email
            );


            return data.session;

        }

        catch (error) {

            console.error(
                "KARŞI AUTH: Oturum kontrolünde beklenmeyen hata:",
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

        console.log(
            "KARŞI AUTH: Yönetici çıkışı başlatılıyor..."
        );


        try {

            const {
                error
            } =
                await client.auth.signOut();


            /* =========================
               ÇIKIŞ HATASI
            ========================= */

            if (error) {

                console.error(
                    "KARŞI AUTH: Çıkış yapılamadı:",
                    error
                );


                alert(
                    "Çıkış yapılamadı:\n\n" +
                    (
                        error.message ||
                        "Bilinmeyen hata."
                    )
                );


                return false;
            }


            /* =========================
               BAŞARILI
            ========================= */

            console.log(
                "KARŞI AUTH: Yönetici çıkışı başarılı."
            );


            window.location.href =
                "giris.html";


            return true;

        }

        catch (error) {

            console.error(
                "KARŞI AUTH: Çıkış sırasında beklenmeyen hata:",
                error
            );


            alert(
                "Çıkış sırasında bir hata oluştu:\n\n" +
                (
                    error.message ||
                    "Bilinmeyen hata."
                )
            );


            return false;
        }

    }


    /* ==================================================
       AUTH DURUMU DEĞİŞİKLİĞİ
    ================================================== */

    client.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "KARŞI AUTH: Auth durumu değişti:",
                event
            );


            /* =========================
               ÇIKIŞ YAPILDI
            ========================= */

            if (
                event === "SIGNED_OUT"
            ) {

                const mevcutSayfa =
                    window.location.pathname
                        .split("/")
                        .pop();


                /*
                 * Zaten giriş sayfasındaysak
                 * tekrar yönlendirme yapma.
                 */

                if (
                    mevcutSayfa !== "giris.html"
                ) {

                    window.location.href =
                        "giris.html";
                }

            }

        }
    );


    /* ==================================================
       GLOBAL FONKSİYONLAR
       
       HTML onclick ve diğer admin
       sayfalarının erişebilmesi için.
    ================================================== */

    window.yoneticiOturumuKontrolEt =
        yoneticiOturumuKontrolEt;


    window.cikisYap =
        cikisYap;


    /* ==================================================
       AUTH HAZIR
    ================================================== */

    console.log(
        "KARŞI AUTH: auth.js başarıyla yüklendi."
    );

    console.log(
        "KARŞI AUTH: supabaseClient hazır."
    );

})();
