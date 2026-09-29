import re

with open("js/app.js", "r") as f:
    content = f.read()

old_str = """        const categoryText = app.category === 'Games' ? strings[currentLanguage].categoryGame : strings[currentLanguage].categoryApp;
        
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
        const btnText = isLarge ? (currentLanguage === 'ar' ? 'تليجرام' : 'Telegram') : strings[currentLanguage].download;

        card.innerHTML = `
            ${imgHTML}
            <div class="card-info">
                <div class="card-title">${app.name}</div>
                <div class="card-category">${categoryText}</div>
            </div>
            <!-- Prevent modal open when clicking download -->
            <a href="${downloadLink}" class="card-install-btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                <i class="fa-solid ${btnIcon}"></i> ${btnText}
            </a>
        `;"""

new_str = """        let descWords = '';
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

if old_str in content:
    content = content.replace(old_str, new_str)
    with open("js/app.js", "w") as f:
        f.write(content)
    print("Patched renderApps successfully")
else:
    print("Could not find the target string in app.js")

