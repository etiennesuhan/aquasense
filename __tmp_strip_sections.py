# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('index.html')
text = path.read_text(encoding='utf-8')
# remove use-cases section
start = text.find('<section id="use-cases"')
if start != -1:
    end = text.find('</section>', start)
    text = text[:start] + text[end+len('</section>'):]  # remove first closing section
# remove newsletter section
start = text.find('<section id="newsletter"')
if start != -1:
    end = text.find('</section>', start)
    text = text[:start] + text[end+len('</section>'):]  # remove first closing section
# remove request CTA button in hero
text = text.replace('\n          <a class="button button--ghost" href="request.html" data-i18n="heroRequestCta">Individuelle Anfrage stellen</a>', '')
path.write_text(text, encoding='utf-8')
