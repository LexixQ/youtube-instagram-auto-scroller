// background.js

// Eklenti ilk yüklendiğinde veya güncellendiğinde başlangıç durumunu ayarla
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ autoScrollEnabled: false }, () => {
    console.log("Eklenti kuruldu/güncellendi, otomatik kaydırma varsayılan olarak kapalı.");
    // updateIcon(false); // ÖNERİ UYGULANDI: Bu satır kaldırıldı, aşağıdaki genel get işlemi başlangıç ikonunu ayarlayacak.
  });
});

// Eklenti ikonunun ve başlığının görünümünü günceller
function updateIcon(enabled) {
  const iconPaths = enabled
    ? { "16": "icons/icon-16-enabled.png", "32": "icons/icon-32-enabled.png" }
    : { "16": "icons/icon-16-disabled.png", "32": "icons/icon-32-disabled.png" };
  chrome.action.setIcon({ path: iconPaths });

  const title = enabled ? "Otomatik Kaydırmayı Kapat (Aktif)" : "Otomatik Kaydırmayı Aktif Et (Kapalı)";
  chrome.action.setTitle({ title: title });
  console.log(`Background: İkon ve başlık güncellendi -> Durum: ${enabled ? 'Aktif' : 'Kapalı'}`);
}

// Tarayıcı eklenti ikonuna tıklandığında çalışır
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['autoScrollEnabled'], (result) => {
    const currentState = result.autoScrollEnabled;
    const newState = !currentState;
    chrome.storage.local.set({ autoScrollEnabled: newState }, () => {
      if (chrome.runtime.lastError) {
        console.error("BG: İkon tıklaması sonrası storage güncellenemedi:", chrome.runtime.lastError.message);
      } else {
        console.log("BG: Eklenti ikonu tıklandı, storage güncellendi:", newState);
        // İkon ve içerik script'i artık storage.onChanged üzerinden güncellenecek.
      }
    });
  });
});

// `chrome.storage.local` üzerindeki değişiklikleri dinler
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.autoScrollEnabled) {
    const newState = changes.autoScrollEnabled.newValue;
    console.log("BG (Storage Değişikliği): Yeni durum algılandı:", newState);
    updateIcon(newState); // İkonu global duruma göre güncelle

    // Aktif YouTube Shorts veya Instagram Reels sekmelerine yeni durumu bildir
    // Not: content_script.js de storage.onChanged dinliyor, bu mesaj yedek amaçlı veya
    // content_script'in henüz yüklenmemiş olabileceği durumlar için.
    chrome.tabs.query({url: ["*://*.youtube.com/shorts/*", "*://*.instagram.com/reels/*", "*://*.instagram.com/*"]}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.warn("BG: Sekmeler sorgulanırken hata:", chrome.runtime.lastError.message);
        return;
      }
      tabs.forEach((activeTab) => {
        chrome.tabs.sendMessage(activeTab.id, { command: "toggleStatus", enabled: newState })
          .catch(error => console.log(`BG: İçerik scriptine mesaj gönderilemedi (${activeTab.id} - ${activeTab.url}):`, error.message));
      });
    });
  }
});

// Tarayıcı başladığında mevcut durumu kontrol edip ikonu ayarla
chrome.runtime.onStartup.addListener(() => {
    console.log("BG: Tarayıcı başlatıldı.");
    chrome.storage.local.get(['autoScrollEnabled'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("BG (onStartup): Storage okunamadı:", chrome.runtime.lastError.message);
        } else {
            updateIcon(!!result.autoScrollEnabled);
        }
    });
});

// Eklenti (service worker) başladığında/yeniden başladığında ikonu ayarla.
// Bu, onInstalled ve onStartup dışında durumlar için de (örn. eklenti güncellemesi sonrası service worker'ın yeniden başlatılması)
// ikonun doğru olmasını sağlar.
chrome.storage.local.get(['autoScrollEnabled'], (result) => {
    if (chrome.runtime.lastError) {
        console.error("BG (İlk Yükleme/Yeniden Başlama): Storage okunamadı:", chrome.runtime.lastError.message);
    } else {
        console.log("BG: Service worker başladı/yeniden başladı, ikon durumu storage'dan okunuyor.");
        updateIcon(!!result.autoScrollEnabled);
    }
});