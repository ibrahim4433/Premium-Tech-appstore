with open("index.html", "r") as f:
    content = f.read()

old_html = """        <!-- Main Apps Grid -->
        <section id="apps-page" class="page active">
            <h2 id="page-title" class="section-title">الأحدث</h2>"""

new_html = """        <!-- Main Apps Grid -->
        <section id="apps-page" class="page active">
            <!-- Home Actions (Visible only on Home) -->
            <div id="home-actions" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                <a href="https://t.me/+ij7-LS669ahhMDFk" target="_blank" rel="noopener noreferrer" class="download-btn btn-large" style="flex: 1; font-size: 1rem; padding: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--accent-color); color: var(--text-primary);">
                    <i class="fa-solid fa-user-plus"></i>
                    <span id="btn-join-text">انضمام للقناة</span>
                </a>
                <a href="https://t.me/IA_Assistantbot" target="_blank" rel="noopener noreferrer" class="download-btn btn-large" style="flex: 1; font-size: 1rem; padding: 0.8rem;">
                    <i class="fa-solid fa-paper-plane"></i>
                    <span id="btn-request-text">اطلب تطبيق/لعبة</span>
                </a>
            </div>

            <h2 id="page-title" class="section-title">الأحدث</h2>"""

if old_html in content:
    content = content.replace(old_html, new_html)
    with open("index.html", "w") as f:
        f.write(content)
    print("Patched index.html")
else:
    print("Could not find section in index.html")
