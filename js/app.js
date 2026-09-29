// ==========================================
// STORE CONFIGURATION
// ==========================================
const WORKER_URL = "https://appstore-proxy.4445622.workers.dev"; // The worker URL from user

// Add or edit your sliding banners here!
// You can use a custom image (e.g., 'assets/banner1.jpg') or a gradient background.
// Icons use FontAwesome class names (e.g., 'fa-rocket', 'fa-fire', 'fa-gamepad').
const STORE_BANNERS = [
    {
        title: { ar: "قناة Premium Tech", en: "Premium Tech Channel" },
        subtitle: { ar: "أفضل التطبيقات والألعاب من تليجرام مباشرة", en: "The best premium apps & games directly from Telegram" },
        image: "assets/banner1.jpg", 
        background: "linear-gradient(45deg, #024773, #11a6d4)",
        icon: "fa-rocket"
    },
    {
        title: { ar: "ألعاب عالم مفتوح", en: "Open World Games" },
        subtitle: { ar: "عش المغامرة مع أفضل ألعاب الأكشن والإثارة", en: "Live the adventure with the best action games" },
        image: "assets/banner2.jpg", 
        background: "linear-gradient(45deg, #4b134f, #c94b4b)",
        icon: "fa-fire"
    },
    {
        title: { ar: "تطبيقات المونتاج", en: "Video Editing Apps" },
        subtitle: { ar: "أطلق العنان لإبداعك مع أفضل برامج التصميم", en: "Unleash your creativity with the best editing apps" },
        image: "assets/banner3.jpg", 
        background: "linear-gradient(45deg, #134e5e, #71b280)",
        icon: "fa-gamepad"
    }
];
// ==========================================

let allApps = [];
let currentLanguage = 'ar';
let activeView = 'home';
let currentSearch = '';

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
        bannerDesc: "أفضل التطبيقات والألعاب المميزة"
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
        bannerDesc: "The best premium apps & games"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    renderBanners();
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

    updateViewTitle();
    renderBanners();
    if (allApps.length > 0) {
        renderCategories();
        renderApps();
    }
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        if (currentSearch && activeView === 'categories') {
            switchView('home'); // Automatically switch to a grid view to show results
        }
        renderApps();
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

    document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}

function switchView(viewName) {
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

    // Show selected page
    if (viewName === 'categories') {
        bannersSection.style.display = 'none';
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
        pageTitle.textContent = strings[currentLanguage].titleHome;
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
        allApps.forEach(app => { if(!app.category) app.category = 'Apps'; });
        loading.style.display = 'none';
        renderCategories();
        renderApps();
    } catch (error) {
        console.error(error);
        document.getElementById('loading-text').textContent = 'Error loading store data.';
    }
}

function renderBanners() {
    bannersSection.innerHTML = '';
    
    STORE_BANNERS.forEach(banner => {
        const div = document.createElement('div');
        div.className = 'banner';
        
        let html = '';
        if (banner.image) {
            html += `<img src="${banner.image}" class="banner-img" alt="Banner">`;
            html += `<div class="banner-overlay"></div>`;
        } else {
            div.style.background = banner.background;
            if (banner.icon) {
                html += `<i class="fa-solid ${banner.icon} bg-icon"></i>`;
            }
        }
        
        html += `
            <div class="banner-content">
                <h2>${banner.title[currentLanguage]}</h2>
                <p>${banner.subtitle[currentLanguage]}</p>
            </div>
        `;
        
        div.innerHTML = html;
        bannersSection.appendChild(div);
    });
}

function renderCategories() {
    categoriesGrid.innerHTML = '';
    const uniqueTags = new Set();
    allApps.forEach(app => { if(app.tags) app.tags.forEach(t => uniqueTags.add(t)); });

    if(uniqueTags.size === 0) return;

    uniqueTags.forEach(tag => {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const tagData = TAG_MAP[tag] || { 
            ar: tag.replace('#', ''), 
            en: tag.replace('#', ''), 
            icon: 'fa-hashtag' 
        };

        const label = currentLanguage === 'ar' ? tagData.ar : tagData.en;
        
        card.innerHTML = `
            <i class="fa-solid ${tagData.icon}"></i>
            <span>${label}</span>
        `;
        
        card.onclick = () => {
            // Switch to apps view filtered by this tag
            switchView('home'); // reuse apps grid
            currentSearch = tag; // Hack: use search query for tag filtering for simplicity
            searchInput.value = ''; // Don't show tag in search bar
            updateViewTitle(label);
            renderApps();
        };
        categoriesGrid.appendChild(card);
    });
}

function renderApps() {
    appsGrid.innerHTML = '';
    
    const filteredApps = allApps.filter(app => {
        // Handle explicit Tag filtering from Category click
        if (currentSearch.startsWith('#')) {
            return app.tags && app.tags.includes(currentSearch);
        }

        // View Filtering
        if (activeView === 'apps' && app.category !== 'Apps') return false;
        if (activeView === 'games' && app.category !== 'Games') return false;
        
        // Text Search
        if (currentSearch) {
            const term = currentSearch.toLowerCase();
            return app.name.toLowerCase().includes(term) || app.description.toLowerCase().includes(term);
        }
        return true;
    });

    if (filteredApps.length === 0) {
        appsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">${strings[currentLanguage].empty}</div>`;
        return;
    }

    filteredApps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => openAppDetails(app);

        let imgHTML = app.icon_id 
            ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="card-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
            : `<div class="card-icon fallback"><i class="fa-brands fa-android"></i></div>`;

        let descWords = '';
        if (app.description) {
            const words = app.description.trim().split(/\s+/);
            if (words.length > 0 && words[0] !== '') {
                descWords = words.slice(0, 4).join(' ');
                if (words.length > 4) {
                    descWords += '...';
                }
            }
        }
        const categoryText = descWords || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
        
        const isLarge = app.size > 19.5 * 1024 * 1024; // Telegram Bot API limit is 20MB
        
        // Generate Telegram link (handle private channels starting with -100)
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`; // Fallback to invite link if chat_id is unknown
        if (app.chat_id && app.chat_id.startsWith('-100')) {
            const baseChatId = app.chat_id.substring(4);
            tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
        }
        
        const downloadLink = isLarge 
            ? tgLink
            : `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        
        const btnIcon = isLarge ? 'fa-paper-plane' : 'fa-download';
        const btnText = strings[currentLanguage].download;
        
        let actionsHtml = '';
        if (isLarge) {
            const joinText = currentLanguage === 'ar' ? 'انضمام' : 'Join';
            actionsHtml = `
            <div style="display: flex; gap: 0.5rem; margin: 0.75rem 1rem; margin-top: auto;">
                <a href="${downloadLink}" class="card-install-btn" style="flex: 1; margin: 0; padding: 0.5rem;" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                    <i class="fa-solid ${btnIcon}"></i> ${btnText}
                </a>
                <a href="https://t.me/+ij7-LS669ahhMDFk" class="card-install-btn" style="flex: 1; margin: 0; padding: 0.5rem; background: var(--nav-bg); color: var(--text-primary); border: 1px solid var(--border-color);" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                    <i class="fa-solid fa-user-plus"></i> ${joinText}
                </a>
            </div>
            `;
        } else {
            actionsHtml = `
            <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                <i class="fa-solid ${btnIcon}"></i> ${btnText}
            </a>
            `;
        }

        card.innerHTML = `
            ${imgHTML}
            <div class="card-info" style="${isLarge ? 'padding-bottom: 0;' : ''}">
                <div class="card-title">${app.name}</div>
                <div class="card-category" style="opacity: 0.8; font-size: 0.8rem; line-height: 1.4;">${categoryText}</div>
            </div>
            ${actionsHtml}
        `;
        appsGrid.appendChild(card);
    });
}

function formatBytes(bytes) {
    if (!+bytes) return '0 B';
    const k = 1024, i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

function openAppDetails(app) {
    document.getElementById('modal-title').textContent = app.name;
    
    let descWords = '';
    if (app.description) {
        const words = app.description.trim().split(/\s+/);
        if (words.length > 0 && words[0] !== '') {
            descWords = words.slice(0, 4).join(' ');
            if (words.length > 4) {
                descWords += '...';
            }
        }
    }
    const categoryText = descWords || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    document.getElementById('modal-category').textContent = categoryText;
    document.getElementById('modal-size').textContent = formatBytes(app.size);
    document.getElementById('modal-description').textContent = app.description;
    
    const isLarge = app.size > 19.5 * 1024 * 1024;
    const downloadBtn = document.getElementById('modal-download');
    const modalActions = document.querySelector('.modal-actions');
    
    // Remove existing join button if it exists from previous click
    const existingJoinBtn = document.getElementById('modal-join-btn');
    if (existingJoinBtn) existingJoinBtn.remove();
    
    if (isLarge) {
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`; // Fallback to invite link if chat_id is unknown
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
        joinBtn.className = 'btn';
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.style.background = 'var(--nav-bg)';
        joinBtn.style.color = 'var(--text-primary)';
        joinBtn.style.border = '1px solid var(--border-color)';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام' : 'Join'}`;
        
        modalActions.style.display = 'flex';
        modalActions.style.gap = '0.5rem';
        downloadBtn.style.flex = '1';
        joinBtn.style.flex = '1';
        
        modalActions.appendChild(joinBtn);
        
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
