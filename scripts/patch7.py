with open("js/app.js", "r") as f:
    content = f.read()

# 1. Update setupEventListeners for category search
old_setup = """    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        if (currentSearch && activeView === 'categories') {
            switchView('home'); // Automatically switch to a grid view to show results
        }
        renderApps();
    });"""

new_setup = """    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (activeView === 'categories') {
            renderCategories();
        } else {
            renderApps();
        }
    });"""
content = content.replace(old_setup, new_setup)

# 2. Add getTagInfo and rewrite renderCategories
old_render_cats = """function renderCategories() {
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
}"""

new_render_cats = """function getTagInfo(tag) {
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
    });
}"""
content = content.replace(old_render_cats, new_render_cats)

# 3. Swap version and description in renderApps
old_render_apps_card = """        const versionText = app.version ? (currentLanguage === 'ar' ? `إصدار: ${app.version}` : `v${app.version}`) : (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
        
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
            ${imgHTML}
            <div class="card-info">
                <div class="card-title">${app.name}</div>
                <div class="card-category" style="opacity: 0.8; font-size: 0.8rem; line-height: 1.4; color: var(--accent-color); font-weight: bold;">${versionText}</div>
            </div>"""

new_render_apps_card = """        let descWords = '';
        if (app.description) {
            const words = app.description.trim().split(/\\s+/);
            if (words.length > 0 && words[0] !== '') {
                descWords = words.slice(0, 4).join(' ');
                if (words.length > 4) {
                    descWords += '...';
                }
            }
        }
        const categoryText = descWords || (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
        
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
            ${imgHTML}
            <div class="card-info">
                <div class="card-title">${app.name}</div>
                <div class="card-category" style="opacity: 0.8; font-size: 0.8rem; line-height: 1.4;">${categoryText}</div>
            </div>"""
content = content.replace(old_render_apps_card, new_render_apps_card)


# 4. Update openAppDetails (Version, Note position, Join button style)
old_open_details = """function openAppDetails(app) {
    history.pushState({ modalOpen: true }, ''); // Push state for back button
    
    document.getElementById('modal-title').textContent = app.name;
    
    let descWords = '';
    if (app.description) {
        const words = app.description.trim().split(/\\s+/);
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
    
    // Add Note for large files
    const isLarge = app.size > 19.5 * 1024 * 1024;
    if (isLarge) {
        const noteText = currentLanguage === 'ar' 
            ? 'ملاحظة: يجب الانضمام للقناة الخاصة أولاً لتتمكن من تحميل هذا الملف الكبير عبر تليجرام.' 
            : 'Note: You must join the private channel first to download this large file via Telegram.';
        document.getElementById('modal-description').innerHTML = `<div style="background: rgba(0, 168, 232, 0.1); border-right: 4px solid var(--accent-color); padding: 1rem; margin-bottom: 1rem; border-radius: 4px; font-weight: 600;">${noteText}</div>` + app.description.replace(/\\n/g, '<br>');
    } else {
        document.getElementById('modal-description').innerHTML = app.description.replace(/\\n/g, '<br>');
    }
    
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
        joinBtn.className = 'btn';
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.style.background = 'var(--bg-secondary)';
        joinBtn.style.color = 'var(--text-primary)';
        joinBtn.style.border = '1px solid var(--border-color)';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}`;
        
        modalActions.style.display = 'flex';
        modalActions.style.gap = '0.5rem';
        downloadBtn.style.flex = '2';
        joinBtn.style.flex = '1';
        
        modalActions.appendChild(joinBtn);
        
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
        
        downloadBtn.style.flex = '1';
    }"""

new_open_details = """function openAppDetails(app) {
    history.pushState({ modalOpen: true }, ''); // Push state for back button
    
    document.getElementById('modal-title').textContent = app.name;
    
    const versionText = app.version ? (currentLanguage === 'ar' ? `إصدار: ${app.version}` : `v${app.version}`) : (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
    
    document.getElementById('modal-category').innerHTML = `<span style="color: var(--accent-color); font-weight: bold;">${versionText}</span>`;
    document.getElementById('modal-size').textContent = formatBytes(app.size);
    
    // Add Note for large files at the bottom
    const isLarge = app.size > 19.5 * 1024 * 1024;
    let descriptionHtml = app.description.replace(/\\n/g, '<br>');
    
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
        joinBtn.className = 'btn btn-primary'; // Match the download button style exactly
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLanguage === 'ar' ? 'انضمام للقناة' : 'Join Channel'}`;
        
        modalActions.style.display = 'flex';
        modalActions.style.gap = '0.5rem';
        downloadBtn.style.flex = '2';
        joinBtn.style.flex = '1';
        
        modalActions.appendChild(joinBtn);
        
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
        
        downloadBtn.style.flex = '1';
    }"""
content = content.replace(old_open_details, new_open_details)

with open("js/app.js", "w") as f:
    f.write(content)
print("Patched successfully")
