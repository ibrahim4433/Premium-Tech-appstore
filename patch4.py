import re

with open("js/app.js", "r") as f:
    content = f.read()

old_str = """document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    renderBanners();
    fetchApps();
    setupEventListeners();
});"""

new_str = """document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    createFloatingBackground();
    renderBanners();
    fetchApps();
    setupEventListeners();
});"""

if old_str in content:
    content = content.replace(old_str, new_str)
    
    new_func = """
function createFloatingBackground() {
    const bgContainer = document.createElement('div');
    bgContainer.className = 'floating-background';
    document.body.appendChild(bgContainer);

    const icons = ['fa-paper-plane', 'fa-android'];
    const numIcons = 20;

    for (let i = 0; i < numIcons; i++) {
        const icon = document.createElement('i');
        const iconClass = icons[Math.floor(Math.random() * icons.length)];
        icon.className = iconClass === 'fa-paper-plane' ? `fa-solid ${iconClass} floating-icon` : `fa-brands ${iconClass} floating-icon`;

        const size = Math.random() * 25 + 15;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 20;

        icon.style.fontSize = `${size}px`;
        icon.style.left = `${left}vw`;
        icon.style.animationDuration = `${duration}s`;
        icon.style.animationDelay = `-${delay}s`;

        bgContainer.appendChild(icon);
    }
}
"""
    content += new_func
    
    with open("js/app.js", "w") as f:
        f.write(content)
    print("Patched app.js successfully")
else:
    print("Could not find the target string in app.js")

