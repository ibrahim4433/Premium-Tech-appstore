with open("css/style.css", "r") as f:
    content = f.read()

old_nav = """.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0 0.5rem;
    gap: 1rem;
}"""

new_nav = """.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0 0.5rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.nav-brand { order: 1; }
.nav-actions { order: 2; }

.search-container {
    order: 3;
    width: 100%;
}
"""
content = content.replace(old_nav, new_nav)

old_desktop_tabs = """@media (min-width: 768px) {
    .desktop-tabs {
        display: flex;
        flex: 1;
        justify-content: center;
    }
}"""

new_desktop_tabs = """@media (min-width: 768px) {
    .search-container {
        order: 2;
        width: auto;
        flex: 1;
        margin: 0 2rem;
        max-width: 500px;
    }
    .nav-actions { order: 3; }
    
    .desktop-tabs-wrapper {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-top: 0.5rem;
    }
    .desktop-tabs {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
    }
}"""
content = content.replace(old_desktop_tabs, new_desktop_tabs)

with open("css/style.css", "w") as f:
    f.write(content)
print("Patched css")
