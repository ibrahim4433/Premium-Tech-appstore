with open("js/app.js", "r") as f:
    content = f.read()

# Fix renderApps (remove Join button, add Version)
old_render = """        let descWords = '';
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
        `;"""

new_render = """        const versionText = app.version ? (currentLanguage === 'ar' ? `إصدار: ${app.version}` : `v${app.version}`) : (app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp);
        
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
            </div>
            <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                <i class="fa-solid ${btnIcon}"></i> ${btnText}
            </a>
        `;"""
content = content.replace(old_render, new_render)

# Fix openAppDetails (Add note, fix styling)
old_modal = """function openAppDetails(app) {
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
    }"""

new_modal = """function openAppDetails(app) {
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
content = content.replace(old_modal, new_modal)

with open("js/app.js", "w") as f:
    f.write(content)
print("Patched app.js successfully")
