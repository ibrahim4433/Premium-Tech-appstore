const WORKER_URL = "https://appstore-proxy.4445622.workers.dev"; // The worker URL from user

let allApps = [];
let currentCategory = 'All';
let currentLanguage = 'ar';

// DOM Elements
const grid = document.getElementById('apps-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const tabBtns = document.querySelectorAll('.tab-btn');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const modal = document.getElementById('app-modal');
const closeModal = document.querySelector('.close-modal');

// Language Strings
const strings = {
    ar: {
        search: "البحث عن تطبيقات وألعاب...",
        all: "الكل",
        apps: "التطبيقات",
        games: "الألعاب",
        loading: "جاري التحميل...",
        empty: "لم يتم العثور على نتائج.",
        download: "تنزيل",
        about: "حول هذا التطبيق",
        categoryApp: "تطبيق",
        categoryGame: "لعبة"
    },
    en: {
        search: "Search for apps & games...",
        all: "All",
        apps: "Apps",
        games: "Games",
        loading: "Loading...",
        empty: "No results found.",
        download: "Download",
        about: "About this app",
        categoryApp: "App",
        categoryGame: "Game"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    fetchApps();
    setupEventListeners();
});

// Initialization
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'ar';
    setLanguage(savedLang);
}

// Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        renderApps(e.target.value);
    });

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            renderApps(searchInput.value);
        });
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Language Toggle
    langToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        localStorage.setItem('lang', currentLanguage);
        setLanguage(currentLanguage);
    });

    // Modal Close
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Update Text
    searchInput.placeholder = strings[lang].search;
    loading.textContent = strings[lang].loading;
    
    document.querySelector('[data-category="All"]').textContent = strings[lang].all;
    document.querySelector('[data-category="Apps"]').textContent = strings[lang].apps;
    document.querySelector('[data-category="Games"]').textContent = strings[lang].games;
    
    document.querySelector('.modal-body h3').textContent = strings[lang].about;
    document.getElementById('download-text').textContent = strings[lang].download;

    // Re-render to update categories
    if (allApps.length > 0) renderApps(searchInput.value);
}

// Data Fetching and Rendering
async function fetchApps() {
    try {
        const response = await fetch('apps.json');
        if (!response.ok) throw new Error('Failed to load apps');
        
        allApps = await response.json();
        
        // Fix old data without categories
        allApps.forEach(app => {
            if(!app.category) app.category = 'Apps';
        });

        loading.style.display = 'none';
        renderApps();
    } catch (error) {
        console.error(error);
        loading.textContent = 'Error loading store data.';
    }
}

function renderApps(searchQuery = '') {
    grid.innerHTML = '';
    
    const filteredApps = allApps.filter(app => {
        const matchesCategory = currentCategory === 'All' || app.category === currentCategory;
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              app.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredApps.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">${strings[currentLanguage].empty}</div>`;
        return;
    }

    filteredApps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => openAppDetails(app);

        let imgHTML = '';
        if (app.icon_id) {
            imgHTML = `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="card-icon" loading="lazy" onerror="this.outerHTML='<div class=\\'card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`;
        } else {
            imgHTML = `<div class="card-icon fallback"><i class="fa-brands fa-android"></i></div>`;
        }

        const categoryText = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;

        card.innerHTML = `
            ${imgHTML}
            <div class="card-info">
                <div class="card-title">${app.name}</div>
                <div class="card-category">${categoryText}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Modal Logic
function openAppDetails(app) {
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalSize = document.getElementById('modal-size');
    const modalDesc = document.getElementById('modal-description');
    const modalIcon = document.getElementById('modal-icon');
    const modalDownload = document.getElementById('modal-download');

    modalTitle.textContent = app.name;
    modalCategory.textContent = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
    modalSize.textContent = formatBytes(app.size);
    modalDesc.textContent = app.description;

    // Use filename param for Cloudflare worker download
    modalDownload.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;

    if (app.icon_id) {
        modalIcon.src = `${WORKER_URL}/?id=${app.icon_id}&action=image`;
        modalIcon.style.display = 'block';
    } else {
        modalIcon.style.display = 'none'; // Could replace with fallback icon in modal too
    }

    modal.classList.add('active');
}
