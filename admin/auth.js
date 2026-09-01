/* ==================================================
   KARŞI — ADMIN AUTH
   Yönetim paneli oturum kontrolü
================================================== */

const SUPABASE_URL =
    "https://rfqiffvudbmphvklxetf.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWlmZnZ1ZGJtcGh2a2x4ZXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDM2MDcsImV4cCI6MjEwMzcxOTYwN30.2L9Yjkc3kK1zfo4muGy18XXX4COaB5RMAxSLt-bDt_c";


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
