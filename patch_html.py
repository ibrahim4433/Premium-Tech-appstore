import re

with open("index.html", "r") as f:
    content = f.read()

old_header = """    <header class="top-header">
        <div class="nav-container">
            <div class="nav-brand">
                <img src="assets/logo.jpg" alt="Premium Tech" class="brand-logo" onerror="this.src='https://ui-avatars.com/api/?name=PT&background=00a8e8&color=fff&rounded=true'">
                <span class="brand-text">Premium Tech</span>
            </div>

            <!-- Desktop Tabs (Visible only on large screens, centered) -->
            <div class="desktop-tabs">
                <button class="desktop-tab active" data-view="home">الرئيسية</button>
                <button class="desktop-tab" data-view="apps">التطبيقات</button>
                <button class="desktop-tab" data-view="games">الألعاب</button>
                <button class="desktop-tab" data-view="categories">التصنيفات</button>
            </div>

            <div class="nav-actions">
                <button id="theme-toggle" class="icon-btn" title="تغيير المظهر">
                    <i class="fa-solid fa-sun"></i>
                </button>
                <button id="lang-toggle" class="icon-btn" title="تغيير اللغة">
                    <i class="fa-solid fa-language"></i>
                </button>
            </div>
        </div>
        
        <div class="search-container">
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="search-input" placeholder="البحث عن تطبيقات وألعاب...">
            </div>
        </div>
    </header>"""

new_header = """    <header class="top-header">
        <div class="nav-container">
            <div class="nav-brand">
                <img src="assets/logo.jpg" alt="Premium Tech" class="brand-logo" onerror="this.src='https://ui-avatars.com/api/?name=PT&background=00a8e8&color=fff&rounded=true'">
                <span class="brand-text">Premium Tech</span>
            </div>

            <div class="search-container">
                <div class="search-bar">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" id="search-input" placeholder="البحث عن تطبيقات وألعاب...">
                </div>
            </div>

            <div class="nav-actions">
                <button id="theme-toggle" class="icon-btn" title="تغيير المظهر">
                    <i class="fa-solid fa-sun"></i>
                </button>
                <button id="lang-toggle" class="icon-btn" title="تغيير اللغة">
                    <i class="fa-solid fa-language"></i>
                </button>
            </div>
        </div>
        
        <div class="desktop-tabs-wrapper">
            <!-- Desktop Tabs (Visible only on large screens, centered) -->
            <div class="desktop-tabs">
                <button class="desktop-tab active" data-view="home">الرئيسية</button>
                <button class="desktop-tab" data-view="apps">التطبيقات</button>
                <button class="desktop-tab" data-view="games">الألعاب</button>
                <button class="desktop-tab" data-view="categories">التصنيفات</button>
            </div>
        </div>
    </header>"""

if old_header in content:
    content = content.replace(old_header, new_header)
    with open("index.html", "w") as f:
        f.write(content)
    print("Patched index.html")
else:
    print("Could not find header in index.html")
