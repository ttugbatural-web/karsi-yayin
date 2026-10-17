# KARŞIDAN Teknik Denetim — İlk Tur

Tarih: 2026-10-17
Kapsam: GitHub kaynak kodu incelemesi. Supabase veri tabanı/politikaları ve canlı tarayıcı testleri bu turda kapsam dışıdır.

## Uygulanan değişiklik

Yönetim arayüzü HTML dosyalarına `<meta name="robots" content="noindex, nofollow">` eklendi. Bu değişiklik arama motorlarına yönetim ekranlarını indekslememeleri gerektiğini bildirir. **Bu bir erişim kontrolü değildir**; yönetim sayfalarının güvenliği oturum denetimi ve Supabase RLS/politikalarıyla ayrıca doğrulanmalıdır.

Değiştirilen dosyalar:
- `admin.html`
- `admin/ayarlar.html`
- `admin/dosyalar.html`
- `admin/dunya.html`
- `admin/giris.html`
- `admin/haberler.html`
- `admin/hakkimizda.html`
- `admin/index.html`
- `admin/kose-yazilari.html`
- `admin/yazarlar.html`
- `admin/yorumlar.html`

Değişiklikler `audit/karshidan-quality-fixes` dalında tutuluyor; ana dala doğrudan yazılmadı.

## İlk kod incelemesi bulguları

1. **Köşe yazısı editörü:** `admin/kose-yazilari.html` içinde `contenteditable` ve `document.execCommand` kullanılıyor. `execCommand` eski/deprecated bir API olmakla birlikte hâlâ birçok tarayıcıda çalışır; editörü değiştirmek kaydetme ve biçimlendirme davranışını bozabileceği için bu turda değiştirilmedi. Gerçek tarayıcı testleriyle ayrı ele alınmalı.
2. **HTML güvenliği:** `kose-yazisi.html` tarafında yazı içeriği için izin listeli bir HTML temizleme işlevi mevcut. Yönetim editöründe veritabanından gelen HTML'nin editöre yüklenmesi ve kaydetme akışı ayrıca test edilmeli.
3. **SEO altyapısı:** Ana sayfada meta açıklaması, canonical, Open Graph/Twitter alanları ve JSON-LD bulunuyor. `robots.txt` sitemap'e işaret ediyor. `sitemap.xml` şu an sabit sayfaları listeliyor; veritabanından gelen her bir yazı/haberin sitemap'e dahil edilip edilmediği dinamik URL stratejisine göre ayrıca değerlendirilmelidir.
4. **Mobil görünüm:** İncelenen ana sayfa, yönetim ekranı ve yazı sayfalarında viewport tanımı ve responsive CSS media query'leri mevcut. Bu, telefon/tablet üzerinde hatasız çalıştıklarını tek başına kanıtlamaz; gerçek cihaz/emülasyon testi yapılmadı.
5. **Supabase:** Tarayıcı tarafında publishable/anon anahtar kullanımı görülüyor. Bu tür anahtarların istemci kodunda bulunması tek başına güvenlik açığı kanıtı değildir; asıl belirleyici tablo bazlı Row Level Security (RLS), politikalar, Storage izinleri ve yönetici rolü denetimleridir. Kullanıcı talimatıyla bunlar henüz incelenmedi.
6. **Haber otomasyonu:** `.github/workflows/haberler.yml` saatlik zamanlanmış RSS/web haber toplama ve `data/haberler.json` dosyasını commit etme iş akışı içeriyor. Kaynakların erişilebilirliği, içerik lisansları/atıfları, ayrıştırma kalitesi ve workflow güvenliği ayrıca doğrulanmalı.

## Bu turda yapılmayanlar

- Supabase tablo/RLS/Storage politikalarını incelemek
- Canlı siteye telefon/tablet emülasyonu veya gerçek tarayıcı testleri uygulamak
- Editörün kaydetme/yükleme döngüsünü gerçek Supabase verisiyle test etmek
- Değişiklikleri ana dala birleştirmek veya canlı yayına almak

## Sonraki önerilen sıra

1. Yönetim sayfalarında noindex değişikliklerini doğrulamak.
2. Editörün HTML sanitizasyonunu, kaydetme/yükleme ve bağlantı/biçimlendirme davranışını test etmek.
3. Mobil telefon ve tablet görünümlerini test etmek.
4. Kullanıcı onayladığı zaman Supabase RLS, Storage ve yönetici yetkilerini incelemek.
5. SEO sitemap'ini dinamik içerik stratejisiyle eşleştirmek ve otomatik kontroller eklemek.


## İkinci tur: SEO ve HTML kaynak doğrulaması

Tarih: 2026-10-17

### Uygulanan düzeltmeler

- `dosya.html` dosyasının başındaki ve sonundaki Markdown kod çiti işaretleri kaldırıldı. Dosya artık doğrudan `<!DOCTYPE html>` ile başlıyor ve `</html>` ile bitiyor. Bu işaretler sayfa kaynağına karıştığında tarayıcının belgeyi yorumlamasını olumsuz etkileyebilirdi.
- `dosya.html`, `diktator-olmadan-once-herkes-halkcidir.html`, `dunya.html` ve `haberler.html` sayfalarına açıklayıcı meta description eklendi.
- `karsi-gundem.html` sayfasının başlığında yönetim paneli olduğu açıkça belirtildiğinden, ona da `noindex, nofollow` eklendi.

### Doğrulama

- Beş dosyanın tamamı GitHub dalından tekrar okundu.
- `dosya.html` için başlangıçta doctype, sonda kapanış `</html>`, meta description varlığı doğrulandı.
- Dört içerik sayfasındaki açıklamalar ve yönetim sayfasındaki noindex direktifi doğrulandı.

### Kapsam sınırlaması

Bu kontroller kaynak kodu üzerinde statik kontrollerdir. Tarayıcıda gerçek render, cihaz emülasyonu, bağlantıların canlı HTTP yanıtları ve Supabase yetkilendirme/RLS testleri yerine geçmez.


## Üçüncü tur: köşe yazısı editöründe HTML temizleme

Tarih: 2026-10-17

### Uygulanan düzeltme

`admin/kose-yazilari.html` içine izin listesi tabanlı `editorHTMLGuvende()` eklendi. Veritabanından editöre içerik yüklenirken ve kaydetmeden önce editör HTML'si temizleniyor. Script/iframe/form/aktif medya ve resim etiketleri kaldırılıyor; olay işleyici gibi HTML nitelikleri temizleniyor; biçimlendirme için izin verilen etiketler, stiller ve güvenli bağlantı protokolleri korunuyor.

### Statik doğrulama

- Temizleyici fonksiyonun bulunduğu doğrulandı.
- Yazı yükleme ve kaydetme yollarının ikisinin de temizleyiciyi çağırdığı doğrulandı.
- Script ve IMG etiketlerinin engellendiği, bağlantı protokollerinin sınırlandığı doğrulandı.

### Sınırlama

Bu, yönetim editöründe kalıcı HTML/DOM XSS riskini azaltmaya yönelik istemci tarafı savunma katmanıdır; tek başına güvenlik garantisi değildir. Supabase RLS ve yetkilendirme politikaları ayrıca doğrulanmalıdır. Gerçek tarayıcıda biçimlendirme, yapıştırma, kaydetme ve yeniden düzenleme regresyon testleri henüz yapılmadı.


## Dördüncü tur: bozuk içerik bağlantıları

Tarih: 2026-10-17

### Uygulanan düzeltmeler

- Ana sayfadaki köşe yazısı kartları `kose-yazilari.html?slug=...` adresine gidiyordu; bu sayfa slug parametresiyle yazı detayı açmıyor. Bağlantı `kose-yazisi.html?slug=...` olarak düzeltildi.
- Dünya haberleri listesi `dunya-{slug}.html` şeklinde dosyalar oluşturulmuş gibi bağlantı kuruyordu, ancak depoda bu dosyalar yoktu. Mevcut `dunya_haberleri` tablosunun alanlarını kullanan `dunya-haber.html?slug=...` detay sayfası eklendi ve liste bu sayfaya bağlandı.
- Yeni dünya haberi detay rotası sitemap'e eklendi.

### Yeni dünya haber detay sayfası güvenlik davranışı

- İçerik metin olarak kaçırılıp paragraf halinde gösteriliyor; veritabanından gelen içerik HTML olarak çalıştırılmıyor.
- Kapak ve kaynak bağlantıları yalnızca HTTP/HTTPS URL'leri olarak kabul ediliyor.
- Yalnızca `durum = yayinda` olan ve slug'ı eşleşen kayıt yükleniyor.
- Başlık ve açıklama meta alanları içerik yüklenince güncelleniyor.

### Statik doğrulama

Bu değişiklikler dal üzerinde kaynak kodu olarak oluşturuldu. Canlı Supabase kaydıyla uçtan uca doğrulama henüz yapılmadı; tablo alanları mevcut `dunya.html` ve `admin/dunya.html` kaynaklarından eşleştirildi.


## Beşinci tur: ana sayfa HTML temizliği

Tarih: 2026-10-17

### Uygulanan düzeltme

`index.html` içinde başlık, navigasyon ve ana içerik bölümlerini çevreleyen tek başına duran sekiz Markdown kod çiti satırı bulundu ve kaldırıldı. Bunlar HTML kaynağına ait değildi ve tarayıcıda görünür metin/işaret olarak çıkabiliyordu. Sayfanın `<!DOCTYPE html>` ile başladığı ve `</html>` ile bittiği doğrulandı.

### Genel statik bağlantı kontrolü

Önceki turda depodaki kök dizin HTML sayfaları tarandı; kontrol edilen yerel HTML bağlantılarında eksik hedef bulunmadı. Ana sayfa ve dünya haberleri detay bağlantıları düzeltilerek yeni hedefler eklendi.


## Altıncı tur: yönetim paneli erişim kontrolü ve editör güvenliği

Tarih: 2026-10-17

### Bulgu ve düzeltmeler

- `admin/haberler.html`, `admin/yorumlar.html`, `admin/dosyalar.html` ve `admin/hakkimizda.html` sayfalarında ortak yönetici oturumu doğrulaması eksikti veya çağrılmıyordu. Ortak `admin/auth.js` kontrolü eklendi; veri yükleme başlangıcı doğrulanmış oturumdan sonra çalışacak şekilde düzenlendi. Oturum doğrulanırken arayüz gizleniyor.
- Haberler ve dosyalar zengin metin editörlerinde, veritabanından yüklenen HTML kaydedilmiş/tekrar düzenlenmiş içerik olarak doğrudan DOM'a basılabiliyordu. Paylaşılan `admin/editor-sanitize.js` temizleyicisi eklendi; editöre yükleme ve kaydetme sırasında izin listesi tabanlı HTML temizliği yapılıyor.
- `admin/ayarlar.html` dışındaki başlangıç/bitiş Markdown kod çitleri ve `admin/yazarlar.html` içindeki tek başına duran kod çitleri kaldırıldı.
- Yönetim sayfalarının noindex direktifleri ve HTML sınırları tekrar kontrol edildi.

### Statik doğrulama

- 24 HTML dosyasında yerel `href` hedefleri tarandı; göreli `../` ve yönetim klasörüne göre yollar normalleştirildikten sonra eksik yerel hedef bulunmadı.
- Yönetim HTML sayfalarında Markdown kod çiti kalmadığı ve yönetim sayfalarının noindex direktifleri taşıdığı kontrol edildi.
- Haberler, yorumlar, dosyalar ve hakkımızda sayfalarının veri yükleme başlangıçları ortak oturum doğrulamasına bağlandı.
- Haberler ve dosyalar editöründe ham `data.icerik` / `dosya.icerik` atamalarının temizleyiciyle değiştirildiği doğrulandı.

### Güvenlik sınırları ve açık işler

- Tarayıcı tarafındaki oturum kontrolü tek başına güvenlik sınırı değildir. Supabase tarafında her tablo ve Storage bucket için RLS/izin politikaları doğrulanmalı; bu oturumda Supabase yönetim API'sine veya proje paneline erişim yoktu, dolayısıyla politika değişikliği yapılmadı ve yetkisiz REST istekleriyle doğrulama gerçekleştirilmedi.
- Canlı siteye web tarayıcı aracıyla erişim denemeleri başarısız oldu; gerçek cihaz/telefon/tablet render ve etkileşim testleri yapılamadı.
- Bu turdaki doğrulama kaynak kodu taramasıyla sınırlıdır. Canlı ortamda giriş/çıkış, içerik kaydetme, resim yükleme, editör yapıştırma ve mobil regresyon testleri ayrıca çalıştırılmalıdır.


## Yedinci tur: yönetici rolü doğrulaması — açık kritik konu

Ortak `admin/auth.js` dosyasındaki kontrol, geçerli bir Supabase oturumu olup olmadığını doğruluyor; kullanıcının ayrıca yönetici rolüne sahip olduğunu bağımsız olarak doğrulamıyor. Bu nedenle oturum kontrolü eklenmiş olsa da yönetim ekranlarının güvenliği yalnızca bu istemci tarafı kontrole dayandırılamaz.

Supabase yönetim/politika erişimi bu çalışma ortamında bulunmadığından:
- `app_metadata` / yönetici rolü atamalarını doğrulayamadım;
- RLS ve Storage politikalarını okuyup değiştiremedim;
- yetkisiz kullanıcıyla negatif erişim testi yapamadım.

Canlıya çıkış öncesi kritik iş: Supabase tarafında yazma/silme işlemlerinin yalnızca açıkça yetkilendirilmiş yöneticilere izin verdiği doğrulanmalı. Kullanıcı tablosu veya istemci tarafından değiştirilebilir `user_metadata` tek başına güvenilir rol kaynağı olarak kullanılmamalı. Yönetici rolü için Supabase tarafından güvenilen `app_metadata` veya sunucu tarafında doğrulanan bir allowlist kullanılmalı.


## Dördüncü tur: Supabase RLS ve yönetici yetkisi

Tarih: 2026-10-17

### Veritabanı denetimi ve düzeltmeleri

- `public` şemasındaki tüm tablolar için RLS etkinliği kontrol edildi; kontrol sonucunda RLS kapalı tablo sayısı 0.
- Anonim `INSERT`/`UPDATE`/`DELETE` politikaları kaldırıldı; ziyaretçilerin yalnızca yayımlanmış/aktif içerikleri okuması ve yorumları bekleyen durumda göndermesi için politikalar oluşturuldu.
- Storage'daki üç site görseli bucket'ında herkese açık yükleme/değiştirme/silme politikaları kaldırıldı; okuma açık, yazma yönetici kimliğine sınırlandırıldı.
- Beş yabancı anahtar indeksi eklendi; iki tetikleyici fonksiyonunun `search_path` ayarı sabitlendi.
- `dunya-haberlerini-tara` Edge Function sürüm 7'ye dağıtıldı; JWT doğrulamasına ek olarak yönetici kullanıcı UUID'si kontrolü eklendi.

### Ek kod düzeltmeleri

- `admin/auth.js` içine Supabase veritabanı politikalarıyla eşleşen yönetici UUID kontrolü eklendi.
- `admin/giris.html` mevcut oturumu yalnızca yönetici kullanıcı için kabul edecek şekilde güncellendi.
- `admin/ayarlar.html` ortak yönetici oturum kontrolünü kullanacak şekilde düzeltildi. Önceki sürümde sadece oturum varlığı kontrol ediliyor ve ortak rol denetimi kullanılmıyordu.
- Kök dizindeki eski `admin.html` yönetim uygulaması, rol kontrolünü atlayabilen eski giriş akışını kaldırmak için `admin/giris.html` adresine yönlendiren uyumluluk sayfasına dönüştürüldü.

### Doğrulama ve sınırlamalar

- Son SQL kontrolünde `public` şemasında RLS kapalı tablo: 0; anonim değişiklik politikası: 0; anonim Storage değişiklik politikası: 0.
- Beş yeni indeksin varlığı doğrulandı.
- Supabase Security Advisor'da sızdırılmış parola korumasının kapalı olduğu uyarısı devam ediyor; mevcut bağlantı aracı Auth ayarını değiştirmediğinden bu ayar elle etkinleştirilmeli.
- Bu değişiklikler ayrı GitHub dalında hazırlanıyor; canlı siteye alınmadan önce PR diff'i ve dağıtım kontrolleri incelenmeli. Gerçek tarayıcıyla yönetici giriş/çıkış, medya yükleme ve içerik CRUD uçtan uca testleri henüz yapılmadı.
