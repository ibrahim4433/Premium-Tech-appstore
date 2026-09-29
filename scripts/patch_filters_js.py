with open("js/app.js", "r") as f:
    content = f.read()

# 1. Update Translations
old_strings_en = """    empty: "No apps found.",
    error: "Error loading apps."
};"""
new_strings_en = """    empty: "No apps found.",
    error: "Error loading apps.",
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
    optCatAll: "All"
};"""
content = content.replace(old_strings_en, new_strings_en)

old_strings_ar = """    empty: "لا توجد تطبيقات.",
    error: "خطأ في تحميل التطبيقات."
};"""
new_strings_ar = """    empty: "لا توجد تطبيقات.",
    error: "خطأ في تحميل التطبيقات.",
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
    optCatAll: "الكل"
};"""
content = content.replace(old_strings_ar, new_strings_ar)


# 2. Update setLanguage for Filters
old_set_lang = """    const btnReqText = document.getElementById('btn-request-text');
    if (btnReqText) btnReqText.textContent = lang === 'ar' ? 'اطلب تطبيق/لعبة' : 'Request App/Game';

    updateViewTitle();"""

new_set_lang = """    const btnReqText = document.getElementById('btn-request-text');
    if (btnReqText) btnReqText.textContent = lang === 'ar' ? 'اطلب تطبيق/لعبة' : 'Request App/Game';

    // Update Filter labels
    ['label-sort', 'opt-sort-new', 'opt-sort-old', 'opt-sort-asc', 'opt-sort-desc', 'opt-size-asc', 'opt-size-desc',
     'label-size', 'opt-size-all', 'opt-size-small', 'opt-size-large', 'label-category', 'opt-cat-all'].forEach(id => {
         const el = document.getElementById(id);
         if (el) {
             const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
             el.textContent = strings[lang][key];
         }
     });

    updateViewTitle();"""
content = content.replace(old_set_lang, new_set_lang)


# 3. Update setupEventListeners for Filters
old_events = """    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (activeView === 'categories') {
            renderCategories();
        } else {
            renderApps();
        }
    });"""

new_events = """    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (activeView === 'categories') {
            renderCategories();
        } else {
            renderApps();
        }
    });

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
    });"""
content = content.replace(old_events, new_events)


# 4. Update fetchApps to assign index for sorting
old_fetch = """        allApps = await response.json();
        allApps.forEach(app => { if(!app.category) app.category = 'Apps'; });"""

new_fetch = """        allApps = await response.json();
        allApps.forEach((app, idx) => { 
            if(!app.category) app.category = 'Apps';
            app._index = idx; // Store original insertion order for sorting
        });"""
content = content.replace(old_fetch, new_fetch)


# 5. Update renderCategories to populate category-select
old_render_cat = """    if(uniqueTags.size === 0) return;
    
    const renderedNames = new Set(); // Avoid duplicate categories with different tags but same mapped name

    uniqueTags.forEach(tag => {"""

new_render_cat = """    if(uniqueTags.size === 0) return;
    
    const renderedNames = new Set(); // Avoid duplicate categories with different tags but same mapped name
    
    const categorySelect = document.getElementById('category-select');
    let prevSelected = '';
    if (categorySelect) {
        prevSelected = categorySelect.value;
        while (categorySelect.options.length > 1) categorySelect.remove(1);
    }

    uniqueTags.forEach(tag => {"""

content = content.replace(old_render_cat, new_render_cat)

old_cat_append = """        card.onclick = () => {
            switchView('home');
            currentSearch = tag;
            searchInput.value = '';
            updateViewTitle(label);
            renderApps();
        };
        categoriesGrid.appendChild(card);
    });
}"""

new_cat_append = """        card.onclick = () => {
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
}"""
content = content.replace(old_cat_append, new_cat_append)


# 6. Update renderApps filtering and sorting
old_render_apps = """function renderApps() {
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

    if (filteredApps.length === 0) {"""

new_render_apps = """function renderApps() {
    appsGrid.innerHTML = '';
    
    const filteredApps = allApps.filter(app => {
        // Dropdown Category Filter
        const selectedCat = document.getElementById('category-select') ? document.getElementById('category-select').value : 'all';
        if (selectedCat !== 'all') {
            let hasTag = false;
            if (app.tags) {
                app.tags.forEach(t => {
                    const tagInfo = getTagInfo(t);
                    const tagLabel = currentLanguage === 'ar' ? tagInfo.ar : tagInfo.en;
                    if (tagLabel === selectedCat) hasTag = true;
                });
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
        const sizeFilter = document.getElementById('size-select') ? document.getElementById('size-select').value : 'all';
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
    const sortMethod = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'new';
    filteredApps.sort((a, b) => {
        if (sortMethod === 'new') return b._index - a._index; // Newest first
        if (sortMethod === 'old') return a._index - b._index; // Oldest first
        if (sortMethod === 'name_asc') return a.name.localeCompare(b.name);
        if (sortMethod === 'name_desc') return b.name.localeCompare(a.name);
        if (sortMethod === 'size_asc') return a.size - b.size;
        if (sortMethod === 'size_desc') return b.size - a.size;
        return 0;
    });

    if (filteredApps.length === 0) {"""
content = content.replace(old_render_apps, new_render_apps)

with open("js/app.js", "w") as f:
    f.write(content)
print("Patched app.js for filters")
