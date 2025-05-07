// content_script.js

// --- GENEL KONTROL VE DEĞİŞKENLER ---
// console.log("YouTube & Instagram Otomatik Kaydırıcı Aktif!"); // ÖNERİ UYGULANDI: Daha az genel log.

let autoScrollEnabled = false; // Genel otomatik kaydırma durumu (storage'dan okunur)
let currentSite = ''; // Mevcut site: 'youtube' veya 'instagram'

// Sayfa yüklendiğinde hangi sitede olduğumuzu belirle
if (window.location.hostname.includes("youtube.com")) {
    currentSite = 'youtube';
} else if (window.location.hostname.includes("instagram.com")) {
    currentSite = 'instagram';
}
console.log(`CS: Otomatik Kaydırıcı ${currentSite} için aktif.`);

// --- YOUTUBE SHORTS İÇİN ÖZEL KODLAR ---
let yt_currentVideoElement = null;
let yt_observer = null;
let yt_scrollInitiatedForCurrentVideo = false;
let yt_toggleButton = null;

const yt_playIconSVG = `
<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="icon-active" style="pointer-events: none; display: block; width: 100%; height: 100%;">
  <g><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></g>
</svg>`; // Duraklat ikonu (oto-kaydırma kapalıyken "başlat" anlamında)
const yt_pauseIconSVG = `
<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="icon-inactive" style="pointer-events: none; display: block; width: 100%; height: 100%;">
  <g><path d="M8 5v14l11-7z"></path></g>
</svg>`; // Oynat ikonu (oto-kaydırma açıkken "durdur" anlamında)

function yt_scrollToNextShort() {
    setTimeout(() => {
        const nextButton = document.querySelector('button[aria-label="Next video"], button[aria-label="Sonraki video"]');
        if (nextButton) {
            // console.log("CS (YT): Sonraki video butonuna tıklanıyor..."); // ÖNERİ UYGULANDI: Daha az log
            nextButton.click();
        } else {
            console.warn("CS (YT): Sonraki video butonu bulunamadı, pencere kaydırılıyor...");
            window.scrollBy(0, window.innerHeight);
        }
    }, 100);
}

function yt_handleTimeUpdate() {
    if (!autoScrollEnabled || yt_scrollInitiatedForCurrentVideo || !yt_currentVideoElement) {
        return;
    }
    const currentTime = yt_currentVideoElement.currentTime;
    const duration = yt_currentVideoElement.duration;

    if (!isNaN(duration) && duration > 0 && (duration - currentTime < 0.3)) {
        // console.log(`CS (YT): Video sonuna yaklaşıldı (${currentTime.toFixed(2)} / ${duration.toFixed(2)}), geçiliyor...`); // ÖNERİ UYGULANDI: Daha az log
        yt_scrollInitiatedForCurrentVideo = true;
        yt_scrollToNextShort();
    }
}

function yt_handleLoadedMetadata() {
    if (!yt_currentVideoElement) return;
    // console.log("CS (YT): Yeni video yüklendi. Bayrak sıfırlanıyor. Süre:", yt_currentVideoElement.duration); // ÖNERİ UYGULANDI: Daha az log
    yt_scrollInitiatedForCurrentVideo = false;
    if (autoScrollEnabled) {
         setTimeout(yt_handleTimeUpdate, 50);
    }
}

function yt_attachListenersToVideo(videoElement) {
    if (!videoElement) return;
    if (yt_currentVideoElement && yt_currentVideoElement !== videoElement) {
        yt_currentVideoElement.removeEventListener('timeupdate', yt_handleTimeUpdate);
        yt_currentVideoElement.removeEventListener('loadedmetadata', yt_handleLoadedMetadata);
    }
    videoElement.addEventListener('timeupdate', yt_handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', yt_handleLoadedMetadata);
    yt_currentVideoElement = videoElement;
}

function yt_findAndAttachToVideo() {
    const videoSelector = '#player-container video[src]';
    const videoContainer = document.querySelector(videoSelector);

    if (videoContainer) {
        if (videoContainer !== yt_currentVideoElement) {
            yt_attachListenersToVideo(videoContainer);
            yt_handleLoadedMetadata();
        }
    } else if (yt_currentVideoElement) {
        yt_currentVideoElement.removeEventListener('timeupdate', yt_handleTimeUpdate);
        yt_currentVideoElement.removeEventListener('loadedmetadata', yt_handleLoadedMetadata);
        yt_currentVideoElement = null;
        yt_scrollInitiatedForCurrentVideo = false;
    }
}

function yt_updateButtonAppearance() {
    if (!yt_toggleButton) return;
    if (autoScrollEnabled) {
        yt_toggleButton.classList.add('active');
        yt_toggleButton.title = "Otomatik Kaydırmayı Durdur";
        yt_toggleButton.innerHTML = yt_pauseIconSVG;
    } else {
        yt_toggleButton.classList.remove('active');
        yt_toggleButton.title = "Otomatik Kaydırmayı Başlat";
        yt_toggleButton.innerHTML = yt_playIconSVG;
    }
    // console.log("CS (YT): Buton görünümü güncellendi. Aktif:", autoScrollEnabled); // ÖNERİ UYGULANDI: Daha az log
}

function yt_handleButtonClick() {
    const newState = !autoScrollEnabled;
    chrome.storage.local.set({ autoScrollEnabled: newState }, () => {
        if (chrome.runtime.lastError) {
            console.error("CS (YT Buton): Storage güncellenemedi!", chrome.runtime.lastError.message);
        } else {
            console.log("CS (YT Buton): Storage güncellendi:", newState, ". Değişiklik yayılacak.");
        }
    });
}

function yt_createAndAddButton(container) {
    if (document.getElementById('auto-scroll-toggle-button')) {
        if (yt_toggleButton) yt_updateButtonAppearance();
        return;
    }
    // console.log("CS (YT): Otomatik kaydırma butonu oluşturuluyor..."); // ÖNERİ UYGULANDI: Daha az log
    yt_toggleButton = document.createElement('button');
    yt_toggleButton.id = 'auto-scroll-toggle-button';
    yt_toggleButton.addEventListener('click', yt_handleButtonClick);
    container.appendChild(yt_toggleButton);
    yt_updateButtonAppearance();
    console.log("CS (YT): Otomatik kaydırma butonu sayfaya eklendi.");
}

function yt_findActionsContainerAndAddButton() {
    const actionsContainer = document.querySelector('#actions.ytd-reel-player-overlay-renderer');
    const container = actionsContainer || document.querySelector('#menu.ytd-reel-player-overlay-renderer');

    if (container && !document.getElementById('auto-scroll-toggle-button')) {
        yt_createAndAddButton(container);
    }
}

function yt_observePageChanges() {
    const targetNode = document.body;
    if (!targetNode) {
        console.error("CS (YT): Sayfa izleme hedefi (body) bulunamadı.");
        return;
    }
    const config = { childList: true, subtree: true };

    const callback = function(mutationsList, observer) {
        yt_findAndAttachToVideo();
        yt_findActionsContainerAndAddButton();
    };
    yt_observer = new MutationObserver(callback);
    yt_observer.observe(targetNode, config);
    console.log("CS (YT): Sayfa değişiklikleri (video ve buton için) izlenmeye başlandı.");

    yt_findAndAttachToVideo();
    yt_findActionsContainerAndAddButton();

    const yt_initialButtonCheckInterval = setInterval(() => {
        if (document.getElementById('auto-scroll-toggle-button')) {
            clearInterval(yt_initialButtonCheckInterval);
        } else {
            yt_findActionsContainerAndAddButton();
        }
    }, 1000);
     setTimeout(() => clearInterval(yt_initialButtonCheckInterval), 10000);
}


// --- INSTAGRAM REELS İÇİN ÖZEL KODLAR ---
let ig_currentVideoElement = null;
let ig_applicationIsOn = false;
let ig_observer = null;
let ig_newVideoObserver = null;
let ig_isOnReelsPage = false;
let ig_appIsRunning = false;

const IG_VIDEOS_LIST_SELECTOR = "main video";

function ig_isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function ig_getCurrentVideo() {
    const videos = Array.from(document.querySelectorAll(IG_VIDEOS_LIST_SELECTOR));
    return videos.find(video => ig_isElementVisible(video));
}

function ig_scrollToNextReel() {
    // console.log("CS (IG): Sonraki Reel'e kaydırılıyor..."); // ÖNERİ UYGULANDI: Daha az log
    const videos = Array.from(document.querySelectorAll(IG_VIDEOS_LIST_SELECTOR));
    const currentVideo = ig_currentVideoElement;

    if (!currentVideo) {
        console.warn("CS (IG): Kaydırma için mevcut video bulunamadı.");
        return;
    }

    const currentIndex = videos.indexOf(currentVideo);
    if (currentIndex > -1 && currentIndex < videos.length - 1) {
        const nextVideo = videos[currentIndex + 1];
        if (nextVideo) {
            nextVideo.scrollIntoView({ behavior: "smooth", block: "center" });
            // console.log("CS (IG): Bir sonraki Reel'e kaydırıldı."); // ÖNERİ UYGULANDI: Daha az log
        }
    } else {
        // console.log("CS (IG): Sonraki Reel bulunamadı veya zaten son videoda."); // ÖNERİ UYGULANDI: Daha az log
    }
}

function ig_onVideoEnd() {
    // console.log("CS (IG): Video bitti."); // ÖNERİ UYGULANDI: Daha az log
    if (ig_applicationIsOn) {
        ig_scrollToNextReel();
    }
}

function ig_attachListenersToReelVideo(videoElement) {
    if (ig_currentVideoElement && ig_currentVideoElement !== videoElement) {
        ig_currentVideoElement.removeEventListener('ended', ig_onVideoEnd);
    }
    if (videoElement) {
        videoElement.removeAttribute("loop"); // ÖNEMLİ: Otomatik geçiş için sonsuz döngüyü kaldır
        videoElement.addEventListener('ended', ig_onVideoEnd);
        ig_currentVideoElement = videoElement;
        // console.log("CS (IG): Dinleyiciler eklendi:", videoElement); // ÖNERİ UYGULANDI: Daha az log
    }
}

function ig_handleNewReelInView(entries, observer) {
    if (!ig_appIsRunning) return;

    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.matches(IG_VIDEOS_LIST_SELECTOR)) {
            // console.log("CS (IG): Yeni Reel videoda:", entry.target); // ÖNERİ UYGULANDI: Daha az log
            ig_attachListenersToReelVideo(entry.target);
            if (ig_applicationIsOn && entry.target.ended) {
                ig_onVideoEnd();
            }
        }
    });
}

function ig_startReelsObserver() {
    if (ig_newVideoObserver) ig_newVideoObserver.disconnect();

    ig_newVideoObserver = new IntersectionObserver(ig_handleNewReelInView, {
        root: null,
        threshold: 0.8,
    });

    const initialVideo = ig_getCurrentVideo();
    if (initialVideo) {
        ig_attachListenersToReelVideo(initialVideo);
        ig_newVideoObserver.observe(initialVideo);
        initialVideo.dataset.igObserved = true;
    }
    console.log("CS (IG): Reels video görünürlük gözlemcisi başlatıldı.");
}

function ig_initializeInstagramLogic() {
    if (ig_appIsRunning) return;
    ig_appIsRunning = true;
    ig_applicationIsOn = autoScrollEnabled;
    console.log("CS (IG): Instagram mantığı başlatılıyor. Otomatik kaydırma:", ig_applicationIsOn);

    const currentReelVideo = ig_getCurrentVideo();
    if (currentReelVideo) {
        ig_attachListenersToReelVideo(currentReelVideo);
    }
    ig_startReelsObserver();
}

function ig_stopInstagramLogic() {
    if (!ig_appIsRunning) return;
    ig_appIsRunning = false;
    console.log("CS (IG): Instagram mantığı durduruluyor.");
    if (ig_currentVideoElement) {
        ig_currentVideoElement.removeEventListener('ended', ig_onVideoEnd);
    }
    if (ig_newVideoObserver) {
        ig_newVideoObserver.disconnect();
        ig_newVideoObserver = null;
    }
    ig_currentVideoElement = null;
}

function ig_checkURLAndManageApp() {
    const isOnInstagramPage = window.location.hostname.includes("instagram.com");
    const newIsOnReelsPage = window.location.pathname.startsWith("/reels/");

    if (isOnInstagramPage && newIsOnReelsPage && !ig_isOnReelsPage) {
        console.log("CS (IG): Reels sayfasına girildi.");
        ig_isOnReelsPage = true;
        ig_initializeInstagramLogic();
    } else if ((isOnInstagramPage && !newIsOnReelsPage && ig_isOnReelsPage) || (!isOnInstagramPage && ig_isOnReelsPage)) {
        console.log("CS (IG): Reels sayfasından çıkıldı.");
        ig_isOnReelsPage = false;
        ig_stopInstagramLogic();
    } else if (isOnInstagramPage && newIsOnReelsPage && ig_isOnReelsPage && !ig_appIsRunning) {
        console.log("CS (IG): Reels sayfasında uygulama durmuş, yeniden başlatılıyor.");
        ig_initializeInstagramLogic();
    }
}

function ig_observePageChanges() {
    const targetNode = document.body;
    if (!targetNode) {
        console.error("CS (IG): Sayfa izleme hedefi (body) bulunamadı.");
        return;
    }
    const config = { childList: true, subtree: true };

    let lastUrl = location.href;

    const ig_page_observer_callback = function(mutationsList, observer) {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            // console.log("CS (IG): URL değişti:", lastUrl); // ÖNERİ UYGULANDI: Daha az log
            ig_checkURLAndManageApp();
        }

        if (ig_isOnReelsPage && ig_appIsRunning) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const videosInNode = node.matches(IG_VIDEOS_LIST_SELECTOR) ? [node] : Array.from(node.querySelectorAll(IG_VIDEOS_LIST_SELECTOR));
                            videosInNode.forEach(video => {
                                if (ig_newVideoObserver && !video.dataset.igObserved) {
                                    ig_newVideoObserver.observe(video);
                                    video.dataset.igObserved = true;
                                    // console.log("CS (IG): Yeni eklenen video görünürlük gözlemcisine eklendi:", video); // ÖNERİ UYGULANDI: Daha az log
                                }
                            });
                        }
                    });
                }
            });
            const currentVisibleReel = ig_getCurrentVideo();
            if (currentVisibleReel && currentVisibleReel !== ig_currentVideoElement) {
                // console.log("CS (IG): Görünür video değişti (MutationObserver ile fark edildi), dinleyiciler güncelleniyor."); // ÖNERİ UYGULANDI: Daha az log
                ig_attachListenersToReelVideo(currentVisibleReel);
                if(ig_newVideoObserver && !currentVisibleReel.dataset.igObserved) {
                    ig_newVideoObserver.observe(currentVisibleReel);
                    currentVisibleReel.dataset.igObserved = true;
                }
            }
        }
    };

    ig_observer = new MutationObserver(ig_page_observer_callback);
    ig_observer.observe(targetNode, config);
    console.log("CS (IG): Instagram sayfa değişiklikleri izlenmeye başlandı.");

    ig_checkURLAndManageApp();

    window.addEventListener('popstate', () => {
        // console.log("CS (IG): Popstate olayı algılandı."); // ÖNERİ UYGULANDI: Daha az log
        ig_checkURLAndManageApp();
    });
}

function ig_updateStateBasedOnGlobal() {
    if (ig_appIsRunning) {
        ig_applicationIsOn = autoScrollEnabled;
        console.log("CS (IG): Global durum değişti, Instagram otomatik kaydırma şimdi:", ig_applicationIsOn);
        if (ig_applicationIsOn && ig_currentVideoElement && ig_currentVideoElement.ended) {
            ig_onVideoEnd();
        }
    }
}


// --- GENEL BAŞLANGIÇ VE MESAJLAŞMA ---

chrome.storage.local.get(['autoScrollEnabled'], (result) => {
    if (chrome.runtime.lastError) {
        console.error("CS (İlk Yükleme): Storage okunamadı:", chrome.runtime.lastError.message);
    } else {
        autoScrollEnabled = !!result.autoScrollEnabled;
        console.log("CS: Başlangıç otomatik kaydırma durumu (storage):", autoScrollEnabled);

        if (currentSite === 'youtube' && window.location.pathname.startsWith("/shorts/")) {
            console.log("CS: YT Shorts sayfasındayız, YouTube mantığı başlatılıyor...");
            yt_observePageChanges();
            if (yt_toggleButton) yt_updateButtonAppearance();
        } else if (currentSite === 'instagram') {
            console.log("CS: Instagram sayfasındayız, Instagram sayfa izleyicisi başlatılıyor...");
            ig_observePageChanges();
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "toggleStatus") {
        const oldState = autoScrollEnabled;
        autoScrollEnabled = request.enabled;
        console.log(`CS (Mesaj Alındı): Otomatik kaydırma güncellendi: ${oldState} -> ${autoScrollEnabled}`);

        if (currentSite === 'youtube' && window.location.pathname.startsWith("/shorts/")) {
            if (yt_toggleButton) yt_updateButtonAppearance();
            if (!autoScrollEnabled) {
                yt_scrollInitiatedForCurrentVideo = false;
            } else if (yt_currentVideoElement) {
                 yt_handleTimeUpdate();
            }
        } else if (currentSite === 'instagram') {
            ig_updateStateBasedOnGlobal();
        }
        sendResponse({ status: "ok", message: "Content script durumu güncelledi." });
    }
    return true;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.autoScrollEnabled) {
        const newEnabledState = changes.autoScrollEnabled.newValue;
        const oldState = autoScrollEnabled;
        autoScrollEnabled = newEnabledState;
        console.log(`CS (Storage Değişikliği): Otomatik kaydırma güncellendi: ${oldState} -> ${autoScrollEnabled}`);

        if (currentSite === 'youtube' && window.location.pathname.startsWith("/shorts/")) {
            if (yt_toggleButton) yt_updateButtonAppearance();
            if (!autoScrollEnabled) {
                yt_scrollInitiatedForCurrentVideo = false;
            } else if (yt_currentVideoElement) {
                 yt_handleTimeUpdate();
            }
        } else if (currentSite === 'instagram') {
            ig_updateStateBasedOnGlobal();
        }
    }
});