/* ==================================================
   KARŞI — ADMIN AUTH
   Yönetim paneli oturum kontrolü
================================================== */

const SUPABASE_URL =
    "https://rfqiffvudbmphvklxetf.supabase.co";

const SUPABASE_ANON_KEY =
    "BURAYA_ÇALIŞAN_ANON_KEYİNİ_YAPIŞTIR";


/* ==================================================
   SUPABASE BAĞLANTISI
================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ==================================================
   YÖNETİCİ OTURUMUNU KONTROL ET
================================================== */

async function yoneticiOturumuKontrolEt() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Oturum kontrol hatası:",
            error
        );

        window.location.href =
            "giris.html";

        return null;
    }


    if (!data.session) {

        window.location.href =
            "giris.html";

        return null;
    }


    console.log(
        "KARŞI: Yönetici oturumu aktif:",
        data.session.user.email
    );


    return data.session;

}


/* ==================================================
   ÇIKIŞ YAP
================================================== */

async function cikisYap() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Çıkış yapılamadı:",
            error
        );

        return;
    }


    window.location.href =
        "giris.html";

}
