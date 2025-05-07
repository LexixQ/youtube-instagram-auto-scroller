# YouTube & Instagram Otomatik Kaydırıcı

[![Sürüm](https://img.shields.io/badge/sürüm-2.0-blue.svg)](manifest.json)
[![Lisans](https://img.shields.io/badge/lisans-MIT-green.svg)](LICENSE)

YouTube Shorts ve Instagram Reels deneyiminizi bir üst seviyeye taşıyın! Bu Chrome eklentisi, videolar bittiğinde otomatik olarak bir sonrakine geçer, böylece favori kısa videolarınızı kesintisiz bir şekilde izleyebilirsiniz.

---

## ✨ Temel Özellikler

*   **Kesintisiz Otomatik Kaydırma:**
    *   📺 **YouTube Shorts:** Bir Short videosu sona erdiğinde otomatik olarak bir sonraki Short'a geçer.
    *   📸 **Instagram Reels:** Bir Reel videosu (hem `/reels/` sayfasında hem de ana akışta) bittiğinde bir sonraki Reel'e kaydırır. Instagram'ın kendi "loop" (tekrar oynatma) özelliğini devre dışı bırakarak düzgün geçiş sağlar.
*   **Kolay ve Anında Kontrol:**
    *   ![Eklenti İkonu Değişimi](https://via.placeholder.com/300x150.gif?text=Eklenti+İkonu+Aktif/Pasif+GIF)
        *Görsel: Eklenti ikonu aktif (mavi) ve pasif (gri) durumları.*
    *   **Tarayıcı İkonu:** Eklenti ikonuna tıklayarak özelliği tüm desteklenen platformlar için anında AÇIP/KAPATabilirsiniz. İkonun rengi ve başlığı mevcut durumu gösterir.
*   **YouTube'a Özel Buton:**
    *   ![YouTube Butonu](https://via.placeholder.com/300x150.gif?text=YouTube+Butonu+GIF)
        *Görsel: YouTube Shorts üzerindeki kontrol butonu.*
    *   YouTube Shorts izlerken, video üzerindeki sağ taraftaki aksiyon butonları arasına eklenen özel bir oynat/duraklat butonu ile otomatik kaydırmayı (genel ayarı değiştirerek) AÇIP/KAPATabilirsiniz.
*   **Akıllı Durum Yönetimi:** Eklenti durumu (`autoScrollEnabled`) tarayıcıda saklanır ve tüm açık sekmelerde senkronize çalışır.
*   **Manifest V3 Desteği:** En güncel Chrome eklenti standartlarına uygun olarak geliştirilmiştir.

---

## 🚀 Kurulum

### Manuel Kurulum (Geliştirici Modu)

Eğer eklentiyi hemen denemek veya geliştirmeye katkıda bulunmak isterseniz:

1.  **Projeyi İndirin:**
    *   Bu repoyu ZIP olarak indirin: `https://github.com/LexixQ/youtube-instagram-auto-scroller.git` ve bilgisayarınızda bir klasöre çıkartın.
    *   Veya Git kullanarak klonlayın:
        ```bash
        git clone https://github.com/LexixQ/youtube-instagram-auto-scroller.git
        ```
2.  **Chrome Eklentiler Sayfasını Açın:**
    *   Google Chrome'u açın.
    *   Adres çubuğuna `chrome://extensions` yazın ve Enter'a basın.
3.  **Geliştirici Modunu Aktif Edin:**
    *   Sayfanın sağ üst köşesindeki **Geliştirici modu** (Developer mode) anahtarını açık konuma getirin.
4.  **Eklentiyi Yükleyin:**
    *   Sol üstte beliren **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
    *   Açılan dosya seçme penceresinde, 1. adımda ZIP'ten çıkardığınız veya klonladığınız proje klasörünü (içinde `manifest.json` dosyasının bulunduğu klasörü) seçin.
5.  **Hazır!** Eklenti kurulacak ve tarayıcı araç çubuğunda ikonu görünecektir.

---

## 🎮 Nasıl Kullanılır?

Kurulumdan sonra eklenti otomatik olarak çalışmaya başlar (varsayılan olarak kapalıdır).

1.  **Genel Kontrol (Tarayıcı İkonu):**
    *   Tarayıcınızın sağ üst köşesindeki **YouTube & Instagram Otomatik Kaydırıcı** ikonuna tıklayın.
    *   **Mavi ikon:** Otomatik kaydırma AKTİF.
    *   **Gri ikon:** Otomatik kaydırma KAPALI.
    *   Bu ayar hem YouTube Shorts hem de Instagram Reels için geçerlidir.

2.  **YouTube Shorts Üzerindeki Buton:**
    *   Bir YouTube Shorts videosu izlerken, videonun sağ tarafındaki beğeni, yorum gibi butonların olduğu alanda eklentimize ait yeni bir buton göreceksiniz.
    *   Bu butona tıklayarak da genel otomatik kaydırma ayarını değiştirebilirsiniz.
    *   Butonun görünümü (ikon ve arkaplan rengi) özelliğin aktif olup olmadığını gösterir.

3.  **Instagram Reels:**
    *   Instagram Reels'de gezinirken (ister `/reels/` sayfasında, ister ana akışınızda), eğer tarayıcı ikonu üzerinden otomatik kaydırma **aktif** ise, bir Reel bittiğinde bir sonrakine otomatik olarak geçilecektir.
    *   Instagram için ayrıca sayfa üzerinde bir kontrol butonu bulunmamaktadır; kontrol sadece genel eklenti ikonu üzerinden yapılır.

---

## 🛠️ Geliştirme & Katkıda Bulunma

Bu proje açık kaynaktır ve katkılarınıza açıktır!

*   **Hata Bildirimi:** Bir hata bulursanız veya bir sorunla karşılaşırsanız, lütfen [Issues](https://github.com/LexixQ/youtube-instagram-auto-scroller/issues) bölümünden yeni bir bildirim açın.
*   **Özellik İsteği:** Eklentide görmek istediğiniz yeni bir özellik varsa, bunu da "Issues" üzerinden önerebilirsiniz.
*   **Kod Katkısı:**
    1.  Bu repoyu fork'layın.
    2.  Yeni bir özellik veya hata düzeltmesi için ayrı bir branch oluşturun (örn: `git checkout -b ozellik/yeni-super-ozellik` veya `git checkout -b duzeltme/kaydirma-sorunu`).
    3.  Değişikliklerinizi yapın ve commit'leyin.
    4.  Kendi fork'unuza push'layın.
    5.  Ana repoya bir Pull Request (Çekme İsteği) açın.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır. Kısacası, kodu istediğiniz gibi kullanmakta, değiştirmekte ve dağıtmakta (ticari amaçlar dahil) özgürsünüz, tek şart lisans ve telif hakkı bildirimini korumanızdır.

---

*YouTube ve Instagram, kendi sahiplerinin ticari markalarıdır. Bu eklenti, bu platformlarla resmi bir bağlantısı olmayan bağımsız bir projedir.*