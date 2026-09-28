const WORKER_URL = "https://appstore-proxy.4445622.workers.dev"; // The worker URL from user

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
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
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
        download: "تثبيت",
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
        download: "Install",
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
    document.getElementById('banner-title').textContent = strings[lang].bannerTitle;
    document.getElementById('banner-desc').textContent = strings[lang].bannerDesc;
    
    // Update Nav Labels
    document.querySelector('[data-view="home"] .nav-label').textContent = strings[lang].navHome;
    document.querySelector('[data-view="games"] .nav-label').textContent = strings[lang].navGames;
    document.querySelector('[data-view="apps"] .nav-label').textContent = strings[lang].navApps;
    document.querySelector('[data-view="categories"] .nav-label').textContent = strings[lang].navCategories;

    // Refresh UI
    updateViewTitle();
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
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Hide all pages
    Object.values(views).forEach(page => {
        if(page) page.classList.add('hidden');
    });

    // Handle Search Override
    if (currentSearch !== '') {
        currentSearch = '';
        searchInput.value = '';
    }

    // Show selected page
    if (viewName === 'categories') {
        bannersSection.style.display = 'none';
        views.categories.classList.remove('hidden');
    } else {
        bannersSection.style.display = viewName === 'home' ? 'flex' : 'none';
        views.apps.classList.remove('hidden');
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

        const categoryText = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
        const downloadLink = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;

        card.innerHTML = `
            ${imgHTML}
            <div class="card-info">
                <div class="card-title">${app.name}</div>
                <div class="card-category">${categoryText}</div>
            </div>
            <!-- Prevent modal open when clicking download -->
            <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                <i class="fa-solid fa-download"></i> ${strings[currentLanguage].download}
            </a>
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
    document.getElementById('modal-category').textContent = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
    document.getElementById('modal-size').textContent = formatBytes(app.size);
    document.getElementById('modal-description').textContent = app.description;
    
    document.getElementById('modal-download').href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;

    const modalIcon = document.getElementById('modal-icon');
    if (app.icon_id) {
        modalIcon.src = `${WORKER_URL}/?id=${app.icon_id}&action=image`;
        modalIcon.style.display = 'block';
    } else {
        modalIcon.style.display = 'none';
    }

    modal.classList.add('active');
}
