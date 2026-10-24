# Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_worker = 'const WORKER_URL = "https://appstore-proxy.4445622.workers.dev";'
new_worker = 'const WORKER_URL = "https://appstore-proxy.iateam.workers.dev";'

assert old_worker in js, "Old worker URL not found in js/app.js"
js = js.replace(old_worker, new_worker)

with open('js/app.js', 'w', encoding='utf-8', newline='') as f:
    f.write(js)
print('Updated WORKER_URL in js/app.js')

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_icons = '''    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#011b33">
    <link rel="apple-touch-icon" href="assets/logo-192.png">'''

new_icons = '''    <!-- Favicon & Browser Tab Icons -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/logo-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="assets/logo-512.png">
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="apple-touch-icon" href="assets/logo-192.png">
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#011b33">'''

assert old_icons in html, "Old icon block not found in index.html"
html = html.replace(old_icons, new_icons)
html = html.replace('?v=18', '?v=19')

with open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Updated icons and version in index.html')

# Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

old_cache_list = ''''./manifest.json',
  './assets/logo-192.png','''

new_cache_list = ''''./manifest.json',
  './favicon.ico',
  './assets/logo-192.png','''

if old_cache_list in sw:
    sw = sw.replace(old_cache_list, new_cache_list)

sw = sw.replace('premium-techs-cache-v18', 'premium-techs-cache-v19')

with open('sw.js', 'w', encoding='utf-8', newline='') as f:
    f.write(sw)
print('Updated sw.js cache')
