with open("css/style.css", "r") as f:
    css = f.read()

old_css = """.filter-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    animation: slideDown 0.3s ease-out;
}"""

new_css = """.search-container { position: relative; }
.filter-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    animation: slideDown 0.2s ease-out;
}"""

css = css.replace(old_css, new_css)
with open("css/style.css", "w") as f:
    f.write(css)
print("Patched css")
