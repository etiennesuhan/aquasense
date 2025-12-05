# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('shop.html')
text = path.read_text(encoding='utf-8')
start = text.find('<section id="hero"')
if start != -1:
    end = text.find('</section>', start)
    text = text[:start] + text[end+len('</section>'):]  # remove hero section
path.write_text(text, encoding='utf-8')
