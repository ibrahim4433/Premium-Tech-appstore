with open("js/app.js", "r") as f:
    content = f.read()

# 1. Update setLanguage for the new buttons
old_lang = """    // Update Desktop Tabs
    document.querySelector('.desktop-tabs [data-view="home"]').textContent = strings[lang].navHome;
    document.querySelector('.desktop-tabs [data-view="games"]').textContent = strings[lang].navGames;
    document.querySelector('.desktop-tabs [data-view="apps"]').textContent = strings[lang].navApps;
    document.querySelector('.desktop-tabs [data-view="categories"]').textContent = strings[lang].navCategories;

    updateViewTitle();"""

new_lang = """    // Update Desktop Tabs
    document.querySelector('.desktop-tabs [data-view="home"]').textContent = strings[lang].navHome;
    document.querySelector('.desktop-tabs [data-view="games"]').textContent = strings[lang].navGames;
    document.querySelector('.desktop-tabs [data-view="apps"]').textContent = strings[lang].navApps;
    document.querySelector('.desktop-tabs [data-view="categories"]').textContent = strings[lang].navCategories;

    // Update Home Actions
    const btnJoinText = document.getElementById('btn-join-text');
    if (btnJoinText) btnJoinText.textContent = lang === 'ar' ? 'انضمام للقناة' : 'Join Channel';
    const btnReqText = document.getElementById('btn-request-text');
    if (btnReqText) btnReqText.textContent = lang === 'ar' ? 'اطلب تطبيق/لعبة' : 'Request App/Game';

    updateViewTitle();"""
content = content.replace(old_lang, new_lang)

# 2. Update switchView for home actions
old_switch = """    // Handle Search Override
    if (currentSearch !== '') {
        currentSearch = '';
        searchInput.value = '';
    }

    // Show selected page"""

new_switch = """    // Handle Search Override
    if (currentSearch !== '') {
        currentSearch = '';
        searchInput.value = '';
    }
    
    // Toggle home actions
    const homeActions = document.getElementById('home-actions');
    if (homeActions) {
        homeActions.style.display = viewName === 'home' ? 'flex' : 'none';
    }

    // Show selected page"""
content = content.replace(old_switch, new_switch)


# 3. Update renderBanners for Auto scroll
old_banners = """        const card = document.createElement('a');
        card.href = '#'; // Will add filter link functionality later if needed
        card.className = 'banner';
        card.innerHTML = `
            <img src="${WORKER_URL}/?id=${b.file_id}&action=image" alt="${b.name}" loading="lazy" onerror="this.src='assets/logo.jpg'">
            <div class="banner-overlay">
                <span class="banner-tag">${b.name}</span>
            </div>
        `;
        bannersSection.appendChild(card);
    });
}"""

new_banners = """        const card = document.createElement('a');
        card.href = '#'; // Will add filter link functionality later if needed
        card.className = 'banner';
        card.innerHTML = `
            <img src="${WORKER_URL}/?id=${b.file_id}&action=image" alt="${b.name}" loading="lazy" onerror="this.src='assets/logo.jpg'">
            <div class="banner-overlay">
                <span class="banner-tag">${b.name}</span>
            </div>
        `;
        bannersSection.appendChild(card);
    });
    
    // Setup Auto Scroll
    if (window.bannerScrollInterval) clearInterval(window.bannerScrollInterval);
    
    if (BANNERS.length > 1) {
        window.bannerScrollInterval = setInterval(() => {
            if (!bannersSection || bannersSection.style.display === 'none') return;
            if (bannersSection.matches(':hover') || bannersSection.matches(':active')) return;
            
            const bannerElement = bannersSection.querySelector('.banner');
            if (!bannerElement) return;
            
            const cardWidth = bannerElement.offsetWidth + 16;
            const maxScroll = bannersSection.scrollWidth - bannersSection.clientWidth;
            const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
            
            if (isRtl) {
                if (Math.abs(bannersSection.scrollLeft) >= maxScroll - 10) {
                    bannersSection.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    bannersSection.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                }
            } else {
                if (bannersSection.scrollLeft >= maxScroll - 10) {
                    bannersSection.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    bannersSection.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, 3500); // Scroll every 3.5 seconds
    }
}"""
content = content.replace(old_banners, new_banners)


# 4. Update Modal joinBtn class
old_modal_btn = """        joinBtn.className = 'btn btn-primary'; // Match the download button style exactly
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}`;"""

new_modal_btn = """        joinBtn.className = 'download-btn btn-large'; // Match the exact rectangle style
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.style.background = 'var(--bg-secondary)'; // Use slightly different background to distinguish it
        joinBtn.style.border = '1px solid var(--accent-color)';
        joinBtn.style.color = 'var(--text-primary)';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}`;"""
content = content.replace(old_modal_btn, new_modal_btn)

with open("js/app.js", "w") as f:
    f.write(content)
print("Patched app.js")
