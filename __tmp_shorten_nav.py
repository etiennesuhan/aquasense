from pathlib import Path
for name in ['index.html','app.html','shop.html','request.html']:
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    start = text.index('<ul id="nav-links" class="nav__list">')
    end = text.index('</ul>', start) + len('</ul>')
    new_block = '\n        <ul id="nav-links" class="nav__list">\n          <li><a href="#hero" data-home="index.html#hero" data-nav="home" data-i18n="navStart">Start</a></li>\n          <li><a href="app.html" data-nav="app" data-i18n="navApp">App</a></li>\n          <li><a href="shop.html" data-nav="shop" data-i18n="navShop">Shop</a></li>\n          <li><button class="lang-toggle" type="button" aria-label="Sprache umschalten">DE / EN</button></li>\n        </ul>'
    text = text[:start] + new_block + text[end:]
    path.write_text(text, encoding='utf-8')
