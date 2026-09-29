with open("index.html", "r") as f:
    content = f.read()

old_search = """        <div class="search-container">
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="search-input" placeholder="البحث عن تطبيقات وألعاب...">
            </div>
        </div>"""

new_search = """        <div class="search-container">
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="search-input" placeholder="البحث عن تطبيقات وألعاب...">
                <button id="filter-toggle" class="filter-toggle" aria-label="Toggle Filters">
                    <i class="fa-solid fa-sliders"></i>
                </button>
            </div>
            
            <div id="filter-panel" class="filter-panel" style="display: none;">
                <div class="filter-group">
                    <label id="label-sort">ترتيب حسب</label>
                    <select id="sort-select">
                        <option value="new" id="opt-sort-new">الأحدث</option>
                        <option value="old" id="opt-sort-old">الأقدم</option>
                        <option value="name_asc" id="opt-sort-asc">الاسم (أ-ي)</option>
                        <option value="name_desc" id="opt-sort-desc">الاسم (ي-أ)</option>
                        <option value="size_asc" id="opt-size-asc">الحجم (الأصغر)</option>
                        <option value="size_desc" id="opt-size-desc">الحجم (الأكبر)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label id="label-size">حجم الملف</label>
                    <select id="size-select">
                        <option value="all" id="opt-size-all">الكل</option>
                        <option value="small" id="opt-size-small">أصغر من 20MB (مباشر)</option>
                        <option value="large" id="opt-size-large">أكبر من 20MB (تليجرام)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label id="label-category">التصنيف</label>
                    <select id="category-select">
                        <option value="all" id="opt-cat-all">الكل</option>
                        <!-- Injected via JS -->
                    </select>
                </div>
            </div>
        </div>"""

content = content.replace(old_search, new_search)

with open("index.html", "w") as f:
    f.write(content)
print("Patched index.html for filters")

# --- Patch style.css ---
with open("css/style.css", "a") as f:
    f.write("""

/* Filters & Search */
.filter-toggle {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    height: 100%;
    display: flex;
    align-items: center;
}
:root[dir="rtl"] .filter-toggle { right: auto; left: 1rem; }
.filter-toggle:hover, .filter-toggle.active { color: var(--accent-color); }

.search-bar input { padding: 0.8rem 3rem 0.8rem 3rem !important; }

.filter-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    animation: slideDown 0.3s ease-out;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.filter-group { flex: 1; min-width: 140px; }
.filter-group label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    color: var(--text-secondary);
}
.filter-group select {
    width: 100%;
    padding: 0.6rem;
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
}
.filter-group select:focus { border-color: var(--accent-color); }
""")
print("Patched style.css")
