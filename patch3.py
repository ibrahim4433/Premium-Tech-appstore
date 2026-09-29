import re

with open("js/app.js", "r") as f:
    content = f.read()

old_str = """function openAppDetails(app) {
    document.getElementById('modal-title').textContent = app.name;
    document.getElementById('modal-category').textContent = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
    document.getElementById('modal-size').textContent = formatBytes(app.size);
    document.getElementById('modal-description').textContent = app.description;
    
    const isLarge = app.size > 19.5 * 1024 * 1024;
    const downloadBtn = document.getElementById('modal-download');
    
    if (isLarge) {
        let tgLink = `https://t.me/+ij7-LS669ahhMDFk`; // Fallback to invite link if chat_id is unknown
        if (app.chat_id && app.chat_id.startsWith('-100')) {
            const baseChatId = app.chat_id.substring(4);
            tgLink = `https://t.me/c/${baseChatId}/${app.id}`;
        }
        
        downloadBtn.href = tgLink;
        downloadBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${currentLanguage === 'ar' ? 'تنزيل عبر تليجرام' : 'Download via Telegram'}`;
    } else {
        downloadBtn.href = `${WORKER_URL}/?id=${app.file_id}&action=download&filename=${encodeURIComponent(app.file_name)}`;
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="download-text">${strings[currentLanguage].download}</span>`;
    }"""

new_str = """function openAppDetails(app) {
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

if old_str in content:
    content = content.replace(old_str, new_str)
    with open("js/app.js", "w") as f:
        f.write(content)
    print("Patched openAppDetails successfully")
else:
    print("Could not find the target string in app.js")

