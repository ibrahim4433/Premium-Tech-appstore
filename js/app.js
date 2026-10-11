// ==========================================
// STORE CONFIGURATION
// ==========================================
const WORKER_URL = "https://appstore-proxy.4445622.workers.dev"; // The worker URL from user

let storeBanners = [];
// ==========================================

let allApps = [];
let currentLanguage = 'ar';
let activeView = 'home';
let currentSearch = '';
let currentSortMode = 'new';
let currentGroupMode = 'none';
let currentViewMode = 'grid';
let currentGridCols = 3;

// DOM Elements
const views = {
    home: document.getElementById('apps-page'), // Home reuses apps-page grid
    apps: document.getElementById('apps-page'),
    games: document.getElementById('apps-page'),
    categories: document.getElementById('categories-page')
};

const appsGrid = document.getElementById('apps-grid');
const categoriesGrid = document.getElementById('categories-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const navItems = document.querySelectorAll('.bottom-nav .nav-item, .desktop-tab');
const pageTitle = document.getElementById('page-title');
const bannersSection = document.getElementById('banners-section');
const modal = document.getElementById('app-modal');

// Modern UI DOM Elements
const homeShelves = document.getElementById('home-shelves');
const searchClearBtn = document.getElementById('search-clear');
const categoryChipsBar = document.getElementById('category-chips-bar');
const favoritesModal = document.getElementById('favorites-modal');
const closeFavoritesModalBtn = document.getElementById('close-favorites-modal');
const btnFavorites = document.getElementById('btn-favorites');
const favoritesBadge = document.getElementById('favorites-badge');
const toastContainer = document.getElementById('toast-container');
const modalFavBtn = document.getElementById('modal-fav-btn');
const modalShareBtn = document.getElementById('modal-share-btn');
let currentModalApp = null;
const STORAGE_KEY_FAVS = 'pts_favorites';

// Data Definitions
const TAG_MAP = {
    '#games': { ar: 'ألعاب', en: 'Games', icon: 'fa-gamepad' },
    '#Social': { ar: 'تواصل اجتماعي', en: 'Social', icon: 'fa-users' },
    '#editing': { ar: 'مونتاج وتصميم', en: 'Editing', icon: 'fa-wand-magic-sparkles' },
    '#vpn': { ar: 'كاسر بروكسي VPN', en: 'VPN', icon: 'fa-shield-halved' },
    '#Tools': { ar: 'أدوات', en: 'Tools', icon: 'fa-wrench' },
    '#watching': { ar: 'مشاهدة', en: 'Watching', icon: 'fa-play' },
    '#multimedia': { ar: 'ملتيميديا', en: 'Multimedia', icon: 'fa-photo-film' },
    '#browser': { ar: 'متصفحات', en: 'Browsers', icon: 'fa-globe' },
    '#translate': { ar: 'ترجمة', en: 'Translation', icon: 'fa-language' },
    '#store': { ar: 'متاجر', en: 'Stores', icon: 'fa-store' },
    '#record': { ar: 'تسجيل', en: 'Recording', icon: 'fa-microphone' },
    '#tips': { ar: 'شروحات', en: 'Tips', icon: 'fa-lightbulb' },
    '#books': { ar: 'كتب', en: 'Books', icon: 'fa-book' },
    '#wallpapers': { ar: 'خلفيات', en: 'Wallpapers', icon: 'fa-image' },
    '#themes': { ar: 'ثيمات', en: 'Themes', icon: 'fa-palette' },
    '#learning': { ar: 'تعليم', en: 'Education', icon: 'fa-graduation-cap' },
    '#religious': { ar: 'دينيات', en: 'Religious', icon: 'fa-mosque' },
    '#news': { ar: 'أخبار', en: 'News', icon: 'fa-newspaper' },
    '#music': { ar: 'موسيقى', en: 'Music', icon: 'fa-music' },
    '#keyboard': { ar: 'كيبوردات', en: 'Keyboards', icon: 'fa-keyboard' },
    '#camera': { ar: 'كاميرا وفلاتر', en: 'Camera', icon: 'fa-camera' },
    '#IA': { ar: 'ذكاء اصطناعي', en: 'AI', icon: 'fa-robot' }
};

const strings = {
    ar: {
        search: "البحث عن تطبيقات وألعاب...",
        loading: "جاري التحميل...",
        empty: "لم يتم العثور على نتائج.",
        download: "تنزيل",
        about: "حول هذا التطبيق",
        categoryApp: "تطبيق",
        categoryGame: "لعبة",
        titleHome: "الأحدث",
        titleApps: "التطبيقات",
        titleGames: "الألعاب",
        titleSearch: "نتائج البحث",
        navHome: "الرئيسية",
        navGames: "الألعاب",
        navApps: "التطبيقات",
        navCategories: "التصنيفات",
        bannerTitle: "اكتشف الجديد",
        bannerDesc: "أفضل التطبيقات والألعاب المميزة",
        labelSort: "ترتيب حسب",
        optSortNew: "الأحدث",
        optSortOld: "الأقدم",
        optSortAsc: "الاسم (أ-ي)",
        optSortDesc: "الاسم (ي-أ)",
        optSizeAsc: "الحجم (الأصغر)",
        optSizeDesc: "الحجم (الأكبر)",
        labelSize: "حجم الملف",
        optSizeAll: "الكل",
        optSizeSmall: "أصغر من 20MB (مباشر)",
        optSizeLarge: "أكبر من 20MB (تليجرام)",
        labelCategory: "التصنيف",
        optCatAll: "الكل",
        pwaInstallBtn: "تثبيت المتجر",
        pwaModalTitle: "تثبيت المتجر",
        pwaModalDesc: "قم بتثبيت التطبيق على جهازك للوصول السريع بدون الحاجة لفتح المتصفح في كل مرة!",
        pwaConfirmBtn: "موافق، تثبيت",
        reqModalTitle: "اطلب تطبيق/لعبة",
        reqLabelName: "اسم التطبيق/اللعبة *",
        reqNamePh: "مثال: Minecraft",
        reqLabelLink: "رابط جوجل بلاي (اختياري)",
        reqLabelMods: "نوع التعديل المطلوب",
        reqModOtherPh: "تعديل آخر... (اكتب هنا)",
        reqLabelNotes: "ملاحظات إضافية (اختياري)",
        reqNotesPh: "أي تفاصيل أخرى...",
        reqBtnSubmit: "إرسال الطلب عبر تليجرام",
        favAdded: "تمت الإضافة إلى المفضلة ❤️",
        favRemoved: "تم الحذف من المفضلة",
        favModalTitle: "تطبيقاتي المفضلة",
        favEmptyTitle: "لا توجد تطبيقات محفوظة بعد",
        favEmptyDesc: "اضغط على أيقونة القلب على أي تطبيق للوصول السريع إليه في أي وقت.",
        shareSuccess: "تم نسخ رابط التطبيق بنجاح! 📋",
        shelfTrending: "الأكثر تميزاً ورواجاً",
        shelfGames: "أفضل الألعاب المميزة",
        shelfAI: "تطبيقات الذكاء الاصطناعي",
        shelfDirect: "تنزيل مباشر بدون تليجرام",
        seeAll: "عرض الكل",
        directBadge: "⚡ مباشر"
    },
    en: {
        search: "Search for apps & games...",
        loading: "Loading...",
        empty: "No results found.",
        download: "Download",
        about: "About this app",
        categoryApp: "App",
        categoryGame: "Game",
        titleHome: "Latest",
        titleApps: "Apps",
        titleGames: "Games",
        titleSearch: "Search Results",
        navHome: "Home",
        navGames: "Games",
        navApps: "Apps",
        navCategories: "Categories",
        bannerTitle: "Discover",
        bannerDesc: "The best premium apps & games",
        labelSort: "Sort By",
        optSortNew: "Newest",
        optSortOld: "Oldest",
        optSortAsc: "Name (A-Z)",
        optSortDesc: "Name (Z-A)",
        optSizeAsc: "Size (Smallest)",
        optSizeDesc: "Size (Largest)",
        labelSize: "File Size",
        optSizeAll: "All",
        optSizeSmall: "< 20MB (Direct)",
        optSizeLarge: "> 20MB (Telegram)",
        labelCategory: "Category",
        optCatAll: "All",
        pwaInstallBtn: "Install Store",
        pwaModalTitle: "Install AppStore",
        pwaModalDesc: "Install the app on your device for quick access without needing to open the browser every time!",
        pwaConfirmBtn: "Yes, Install",
        reqModalTitle: "Request App/Game",
        reqLabelName: "App/Game Name *",
        reqNamePh: "e.g., Minecraft",
        reqLabelLink: "Google Play Link (Optional)",
        reqLabelMods: "Required Modification",
        reqModOtherPh: "Other mod... (Type here)",
        reqLabelNotes: "Additional Notes (Optional)",
        reqNotesPh: "Any other details...",
        reqBtnSubmit: "Send Request via Telegram",
        favAdded: "Added to favorites ❤️",
        favRemoved: "Removed from favorites",
        favModalTitle: "My Saved Apps",
        favEmptyTitle: "No saved apps yet",
        favEmptyDesc: "Tap the heart icon on any app to save it for quick access anytime.",
        shareSuccess: "App link copied to clipboard! 📋",
        shelfTrending: "Featured & Trending",
        shelfGames: "Top Games",
        shelfAI: "AI Tools",
        shelfDirect: "Direct Download (<20MB)",
        seeAll: "See All",
        directBadge: "⚡ Direct"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    createFloatingBackground();
    fetchBanners();
    fetchApps();
    setupEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'ar';
    setLanguage(savedLang);
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Update Text UI
    searchInput.placeholder = strings[lang].search;
    document.getElementById('loading-text').textContent = strings[lang].loading;
    document.getElementById('about-title').textContent = strings[lang].about;
    document.getElementById('download-text').textContent = strings[lang].download;
    // Update Nav Labels (Mobile)
    document.querySelector('.bottom-nav [data-view="home"] .nav-label').textContent = strings[lang].navHome;
    document.querySelector('.bottom-nav [data-view="games"] .nav-label').textContent = strings[lang].navGames;
    document.querySelector('.bottom-nav [data-view="apps"] .nav-label').textContent = strings[lang].navApps;
    document.querySelector('.bottom-nav [data-view="categories"] .nav-label').textContent = strings[lang].navCategories;

    // Update Desktop Tabs
    document.querySelector('.desktop-tabs [data-view="home"]').textContent = strings[lang].navHome;
    document.querySelector('.desktop-tabs [data-view="games"]').textContent = strings[lang].navGames;
    document.querySelector('.desktop-tabs [data-view="apps"]').textContent = strings[lang].navApps;
    document.querySelector('.desktop-tabs [data-view="categories"]').textContent = strings[lang].navCategories;

    // Update Home Actions
    const btnJoinText = document.getElementById('btn-join-text');
    if (btnJoinText) btnJoinText.textContent = lang === 'ar' ? 'انضمام للقناة' : 'Join Channel';
    const btnReqText = document.getElementById('btn-request-text');
    if (btnReqText) btnReqText.textContent = lang === 'ar' ? 'اطلب تطبيق/لعبة' : 'Request App/Game';

    // Update Filter labels
    const btnFilterText = document.getElementById('btn-filter-text');
    if (btnFilterText) btnFilterText.textContent = lang === 'ar' ? 'تصفية وترتيب' : 'Filter & Sort';

    ['label-sort', 'opt-sort-new', 'opt-sort-old', 'opt-sort-asc', 'opt-sort-desc', 'opt-size-asc', 'opt-size-desc',
     'label-size', 'opt-size-all', 'opt-size-small', 'opt-size-large', 'label-category', 'opt-cat-all'].forEach(id => {
         const el = document.getElementById(id);
         if (el) {
             const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
             el.textContent = strings[lang][key];
         }
     });

    // Update PWA UI
    const pwaBtnText = document.getElementById('pwa-btn-text');
    if (pwaBtnText) pwaBtnText.textContent = strings[lang].pwaInstallBtn;
    
    const staticInstallText = document.getElementById('static-install-text');
    if (staticInstallText) staticInstallText.textContent = strings[lang].pwaInstallBtn;
    
    const pwaModalTitle = document.getElementById('install-modal-title');
    if (pwaModalTitle) pwaModalTitle.textContent = strings[lang].pwaModalTitle;
    
    const pwaModalDesc = document.getElementById('install-modal-desc');
    if (pwaModalDesc) pwaModalDesc.textContent = strings[lang].pwaModalDesc;
    
    const pwaConfirmText = document.getElementById('confirm-install-text');
    if (pwaConfirmText) pwaConfirmText.textContent = strings[lang].pwaConfirmBtn;

    // Update Request Modal UI
    const reqModalTitle = document.getElementById('req-modal-title');
    if (reqModalTitle) reqModalTitle.textContent = strings[lang].reqModalTitle;
    const reqLabelName = document.getElementById('req-label-name');
    if (reqLabelName) reqLabelName.textContent = strings[lang].reqLabelName;
    const reqNameInput = document.getElementById('req-name');
    if (reqNameInput) reqNameInput.placeholder = strings[lang].reqNamePh;
    const reqLabelLink = document.getElementById('req-label-link');
    if (reqLabelLink) reqLabelLink.textContent = strings[lang].reqLabelLink;
    const reqLabelMods = document.getElementById('req-label-mods');
    if (reqLabelMods) reqLabelMods.textContent = strings[lang].reqLabelMods;
    const reqModOtherInput = document.getElementById('req-mod-other');
    if (reqModOtherInput) reqModOtherInput.placeholder = strings[lang].reqModOtherPh;
    const reqLabelNotes = document.getElementById('req-label-notes');
    if (reqLabelNotes) reqLabelNotes.textContent = strings[lang].reqLabelNotes;
    const reqNotesInput = document.getElementById('req-notes');
    if (reqNotesInput) reqNotesInput.placeholder = strings[lang].reqNotesPh;
    const reqBtnSubmitText = document.getElementById('req-btn-submit-text');
    if (reqBtnSubmitText) reqBtnSubmitText.textContent = strings[lang].reqBtnSubmit;

    document.querySelectorAll('.cb-text').forEach(span => {
        span.textContent = span.getAttribute(`data-${lang}`);
    });

    // Update Favorites Modal Text
    const favModalTitle = document.getElementById('fav-modal-title');
    if (favModalTitle) favModalTitle.textContent = strings[lang].favModalTitle;
    const favEmptyTitle = document.getElementById('fav-empty-title');
    if (favEmptyTitle) favEmptyTitle.textContent = strings[lang].favEmptyTitle;
    const favEmptyDesc = document.getElementById('fav-empty-desc');
    if (favEmptyDesc) favEmptyDesc.textContent = strings[lang].favEmptyDesc;

    // Update Shelves Headers
    const sFeatured = document.getElementById('shelf-featured-title');
    if (sFeatured) sFeatured.textContent = strings[lang].shelfTrending;
    const sGames = document.getElementById('shelf-games-title');
    if (sGames) sGames.textContent = strings[lang].shelfGames;
    const sAi = document.getElementById('shelf-ai-title');
    if (sAi) sAi.textContent = strings[lang].shelfAI;
    const sDirect = document.getElementById('shelf-direct-title');
    if (sDirect) sDirect.textContent = strings[lang].shelfDirect;
    document.querySelectorAll('.see-all-text').forEach(el => {
        el.textContent = strings[lang].seeAll;
    });

    // Update Category Chips
    if (categoryChipsBar) {
        const chipLabels = {
            'all': { ar: 'الكل', en: 'All' },
            '#games': { ar: 'ألعاب', en: 'Games' },
            '#IA': { ar: 'ذكاء اصطناعي', en: 'AI Tools' },
            '#watching': { ar: 'مشاهدة وميديا', en: 'Media' },
            '#vpn': { ar: 'VPN وحماية', en: 'VPN' },
            '#Tools': { ar: 'أدوات', en: 'Tools' },
            '#editing': { ar: 'مونتاج وتصميم', en: 'Editing' },
            'direct': { ar: 'تنزيل مباشر', en: 'Direct' },
            '#Social': { ar: 'تواصل', en: 'Social' }
        };
        categoryChipsBar.querySelectorAll('.chip').forEach(chip => {
            const key = chip.getAttribute('data-chip');
            const span = chip.querySelector('.chip-text');
            if (span && chipLabels[key]) {
                span.textContent = chipLabels[key][lang];
            }
        });
    }

    updateViewTitle();
    renderBanners();
    if (allApps.length > 0) {
        renderShelves();
        renderCategories();
        renderApps();
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, icon = 'fa-check', type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon} toast-icon ${type}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 2600);
}

// ==========================================
// FAVORITES SYSTEM (localStorage)
// ==========================================
function getFavorites() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_FAVS);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(favs) {
    try {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favs));
    } catch (e) {
        console.error('Failed to save favorites:', e);
    }
}

function isFavorite(appName) {
    const favs = getFavorites();
    return favs.includes(appName);
}

function toggleFavorite(app, event) {
    if (!app) return;
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const favs = getFavorites();
    const idx = favs.indexOf(app.name);
    let added = false;
    if (idx > -1) {
        favs.splice(idx, 1);
        added = false;
        showToast(strings[currentLanguage].favRemoved, 'fa-heart-crack', 'info');
    } else {
        favs.push(app.name);
        added = true;
        showToast(strings[currentLanguage].favAdded, 'fa-heart', 'heart');
    }
    saveFavorites(favs);
    updateFavoritesBadge();
    
    // Update card buttons on page matching this app name
    document.querySelectorAll(`[data-app-fav="${encodeURIComponent(app.name)}"]`).forEach(btn => {
        if (added) {
            btn.classList.add('active');
            btn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }
    });
    
    // Update modal fav button if open
    if (currentModalApp && currentModalApp.name === app.name) {
        updateModalFavBtn(currentModalApp);
    }
    
    // Update favorites modal list if open
    if (favoritesModal && favoritesModal.classList.contains('active')) {
        renderFavoritesList();
    }
}

function updateFavoritesBadge() {
    if (!favoritesBadge) return;
    const favs = getFavorites();
    const count = favs.length;
    if (count > 0) {
        favoritesBadge.textContent = count > 99 ? '99+' : count;
        favoritesBadge.style.display = 'block';
    } else {
        favoritesBadge.style.display = 'none';
    }
}

function updateModalFavBtn(app) {
    if (!modalFavBtn) return;
    const fav = isFavorite(app.name);
    if (fav) {
        modalFavBtn.classList.add('active');
        modalFavBtn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        modalFavBtn.title = currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites';
    } else {
        modalFavBtn.classList.remove('active');
        modalFavBtn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        modalFavBtn.title = currentLanguage === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites';
    }
}

function openFavoritesModal() {
    if (!favoritesModal) return;
    renderFavoritesList();
    favoritesModal.classList.add('active');
}

function closeFavoritesModal() {
    if (favoritesModal) {
        favoritesModal.classList.remove('active');
    }
}

function renderFavoritesList() {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('favorites-empty');
    const countEl = document.getElementById('fav-modal-count');
    if (!listEl || !emptyEl) return;
    
    const favNames = getFavorites();
    const favApps = allApps.filter(a => favNames.includes(a.name));
    
    if (countEl) {
        countEl.textContent = currentLanguage === 'ar' 
            ? `${favApps.length} تطبيق محفوظ` 
            : `${favApps.length} saved apps`;
    }
    
    if (favApps.length === 0) {
        listEl.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    
    emptyEl.style.display = 'none';
    listEl.innerHTML = '';
    
    favApps.forEach(app => {
        const item = document.createElement('div');
        item.className = 'fav-item-card';
        item.onclick = () => {
            closeFavoritesModal();
            openAppDetails(app);
        };
        
        const imgHTML = app.icon_id 
            ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="fav-item-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'fav-item-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
            : `<div class="fav-item-icon fallback"><i class="fa-brands fa-android"></i></div>`;
            
        const cat = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
        
        item.innerHTML = `
            ${imgHTML}
            <div class="fav-item-info">
                <div class="fav-item-title">${app.name}</div>
                <div class="fav-item-category">${cat} • ${formatBytes(app.size)}</div>
            </div>
            <button class="fav-remove-btn" title="حذف" aria-label="حذف">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        
        item.querySelector('.fav-remove-btn').onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(app, e);
        };
        
        listEl.appendChild(item);
    });
}

// ==========================================
// CURATED HOME SHELVES
// ==========================================
function renderShelves() {
    if (!homeShelves || allApps.length === 0) return;
    
    // 1. Featured / Trending: Top 10 apps
    const featuredGrid = document.getElementById('shelf-featured-grid');
    if (featuredGrid) {
        featuredGrid.innerHTML = '';
        const featured = allApps.slice(0, 10);
        featured.forEach(app => featuredGrid.appendChild(createShelfCard(app)));
    }
    
    // 2. Top Games
    const gamesGrid = document.getElementById('shelf-games-grid');
    if (gamesGrid) {
        gamesGrid.innerHTML = '';
        const games = allApps.filter(a => a.category === 'Games' || (a.tags && a.tags.some(t => t.toLowerCase().includes('game')))).slice(0, 10);
        games.forEach(app => gamesGrid.appendChild(createShelfCard(app)));
    }
    
    // 3. AI Tools
    const aiGrid = document.getElementById('shelf-ai-grid');
    if (aiGrid) {
        aiGrid.innerHTML = '';
        const aiApps = allApps.filter(a => {
            if (a.tags && a.tags.some(t => t.toLowerCase() === '#ia' || t.toLowerCase() === '#ai')) return true;
            const text = (a.name + ' ' + (a.description || '')).toLowerCase();
            return text.includes('ذكاء اصطناعي') || text.includes('deepseek') || text.includes('chatgpt') || text.includes('gpt') || text.includes(' ai ');
        }).slice(0, 10);
        aiApps.forEach(app => aiGrid.appendChild(createShelfCard(app)));
    }
    
    // 4. Direct Download: <= 19.5MB
    const directGrid = document.getElementById('shelf-direct-grid');
    if (directGrid) {
        directGrid.innerHTML = '';
        const directApps = allApps.filter(a => a.size > 0 && a.size <= 19.5 * 1024 * 1024).slice(0, 10);
        directApps.forEach(app => directGrid.appendChild(createShelfCard(app)));
    }
}

function createShelfCard(app) {
    const card = document.createElement('div');
    card.className = 'shelf-card';
    card.onclick = () => openAppDetails(app);

    const isLarge = app.size > 19.5 * 1024 * 1024;
    const badgeHTML = !isLarge ? `<span class="shelf-card-badge"><i class="fa-solid fa-bolt"></i> مباشر</span>` : '';
    
    const imgHTML = app.icon_id 
        ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="shelf-card-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'shelf-card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
        : `<div class="shelf-card-icon fallback"><i class="fa-brands fa-android"></i></div>`;

    card.innerHTML = `
        ${badgeHTML}
        ${imgHTML}
        <div class="shelf-card-title">${app.name}</div>
        <div class="shelf-card-meta">
            <span>${formatBytes(app.size)}</span>
        </div>
    `;
    return card;
}

// ==========================================
// CATEGORY CHIPS & SHELF EVENTS
// ==========================================
function setupCategoryChips() {
    if (!categoryChipsBar) return;
    categoryChipsBar.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChipsBar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const chipType = chip.getAttribute('data-chip');
            const sizeSelect = document.getElementById('size-select');
            const categorySelect = document.getElementById('category-select');
            
            if (chipType === 'all') {
                if (sizeSelect) sizeSelect.value = 'all';
                if (categorySelect) categorySelect.value = 'all';
                currentSearch = '';
                searchInput.value = '';
                if (searchClearBtn) searchClearBtn.classList.remove('visible');
                if (activeView !== 'home') switchView('home');
                else renderApps();
            } else if (chipType === 'direct') {
                if (sizeSelect) sizeSelect.value = 'small';
                if (categorySelect) categorySelect.value = 'all';
                currentSearch = '';
                searchInput.value = '';
                if (searchClearBtn) searchClearBtn.classList.remove('visible');
                if (activeView !== 'home') switchView('home');
                else renderApps();
            } else if (chipType === '#games') {
                if (sizeSelect) sizeSelect.value = 'all';
                if (categorySelect) categorySelect.value = 'all';
                currentSearch = '';
                searchInput.value = '';
                if (searchClearBtn) searchClearBtn.classList.remove('visible');
                switchView('games');
            } else {
                if (sizeSelect) sizeSelect.value = 'all';
                if (categorySelect) categorySelect.value = 'all';
                currentSearch = chipType.toLowerCase();
                searchInput.value = chipType;
                if (searchClearBtn) searchClearBtn.classList.add('visible');
                if (activeView !== 'home') switchView('home');
                else renderApps();
            }
            
            const top = appsGrid.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
    });
}

function setupShelvesEvents() {
    document.querySelectorAll('.shelf-see-all').forEach(btn => {
        btn.addEventListener('click', () => {
            const shelfType = btn.getAttribute('data-shelf');
            const sizeSelect = document.getElementById('size-select');
            
            if (shelfType === 'featured') {
                currentSortMode = 'new';
                const utilSort = document.getElementById('util-sort');
                if (utilSort) utilSort.classList.remove('active');
                renderApps();
            } else if (shelfType === 'games') {
                switchView('games');
            } else if (shelfType === 'ai') {
                currentSearch = '#ia';
                searchInput.value = '#IA';
                if (searchClearBtn) searchClearBtn.classList.add('visible');
                renderApps();
            } else if (shelfType === 'direct') {
                if (sizeSelect) sizeSelect.value = 'small';
                renderApps();
            }
            
            const top = appsGrid.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
    });
}

function setupEventListeners() {
    let searchDebounceTimer = null;
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
            if (searchClearBtn) searchClearBtn.classList.add('visible');
        } else {
            if (searchClearBtn) searchClearBtn.classList.remove('visible');
        }
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            if (activeView === 'categories') {
                renderCategories();
            } else {
                renderApps();
            }
        }, 150);
    });

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchClearBtn.classList.remove('visible');
            currentSearch = '';
            if (categoryChipsBar) {
                categoryChipsBar.querySelectorAll('.chip').forEach(c => {
                    if (c.getAttribute('data-chip') === 'all') c.classList.add('active');
                    else c.classList.remove('active');
                });
            }
            if (activeView === 'categories') {
                renderCategories();
            } else {
                renderApps();
            }
            searchInput.focus();
        });
    }

    setupCategoryChips();
    setupShelvesEvents();

    if (btnFavorites) {
        btnFavorites.addEventListener('click', openFavoritesModal);
    }
    if (closeFavoritesModalBtn) {
        closeFavoritesModalBtn.addEventListener('click', closeFavoritesModal);
    }
    window.addEventListener('click', (e) => {
        if (e.target === favoritesModal && favoritesModal.classList.contains('active')) {
            closeFavoritesModal();
        }
    });

    if (modalFavBtn) {
        modalFavBtn.onclick = () => {
            if (currentModalApp) {
                toggleFavorite(currentModalApp);
            }
        };
    }

    if (modalShareBtn) {
        modalShareBtn.onclick = () => {
            if (!currentModalApp) return;
            const shareUrl = `${window.location.origin}${window.location.pathname}?app=${encodeURIComponent(currentModalApp.name)}`;
            if (navigator.share) {
                navigator.share({
                    title: currentModalApp.name,
                    text: `${currentModalApp.name} - متجر Premium Techs`,
                    url: shareUrl
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast(strings[currentLanguage].shareSuccess, 'fa-copy', 'success');
                }).catch(() => {
                    showToast(shareUrl, 'fa-link', 'info');
                });
            }
        };
    }

    const utilSort = document.getElementById('util-sort');
    if (utilSort) {
        utilSort.addEventListener('click', () => {
            const sortModes = ['new', 'old', 'name_asc', 'name_desc'];
            const icons = ['fa-clock', 'fa-clock-rotate-left', 'fa-arrow-down-a-z', 'fa-arrow-up-z-a'];
            const labelsAr = ['الأحدث', 'الأقدم', 'أبجدي تصاعدي', 'أبجدي تنازلي'];
            const labelsEn = ['Newest', 'Oldest', 'A-Z', 'Z-A'];
            let idx = sortModes.indexOf(currentSortMode);
            idx = (idx + 1) % sortModes.length;
            currentSortMode = sortModes[idx];
            
            const labels = currentLanguage === 'ar' ? labelsAr : labelsEn;
            utilSort.innerHTML = `<i class="fa-solid ${icons[idx]}"></i> <span class="util-text">${labels[idx]}</span>`;
            
            // Update page title based on sorting mode
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = labels[idx];
            }
            
            if (currentSortMode !== 'new') utilSort.classList.add('active');
            else utilSort.classList.remove('active');
            
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = currentSortMode;
            
            renderApps();
        });
    }
    
    const utilGroup = document.getElementById('util-group');
    if (utilGroup) {
        utilGroup.addEventListener('click', () => {
            const groupModes = ['none', 'category', 'alpha', 'date'];
            const icons = ['fa-layer-group', 'fa-tags', 'fa-font', 'fa-calendar-day'];
            const labelsAr = ['تجميع', 'التصنيفات', 'أبجدياً', 'التاريخ'];
            const labelsEn = ['Group', 'Categories', 'Alphabetical', 'Date'];
            
            let idx = groupModes.indexOf(currentGroupMode);
            idx = (idx + 1) % groupModes.length;
            currentGroupMode = groupModes[idx];
            
            const labels = currentLanguage === 'ar' ? labelsAr : labelsEn;
            utilGroup.innerHTML = `<i class="fa-solid ${icons[idx]}"></i> <span class="util-text">${labels[idx]}</span>`;
            
            if (currentGroupMode === 'none') {
                utilGroup.classList.remove('active');
            } else {
                utilGroup.classList.add('active');
            }
            renderApps();
        });
    }

    const utilView = document.getElementById('util-view');
    if (utilView) {
        utilView.addEventListener('click', () => {
            const viewModes = ['grid', 'list', 'single'];
            const icons = ['fa-grip', 'fa-list', 'fa-square'];
            const labelsAr = ['شبكة', 'قائمة', 'صف واحد'];
            const labelsEn = ['Grid', 'List', 'Single'];
            
            let idx = viewModes.indexOf(currentViewMode);
            idx = (idx + 1) % viewModes.length;
            currentViewMode = viewModes[idx];
            
            const labels = currentLanguage === 'ar' ? labelsAr : labelsEn;
            utilView.innerHTML = `<i class="fa-solid ${icons[idx]}"></i> <span class="util-text">${labels[idx]}</span>`;
            
            if (currentViewMode !== 'grid') utilView.classList.add('active');
            else utilView.classList.remove('active');
            
            updateGridClass();
        });
    }
    
    const utilSlider = document.getElementById('grid-columns-slider');
    if (utilSlider) {
        utilSlider.addEventListener('input', (e) => {
            currentGridCols = parseInt(e.target.value);
            updateGridClass();
        });
    }
    const filterToggle = document.getElementById('filter-toggle');
    const filterPanel = document.getElementById('filter-panel');
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', () => {
            filterToggle.classList.toggle('active');
            filterPanel.style.display = filterPanel.style.display === 'none' ? 'flex' : 'none';
        });
    }

    ['sort-select', 'size-select', 'category-select'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderApps);
    });

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.getAttribute('data-view'));
        });
    });

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    langToggle.addEventListener('click', () => {
        setLanguage(currentLanguage === 'ar' ? 'en' : 'ar');
        localStorage.setItem('lang', currentLanguage);
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            if (history.state && history.state.modalOpen) history.back();
        }
    });
    window.addEventListener('click', (e) => { 
        if (e.target === modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            if (history.state && history.state.modalOpen) history.back();
        } 
    });
    window.addEventListener('popstate', (e) => {
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // Request Modal Logic
    const reqModal = document.getElementById('request-modal');
    const btnRequestLink = document.getElementById('btn-request-link');
    const closeReqModal = document.getElementById('close-request-modal');
    const requestForm = document.getElementById('request-form');

    if (btnRequestLink) {
        btnRequestLink.addEventListener('click', () => {
            if (reqModal) reqModal.classList.add('active');
        });
    }

    if (closeReqModal) {
        closeReqModal.addEventListener('click', () => {
            if (reqModal) reqModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === reqModal && reqModal.classList.contains('active')) {
            reqModal.classList.remove('active');
        }
    });

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const appName = document.getElementById('req-name').value.trim();
            const playLink = document.getElementById('req-link').value.trim();
            const notes = document.getElementById('req-notes').value.trim();
            const otherMod = document.getElementById('req-mod-other').value.trim();
            
            // Gather checkboxes
            const selectedMods = [];
            document.querySelectorAll('.req-mod-cb:checked').forEach(cb => {
                selectedMods.push(cb.value);
            });
            if (otherMod) selectedMods.push(otherMod);

            let message = `📌 **طلب تطبيق/لعبة**\n`;
            message += `🔹 الاسم: ${appName}\n`;
            if (playLink) message += `🔗 الرابط: ${playLink}\n`;
            if (selectedMods.length > 0) message += `🛠 التعديل المطلوب: ${selectedMods.join(', ')}\n`;
            if (notes) message += `📝 ملاحظات: ${notes}\n`;

            const botUrl = `https://t.me/IA_Assistantbot?text=${encodeURIComponent(message)}`;
            window.open(botUrl, '_blank');
            
            // Reset and close
            requestForm.reset();
            reqModal.classList.remove('active');
        });
    }
}

function switchView(viewName) {
    if (activeView === viewName && currentSearch === '') return;
    activeView = viewName;
    
    // Update active nav button
    navItems.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`[data-view="${viewName}"]`).forEach(btn => btn.classList.add('active'));

    // Hide all pages
    Object.values(views).forEach(page => {
        if(page) page.classList.remove('active');
    });

    // Handle Search Override
    if (currentSearch !== '') {
        currentSearch = '';
        searchInput.value = '';
        if (searchClearBtn) searchClearBtn.classList.remove('visible');
    }
    
    // Toggle home actions
    const homeActions = document.getElementById('home-actions');
    if (homeActions) {
        homeActions.style.display = viewName === 'home' ? 'flex' : 'none';
    }

    // Show selected page
    if (viewName === 'categories') {
        bannersSection.style.display = 'none';
        if (homeShelves) homeShelves.style.display = 'none';
        views.categories.classList.add('active');
    } else {
        bannersSection.style.display = viewName === 'home' ? 'flex' : 'none';
        views.apps.classList.add('active');
        updateViewTitle();
        renderApps();
    }
}

function updateViewTitle(customTitle = null) {
    if (customTitle) {
        pageTitle.textContent = customTitle;
        return;
    }
    if (currentSearch) {
        pageTitle.textContent = strings[currentLanguage].titleSearch;
    } else if (activeView === 'home') {
        const sortModes = ['new', 'old', 'name_asc', 'name_desc'];
        const labelsAr = ['الأحدث', 'الأقدم', 'أبجدي تصاعدي', 'أبجدي تنازلي'];
        const labelsEn = ['Newest', 'Oldest', 'A-Z', 'Z-A'];
        const idx = sortModes.indexOf(currentSortMode);
        const labels = currentLanguage === 'ar' ? labelsAr : labelsEn;
        pageTitle.textContent = labels[idx];
    } else if (activeView === 'apps') {
        pageTitle.textContent = strings[currentLanguage].titleApps;
    } else if (activeView === 'games') {
        pageTitle.textContent = strings[currentLanguage].titleGames;
    }
}

async function fetchApps() {
    try {
        const response = await fetch('apps.json');
        if (!response.ok) throw new Error('Failed to load apps');
        allApps = await response.json();
        allApps.forEach((app, idx) => { 
            if(!app.category) app.category = 'Apps';
            app._index = idx; // Store original insertion order for sorting
            if (app.description) {
                const words = app.description.trim().split(/\s+/);
                app._descShort = words.length > 4 ? words.slice(0, 4).join(' ') + '...' : words.slice(0, 4).join(' ');
            } else {
                app._descShort = '';
            }
        });
        loading.style.display = 'none';
        renderShelves();
        updateFavoritesBadge();
        renderCategories();
        renderApps();

        // Deep-linking support (?app=Name)
        const urlParams = new URLSearchParams(window.location.search);
        const deepApp = urlParams.get('app');
        if (deepApp) {
            const target = allApps.find(a => a.name.toLowerCase() === deepApp.trim().toLowerCase());
            if (target) {
                setTimeout(() => openAppDetails(target), 300);
            }
        }
    } catch (error) {
        console.error(error);
        document.getElementById('loading-text').textContent = 'Error loading store data.';
    }
}

async function fetchBanners() {
    try {
        const response = await fetch('banners.json');
        if (!response.ok) throw new Error('Failed to load banners.json');
        storeBanners = await response.json();
        renderBanners();
    } catch (error) {
        console.error('Banners fetch error:', error);
    }
}

function renderBanners() {
    bannersSection.innerHTML = '';
    
    // Setup snapping physics
    bannersSection.style.scrollSnapType = 'x mandatory';
    bannersSection.style.overflowX = 'auto';
    bannersSection.style.scrollBehavior = 'smooth';
    
    if (window.mainScrollTimer) clearInterval(window.mainScrollTimer);
    if (window.slideTimers) {
        window.slideTimers.forEach(t => clearInterval(t));
    }
    window.slideTimers = [];

    storeBanners.forEach((bannerConfig, index) => {
        const div = document.createElement('div');
        div.className = 'banner';
        div.dataset.index = index;
        div.style.scrollSnapAlign = 'center';
        
        // Handle Action Click
        div.addEventListener('click', () => {
            if (!bannerConfig.action) return;
            if (bannerConfig.action.type === 'link') {
                window.open(bannerConfig.action.target, '_blank');
            } else if (bannerConfig.action.type === 'open_app') {
                const targetApp = allApps.find(a => a.name.toLowerCase() === bannerConfig.action.appName.toLowerCase());
                if (targetApp) openAppDetails(targetApp);
                else console.warn('App not found for banner click:', bannerConfig.action.appName);
            }
        });

        // Setup internal slides
        if (bannerConfig.slides && bannerConfig.slides.length > 0) {
            bannerConfig.slides.forEach((slide, sIdx) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `banner-slide ${sIdx === 0 ? 'active' : ''}`;
                
                const titleStr = slide.title[currentLanguage] || slide.title.en || '';
                const subStr = slide.subtitle[currentLanguage] || slide.subtitle.en || '';
                
                slideDiv.innerHTML = `
                    <div style="background: linear-gradient(45deg, #024773, #11a6d4); width:100%; height:100%; position:absolute; top:0; left:0; z-index:-2;"></div>
                    <img src="${slide.image}" onerror="this.style.display='none'" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:-1;" alt="Banner Image">
                    <div class="banner-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); z-index:0;"></div>
                    <div class="banner-content" style="position:relative; z-index:1; width:100%;">
                        <h2 style="margin: 0 0 5px 0;">${titleStr}</h2>
                        <p style="margin: 0;">${subStr}</p>
                    </div>
                `;
                div.appendChild(slideDiv);
            });
        }
        
        bannersSection.appendChild(div);
    });
    
    setupRobustBanners();
}

let currentBannerIndex = 0;

function setupRobustBanners() {
    const banners = document.querySelectorAll('.banner');
    if (!banners.length) return;

    // 1. Setup independent internal slide cycling for EVERY banner
    banners.forEach((banner) => {
        const slides = banner.querySelectorAll('.banner-slide');
        if (slides.length <= 1) return;
        
        let currentSlide = 0;
        // Make sure first is active
        slides.forEach((s, i) => {
            if (i === 0) s.classList.add('active');
            else s.classList.remove('active');
        });

        const timer = setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000); // Crossfade every 3 seconds
        
        window.slideTimers.push(timer);
    });

    // 2. Setup a continuous auto-scroller for the main container
    currentBannerIndex = 0;
    window.mainScrollTimer = setInterval(() => {
        if (!bannersSection || bannersSection.style.display === 'none') return;
        const allBanners = document.querySelectorAll('.banner');
        if (!allBanners.length) return;

        currentBannerIndex++;
        if (currentBannerIndex >= allBanners.length) {
            currentBannerIndex = 0;
        }

        const targetBanner = allBanners[currentBannerIndex];
        // Calculate scroll position to center the banner horizontally
        const scrollLeft = targetBanner.offsetLeft - (bannersSection.clientWidth - targetBanner.clientWidth) / 2;
        bannersSection.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 5000); // Move to next banner every 5 seconds
}

function getTagInfo(tag) {
    if (typeof TAG_MAP !== 'undefined' && TAG_MAP[tag.toLowerCase()]) return TAG_MAP[tag.toLowerCase()];
    const lower = tag.toLowerCase();
    let icon = 'fa-tag';
    let ar = tag.replace('#', '');
    let en = tag.replace('#', '');
    
    if (lower.includes('game') || lower.includes('gta') || lower.includes('psp') || lower.includes('racer')) { icon = 'fa-gamepad'; ar = 'ألعاب'; en = 'Games'; }
    else if (lower.includes('watch') || lower.includes('tv') || lower.includes('movie') || lower.includes('anime') || lower.includes('player') || lower.includes('media')) { icon = 'fa-tv'; ar = 'ميديا ومشاهدة'; en = 'Media'; }
    else if (lower.includes('tool') || lower.includes('edit') || lower.includes('manager') || lower.includes('scanner') || lower.includes('camera') || lower.includes('launcher')) { icon = 'fa-wrench'; ar = 'أدوات'; en = 'Tools'; }
    else if (lower.includes('music') || lower.includes('audio') || lower.includes('podcast') || lower.includes('radio') || lower.includes('spotify') || lower.includes('listen')) { icon = 'fa-music'; ar = 'صوتيات'; en = 'Audio'; }
    else if (lower.includes('vpn') || lower.includes('secur') || lower.includes('firewall') || lower.includes('internet')) { icon = 'fa-shield-halved'; ar = 'حماية وشبكات'; en = 'VPN & Security'; }
    else if (lower.includes('social') || lower.includes('chat') || lower.includes('wa') || lower.includes('insta') || lower.includes('tiktok') || lower.includes('comunication') || lower.includes('telegram')) { icon = 'fa-users'; ar = 'تواصل اجتماعي'; en = 'Social'; }
    else if (lower.includes('ai') || lower.includes('bot') || lower.includes('ia') || lower.includes('chatgpt')) { icon = 'fa-robot'; ar = 'ذكاء اصطناعي'; en = 'AI'; }
    else if (lower.includes('book') || lower.includes('pdf') || lower.includes('read') || lower.includes('dictionary') || lower.includes('notes')) { icon = 'fa-book'; ar = 'كتب وملاحظات'; en = 'Books & Notes'; }
    else if (lower.includes('islam') || lower.includes('quran') || lower.includes('دين') || lower.includes('قران') || lower.includes('اذكار') || lower.includes('أسلامي')) { icon = 'fa-mosque'; ar = 'إسلاميات'; en = 'Islamic'; }
    else if (lower.includes('sport') || lower.includes('football')) { icon = 'fa-futbol'; ar = 'رياضة'; en = 'Sports'; }
    else if (lower.includes('photo') || lower.includes('image') || lower.includes('art') || lower.includes('design') || lower.includes('wallpaper')) { icon = 'fa-image'; ar = 'صور وتصميم'; en = 'Photos & Art'; }
    else if (lower.includes('health') || lower.includes('fit') || lower.includes('work') || lower.includes('medical')) { icon = 'fa-heart-pulse'; ar = 'صحة'; en = 'Health'; }
    else if (lower.includes('educat') || lower.includes('learn') || lower.includes('lesson')) { icon = 'fa-graduation-cap'; ar = 'تعليم'; en = 'Education'; }
    else if (lower.includes('browser') || lower.includes('web')) { icon = 'fa-globe'; ar = 'تصفح'; en = 'Browsers'; }
    else if (lower.includes('business') || lower.includes('finance')) { icon = 'fa-briefcase'; ar = 'أعمال'; en = 'Business'; }
    else if (lower.includes('map') || lower.includes('nav')) { icon = 'fa-map-location-dot'; ar = 'خرائط'; en = 'Maps'; }
    
    return { ar: ar, en: en, icon: icon };
}

function renderCategories() {
    categoriesGrid.innerHTML = '';
    const uniqueTags = new Set();
    allApps.forEach(app => { if(app.tags) app.tags.forEach(t => uniqueTags.add(t)); });

    if(uniqueTags.size === 0) return;
    
    const renderedNames = new Set(); // Avoid duplicate categories with different tags but same mapped name
    
    const categorySelect = document.getElementById('category-select');
    let prevSelected = '';
    if (categorySelect) {
        prevSelected = categorySelect.value;
        while (categorySelect.options.length > 1) categorySelect.remove(1);
    }

    uniqueTags.forEach(tag => {
        const tagData = getTagInfo(tag);
        const label = currentLanguage === 'ar' ? tagData.ar : tagData.en;
        
        if (renderedNames.has(label)) return;
        
        if (currentSearch && !currentSearch.startsWith('#')) {
            if (!label.toLowerCase().includes(currentSearch)) {
                return;
            }
        }
        
        renderedNames.add(label);
        
        const card = document.createElement('div');
        card.className = 'category-card';
        
        card.innerHTML = `
            <i class="fa-solid ${tagData.icon}"></i>
            <span>${label}</span>
        `;
        
        card.onclick = () => {
            switchView('home');
            currentSearch = tag;
            searchInput.value = '';
            updateViewTitle(label);
            renderApps();
        };
        categoriesGrid.appendChild(card);
        
        // Add to dropdown
        if (categorySelect) {
            const opt = document.createElement('option');
            opt.value = label;
            opt.text = label;
            if (label === prevSelected) opt.selected = true;
            categorySelect.appendChild(opt);
        }
    });
}

let currentFilteredApps = [];
let currentlyRenderedCount = 0;
const BATCH_SIZE = 36;
let gridObserver = null;

function renderApps() {
    appsGrid.innerHTML = '';
    if (gridObserver) {
        gridObserver.disconnect();
        gridObserver = null;
    }
    
    const selectedCat = document.getElementById('category-select') ? document.getElementById('category-select').value : 'all';
    const sizeFilter = document.getElementById('size-select') ? document.getElementById('size-select').value : 'all';

    // Toggle Home Shelves (only in default unfiltered Home view)
    if (homeShelves) {
        const isDefaultHome = activeView === 'home' && !currentSearch && selectedCat === 'all' && sizeFilter === 'all';
        homeShelves.style.display = isDefaultHome ? 'flex' : 'none';
    }

    const filteredApps = allApps.filter(app => {
        // Dropdown Category Filter
        if (selectedCat !== 'all') {
            let hasTag = false;
            if (app.tags) {
                for (let i = 0; i < app.tags.length; i++) {
                    const tagInfo = getTagInfo(app.tags[i]);
                    const tagLabel = currentLanguage === 'ar' ? tagInfo.ar : tagInfo.en;
                    if (tagLabel === selectedCat) { hasTag = true; break; }
                }
            }
            if (!hasTag) return false;
        } else if (currentSearch.startsWith('#')) {
            // Handle explicit Tag filtering from Category click
            if (!app.tags || !app.tags.includes(currentSearch)) return false;
        }

        // View Filtering
        if (activeView === 'apps' && app.category !== 'Apps') return false;
        if (activeView === 'games' && app.category !== 'Games') return false;
        
        // Size filtering
        const isLarge = app.size > 19.5 * 1024 * 1024;
        if (sizeFilter === 'small' && isLarge) return false;
        if (sizeFilter === 'large' && !isLarge) return false;
        
        // Text Search
        if (currentSearch && !currentSearch.startsWith('#')) {
            const term = currentSearch.toLowerCase();
            return app.name.toLowerCase().includes(term) || (app.description && app.description.toLowerCase().includes(term));
        }
        return true;
    });
    
    // Sort
    const sortMethod = currentSortMode;
    filteredApps.sort((a, b) => {
        const aDate = a.date ? a.date : a._index;
        const bDate = b.date ? b.date : b._index;
        
        if (sortMethod === 'new') return bDate - aDate; // Newest first
        if (sortMethod === 'old') return aDate - bDate; // Oldest first
        if (sortMethod === 'name_asc') return a.name.localeCompare(b.name);
        if (sortMethod === 'name_desc') return b.name.localeCompare(a.name);
        if (sortMethod === 'size_asc') return a.size - b.size;
        if (sortMethod === 'size_desc') return b.size - a.size;
        return 0;
    });

    currentFilteredApps = filteredApps;
    currentlyRenderedCount = 0;

    if (filteredApps.length === 0) {
        appsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">${strings[currentLanguage].empty}</div>`;
        return;
    }

    if (currentGroupMode !== 'none') {
        const grouped = {};
        filteredApps.forEach(app => {
            let groupKey = '';
            if (currentGroupMode === 'category') {
                let mainTagLabel = (app.category === 'Games') ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
                if (app.tags && app.tags.length > 0) {
                    const tagInfo = getTagInfo(app.tags[0]);
                    mainTagLabel = currentLanguage === 'ar' ? tagInfo.ar : tagInfo.en;
                }
                groupKey = mainTagLabel;
            } else if (currentGroupMode === 'alpha') {
                groupKey = app.name.charAt(0).toUpperCase();
                if (!groupKey.match(/[A-Zأ-ي]/)) groupKey = '#';
            } else if (currentGroupMode === 'date') {
                if (app.date) {
                    const d = new Date(app.date * 1000);
                    groupKey = `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                } else {
                    groupKey = currentLanguage === 'ar' ? 'أقدم' : 'Older';
                }
            }
            if (!grouped[groupKey]) grouped[groupKey] = [];
            grouped[groupKey].push(app);
        });
        
        let sortedKeys = Object.keys(grouped).sort();
        if (currentGroupMode === 'date') sortedKeys = sortedKeys.reverse();
        
        const fragment = document.createDocumentFragment();
        sortedKeys.forEach(key => {
            const header = document.createElement('div');
            header.className = 'group-header';
            header.textContent = key;
            fragment.appendChild(header);
            
            grouped[key].forEach(app => {
                fragment.appendChild(createAppCard(app));
            });
        });
        appsGrid.appendChild(fragment);
    } else {
        renderNextBatch();
    }
}

function renderNextBatch() {
    if (currentlyRenderedCount >= currentFilteredApps.length) return;
    
    const fragment = document.createDocumentFragment();
    const nextLimit = Math.min(currentlyRenderedCount + BATCH_SIZE, currentFilteredApps.length);
    
    for (let i = currentlyRenderedCount; i < nextLimit; i++) {
        fragment.appendChild(createAppCard(currentFilteredApps[i]));
    }
    currentlyRenderedCount = nextLimit;
    
    const oldSentinel = document.getElementById('grid-sentinel');
    if (oldSentinel) oldSentinel.remove();
    
    appsGrid.appendChild(fragment);
    
    if (currentlyRenderedCount < currentFilteredApps.length) {
        const sentinel = document.createElement('div');
        sentinel.id = 'grid-sentinel';
        sentinel.style.cssText = 'grid-column: 1 / -1; height: 30px; width: 100%; pointer-events: none;';
        appsGrid.appendChild(sentinel);
        
        if (!gridObserver) {
            gridObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    renderNextBatch();
                }
            }, { rootMargin: '600px 0px' });
        }
        gridObserver.observe(sentinel);
    }
}

function updateGridClass() {
    appsGrid.className = 'apps-grid';
    if (currentViewMode === 'list') appsGrid.classList.add('view-list');
    else if (currentViewMode === 'single') appsGrid.classList.add('view-single');
    else {
        appsGrid.style.gridTemplateColumns = `repeat(${currentGridCols}, minmax(100px, 1fr))`;
    }
    
    if (currentViewMode !== 'grid') appsGrid.style.gridTemplateColumns = '';
}

function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.onclick = () => openAppDetails(app);

    const isFav = isFavorite(app.name);
    const favBtnHTML = `
        <button class="card-fav-btn ${isFav ? 'active' : ''}" data-app-fav="${encodeURIComponent(app.name)}" title="المفضلة" aria-label="المفضلة" onclick="toggleFavorite(allApps[${app._index}], event)">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
    `;

    const imgHTML = app.icon_id 
        ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="card-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
        : `<div class="card-icon fallback"><i class="fa-brands fa-android"></i></div>`;

    const categoryText = app._descShort || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    const isLarge = app.size > 19.5 * 1024 * 1024;
    const directBadgeHTML = !isLarge 
        ? `<span class="card-tag-badge tag-direct"><i class="fa-solid fa-bolt"></i> ${strings[currentLanguage].directBadge}</span>`
        : '';
    
    let tgLink = `https://t.me/+ij7-LS669ahhMDFk`;
    if (app.chat_id && app.chat_id.startsWith('-100')) {
        const baseChatId = app.chat_id.substring(4);
        tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
    }
    
    const downloadLink = isLarge 
        ? tgLink
        : `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
    
    const btnIcon = isLarge ? 'fa-paper-plane' : 'fa-download';
    const btnText = strings[currentLanguage].download;

    card.innerHTML = `
        ${favBtnHTML}
        ${imgHTML}
        <div class="card-info">
            <div class="card-title">${app.name}</div>
            <div class="card-category" style="opacity: 0.8; font-size: 0.8rem; line-height: 1.4;">
                ${categoryText}
                ${directBadgeHTML}
            </div>
        </div>
        <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
            <i class="fa-solid ${btnIcon}"></i> ${btnText}
        </a>
    `;
    return card;
}

function formatBytes(bytes) {
    if (!+bytes) return '0 B';
    const k = 1024, i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

function openAppDetails(app) {
    history.pushState({ modalOpen: true }, ''); // Push state for back button
    currentModalApp = app;
    updateModalFavBtn(app);
    
    document.getElementById('modal-title').textContent = app.name;
    
    const versionText = app.version ? (currentLanguage === 'ar' ? `إصدار: ${app.version}` : `v${app.version}`) : (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    document.getElementById('modal-category').innerHTML = `<span style="color: var(--accent-color); font-weight: bold;">${versionText}</span>`;
    
    const sizeLabel = currentLanguage === 'ar' ? 'الحجم: ' : 'Size: ';
    document.getElementById('modal-size').textContent = sizeLabel + formatBytes(app.size);
    
    let dateString = '';
    if (app.date) {
        const d = new Date(app.date * 1000);
        dateString = d.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        dateString = currentLanguage === 'ar' ? 'غير معروف' : 'Unknown';
    }
    const dateLabel = currentLanguage === 'ar' ? 'تاريخ النشر: ' : 'Posted: ';
    document.getElementById('modal-date').textContent = dateLabel + dateString;
    
    // Modal Badges
    const modalBadges = document.getElementById('modal-badges');
    if (modalBadges) {
        modalBadges.innerHTML = '';
        const isLarge = app.size > 19.5 * 1024 * 1024;
        
        // Direct / Telegram badge
        const directBadge = document.createElement('span');
        directBadge.className = 'modal-badge';
        if (!isLarge) {
            directBadge.style.cssText = 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);';
            directBadge.innerHTML = `<i class="fa-solid fa-bolt"></i> ${strings[currentLanguage].directBadge}`;
        } else {
            directBadge.style.cssText = 'background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);';
            directBadge.innerHTML = `<i class="fa-brands fa-telegram"></i> Telegram`;
        }
        modalBadges.appendChild(directBadge);

        // Size badge
        const sizeBadge = document.createElement('span');
        sizeBadge.className = 'modal-badge';
        sizeBadge.style.cssText = 'background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); border: 1px solid var(--border-color);';
        sizeBadge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> ${formatBytes(app.size)}`;
        modalBadges.appendChild(sizeBadge);

        // Category badge
        const catBadge = document.createElement('span');
        catBadge.className = 'modal-badge';
        catBadge.style.cssText = 'background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); border: 1px solid var(--border-color);';
        const catName = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
        catBadge.innerHTML = `<i class="fa-solid ${app.category === 'Games' ? 'fa-gamepad' : 'fa-cubes'}"></i> ${catName}`;
        modalBadges.appendChild(catBadge);
    }

    // Add Note for large files at the bottom
    const isLarge = app.size > 19.5 * 1024 * 1024;
    let descriptionHtml = app.description.replace(/\n/g, '<br>');
    
    if (isLarge) {
        const noteText = currentLanguage === 'ar' 
            ? 'ملاحظة: يجب الانضمام للقناة الخاصة أولاً لتتمكن من تحميل هذا الملف الكبير عبر تليجرام.' 
            : 'Note: You must join the private channel first to download this large file via Telegram.';
        descriptionHtml += `<div style="background: rgba(0, 168, 232, 0.1); border-right: 4px solid var(--accent-color); padding: 1rem; margin-top: 1.5rem; border-radius: 4px; font-weight: 600;">${noteText}</div>`;
    }
    
    document.getElementById('modal-description').innerHTML = descriptionHtml;
    
    const downloadBtn = document.getElementById('modal-download');
    const modalActions = document.querySelector('.modal-actions');
    
    // Remove existing join button if it exists
    const existingJoinBtn = document.getElementById('modal-join-btn');
    if (existingJoinBtn) existingJoinBtn.remove();
    
    if (isLarge) {
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`;
        if (app.chat_id && app.chat_id.startsWith('-100')) {
            const baseChatId = app.chat_id.substring(4);
            tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
        }
        
        downloadBtn.href = tgLink;
        downloadBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
        
        // Add join button
        const joinBtn = document.createElement('a');
        joinBtn.id = 'modal-join-btn';
        joinBtn.href = 'https://t.me/+ij7-LS669ahhMDFk';
        joinBtn.className = 'download-btn btn-large';
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}`;
        
        modalActions.style.display = 'flex';
        modalActions.style.gap = '0.5rem';
        downloadBtn.style.flex = '2';
        joinBtn.style.flex = '1';
        
        if (modalFavBtn) {
            modalActions.insertBefore(joinBtn, modalFavBtn);
        } else {
            modalActions.appendChild(joinBtn);
        }
        
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
        
        downloadBtn.style.flex = '1';
    }

    const modalIcon = document.getElementById('modal-icon');
    if (app.icon_id) {
        modalIcon.src = `${WORKER_URL}/?id=${app.icon_id}&action=image`;
        modalIcon.style.display = 'block';
    } else {
        modalIcon.style.display = 'none';
    }

    modal.classList.add('active');
}

function createFloatingBackground() {
    const bgContainer = document.createElement('div');
    bgContainer.className = 'floating-background';
    document.body.appendChild(bgContainer);

    const icons = ['fa-paper-plane', 'fa-android'];
    const numIcons = 20;

    for (let i = 0; i < numIcons; i++) {
        const icon = document.createElement('i');
        const iconClass = icons[Math.floor(Math.random() * icons.length)];
        icon.className = iconClass === 'fa-paper-plane' ? `fa-solid ${iconClass} floating-icon` : `fa-brands ${iconClass} floating-icon`;

        const size = Math.random() * 25 + 15;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 20;

        icon.style.fontSize = `${size}px`;
        icon.style.left = `${left}vw`;
        icon.style.animationDuration = `${duration}s`;
        icon.style.animationDelay = `-${delay}s`;

        bgContainer.appendChild(icon);
    }
}

// ==========================================
// PWA INSTALLATION LOGIC
// ==========================================
const installBtn = document.getElementById('pwa-install-btn');
const staticInstallBtn = document.getElementById('static-install-btn');
const installModal = document.getElementById('install-modal');
const closeInstallModalBtn = document.getElementById('close-install-modal');
const confirmInstallBtn = document.getElementById('confirm-install-btn');

// If the event fired before this script loaded, show the button immediately
if (window.deferredPrompt && installBtn) {
    installBtn.style.display = 'flex';
    
    // Auto-show popup on big screens if not dismissed before
    if (window.innerWidth >= 768 && !localStorage.getItem('pwa-popup-dismissed')) {
        setTimeout(() => {
            if (installModal && window.deferredPrompt && !localStorage.getItem('pwa-popup-dismissed')) {
                installModal.classList.add('active');
            }
        }, 30000);
    }
}

if (installBtn) {
    installBtn.addEventListener('click', () => {
        // Show our custom modal
        installModal.classList.add('active');
    });
}

if (staticInstallBtn) {
    staticInstallBtn.addEventListener('click', () => {
        // Show our custom modal
        installModal.classList.add('active');
    });
}

if (closeInstallModalBtn) {
    closeInstallModalBtn.addEventListener('click', () => {
        installModal.classList.remove('active');
        localStorage.setItem('pwa-popup-dismissed', 'true');
    });
}

if (confirmInstallBtn) {
    confirmInstallBtn.addEventListener('click', async () => {
        installModal.classList.remove('active');
        if (window.deferredPrompt) {
            // Show the install prompt
            window.deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            window.deferredPrompt = null;
            if (installBtn) installBtn.style.display = 'none';
            if (staticInstallBtn) staticInstallBtn.style.display = 'none';
        } else {
            alert(document.documentElement.lang === 'ar' 
                ? "لا يمكن تثبيت التطبيق حالياً. قد يكون مثبتاً بالفعل، أو أن المتصفح لا يدعم هذه الميزة (تأكد من فتح الرابط الرسمي)." 
                : "Cannot install app right now. It might already be installed, or your browser doesn't support it (make sure you are on the live HTTPS link).");
        }
    });
}

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    if (installBtn) installBtn.style.display = 'none';
    if (installModal) installModal.classList.remove('active');
    // Clear the deferredPrompt so it can be garbage collected
    window.deferredPrompt = null;
    console.log('PWA was installed');
});
