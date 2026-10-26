// ==========================================
// STORE CONFIGURATION
// ==========================================
const WORKER_URL = "https://appstore-proxy.iateam.workers.dev"; // The worker URL from user

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

function normalizeArabic(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Tashkeel / Harakat
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .trim();
}

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

// Master Categories Definition (Curated Categories with Icons, Localized Names, and Descriptions)
const MASTER_CATEGORIES = [
    {
        id: 'games',
        icon: 'fa-gamepad',
        name: { ar: 'الألعاب والترفيه', en: 'Games & Entertainment' },
        desc: {
            ar: 'ألعاب الأكشن والمغامرات والسباقات ومحاكيات PSP المعدلة بأعلى الجرافيكس.',
            en: 'Action, adventure, racing, and PSP emulator modded games.'
        }
    },
    {
        id: 'watching',
        icon: 'fa-play',
        name: { ar: 'مشاهدة وبث مباشر', en: 'Movies & Live TV' },
        desc: {
            ar: 'تطبيقات بث المباريات المباشرة والأفلام والمسلسلات وقنوات IPTV المشفرة.',
            en: 'Live sports streaming, cinema movies, series, and premium IPTV players.'
        }
    },
    {
        id: 'tools',
        icon: 'fa-wrench',
        name: { ar: 'أدوات ونظام', en: 'Tools & Utilities' },
        desc: {
            ar: 'أدوات تسريع الهاتف، مدراء الملفات المتقدمة، وتطبيقات الصيانة والتحكم.',
            en: 'System optimization tools, advanced file managers, and system utilities.'
        }
    },
    {
        id: 'editing',
        icon: 'fa-wand-magic-sparkles',
        name: { ar: 'مونتاج وتصميم', en: 'Editing & Design' },
        desc: {
            ar: 'تطبيقات تحرير الفيديو الاحترافي، فلاتر الصور، وإزالة الخلفيات وتصميم Reels.',
            en: 'Pro video editing, photo filters, background removal, and design tools.'
        }
    },
    {
        id: 'vpn',
        icon: 'fa-shield-halved',
        name: { ar: 'شبكات و VPN', en: 'VPN & Security' },
        desc: {
            ar: 'تطبيقات فك الحجب وتأمين الاتصال وحماية الخصوصية وتجاوز القيود.',
            en: 'Fast unblocking proxies, privacy shields, and encrypted network tunnels.'
        }
    },
    {
        id: 'ai',
        icon: 'fa-robot',
        name: { ar: 'ذكاء اصطناعي', en: 'AI & Smart Bots' },
        desc: {
            ar: 'مساعدات الذكاء الاصطناعي التوليدي، روبوتات الدردشة، وتوليد وتعديل الصور.',
            en: 'Generative AI assistants, smart chatbots, and text/image generators.'
        }
    },
    {
        id: 'social',
        icon: 'fa-users',
        name: { ar: 'تواصل واجتماعي', en: 'Social & Communication' },
        desc: {
            ar: 'تطبيقات المحادثة والمراسلة، منصات التواصل المعدلة، وأدوات التفاعل.',
            en: 'Instant messaging, modded social platforms, and media interaction tools.'
        }
    },
    {
        id: 'islamic',
        icon: 'fa-mosque',
        name: { ar: 'إسلاميات ودين', en: 'Islamic & Quran' },
        desc: {
            ar: 'المصحف الشريف، الأذكار اليومية، مواقيت الصلاة، والتفاسير الصوتية.',
            en: 'Holy Quran recitations, Athkar, accurate prayer times, and Islamic guides.'
        }
    },
    {
        id: 'education',
        icon: 'fa-graduation-cap',
        name: { ar: 'تعليم وتطوير', en: 'Education & Learning' },
        desc: {
            ar: 'تطبيقات تعلم اللغات الأجنبية، دورات البرمجة، والمنصات التعليمية التفاعلية.',
            en: 'Language learning apps, coding courses, and interactive study platforms.'
        }
    },
    {
        id: 'music',
        icon: 'fa-music',
        name: { ar: 'موسيقى وصوتيات', en: 'Music & Audio' },
        desc: {
            ar: 'مشغلات الموسيقى بدون نت، محطات البودكاست، ومحررات المقاطع الصوتية.',
            en: 'Offline music streaming, podcast players, audio cutters, and recorders.'
        }
    },
    {
        id: 'books',
        icon: 'fa-book-open',
        name: { ar: 'كتب ومستندات', en: 'Books & Documents' },
        desc: {
            ar: 'قارئات ملفات PDF والكتب الإلكترونية، القواميس، وتدوين الملاحظات الذكية.',
            en: 'PDF e-book readers, dictionaries, document viewers, and note-taking apps.'
        }
    },
    {
        id: 'sports',
        icon: 'fa-futbol',
        name: { ar: 'رياضة ولياقة', en: 'Sports & Fitness' },
        desc: {
            ar: 'متابعة نتائج المباريات لحظياً، برامج التمارين الرياضية، وعداد السعرات.',
            en: 'Live sports scores, fitness workout coaches, and calorie counters.'
        }
    },
    {
        id: 'camera',
        icon: 'fa-camera',
        name: { ar: 'كاميرا وتصوير', en: 'Camera & Photography' },
        desc: {
            ar: 'تطبيقات الكاميرا اليدوية الاحترافية، العدسات والفلاتر، وتحسين جودة الصور.',
            en: 'Pro manual camera controls, artistic lens filters, and photo enhancers.'
        }
    },
    {
        id: 'browsers',
        icon: 'fa-globe',
        name: { ar: 'متصفحات وإنترنت', en: 'Browsers & Web' },
        desc: {
            ar: 'متصفحات إنترنت سريعة، أدوات حجب الإعلانات المزعجة، والتصفح الآمن الخفي.',
            en: 'Fast web browsers with built-in ad blocking and private browsing.'
        }
    },
    {
        id: 'wallpapers',
        icon: 'fa-palette',
        name: { ar: 'خلفيات وثيمات', en: 'Wallpapers & Themes' },
        desc: {
            ar: 'خلفيات بدقة 4K لشاشات AMOLED، حزم الأيقونات، ومغيرات واجهة الهاتف.',
            en: 'High-res 4K AMOLED wallpapers, custom icon packs, and launcher themes.'
        }
    },
    {
        id: 'productivity',
        icon: 'fa-briefcase',
        name: { ar: 'أعمال وإنتاجية', en: 'Productivity & Office' },
        desc: {
            ar: 'مجموعات الأوفيس لتحرير المستندات والجداول، إدارة الوقت، وتنظيم المهام.',
            en: 'Office suites for editing docs and sheets, task managers, and planners.'
        }
    }
];

const TOP_CHIPS = [
    { id: 'all', ar: 'الكل', en: 'All', icon: 'fa-shapes' },
    ...MASTER_CATEGORIES.map(c => ({
        id: c.id,
        ar: c.name.ar,
        en: c.name.en,
        icon: c.icon
    }))
];

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

        case 'sports':
            return hasAnyTag(['sport', 'football', 'fitness', 'workout', 'gym', 'رياض']) ||
                   name.includes('fit') || name.includes('sport');

        case 'productivity':
            return hasAnyTag(['product', 'office', 'business']) || name.includes('office');

        default:
            return hasAnyTag([catId.toLowerCase()]);
    }
}

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
        optSortRating: "الأعلى تقييماً",
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
        galleryPhotos: "صور",
        showMore: "عرض المزيد",
        showLess: "عرض أقل",
        moreTags: "المزيد",
        channelText: "القناة الخاصة",
        statRating: "التقييم",
        statVersion: "الإصدار",
        statSize: "الحجم",
        statType: "النوع",
        ratingsTitle: "تقييمات المشتركين",
        ratingsSubtext: "تقييم القناة",
        voteOnTelegram: "شارك في التقييم على تليجرام",
        badgeNew: "جديد",
        votesLabel: "تقييم",
        noRatingsYet: "لا توجد تقييمات بعد",
        ratingOptExcellent: "🔥 ممتاز",
        ratingOptGood: "⚡️ جيد",
        ratingOptAverage: "😐 عادي",
        ratingOptBad: "👎 سيء",
        aboutUsTitle: "فريق IA | Incentive Aid",
        aboutUsSubtitle: "نصنع التغيير معاً • We Make The Change Together",
        aboutUsHeading: "من هم الفريق IA:",
        aboutUsBtnTooltip: "من نحن",
        aboutGithubText: "مستودع المشروع (GitHub)",
        aboutCoffeeText: "قهوة للمطورين / Buy us a coffee ☕"
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
        optSortRating: "Highest Rated",
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
        galleryPhotos: "photos",
        showMore: "Read more",
        showLess: "Show less",
        moreTags: "More",
        channelText: "Channel",
        statRating: "Rating",
        statVersion: "Version",
        statSize: "Size",
        statType: "Type",
        ratingsTitle: "Community Ratings",
        ratingsSubtext: "Channel Rating",
        voteOnTelegram: "Vote on Telegram",
        badgeNew: "New",
        votesLabel: "votes",
        noRatingsYet: "No ratings yet",
        ratingOptExcellent: "🔥 Excellent",
        ratingOptGood: "⚡️ Good",
        ratingOptAverage: "😐 Average",
        ratingOptBad: "👎 Bad",
        aboutUsTitle: "IA Team | Incentive Aid",
        aboutUsSubtitle: "We Make The Change Together",
        aboutUsHeading: "Who is the IA Team:",
        aboutUsBtnTooltip: "About Us",
        aboutGithubText: "Project Repository (GitHub)",
        aboutCoffeeText: "Support Us / Buy us a coffee ☕"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    createFloatingBackground();
    fetchBanners();
    fetchApps();
    setupEventListeners();
    updateHeaderSpacer();
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
    const catSectionTitle = document.getElementById('categories-title');
    if (catSectionTitle) catSectionTitle.textContent = strings[lang].navCategories;
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

    ['label-sort', 'opt-sort-new', 'opt-sort-rating', 'opt-sort-old', 'opt-sort-asc', 'opt-sort-desc', 'opt-size-asc', 'opt-size-desc',
        'label-size', 'opt-size-all', 'opt-size-small', 'opt-size-large', 'label-category', 'opt-cat-all'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                el.textContent = strings[lang][key];
            }
        });

    const statRatingLabel = document.getElementById('stat-rating-label');
    if (statRatingLabel) statRatingLabel.textContent = strings[lang].statRating;
    const statVersionLabel = document.getElementById('stat-version-label');
    if (statVersionLabel) statVersionLabel.textContent = strings[lang].statVersion;
    const statSizeLabel = document.getElementById('stat-size-label');
    if (statSizeLabel) statSizeLabel.textContent = strings[lang].statSize;
    const statTypeLabel = document.getElementById('stat-type-label');
    if (statTypeLabel) statTypeLabel.textContent = strings[lang].statType;
    const ratingsTitleText = document.getElementById('ratings-title-text');
    if (ratingsTitleText) ratingsTitleText.textContent = strings[lang].ratingsTitle;
    const ratingsSubtext = document.getElementById('ratings-subtext');
    if (ratingsSubtext) ratingsSubtext.textContent = strings[lang].ratingsSubtext;
    const voteTgBtnText = document.getElementById('vote-tg-btn-text');
    if (voteTgBtnText) voteTgBtnText.textContent = strings[lang].voteOnTelegram;

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

    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle) aboutTitle.textContent = strings[lang].about;

    // Update About Us Modal UI
    const aboutToggle = document.getElementById('about-us-toggle');
    if (aboutToggle) aboutToggle.title = strings[lang].aboutUsBtnTooltip;
    const aboutModalTitle = document.getElementById('about-modal-title');
    if (aboutModalTitle) aboutModalTitle.textContent = strings[lang].aboutUsTitle;
    const aboutModalSubtitle = document.getElementById('about-modal-subtitle');
    if (aboutModalSubtitle) aboutModalSubtitle.textContent = strings[lang].aboutUsSubtitle;
    const aboutIntroHeading = document.getElementById('about-intro-heading');
    if (aboutIntroHeading) aboutIntroHeading.textContent = strings[lang].aboutUsHeading;
    const aboutGithubText = document.getElementById('about-github-text');
    if (aboutGithubText) aboutGithubText.textContent = strings[lang].aboutGithubText;
    const aboutCoffeeText = document.getElementById('about-coffee-text');
    if (aboutCoffeeText) aboutCoffeeText.textContent = strings[lang].aboutCoffeeText;
    const closeAboutBtn = document.getElementById('close-about-modal');
    if (closeAboutBtn) closeAboutBtn.title = lang === 'ar' ? 'إغلاق' : 'Close';

    const aboutTextContent = document.getElementById('about-text-content');
    if (aboutTextContent) {
        if (lang === 'en') {
            aboutTextContent.innerHTML = `
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>A technical, service, and voluntary online team</strong>
                        <span class="point-sub">Founded on 1/1/2020</span>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>Members from across the Arab world...</strong>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>The (Sun) symbol represents:</strong>
                        <span class="quote-text">"The sun that illuminates the path for others"</span>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>The ( IA ) symbol stands for:</strong>
                        <span class="quote-text">The English word "Incentive Aid", meaning motivational assistance</span>
                    </div>
                </div>
                <div class="about-mission-box">
                    <p class="mission-text">
                        Work in our team is <strong>"voluntary service"</strong>. Our primary goal is spreading knowledge and digital entertainment to serve the community, raise tech risk awareness, and promote self-development.
                    </p>
                </div>
            `;
        } else {
            aboutTextContent.innerHTML = `
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>فريق تقني وخدمي وتطوعي (إلكتروني)</strong>
                        <span class="point-sub">تأسس في 1/1/2020</span>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>أعضاؤه من البلاد العربية كافة...</strong>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>رمز (الشمس) للدلالة على:</strong>
                        <span class="quote-text">"الشمس التي تنير درب الآخرين"</span>
                    </div>
                </div>
                <div class="about-point">
                    <span class="point-badge">🔶</span>
                    <div class="point-text">
                        <strong>رمز ( IA ) يشير إلى:</strong>
                        <span class="quote-text">الكلمة الإنجليزية "Incentive Aid" وهي تعني المساعدة التحفيزية</span>
                    </div>
                </div>
                <div class="about-mission-box">
                    <p class="mission-text">
                        العمل في فريقنا هو <strong>"خدمي تطوعي"</strong>، وهدفنا الأساسي نشر العلم والترفيه الرقمي لخدمة المجتمع وتوعيته بالمخاطر التقنية والتطوير الذاتي.
                    </p>
                </div>
            `;
        }
    }

    updateFavoritesBadge();
    renderCategoryChips();
    if (window.currentModalApp) {
        updateModalFavBtn(isFavorite(window.currentModalApp.id || window.currentModalApp.name));
        if (window.currentModalApp.screenshots && window.currentModalApp.screenshots.length > 0) {
            const galleryCount = document.getElementById('modal-gallery-count');
            if (galleryCount) galleryCount.textContent = `${window.currentModalApp.screenshots.length} ${strings[lang].galleryPhotos}`;
        }

        const channelBtn = document.getElementById('modal-channel-tool');
        if (channelBtn) {
            const channelText = channelBtn.querySelector('span');
            if (channelText) channelText.textContent = strings[lang].channelText;
        }

        const descEl = document.getElementById('modal-description');
        const expandText = document.getElementById('desc-expand-text');
        if (descEl && expandText) {
            const isCollapsed = descEl.classList.contains('collapsed');
            expandText.textContent = isCollapsed ? strings[lang].showMore : strings[lang].showLess;
        }

        const modTagsContainer = document.getElementById('modal-mod-tags');
        const modToggleBtn = document.getElementById('mod-tags-toggle-btn');
        if (modTagsContainer && modToggleBtn) {
            const isExpanded = modTagsContainer.classList.contains('expanded');
            const remainingCount = modToggleBtn.getAttribute('data-count') || '';
            const toggleText = modToggleBtn.querySelector('.toggle-text');
            if (toggleText) {
                toggleText.textContent = isExpanded ? strings[lang].showLess : `+${remainingCount} ${strings[lang].moreTags}`;
            }
        }

        const isLarge = window.currentModalApp.size > 19.5 * 1024 * 1024;
        const noteContainer = document.getElementById('modal-note-container');
        if (noteContainer) {
            if (isLarge) {
                const noteText = lang === 'ar'
                    ? 'ملاحظة: يجب الانضمام للقناة الخاصة أولاً لتتمكن من تحميل هذا الملف الكبير عبر تليجرام.'
                    : 'Note: You must join the private channel first to download this large file via Telegram.';
                noteContainer.innerHTML = `
                    <div class="modal-note-card">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>${noteText}</span>
                    </div>
                `;
                noteContainer.style.display = 'block';
            } else {
                noteContainer.innerHTML = '';
                noteContainer.style.display = 'none';
            }
        }

        const statType = document.getElementById('stat-type-val');
        if (statType) {
            statType.textContent = window.currentModalApp.category === 'Games' ? strings[lang].categoryGame : strings[lang].categoryApp;
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

    // About Us Toggle (Header)
    const aboutToggle = document.getElementById('about-us-toggle');
    if (aboutToggle) {
        aboutToggle.addEventListener('click', () => {
            openAboutModal();
        });
    }

    // Close About Us Modal
    const closeAboutBtn = document.getElementById('close-about-modal');
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            closeAboutModal();
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

    // Modal Description Expand / Collapse Button
    const descExpandBtn = document.getElementById('desc-expand-btn');
    if (descExpandBtn && !descExpandBtn._bound) {
        descExpandBtn._bound = true;
        descExpandBtn.addEventListener('click', () => {
            const descEl = document.getElementById('modal-description');
            if (!descEl) return;
            const isCollapsed = descEl.classList.toggle('collapsed');
            const expandText = document.getElementById('desc-expand-text');
            const icon = descExpandBtn.querySelector('i');
            if (isCollapsed) {
                if (expandText) expandText.textContent = strings[currentLanguage].showMore || (currentLanguage === 'ar' ? 'عرض المزيد' : 'Read more');
                if (icon) icon.className = 'fa-solid fa-chevron-down';
            } else {
                if (expandText) expandText.textContent = strings[currentLanguage].showLess || (currentLanguage === 'ar' ? 'عرض أقل' : 'Show less');
                if (icon) icon.className = 'fa-solid fa-chevron-up';
            }
        });
    }

    const utilSort = document.getElementById('util-sort');
    if (utilSort) {
        utilSort.addEventListener('click', () => {
            const sortModes = ['new', 'rating_desc', 'old', 'name_asc', 'name_desc'];
            const icons = ['fa-clock', 'fa-star', 'fa-clock-rotate-left', 'fa-arrow-down-a-z', 'fa-arrow-up-z-a'];
            const labelsAr = ['الأحدث', 'الأعلى تقييماً', 'الأقدم', 'أبجدي تصاعدي', 'أبجدي تنازلي'];
            const labelsEn = ['Newest', 'Highest Rated', 'Oldest', 'A-Z', 'Z-A'];
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
            window._userCustomCols = true;
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
        const aboutModal = document.getElementById('about-modal');
        if (aboutModal && e.target === aboutModal && aboutModal.classList.contains('active')) {
            closeAboutModal();
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
        const aboutModal = document.getElementById('about-modal');
        if (aboutModal && aboutModal.classList.contains('active')) {
            closeAboutModal();
        }
        const reqModal = document.getElementById('request-modal');
        if (reqModal && reqModal.classList.contains('active')) {
            reqModal.classList.remove('active');
        }
        const instModal = document.getElementById('install-modal');
        if (instModal && instModal.classList.contains('active')) {
            instModal.classList.remove('active');
        }
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeScreenshotLightbox();
            if (modal && modal.classList.contains('active')) {
                const closeBtn = document.querySelector('.close-modal');
                if (closeBtn) closeBtn.click();
                else {
                    modal.classList.remove('active');
                    window.currentModalApp = null;
                    cleanAppQueryParam();
                }
            }
            const aboutModal = document.getElementById('about-modal');
            if (aboutModal && aboutModal.classList.contains('active')) {
                closeAboutModal();
            }
            const favModal = document.getElementById('favorites-modal');
            if (favModal && favModal.classList.contains('active')) {
                closeFavoritesModal();
            }
            const reqModal = document.getElementById('request-modal');
            if (reqModal && reqModal.classList.contains('active')) {
                reqModal.classList.remove('active');
            }
            const instModal = document.getElementById('install-modal');
            if (instModal && instModal.classList.contains('active')) {
                instModal.classList.remove('active');
            }
            const filterPanel = document.getElementById('filter-panel');
            if (filterPanel && filterPanel.style.display !== 'none') {
                filterPanel.style.display = 'none';
                const filterToggle = document.getElementById('filter-toggle');
                if (filterToggle) filterToggle.classList.remove('active');
            }
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

    // Robust Auto-minimizing Header on Scroll Down, Expanding on Scroll Up (with hysteresis & deadzone)
    let lastHeaderScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    let headerScrollTicking = false;
    let isHeaderMinimized = false;

    function handleHeaderScroll() {
        const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
        const header = document.querySelector('.top-header');
        if (!header) {
            headerScrollTicking = false;
            return;
        }

        // Keep header fully expanded if user is actively searching
        const searchInput = document.getElementById('search-input');
        if (searchInput && document.activeElement === searchInput) {
            if (isHeaderMinimized) {
                header.classList.remove('header-minimized');
                isHeaderMinimized = false;
            }
            lastHeaderScrollY = currentScrollY;
            headerScrollTicking = false;
            return;
        }

        // Rule 1: Always force expanded near top (scrollY < 60)
        // and lock from collapsing until scrollY > 120 so it never jitters near the top
        if (currentScrollY < 60) {
            if (isHeaderMinimized) {
                header.classList.remove('header-minimized');
                isHeaderMinimized = false;
            }
            lastHeaderScrollY = currentScrollY;
            headerScrollTicking = false;
            return;
        }

        // Calculate scroll delta
        const delta = currentScrollY - lastHeaderScrollY;

        // Rule 2: Only toggle when user has scrolled continuously by at least 18px
        if (delta > 18 && currentScrollY > 120) {
            // Scrolling DOWN past 120px with sufficient movement: minimize
            if (!isHeaderMinimized) {
                header.classList.add('header-minimized');
                isHeaderMinimized = true;

                // Close filter panel if open
                const filterPanel = document.getElementById('filter-panel');
                if (filterPanel && filterPanel.style.display !== 'none') {
                    filterPanel.style.display = 'none';
                    const filterToggle = document.getElementById('filter-toggle');
                    if (filterToggle) filterToggle.classList.remove('active');
                }
            }
            lastHeaderScrollY = currentScrollY;
        } else if (delta < -18) {
            // Scrolling UP by at least 18px: restore full header
            if (isHeaderMinimized) {
                header.classList.remove('header-minimized');
                isHeaderMinimized = false;
            }
            lastHeaderScrollY = currentScrollY;
        }

        headerScrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!headerScrollTicking) {
            requestAnimationFrame(handleHeaderScroll);
            headerScrollTicking = true;
        }
    }, { passive: true });

    // Measure and set header spacer height
    updateHeaderSpacer();
    window.addEventListener('resize', () => {
        const header = document.querySelector('.top-header');
        if (header && !header.classList.contains('header-minimized')) {
            updateHeaderSpacer();
        }
    });
}

function switchView(viewName) {
    if (activeView === viewName && currentSearch === '') return;
    activeView = viewName;

    // Update active nav button
    navItems.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`[data-view="${viewName}"]`).forEach(btn => btn.classList.add('active'));

    // Hide all pages
    Object.values(views).forEach(page => {
        if (page) page.classList.remove('active');
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
        const catTitle = document.getElementById('categories-title');
        if (catTitle) catTitle.textContent = strings[currentLanguage].navCategories;
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
    if (activeView === 'categories') {
        const catTitle = document.getElementById('categories-title');
        if (catTitle) catTitle.textContent = strings[currentLanguage].navCategories;
        return;
    }
    if (currentSearch) {
        pageTitle.textContent = strings[currentLanguage].titleSearch;
    } else if (activeView === 'home') {
        const sortModes = ['new', 'rating_desc', 'old', 'name_asc', 'name_desc'];
        const labelsAr = ['الأحدث', 'الأعلى تقييماً', 'الأقدم', 'أبجدي تصاعدي', 'أبجدي تنازلي'];
        const labelsEn = ['Newest', 'Highest Rated', 'Oldest', 'A-Z', 'Z-A'];
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
            if (!app.category) app.category = 'Apps';
            app._index = idx; // Store original insertion order for sorting
            if (app.description) {
                const parsed = parseAppDescription(app.description);
                const clean = (parsed.cleanDesc || app.description || '').trim();
                const singleLine = clean.replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').trim();
                app._descShort = singleLine;
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

        // Handle Action Click (avoiding accidental fire on touch swipe/drag)
        let bannerTouchStartX = 0;
        let isBannerSwiping = false;

        div.addEventListener('touchstart', (e) => {
            bannerTouchStartX = e.touches[0].clientX;
            isBannerSwiping = false;
        }, { passive: true });

        div.addEventListener('touchmove', (e) => {
            if (Math.abs(e.touches[0].clientX - bannerTouchStartX) > 10) {
                isBannerSwiping = true;
            }
        }, { passive: true });

        div.addEventListener('click', () => {
            if (isBannerSwiping) return;
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
    else if (lower.includes('call') || lower.includes('phone') || lower.includes('contact')) { icon = 'fa-phone-volume'; ar = 'تطبيقات الاتصال'; en = 'Calling Apps'; }
    else if (lower.includes('news') || lower.includes('أخبار')) { icon = 'fa-newspaper'; ar = 'أخبار'; en = 'News'; }
    else if (lower.includes('shop') || lower.includes('market') || lower.includes('متجر') || lower.includes('تسوق')) { icon = 'fa-cart-shopping'; ar = 'تسوق'; en = 'Shopping'; }

    return { ar: ar, en: en, icon: icon };
}

function renderCategories() {
    if (!categoriesGrid) return;
    categoriesGrid.innerHTML = '';

    // Update section title to match current language
    const catTitle = document.getElementById('categories-title');
    if (catTitle) {
        catTitle.textContent = strings[currentLanguage].navCategories;
    }

    const categorySelect = document.getElementById('category-select');
    let prevSelected = '';
    if (categorySelect) {
        prevSelected = categorySelect.value;
        while (categorySelect.options.length > 1) categorySelect.remove(1);
    }

    MASTER_CATEGORIES.forEach(cat => {
        const catName = cat.name[currentLanguage] || cat.name.ar;
        const catDesc = cat.desc[currentLanguage] || cat.desc.ar;

        // Count apps matching this category
        const count = allApps.filter(app => appMatchesCategory(app, cat.id)).length;
        if (count === 0) return;

        // If user typed in search bar, filter by name or description (with Arabic normalization)
        if (currentSearch && !currentSearch.startsWith('#')) {
            const query = currentSearch.toLowerCase();
            const normQuery = normalizeArabic(currentSearch);
            const matchesName = catName.toLowerCase().includes(query) || normalizeArabic(catName).includes(normQuery);
            const matchesDesc = catDesc.toLowerCase().includes(query) || normalizeArabic(catDesc).includes(normQuery);
            if (!matchesName && !matchesDesc) return;
        }

        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${catName} - ${count} ${currentLanguage === 'ar' ? 'تطبيق ولعبة' : 'Apps & Games'}`);

        const arrowIcon = currentLanguage === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right';
        const countUnit = currentLanguage === 'ar' ? 'تطبيق ولعبة' : 'Apps & Games';

        card.innerHTML = `
            <div class="cat-card-header">
                <div class="cat-icon-badge">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="cat-info">
                    <h3 class="cat-name">${catName}</h3>
                    <span class="cat-count">${count} ${countUnit}</span>
                </div>
                <div class="cat-arrow" aria-hidden="true">
                    <i class="fa-solid ${arrowIcon}"></i>
                </div>
            </div>
            <p class="cat-desc">${catDesc}</p>
        `;

        const activateCategory = () => {
            selectCategoryChip(cat.id, catName);
        };

        card.addEventListener('click', activateCategory);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateCategory();
            }
        });

        categoriesGrid.appendChild(card);

        // Add to dropdown
        if (categorySelect) {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.text = catName;
            if (cat.id === prevSelected || catName === prevSelected) opt.selected = true;
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
            if (!appMatchesCategory(app, selectedCat)) return false;
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

        // Text Search (with smart Arabic normalization)
        if (currentSearch && !currentSearch.startsWith('#')) {
            const term = currentSearch.toLowerCase();
            const normTerm = normalizeArabic(currentSearch);
            const nameNorm = normalizeArabic(app.name);
            const descNorm = normalizeArabic(app.description || '');
            return nameNorm.includes(normTerm) || descNorm.includes(normTerm) ||
                   app.name.toLowerCase().includes(term) || (app.description && app.description.toLowerCase().includes(term));
        }
        return true;
    });

    // Sort
    const sortMethod = currentSortMode;
    filteredApps.sort((a, b) => {
        const aDate = a.date ? a.date : a._index;
        const bDate = b.date ? b.date : b._index;

        if (sortMethod === 'new') return bDate - aDate; // Newest first
        if (sortMethod === 'rating_desc') {
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            if (bRating !== aRating) return bRating - aRating;
            return (b.votes || 0) - (a.votes || 0); // Tie-breaker: total votes
        }
        if (sortMethod === 'old') return aDate - bDate; // Oldest first
        if (sortMethod === 'name_asc') return a.name.localeCompare(b.name);
        if (sortMethod === 'name_desc') return b.name.localeCompare(a.name);
        if (sortMethod === 'size_asc') return a.size - b.size;
        if (sortMethod === 'size_desc') return b.size - a.size;
        return 0;
    });

    currentFilteredApps = filteredApps;
    currentlyRenderedCount = 0;

    // Update Search Metrics Counter
    const searchMetricsBar = document.getElementById('search-metrics-bar');
    const searchCountPill = document.getElementById('search-count-pill');
    if (searchMetricsBar && searchCountPill) {
        if (currentSearch && !currentSearch.startsWith('#')) {
            const countLabel = currentLanguage === 'ar'
                ? `نتائج البحث (${filteredApps.length})`
                : `Search results (${filteredApps.length})`;
            searchCountPill.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> <span>${countLabel}</span>`;
            searchMetricsBar.style.display = 'flex';
        } else {
            searchMetricsBar.style.display = 'none';
        }
    }

    if (filteredApps.length === 0) {
        const isSearch = Boolean(currentSearch);
        const emptyTitle = isSearch
            ? (currentLanguage === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No matching results found')
            : strings[currentLanguage].empty;
        const emptyDesc = isSearch
            ? (currentLanguage === 'ar' ? 'جرّب كتابة كلمات بحث أخرى أو تأكد من صحة الحروف' : 'Try searching for different keywords or check spelling')
            : '';
        const resetBtnHTML = isSearch
            ? `<button type="button" class="empty-reset-btn" onclick="clearSearchFilter();"><i class="fa-solid fa-rotate-left"></i> ${currentLanguage === 'ar' ? 'مسح البحث وعرض الكل' : 'Clear search & show all'}</button>`
            : '';

        appsGrid.innerHTML = `
            <div class="apps-empty-state">
                <div class="empty-state-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                <h3 class="empty-state-title">${emptyTitle}</h3>
                ${emptyDesc ? `<p class="empty-state-desc">${emptyDesc}</p>` : ''}
                ${resetBtnHTML}
            </div>
        `;
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
                    groupKey = `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
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

            grouped[key].forEach((app, idx) => {
                fragment.appendChild(createAppCard(app, idx < 8));
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
        fragment.appendChild(createAppCard(currentFilteredApps[i], i < 16));
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

function updateHeaderSpacer() {
    const header = document.querySelector('.top-header');
    const spacer = document.getElementById('header-spacer');
    if (header && spacer && !header.classList.contains('header-minimized')) {
        const h = header.offsetHeight;
        if (h > 0) spacer.style.height = `${h}px`;
    }
}

function updateGridClass() {
    appsGrid.className = 'apps-grid';
    if (currentViewMode === 'list') {
        appsGrid.classList.add('view-list');
        appsGrid.style.gridTemplateColumns = '';
    } else if (currentViewMode === 'single') {
        appsGrid.classList.add('view-single');
        appsGrid.style.gridTemplateColumns = '';
    } else {
        if (window.innerWidth < 768) {
            appsGrid.style.gridTemplateColumns = '';
        } else {
            if (window._userCustomCols) {
                appsGrid.style.gridTemplateColumns = `repeat(${currentGridCols}, minmax(130px, 1fr))`;
            } else {
                appsGrid.style.gridTemplateColumns = '';
            }
        }
    }

    if (currentViewMode !== 'grid') appsGrid.style.gridTemplateColumns = '';
}

function createAppCard(app, isInitial = false) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.onclick = () => openAppDetails(app);

    const isFav = isFavorite(app.id || app.name);
    const favTitle = isFav
        ? (currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
        : (currentLanguage === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites');

    const loadingAttr = isInitial ? 'loading="eager"' : 'loading="lazy"';
    const imgHTML = app.icon_id
        ? `<img src="${WORKER_URL}/?id=${app.icon_id}&action=image" alt="${app.name}" class="card-icon" ${loadingAttr} decoding="async" onerror="this.outerHTML='<div class=\\'card-icon fallback\\'><i class=\\'fa-brands fa-android\\'></i></div>'">`
        : `<div class="card-icon fallback"><i class="fa-brands fa-android"></i></div>`;

    const categoryText = app._descShort || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);

    const isLarge = app.size > 19.5 * 1024 * 1024;

    const hasRating = app.rating && app.votes > 0;
    const ratingBadgeHTML = hasRating
        ? `<span class="card-rating-badge">${app.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span>`
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
        <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${app.id || app.name}" title="${favTitle}" aria-label="Favorite">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        ${ratingBadgeHTML}
        ${imgHTML}
        <div class="card-info">
            <div class="card-title">${app.name}</div>
            <div class="card-desc card-category">${categoryText}</div>
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

function parseAppDescription(rawDesc) {
    if (!rawDesc) return { cleanDesc: '', modFeatures: [], extractedVersion: '' };
    const lines = rawDesc.split('\n');
    let cleanLines = [];
    let modFeatures = [];
    let extractedVersion = '';
    let inModSection = false;

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (!inModSection) cleanLines.push(line);
            continue;
        }

        // Check for version line (e.g. 🧊 الإصدار : v11.6.10, الإصدار : 1.26.52.3)
        if (trimmed.includes('الإصدار') && (trimmed.includes('🧊') || trimmed.startsWith('الإصدار') || trimmed.startsWith('الاصدار'))) {
            const vMatch = trimmed.match(/[:：]\s*(v?[\d\.\-_a-zA-Z]+)/i);
            if (vMatch) extractedVersion = vMatch[1];
            continue;
        }

        // Check for mod header line (e.g. 🏷 النسخة المعدلة وفيها :, 🏷 النسخة معدلة وفيها :)
        if (trimmed.includes('النسخة') && (trimmed.includes('معدلة') || trimmed.includes('المعدلة'))) {
            inModSection = true;
            continue;
        }

        if (inModSection) {
            // Mod feature lines! Clean any leading emoji / bullet / asterisk
            let featureText = trimmed.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F100}-\u{1F1FF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}•\-\*\s]+/u, '').trim();
            if (featureText) {
                modFeatures.push(featureText);
            }
        } else {
            cleanLines.push(line);
        }
    }

    return {
        cleanDesc: cleanLines.join('\n').trim(),
        modFeatures,
        extractedVersion
    };
}

function openAppDetails(app, pushUrl = true) {
    window.currentModalApp = app;
    if (pushUrl) {
        const url = new URL(window.location);
        url.searchParams.set('app', app.name);
        history.pushState({ modalOpen: true, appName: app.name }, '', url.toString());
    }

    document.getElementById('modal-title').textContent = app.name;

    // Parse Description to extract clean text and mod features accurately
    const parsed = parseAppDescription(app.description || '');

    // Resolve version for the Stat Bar (Title on top, value underneath)
    const resolvedVersion = app.version || parsed.extractedVersion || 'v1.0';
    const displayVersion = resolvedVersion.startsWith('v') ? resolvedVersion : 'v' + resolvedVersion;

    // Stat Bar: Rating, Version, Size, Type
    const statRatingVal = document.getElementById('stat-rating-val');
    if (statRatingVal) {
        if (app.rating && app.votes > 0) {
            statRatingVal.innerHTML = `<i class="fa-solid fa-star" style="color: #ffb703;"></i> <span>${app.rating.toFixed(1)}</span>`;
        } else {
            statRatingVal.innerHTML = `<span class="stat-na">--</span>`;
        }
    }

    const statVer = document.getElementById('stat-version-val');
    if (statVer) statVer.textContent = displayVersion;

    const statSize = document.getElementById('stat-size-val');
    if (statSize) statSize.textContent = formatBytes(app.size);

    const statType = document.getElementById('stat-type-val');
    if (statType) statType.textContent = app.category === 'Games' ? (currentLanguage === 'ar' ? 'ألعاب' : 'Game') : (currentLanguage === 'ar' ? 'تطبيق' : 'App');

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

    // Mod Feature Badges directly under the App Title (replacing repeated version line)
    const modTagsContainer = document.getElementById('modal-mod-tags');
    if (modTagsContainer) {
        modTagsContainer.classList.remove('expanded');
        let tagsList = parsed.modFeatures.slice();

        // Fallback detection if no mod bullet list was in the description
        if (tagsList.length === 0) {
            const textToScan = `${app.name} ${app.description || ''}`.toLowerCase();
            if (textToScan.includes('premium') || textToScan.includes('بريميوم') || textToScan.includes('مدفوع')) {
                tagsList.push(currentLanguage === 'ar' ? 'مفتوح Premium' : 'Premium Unlocked');
            }
            if (textToScan.includes('no ads') || textToScan.includes('بدون اعلانات') || textToScan.includes('بدون إعلانات')) {
                tagsList.push(currentLanguage === 'ar' ? 'بدون إعلانات' : 'No Ads');
            }
            if (textToScan.includes('unlimited') || textToScan.includes('غير محدود') || textToScan.includes('قلوب') || textToScan.includes('أموال') || textToScan.includes('فلوس')) {
                tagsList.push(currentLanguage === 'ar' ? 'موارد غير محدودة' : 'Unlimited Resources');
            }
            if (textToScan.includes('pro') || textToScan.includes('برو')) {
                tagsList.push(currentLanguage === 'ar' ? 'ميزات Pro' : 'Pro Unlocked');
            }
        }

        if (tagsList.length > 0) {
            let tagsHtml = '';
            const maxVisible = 3;
            tagsList.forEach((tagText, idx) => {
                const hiddenClass = idx >= maxVisible ? ' mod-tag-hidden' : '';
                tagsHtml += `
                    <span class="mod-pill-tag${hiddenClass}">
                        <i class="fa-solid fa-gem"></i> ${tagText}
                    </span>
                `;
            });

            if (tagsList.length > maxVisible) {
                const moreCount = tagsList.length - maxVisible;
                const moreLabel = strings[currentLanguage].moreTags || (currentLanguage === 'ar' ? 'المزيد' : 'More');
                tagsHtml += `
                    <button type="button" class="mod-tags-toggle-btn" id="mod-tags-toggle-btn" data-count="${moreCount}" aria-expanded="false">
                        <span class="toggle-text">+${moreCount} ${moreLabel}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                `;
            }

            modTagsContainer.innerHTML = tagsHtml;
            modTagsContainer.style.display = 'flex';

            const toggleBtn = document.getElementById('mod-tags-toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = modTagsContainer.classList.toggle('expanded');
                    toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                    const toggleText = toggleBtn.querySelector('.toggle-text');
                    const icon = toggleBtn.querySelector('i');
                    const count = toggleBtn.getAttribute('data-count') || '';
                    if (isExpanded) {
                        if (toggleText) toggleText.textContent = strings[currentLanguage].showLess || (currentLanguage === 'ar' ? 'عرض أقل' : 'Show less');
                        if (icon) icon.className = 'fa-solid fa-chevron-up';
                    } else {
                        const mLabel = strings[currentLanguage].moreTags || (currentLanguage === 'ar' ? 'المزيد' : 'More');
                        if (toggleText) toggleText.textContent = `+${count} ${mLabel}`;
                        if (icon) icon.className = 'fa-solid fa-chevron-down';
                    }
                });
            }
        } else {
            modTagsContainer.innerHTML = '';
            modTagsContainer.style.display = 'none';
        }
    }

    // Clean Description in "حول هذا التطبيق" without repeated version/mod bullets
    const isLarge = app.size > 19.5 * 1024 * 1024;
    const cleanDesc = (parsed.cleanDesc || app.description || '').trim();
    const descEl = document.getElementById('modal-description');
    const expandBtn = document.getElementById('desc-expand-btn');
    const expandText = document.getElementById('desc-expand-text');

    if (descEl) {
        descEl.classList.add('collapsed');
        descEl.innerHTML = cleanDesc.replace(/\n/g, '<br>');
        if (expandText) {
            expandText.textContent = strings[currentLanguage].showMore || (currentLanguage === 'ar' ? 'عرض المزيد' : 'Read more');
        }
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-chevron-down';
        }

        const lineCount = cleanDesc.split('\n').filter(l => l.trim().length > 0).length;
        const isLongText = cleanDesc.length > 220;
        requestAnimationFrame(() => {
            const isOverflow = (descEl.scrollHeight > descEl.clientHeight + 4) || lineCount > 5 || isLongText;
            if (expandBtn) {
                expandBtn.style.display = isOverflow ? 'inline-flex' : 'none';
            }
        });
    }

    // Large File Telegram Note (Moved to the bottom under everything else)
    const noteContainer = document.getElementById('modal-note-container');
    if (noteContainer) {
        if (isLarge) {
            const noteText = currentLanguage === 'ar'
                ? 'ملاحظة: يجب الانضمام للقناة الخاصة أولاً لتتمكن من تحميل هذا الملف الكبير عبر تليجرام.'
                : 'Note: You must join the private channel first to download this large file via Telegram.';
            noteContainer.innerHTML = `
                <div class="modal-note-card">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>${noteText}</span>
                </div>
            `;
            noteContainer.style.display = 'block';
        } else {
            noteContainer.innerHTML = '';
            noteContainer.style.display = 'none';
        }
    }

    // Single Dominant CTA & Secondary Tools
    const downloadBtn = document.getElementById('modal-download');
    const toolsGroup = document.querySelector('.modal-tools-group');

    const existingChannelTool = document.getElementById('modal-channel-tool');
    if (existingChannelTool) existingChannelTool.remove();

    const existingJoinBtn = document.getElementById('modal-join-btn');
    if (existingJoinBtn) existingJoinBtn.remove();

    if (isLarge) {
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`;
        if (app.chat_id && app.chat_id.startsWith('-100')) {
            const baseChatId = app.chat_id.substring(4);
            tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
        }

        downloadBtn.href = tgLink;
        downloadBtn.className = 'download-btn btn-large main-cta-btn';
        downloadBtn.innerHTML = `<i class="fa-brands fa-telegram"></i> <span id="download-text">${currentLanguage === 'ar' ? 'تحميل عبر تليجرام' : 'Download via Telegram'} • ${formatBytes(app.size)}</span>`;

        if (toolsGroup) {
            const channelTool = document.createElement('a');
            channelTool.id = 'modal-channel-tool';
            channelTool.href = 'https://t.me/+ij7-LS669ahhMDFk';
            channelTool.target = '_blank';
            channelTool.rel = 'noopener noreferrer';
            channelTool.className = 'modal-tool-btn channel-tool-btn';
            channelTool.style.textDecoration = 'none';
            channelTool.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>${strings[currentLanguage].channelText || (currentLanguage === 'ar' ? 'القناة الخاصة' : 'Channel')}</span>`;
            toolsGroup.appendChild(channelTool);
        }
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.className = 'download-btn btn-large main-cta-btn';
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${currentLanguage === 'ar' ? 'تثبيت مباشر' : 'Direct Download'} • ${formatBytes(app.size)}</span>`;
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

    // Setup mobile bottom sheet swipe-to-dismiss gesture once
    const modalContent = document.querySelector('#app-modal .modal-content');
    if (modalContent && !modalContent._swipeBound) {
        modalContent._swipeBound = true;
        let touchStartY = 0;
        let touchCurrentY = 0;
        modalContent.addEventListener('touchstart', (e) => {
            if (modalContent.scrollTop <= 0) {
                touchStartY = e.touches[0].clientY;
            } else {
                touchStartY = 0;
            }
        }, { passive: true });

        modalContent.addEventListener('touchmove', (e) => {
            if (touchStartY > 0) {
                touchCurrentY = e.touches[0].clientY;
                const diff = touchCurrentY - touchStartY;
                if (diff > 0) {
                    modalContent.style.transform = `translateY(${diff}px)`;
                }
            }
        }, { passive: true });

        modalContent.addEventListener('touchend', () => {
            if (touchStartY > 0 && touchCurrentY > touchStartY + 90) {
                modalContent.style.transform = '';
                const closeBtn = document.querySelector('.close-modal');
                if (closeBtn) closeBtn.click();
            } else {
                modalContent.style.transform = '';
            }
            touchStartY = 0;
            touchCurrentY = 0;
        });
    }
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

    // Community Ratings Breakdown & Telegram Voting Link
    renderModalRatings(app);

    modal.classList.add('active');
}

function renderModalRatings(app) {
    const ratingsSection = document.getElementById('modal-ratings-section');
    if (!ratingsSection) return;

    const hasRatings = app.rating && app.votes > 0;
    const votesCount = app.votes || 0;
    const votesCountEl = document.getElementById('modal-votes-count');
    const bigNumberEl = document.getElementById('ratings-big-number');
    const starsMeterEl = document.getElementById('ratings-stars-meter');
    const subtextEl = document.getElementById('ratings-subtext');
    const titleTextEl = document.getElementById('ratings-title-text');
    const voteBtn = document.getElementById('modal-vote-tg-btn');
    const voteBtnText = document.getElementById('vote-tg-btn-text');

    if (titleTextEl) titleTextEl.textContent = strings[currentLanguage].ratingsTitle || 'تقييمات المشتركين';
    if (subtextEl) subtextEl.textContent = strings[currentLanguage].ratingsSubtext || 'تقييم القناة';
    if (voteBtnText) voteBtnText.textContent = strings[currentLanguage].voteOnTelegram || 'شارك في التقييم على تليجرام';

    if (votesCountEl) {
        votesCountEl.textContent = `${votesCount} ${strings[currentLanguage].votesLabel || 'تقييم'}`;
    }

    if (bigNumberEl) {
        bigNumberEl.textContent = hasRatings ? app.rating.toFixed(1) : '--';
    }

    if (starsMeterEl) {
        const r = app.rating || 0;
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (r >= i) {
                starsHtml += '<i class="fa-solid fa-star star-filled"></i>';
            } else if (r >= i - 0.5) {
                starsHtml += '<i class="fa-solid fa-star-half-stroke star-half"></i>';
            } else {
                starsHtml += '<i class="fa-regular fa-star star-empty"></i>';
            }
        }
        starsMeterEl.innerHTML = starsHtml;
    }

    const breakdown = app.rating_breakdown || {};
    const categories = [
        { key: 'excellent', label: strings[currentLanguage].ratingOptExcellent || '🔥 ممتاز' },
        { key: 'good', label: strings[currentLanguage].ratingOptGood || '⚡️ جيد' },
        { key: 'average', label: strings[currentLanguage].ratingOptAverage || '😐 عادي' },
        { key: 'bad', label: strings[currentLanguage].ratingOptBad || '👎 سيء' }
    ];

    categories.forEach(cat => {
        const row = ratingsSection.querySelector(`.rating-bar-row[data-key="${cat.key}"]`);
        if (row) {
            const count = breakdown[cat.key] || 0;
            const percent = votesCount > 0 ? Math.round((count / votesCount) * 100) : 0;
            const fill = row.querySelector('.bar-fill');
            const countEl = row.querySelector('.bar-count');
            const labelEl = row.querySelector('.bar-label');

            if (labelEl) labelEl.textContent = cat.label;
            if (fill) fill.style.width = `${percent}%`;
            if (countEl) countEl.textContent = `${count}`;
        }
    });

    if (voteBtn) {
        let pollMsgId = app.poll_msg_id;
        if (!pollMsgId && app.id && !isNaN(parseInt(app.id))) {
            pollMsgId = parseInt(app.id) + 1;
        }

        let pollTgLink = 'https://t.me/+ij7-LS669ahhMDFk';
        if (app.chat_id && app.chat_id.startsWith('-100') && pollMsgId) {
            const baseChatId = app.chat_id.substring(4);
            pollTgLink = `https://t.me/c/${baseChatId}/${pollMsgId}`;
        } else if (pollMsgId) {
            pollTgLink = `https://t.me/c/1423595432/${pollMsgId}`;
        }
        voteBtn.href = pollTgLink;
    }
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

function openAboutModal() {
    const aboutModal = document.getElementById('about-modal');
    if (!aboutModal) return;
    aboutModal.classList.add('active');
}

function closeAboutModal() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) aboutModal.classList.remove('active');
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
let activeCategoryChipId = 'all';

function renderCategoryChips() {
    const container = document.getElementById('category-chips-bar');
    const wrapper = document.querySelector('.chips-wrapper');
    if (!container) return;

    if (activeView === 'games' || activeView === 'categories') {
        if (wrapper) wrapper.style.display = 'none';
        updateHeaderSpacer();
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

    updateHeaderSpacer();
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

function clearSearchFilter() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    currentSearch = '';
    setActiveCategoryChip('all');
    const catSelect = document.getElementById('category-select');
    if (catSelect) catSelect.value = 'all';
    updateViewTitle();
    renderApps();
}
window.clearSearchFilter = clearSearchFilter;

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
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // Respect reduced motion accessibility preference
    }
    const bgContainer = document.createElement('div');
    bgContainer.className = 'floating-background';
    document.body.appendChild(bgContainer);

    const icons = ['fa-paper-plane', 'fa-android'];
    // On mobile devices, keep ambient animation lightweight to conserve battery and GPU
    const numIcons = window.innerWidth < 768 ? 6 : 14;

    for (let i = 0; i < numIcons; i++) {
        const icon = document.createElement('i');
        const iconClass = icons[Math.floor(Math.random() * icons.length)];
        icon.className = iconClass === 'fa-paper-plane' ? `fa-solid ${iconClass} floating-icon` : `fa-brands ${iconClass} floating-icon`;

        const size = Math.random() * 20 + 14;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 18;
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
            const msg = currentLanguage === 'ar'
                ? "لا يمكن تثبيت المتجر حالياً. قد يكون مثبتاً بالفعل، أو افتح الموقع عبر متصفح Chrome/Safari الرسمي."
                : "Cannot install app right now. It might already be installed, or browser support is limited.";
            showToast(msg, 'info', 'fa-circle-info');
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
