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
        favorites: "المفضلة",
        favoritesSubtitle: "التطبيقات المحفوظة",
        emptyFavorites: "قائمتك المفضلة فارغة حالياً",
        emptyFavDesc: "اضغط على أيقونة القلب ❤️ على أي تطبيق لحفظه هنا والوصول إليه بسرعة!",
        browseApps: "استكشاف التطبيقات",
        clearAll: "مسح الكل",
        clearConfirm: "هل أنت متأكد من مسح جميع التطبيقات من المفضلة؟",
        addedToFav: "تمت الإضافة للمفضلة ❤️",
        removedFromFav: "تمت الإزالة من المفضلة",
        allFavsCleared: "تم مسح قائمة المفضلة بنجاح",
        shareText: "مشاركة",
        favBtnText: "المفضلة",
        favSavedText: "في المفضلة",
        linkCopied: "تم نسخ رابط التطبيق بنجاح! 📋",
        shareTitle: "مشاركة تطبيق",
        badgeDirect: "تنزيل مباشر ⚡",
        badgeTelegram: "عبر تليجرام ✈️",
        badgeSize: "الحجم: ",
        badgeTypeApp: "تطبيق بريميوم",
        badgeTypeGame: "لعبة معدلة",
        chipAll: "الكل",
        searchClearTitle: "مسح البحث",
        galleryTitle: "صور من داخل التطبيق",
        galleryPhotos: "صور"
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
        favorites: "Favorites",
        favoritesSubtitle: "Saved Apps",
        emptyFavorites: "Your favorites list is currently empty",
        emptyFavDesc: "Tap the heart icon ❤️ on any app to save it here for instant access!",
        browseApps: "Explore Apps",
        clearAll: "Clear All",
        clearConfirm: "Are you sure you want to clear all favorite apps?",
        addedToFav: "Added to favorites ❤️",
        removedFromFav: "Removed from favorites",
        allFavsCleared: "Favorites cleared successfully",
        shareText: "Share",
        favBtnText: "Favorite",
        favSavedText: "Favorited",
        linkCopied: "App link copied to clipboard! 📋",
        shareTitle: "Share App",
        badgeDirect: "Direct Download ⚡",
        badgeTelegram: "Via Telegram ✈️",
        badgeSize: "Size: ",
        badgeTypeApp: "Premium App",
        badgeTypeGame: "Modded Game",
        chipAll: "All",
        searchClearTitle: "Clear Search",
        galleryTitle: "Inside Preview",
        galleryPhotos: "photos"
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
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', theme === 'dark' ? '#011b33' : '#e0f7fa');
    }
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

    // Update Favorites & Modals UI
    const favToggle = document.getElementById('favorites-toggle');
    if (favToggle) favToggle.title = strings[lang].favorites;
    const favTitle = document.getElementById('favorites-title');
    if (favTitle) favTitle.textContent = strings[lang].favorites;
    const favModalTitle = document.getElementById('fav-modal-title');
    if (favModalTitle) favModalTitle.textContent = strings[lang].favorites;
    const clearFavsText = document.getElementById('clear-favs-text');
    if (clearFavsText) clearFavsText.textContent = strings[lang].clearAll;
    const searchClear = document.getElementById('search-clear');
    if (searchClear) searchClear.title = strings[lang].searchClearTitle;
    const modalShareText = document.getElementById('modal-share-text');
    if (modalShareText) modalShareText.textContent = strings[lang].shareText;

    updateFavoritesBadge();
    renderCategoryChips();
    if (window.currentModalApp) {
        updateModalFavBtn(isFavorite(window.currentModalApp.id || window.currentModalApp.name));
        if (window.currentModalApp.screenshots && window.currentModalApp.screenshots.length > 0) {
            const galleryCount = document.getElementById('modal-gallery-count');
            if (galleryCount) galleryCount.textContent = `${window.currentModalApp.screenshots.length} ${strings[lang].galleryPhotos}`;
        }
    }
    const galleryTitleText = document.getElementById('gallery-title-text');
    if (galleryTitleText) galleryTitleText.textContent = strings[lang].galleryTitle;

    document.querySelectorAll('.cb-text').forEach(span => {
        span.textContent = span.getAttribute(`data-${lang}`);
    });

    updateViewTitle();
    renderBanners();
    if (allApps.length > 0) {
        renderCategories();
        renderApps();
    }
}

function setupEventListeners() {
    let searchDebounceTimer = null;
    const searchClear = document.getElementById('search-clear');

    searchInput.addEventListener('input', (e) => {
        if (searchClear) {
            searchClear.style.display = e.target.value.trim().length > 0 ? 'flex' : 'none';
        }
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim().toLowerCase();
            if (currentSearch) {
                setActiveCategoryChip('all');
            }
            if (activeView === 'categories') {
                renderCategories();
            } else {
                renderApps();
            }
        }, 150);
    });

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            currentSearch = '';
            setActiveCategoryChip('all');
            const catSelect = document.getElementById('category-select');
            if (catSelect) catSelect.value = 'all';
            if (activeView === 'categories') {
                renderCategories();
            } else {
                renderApps();
            }
            searchInput.focus();
        });
    }

    // Favorites Toggle (Header)
    const favToggle = document.getElementById('favorites-toggle');
    if (favToggle) {
        favToggle.addEventListener('click', () => {
            openFavoritesModal();
        });
    }

    // Close Favorites Modal
    const closeFavModal = document.getElementById('close-fav-modal');
    if (closeFavModal) {
        closeFavModal.addEventListener('click', () => {
            closeFavoritesModal();
        });
    }

    // Clear All Favorites
    const clearAllFavsBtn = document.getElementById('clear-all-favs');
    if (clearAllFavsBtn) {
        clearAllFavsBtn.addEventListener('click', () => {
            clearAllFavorites();
        });
    }

    // Modal Action Buttons (Favorites & Smart Share)
    const modalFavBtn = document.getElementById('modal-fav-btn');
    if (modalFavBtn) {
        modalFavBtn.addEventListener('click', () => {
            if (window.currentModalApp) {
                toggleFavorite(window.currentModalApp);
            }
        });
    }

    const modalShareBtn = document.getElementById('modal-share-btn');
    if (modalShareBtn) {
        modalShareBtn.addEventListener('click', () => {
            if (window.currentModalApp) {
                handleShareApp(window.currentModalApp);
            }
        });
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
        closeScreenshotLightbox();
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            window.currentModalApp = null;
            cleanAppQueryParam();
            if (history.state && history.state.modalOpen) history.back();
        }
    });
    window.addEventListener('click', (e) => { 
        if (e.target === modal && modal.classList.contains('active')) {
            closeScreenshotLightbox();
            modal.classList.remove('active');
            window.currentModalApp = null;
            cleanAppQueryParam();
            if (history.state && history.state.modalOpen) history.back();
        } 
        const favModal = document.getElementById('favorites-modal');
        if (favModal && e.target === favModal && favModal.classList.contains('active')) {
            closeFavoritesModal();
        }
    });
    window.addEventListener('popstate', (e) => {
        closeScreenshotLightbox();
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            window.currentModalApp = null;
            cleanAppQueryParam();
        }
        const favModal = document.getElementById('favorites-modal');
        if (favModal && favModal.classList.contains('active')) {
            closeFavoritesModal();
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

    // Initialize chips drag and desktop scroll arrows
    initChipsDragAndScroll();

    // Initialize Screenshots Lightbox Events
    initScreenshotLightboxEvents();
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
    }
    
    // Toggle home actions
    const homeActions = document.getElementById('home-actions');
    if (homeActions) {
        homeActions.style.display = viewName === 'home' ? 'flex' : 'none';
    }

    // Toggle category chips bar according to active view:
    // in navhome : all top chips must be shown (as it is currently)
    // in navgames : all top chips must hide
    // in navapps : all top chips must be shown except "ألعاب"
    // in navCategories : all top chips must hide
    const chipsWrapper = document.querySelector('.chips-wrapper');
    if (chipsWrapper) {
        if (viewName === 'games' || viewName === 'categories') {
            chipsWrapper.style.display = 'none';
            if (viewName === 'games') {
                activeCategoryChipId = 'all';
            }
        } else {
            chipsWrapper.style.display = 'flex';
            if (activeCategoryChipId === 'games' && viewName === 'apps') {
                activeCategoryChipId = 'all';
            }
            renderCategoryChips();
        }
    }

    // Show selected page
    if (viewName === 'categories') {
        bannersSection.style.display = 'none';
        views.categories.classList.add('active');
        renderCategories();
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
        renderCategoryChips();
        updateFavoritesBadge();
        renderCategories();
        renderApps();
        checkDeepLink();
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
    else if (lower.includes('islam') || lower.includes('quran') || lower.includes('دين') || lower.includes('قران') || lower.includes('اذكار') || lower.includes('أسلامي') || lower.includes('religion')) { icon = 'fa-mosque'; ar = 'إسلاميات'; en = 'Islamic'; }
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
        } else if (activeView !== 'games' && activeCategoryChipId && activeCategoryChipId !== 'all') {
            // Header Category Chip Filter (does not affect the Games tab)
            if (!appMatchesCategory(app, activeCategoryChipId)) return false;
        } else if (currentSearch.startsWith('#')) {
            // Handle explicit Tag filtering from Category click
            const targetTag = currentSearch.toLowerCase();
            const tagInfo = getTagInfo(currentSearch);
            let hasTag = false;
            if (app.tags) {
                for (let i = 0; i < app.tags.length; i++) {
                    if (app.tags[i].toLowerCase() === targetTag) { hasTag = true; break; }
                    const tInfo = getTagInfo(app.tags[i]);
                    if (tInfo.ar === tagInfo.ar) { hasTag = true; break; }
                }
            }
            if (!hasTag) return false;
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

    const isFav = isFavorite(app.id || app.name);
    const favTitle = isFav 
        ? (currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
        : (currentLanguage === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites');

    const imgHTML = app.icon_id 
        ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="card-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
        : `<div class="card-icon fallback"><i class="fa-brands fa-android"></i></div>`;

    const categoryText = app._descShort || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    const isLarge = app.size > 19.5 * 1024 * 1024;
    
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
        <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${app.id || app.name}" title="${favTitle}" aria-label="Favorite">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        ${imgHTML}
        <div class="card-info">
            <div class="card-title">${app.name}</div>
            <div class="card-category" style="opacity: 0.8; font-size: 0.8rem; line-height: 1.4;">${categoryText}</div>
        </div>
        <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
            <i class="fa-solid ${btnIcon}"></i> ${btnText}
        </a>
    `;

    const favBtn = card.querySelector('.card-fav-btn');
    if (favBtn) {
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(app, favBtn);
        });
    }

    return card;
}

function formatBytes(bytes) {
    if (!+bytes) return '0 B';
    const k = 1024, i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

function getScreenshotUrl(photoRef) {
    if (!photoRef) return '';
    if (photoRef.startsWith('assets/') || photoRef.startsWith('/') || photoRef.startsWith('http://') || photoRef.startsWith('https://')) {
        return photoRef;
    }
    return `${WORKER_URL}/?id=${photoRef}&action=image`;
}

function openAppDetails(app, pushUrl = true) {
    window.currentModalApp = app;
    if (pushUrl) {
        const url = new URL(window.location);
        url.searchParams.set('app', app.name);
        history.pushState({ modalOpen: true, appName: app.name }, '', url.toString());
    }
    
    document.getElementById('modal-title').textContent = app.name;
    
    // Status Badges
    const badgesContainer = document.getElementById('modal-badges');
    if (badgesContainer) {
        const isLarge = app.size > 19.5 * 1024 * 1024;
        const sizeBadge = `<span class="status-badge badge-size"><i class="fa-solid fa-hard-drive"></i> ${formatBytes(app.size)}</span>`;
        const directBadge = isLarge 
            ? `<span class="status-badge badge-telegram"><i class="fa-brands fa-telegram"></i> ${strings[currentLanguage].badgeTelegram}</span>`
            : `<span class="status-badge badge-direct"><i class="fa-solid fa-bolt"></i> ${strings[currentLanguage].badgeDirect}</span>`;
        const typeBadge = `<span class="status-badge badge-type"><i class="fa-solid ${app.category === 'Games' ? 'fa-gamepad' : 'fa-mobile-screen'}"></i> ${app.category === 'Games' ? strings[currentLanguage].badgeTypeGame : strings[currentLanguage].badgeTypeApp}</span>`;
        const versionBadge = app.version 
            ? `<span class="status-badge badge-version"><i class="fa-solid fa-code-branch"></i> ${app.version.startsWith('v') ? app.version : 'v' + app.version}</span>`
            : '';
        badgesContainer.innerHTML = `${sizeBadge}${directBadge}${typeBadge}${versionBadge}`;
    }

    const versionText = app.version ? (currentLanguage === 'ar' ? `إصدار: ${app.version}` : `v${app.version}`) : (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    const catEl = document.getElementById('modal-category');
    if (catEl) catEl.innerHTML = `<span style="color: var(--accent-color); font-weight: bold;">${versionText}</span>`;
    
    const sizeLabel = strings[currentLanguage].badgeSize;
    const sizeEl = document.getElementById('modal-size');
    if (sizeEl) sizeEl.textContent = sizeLabel + formatBytes(app.size);
    
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
    const dateEl = document.getElementById('modal-date');
    if (dateEl) dateEl.textContent = dateLabel + dateString;
    
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
    const downloadGroup = document.querySelector('.modal-download-group') || document.querySelector('.modal-actions');
    
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
        joinBtn.className = 'download-btn join-channel-btn';
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> <span>${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}</span>`;
        
        downloadGroup.style.display = 'flex';
        downloadGroup.style.gap = '0.6rem';
        downloadBtn.style.flex = '1';
        joinBtn.style.flex = '1';
        
        downloadGroup.appendChild(joinBtn);
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
        downloadBtn.style.flex = '1';
    }

    // Modal Tools: Favorite & Share Buttons
    updateModalFavBtn(isFavorite(app.id || app.name));
    
    const shareTextEl = document.getElementById('modal-share-text');
    if (shareTextEl) shareTextEl.textContent = strings[currentLanguage].shareText;

    const modalIcon = document.getElementById('modal-icon');
    if (app.icon_id) {
        modalIcon.src = `${WORKER_URL}/?id=${app.icon_id}&action=image`;
        modalIcon.style.display = 'block';
    } else {
        modalIcon.style.display = 'none';
    }

    // Screenshots Gallery (Google Play / App Store style)
    const galleryContainer = document.getElementById('modal-gallery-container');
    const galleryTrack = document.getElementById('modal-gallery-track');
    const galleryCount = document.getElementById('modal-gallery-count');
    const galleryTitleText = document.getElementById('gallery-title-text');
    if (galleryTitleText) galleryTitleText.textContent = strings[currentLanguage].galleryTitle;

// getScreenshotUrl moved to global scope

    if (app.screenshots && Array.isArray(app.screenshots) && app.screenshots.length > 0) {
        if (galleryTrack) {
            galleryTrack.innerHTML = '';
            app.screenshots.forEach((photoId, idx) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                item.setAttribute('aria-label', `${app.name} preview ${idx + 1}`);

                const img = document.createElement('img');
                img.className = 'gallery-img';
                img.loading = 'lazy';
                img.src = getScreenshotUrl(photoId);
                img.alt = `${app.name} screenshot ${idx + 1}`;

                img.onerror = () => {
                    item.style.display = 'none';
                };

                item.appendChild(img);
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openScreenshotLightbox(app.screenshots, idx, app.name);
                });
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openScreenshotLightbox(app.screenshots, idx, app.name);
                    }
                });
                galleryTrack.appendChild(item);
            });
        }
        if (galleryCount) {
            galleryCount.textContent = `${app.screenshots.length} ${strings[currentLanguage].galleryPhotos}`;
        }
        if (galleryContainer) galleryContainer.style.display = 'block';
    } else {
        if (galleryContainer) galleryContainer.style.display = 'none';
        if (galleryTrack) galleryTrack.innerHTML = '';
    }

    modal.classList.add('active');
}

// ==========================================
// SCREENSHOT LIGHTBOX VIEWER
// ==========================================
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openScreenshotLightbox(images, startIndex = 0, appName = '') {
    if (!images || !Array.isArray(images) || images.length === 0) return;
    currentLightboxImages = images;
    currentLightboxIndex = startIndex >= 0 && startIndex < images.length ? startIndex : 0;

    const lightbox = document.getElementById('screenshot-lightbox');
    if (!lightbox) return;

    updateScreenshotLightboxUI();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeScreenshotLightbox() {
    const lightbox = document.getElementById('screenshot-lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function updateScreenshotLightboxUI() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!img || currentLightboxImages.length === 0) return;
    const fileId = currentLightboxImages[currentLightboxIndex];
    img.src = getScreenshotUrl(fileId);

    if (counter) {
        counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
    }
    const hasMultiple = currentLightboxImages.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
}

function showNextScreenshot() {
    if (currentLightboxImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
    updateScreenshotLightboxUI();
}

function showPrevScreenshot() {
    if (currentLightboxImages.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
    updateScreenshotLightboxUI();
}

function initScreenshotLightboxEvents() {
    const lightbox = document.getElementById('screenshot-lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeScreenshotLightbox();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevScreenshot();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextScreenshot();
        });
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeScreenshotLightbox();
            }
        });

        // Touch swipe support on mobile
        let touchStartX = 0;
        let touchEndX = 0;
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) {
                    if (currentLanguage === 'ar') showNextScreenshot();
                    else showPrevScreenshot();
                } else {
                    if (currentLanguage === 'ar') showPrevScreenshot();
                    else showNextScreenshot();
                }
            }
        }, { passive: true });
    }
    window.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeScreenshotLightbox();
        } else if (e.key === 'ArrowRight') {
            if (currentLanguage === 'ar') showPrevScreenshot();
            else showNextScreenshot();
        } else if (e.key === 'ArrowLeft') {
            if (currentLanguage === 'ar') showNextScreenshot();
            else showPrevScreenshot();
        }
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info', icon = 'fa-info-circle') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ==========================================
// FAVORITES SYSTEM (localStorage)
// ==========================================
function getFavorites() {
    try {
        const raw = localStorage.getItem('pt_favorites');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(favs) {
    try {
        localStorage.setItem('pt_favorites', JSON.stringify(favs));
    } catch (e) {
        console.error('Failed to save favorites to localStorage:', e);
    }
}

function isFavorite(appId) {
    if (!appId) return false;
    const favs = getFavorites();
    return favs.includes(String(appId));
}

function toggleFavorite(app, targetBtn = null) {
    if (!app) return;
    const appId = String(app.id || app.name);
    let favs = getFavorites();
    const index = favs.indexOf(appId);
    let isAdded = false;

    if (index > -1) {
        favs.splice(index, 1);
        isAdded = false;
    } else {
        favs.push(appId);
        isAdded = true;
    }

    saveFavorites(favs);
    updateFavoritesBadge();

    // Trigger pop animation on badge
    const badge = document.getElementById('fav-badge');
    if (badge) {
        badge.classList.remove('pop');
        void badge.offsetWidth;
        badge.classList.add('pop');
    }

    // Update all card buttons for this app
    document.querySelectorAll(`.card-fav-btn[data-id="${appId}"]`).forEach(btn => {
        btn.classList.toggle('active', isAdded);
        btn.title = isAdded 
            ? (currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
            : (currentLanguage === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isAdded ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
        if (isAdded) {
            btn.classList.remove('pop');
            void btn.offsetWidth;
            btn.classList.add('pop');
        }
    });

    // Update modal favorite button if open
    if (window.currentModalApp && String(window.currentModalApp.id || window.currentModalApp.name) === appId) {
        updateModalFavBtn(isAdded);
    }

    // Show toast alert
    showToast(
        isAdded ? strings[currentLanguage].addedToFav : strings[currentLanguage].removedFromFav,
        isAdded ? 'fav' : 'info',
        isAdded ? 'fa-heart' : 'fa-heart-crack'
    );

    // If favorites modal is active, re-render list
    const favModal = document.getElementById('favorites-modal');
    if (favModal && favModal.classList.contains('active')) {
        renderFavoritesList();
    }
}

function updateFavoritesBadge() {
    const favs = getFavorites();
    const count = favs.length;
    const badge = document.getElementById('fav-badge');
    if (badge) {
        badge.textContent = count;
    }
    const favBtn = document.getElementById('favorites-toggle');
    if (favBtn) {
        if (count > 0) favBtn.classList.add('has-favs');
        else favBtn.classList.remove('has-favs');
    }
    const favCountEl = document.getElementById('fav-count');
    if (favCountEl) favCountEl.textContent = count;
    const favSubtitleEl = document.getElementById('favorites-subtitle');
    if (favSubtitleEl) {
        favSubtitleEl.textContent = `${strings[currentLanguage].favoritesSubtitle} (${count})`;
    }
}

function updateModalFavBtn(isFav) {
    const modalFavBtn = document.getElementById('modal-fav-btn');
    if (!modalFavBtn) return;
    const icon = modalFavBtn.querySelector('i');
    const text = document.getElementById('modal-fav-text');
    if (isFav) {
        modalFavBtn.classList.add('active');
        if (icon) icon.className = 'fa-solid fa-heart';
        if (text) text.textContent = strings[currentLanguage].favSavedText;
        modalFavBtn.title = currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites';
    } else {
        modalFavBtn.classList.remove('active');
        if (icon) icon.className = 'fa-regular fa-heart';
        if (text) text.textContent = strings[currentLanguage].favBtnText;
        modalFavBtn.title = currentLanguage === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites';
    }
}

function openFavoritesModal() {
    const favModal = document.getElementById('favorites-modal');
    if (!favModal) return;
    renderFavoritesList();
    favModal.classList.add('active');
}

function closeFavoritesModal() {
    const favModal = document.getElementById('favorites-modal');
    if (favModal) favModal.classList.remove('active');
    const clearBtn = document.getElementById('clear-all-favs');
    if (clearBtn && clearBtn.classList.contains('confirming')) {
        clearTimeout(clearConfirmTimer);
        clearBtn.classList.remove('confirming');
        const normalText = (strings[currentLanguage] && strings[currentLanguage].clearAll) 
            ? strings[currentLanguage].clearAll 
            : (currentLanguage === 'ar' ? 'مسح الكل' : 'Clear All');
        clearBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> <span id="clear-favs-text">${normalText}</span>`;
    }
}

let clearConfirmTimer = null;

function clearAllFavorites(e = null) {
    if (e && e.stopPropagation) e.stopPropagation();
    const favs = getFavorites();
    if (!favs || favs.length === 0) return;

    const btn = document.getElementById('clear-all-favs');
    if (!btn) return;

    // Second click: execute clear
    if (btn.classList.contains('confirming')) {
        clearTimeout(clearConfirmTimer);
        btn.classList.remove('confirming');

        saveFavorites([]);
        updateFavoritesBadge();
        renderFavoritesList();

        // Update all rendered cards
        document.querySelectorAll('.card-fav-btn').forEach(cardBtn => {
            cardBtn.classList.remove('active');
            const icon = cardBtn.querySelector('i');
            if (icon) icon.className = 'fa-regular fa-heart';
        });

        if (window.currentModalApp) {
            updateModalFavBtn(false);
        }

        const clearedMsg = (strings[currentLanguage] && strings[currentLanguage].allFavsCleared) 
            ? strings[currentLanguage].allFavsCleared 
            : (currentLanguage === 'ar' ? 'تم مسح قائمة المفضلة بنجاح' : 'Favorites cleared successfully');
        showToast(clearedMsg, 'info', 'fa-trash-can');
        return;
    }

    // First click: prompt for confirmation directly on button
    btn.classList.add('confirming');
    const confirmText = currentLanguage === 'ar' ? 'تأكيد المسح؟' : 'Confirm Clear?';
    btn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${confirmText}</span>`;

    clearTimeout(clearConfirmTimer);
    clearConfirmTimer = setTimeout(() => {
        if (btn && btn.classList.contains('confirming')) {
            btn.classList.remove('confirming');
            const normalText = (strings[currentLanguage] && strings[currentLanguage].clearAll) 
                ? strings[currentLanguage].clearAll 
                : (currentLanguage === 'ar' ? 'مسح الكل' : 'Clear All');
            btn.innerHTML = `<i class="fa-solid fa-trash-can"></i> <span id="clear-favs-text">${normalText}</span>`;
        }
    }, 4000);
}

window.clearAllFavorites = clearAllFavorites;

function renderFavoritesList() {
    const listEl = document.getElementById('favorites-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const favIds = getFavorites();
    updateFavoritesBadge();

    const clearBtn = document.getElementById('clear-all-favs');

    if (favIds.length === 0) {
        if (clearBtn) {
            clearBtn.style.display = 'none';
            clearBtn.classList.remove('confirming');
        }
        listEl.innerHTML = `
            <div class="fav-empty-state">
                <i class="fa-solid fa-heart-crack fav-empty-icon"></i>
                <h3>${strings[currentLanguage].emptyFavorites}</h3>
                <p>${strings[currentLanguage].emptyFavDesc}</p>
                <button class="fav-empty-btn" onclick="closeFavoritesModal();">
                    <i class="fa-solid fa-compass"></i> ${strings[currentLanguage].browseApps}
                </button>
            </div>
        `;
        return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-flex';

    const fragment = document.createDocumentFragment();
    favIds.forEach(id => {
        const app = allApps.find(a => String(a.id) === String(id) || a.name === id);
        if (!app) return;

        const isLarge = app.size > 19.5 * 1024 * 1024;
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`;
        if (app.chat_id && app.chat_id.startsWith('-100')) {
            const baseChatId = app.chat_id.substring(4);
            tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
        }
        const downloadLink = isLarge 
            ? tgLink 
            : `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;

        const card = document.createElement('div');
        card.className = 'fav-item-card';

        const imgHTML = app.icon_id 
            ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="fav-item-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'fav-item-icon fallback\\' style=\\'display:flex;align-items:center;justify-content:center;color:var(--accent-color);\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
            : `<div class="fav-item-icon fallback" style="display:flex;align-items:center;justify-content:center;color:var(--accent-color);"><i class="fa-brands fa-android"></i></div>`;

        const badgeType = `<span class="status-badge badge-type" style="padding:0.15rem 0.5rem;font-size:0.72rem;"><i class="fa-solid ${app.category === 'Games' ? 'fa-gamepad' : 'fa-mobile-screen'}"></i> ${app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp}</span>`;
        const badgeSize = `<span class="status-badge badge-size" style="padding:0.15rem 0.5rem;font-size:0.72rem;"><i class="fa-solid fa-hard-drive"></i> ${formatBytes(app.size)}</span>`;

        card.innerHTML = `
            ${imgHTML}
            <div class="fav-item-info">
                <div class="fav-item-title">${app.name}</div>
                <div class="fav-item-meta">
                    ${badgeType}
                    ${badgeSize}
                </div>
            </div>
            <div class="fav-item-actions">
                <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" style="width:auto;padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="event.stopPropagation();">
                    <i class="fa-solid ${isLarge ? 'fa-paper-plane' : 'fa-download'}"></i>
                </a>
                <button class="fav-del-btn" title="${currentLanguage === 'ar' ? 'حذف من المفضلة' : 'Remove'}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        const delBtn = card.querySelector('.fav-del-btn');
        if (delBtn) {
            delBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(app);
            };
        }

        card.onclick = () => {
            closeFavoritesModal();
            openAppDetails(app);
        };

        fragment.appendChild(card);
    });

    listEl.appendChild(fragment);
}

// ==========================================
// CATEGORY CHIPS BAR
// ==========================================
const TOP_CHIPS = [
    { id: 'all', ar: 'الكل', en: 'All', icon: 'fa-shapes' },
    { id: 'games', ar: 'ألعاب', en: 'Games', icon: 'fa-gamepad' },
    { id: 'watching', ar: 'مشاهدة وميديا', en: 'Media', icon: 'fa-play' },
    { id: 'tools', ar: 'أدوات', en: 'Tools', icon: 'fa-wrench' },
    { id: 'editing', ar: 'مونتاج وتصميم', en: 'Editing', icon: 'fa-wand-magic-sparkles' },
    { id: 'vpn', ar: 'VPN وكاسر', en: 'VPN & Proxy', icon: 'fa-shield-halved' },
    { id: 'ai', ar: 'ذكاء اصطناعي', en: 'AI', icon: 'fa-robot' },
    { id: 'islamic', ar: 'إسلاميات', en: 'Islamic', icon: 'fa-mosque' },
    { id: 'social', ar: 'تواصل اجتماعي', en: 'Social', icon: 'fa-users' },
    { id: 'music', ar: 'موسيقى وصوتيات', en: 'Music', icon: 'fa-music' },
    { id: 'browsers', ar: 'متصفحات', en: 'Browsers', icon: 'fa-globe' },
    { id: 'education', ar: 'تعليم', en: 'Education', icon: 'fa-graduation-cap' },
    { id: 'books', ar: 'كتب ومستندات', en: 'Books', icon: 'fa-book' },
    { id: 'wallpapers', ar: 'خلفيات وثيمات', en: 'Wallpapers', icon: 'fa-palette' },
    { id: 'camera', ar: 'كاميرا وفلاتر', en: 'Camera', icon: 'fa-camera' }
];

let activeCategoryChipId = 'all';

function appMatchesCategory(app, catId) {
    if (!catId || catId === 'all') return true;

    const tags = Array.isArray(app.tags) ? app.tags.map(t => String(t).toLowerCase()) : [];
    const name = (app.name || '').toLowerCase();
    const desc = (app.description || '').toLowerCase();
    const category = app.category || '';

    const hasAnyTag = (keywords) => {
        return tags.some(tag => keywords.some(kw => tag.includes(kw)));
    };

    switch (catId) {
        case 'islamic':
            return hasAnyTag(['islam', 'quran', 'دين', 'ديني', 'قران', 'اذكار', 'أسلامي', 'religion']) ||
                   name.includes('مصحف') || name.includes('قرآن') || name.includes('قران') ||
                   name.includes('أذكار') || name.includes('اذكار') || name.includes('صلات') ||
                   name.includes('prayer') || name.includes('quran') || name.includes('islam') ||
                   name.includes('tarteel') || name.includes('khatmah') || name.includes('muslim');

        case 'games':
            return category === 'Games' || hasAnyTag(['game', 'gta', 'psp', 'racer']);

        case 'watching':
            return hasAnyTag(['watch', 'tv', 'movie', 'anime', 'player', 'media', 'iptv', 'cartoon', 'romance']);

        case 'tools':
            return hasAnyTag(['tool', 'manager', 'scanner', 'launcher', 'utility', 'ادوات', 'battery', 'controls', 'cleaner', 'recover']);

        case 'editing':
            return hasAnyTag(['edit', 'photoeditor', 'photography', 'photosgenerator', 'remove_bckground', 'videocaptions', 'design']);

        case 'vpn':
            return hasAnyTag(['vpn', 'secur', 'firewall', 'freeinternet', 'udp', 'proxy']);

        case 'ai':
            return hasAnyTag(['ai', 'bot', 'ia', 'chatgpt']);

        case 'social':
            return hasAnyTag(['social', 'chat', 'wa', 'insta', 'tiktok', 'comunication', 'telegram', 'calling']);

        case 'music':
            return hasAnyTag(['music', 'audio', 'podcast', 'radio', 'spotify', 'listen', 'karoke', 'mp3', 'ringtone', 'tuner']);

        case 'browsers':
            return hasAnyTag(['browser', 'web']);

        case 'education':
            return hasAnyTag(['educat', 'learn', 'lesson', 'quiz', 'programming', 'translation']);

        case 'books':
            return hasAnyTag(['book', 'pdf', 'read', 'dictionary', 'notes', 'thesaurus', 'ebook']);

        case 'wallpapers':
            return hasAnyTag(['wallpaper', 'thim', 'theme']);

        case 'camera':
            return hasAnyTag(['camera', 'photo']);

        default:
            return hasAnyTag([catId.toLowerCase()]);
    }
}

function renderCategoryChips() {
    const container = document.getElementById('category-chips-bar');
    const wrapper = document.querySelector('.chips-wrapper');
    if (!container) return;

    if (activeView === 'games' || activeView === 'categories') {
        if (wrapper) wrapper.style.display = 'none';
        return;
    } else {
        if (wrapper) wrapper.style.display = 'flex';
    }

    container.innerHTML = '';

    // In 'apps' view, exclude 'games' chip
    const visibleChips = TOP_CHIPS.filter(chip => {
        if (activeView === 'apps' && chip.id === 'games') {
            return false;
        }
        return true;
    });

    visibleChips.forEach(chip => {
        const btn = document.createElement('button');
        btn.className = `cat-chip ${chip.id === activeCategoryChipId ? 'active' : ''}`;
        btn.dataset.chipId = chip.id;
        btn.innerHTML = `<i class="fa-solid ${chip.icon}"></i> <span>${chip[currentLanguage]}</span>`;

        btn.addEventListener('click', () => {
            selectCategoryChip(chip.id, chip[currentLanguage], btn);
        });

        container.appendChild(btn);
    });
}

function selectCategoryChip(chipId, chipLabel, chipBtn = null) {
    // If the user clicks the currently active non-'all' chip, toggle back to 'all'
    if (activeCategoryChipId === chipId && chipId !== 'all') {
        chipId = 'all';
        chipLabel = currentLanguage === 'ar' ? 'الكل' : 'All';
    }

    activeCategoryChipId = chipId;

    document.querySelectorAll('.cat-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.chipId === chipId);
    });

    if (chipBtn && chipId !== 'all') {
        chipBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    if (activeView === 'categories') {
        switchView('home');
    }

    currentSearch = '';
    searchInput.value = '';
    const searchClear = document.getElementById('search-clear');
    if (searchClear) searchClear.style.display = 'none';

    const catSelect = document.getElementById('category-select');
    if (catSelect) catSelect.value = 'all';

    if (chipId === 'all') {
        updateViewTitle();
    } else {
        updateViewTitle(chipLabel);
    }
    renderApps();
}

function setActiveCategoryChip(chipId) {
    activeCategoryChipId = chipId;
    document.querySelectorAll('.cat-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.chipId === chipId);
    });
}

function initChipsDragAndScroll() {
    const container = document.getElementById('category-chips-bar');
    const btnLeft = document.getElementById('chips-btn-left');
    const btnRight = document.getElementById('chips-btn-right');
    if (!container) return;

    if (btnLeft) {
        btnLeft.addEventListener('click', () => {
            container.scrollBy({ left: -260, behavior: 'smooth' });
        });
    }

    if (btnRight) {
        btnRight.addEventListener('click', () => {
            container.scrollBy({ left: 260, behavior: 'smooth' });
        });
    }

    // Desktop mouse wheel support (shift/delta conversion)
    container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    // Hold click and drag to scroll (mouse grab & move)
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only primary mouse button
        isDown = true;
        hasDragged = false;
        container.classList.add('is-dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - container.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) {
            hasDragged = true;
        }
        container.scrollLeft = scrollLeft - walk;
    });

    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        container.classList.remove('is-dragging');
        if (hasDragged) {
            // Suppress the click event that follows mouseup if dragged
            const suppressClick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.removeEventListener('click', suppressClick, true);
            };
            window.addEventListener('click', suppressClick, true);
        }
    };

    window.addEventListener('mouseup', endDrag);
}

// ==========================================
// SMART SHARE & DEEP LINKING
// ==========================================
function handleShareApp(app) {
    if (!app) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?app=${encodeURIComponent(app.name)}`;
    const shareTitle = `${app.name} | Premium Techs`;
    const shareText = currentLanguage === 'ar'
        ? `تحميل ${app.name} بريميوم مجاناً من متجر Premium Techs:`
        : `Download ${app.name} Premium for free from Premium Techs Store:`;

    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        }).catch(err => {
            if (err.name !== 'AbortError') {
                copyShareUrl(shareUrl);
            }
        });
    } else {
        copyShareUrl(shareUrl);
    }
}

function copyShareUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(strings[currentLanguage].linkCopied, 'success', 'fa-copy');
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(url) {
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        showToast(strings[currentLanguage].linkCopied, 'success', 'fa-copy');
    } catch (e) {
        prompt(currentLanguage === 'ar' ? 'انسخ الرابط:' : 'Copy Link:', url);
    }
    document.body.removeChild(tempInput);
}

function checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    if (!appParam || allApps.length === 0) return;

    const query = decodeURIComponent(appParam).trim().toLowerCase();
    const target = allApps.find(a => 
        a.name.toLowerCase() === query ||
        a.name.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
        String(a.id) === query
    );

    if (target) {
        setTimeout(() => {
            openAppDetails(target, false);
        }, 150);
    }
}

function cleanAppQueryParam() {
    const url = new URL(window.location);
    if (url.searchParams.has('app')) {
        url.searchParams.delete('app');
        const cleanUrl = url.pathname + (url.search ? url.search : '') + url.hash;
        history.replaceState({}, '', cleanUrl);
    }
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
