import os
import re

files = [
    'c:/Users/saich/projects/formify/public/index.html',
    'c:/Users/saich/projects/formify/public/admin.html',
    'c:/Users/saich/projects/formify/public/owner.html',
    'c:/Users/saich/projects/formify/public/form.html',
    'c:/Users/saich/projects/formify/public/responses.html'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean HTML tags
    content = content.replace('<canvas id="hero-canvas"></canvas>', '')
    content = content.replace('<canvas id="bg-canvas"></canvas>', '')
    content = content.replace('<canvas id="neural-canvas"></canvas>', '')

    # Remove any remaining JS canvas logic
    js_patterns = [
        re.compile(r'\/\*\s*---\s*3D INTERACTIVE MESH LOGIC\s*---\s*\*\/.*?animate\(\);\s*', re.IGNORECASE | re.DOTALL),
        re.compile(r'\/\*\s*---\s*3D INTERACTIVE BACKGROUND LOGIC\s*---\s*\*\/.*?animate\(\);\s*', re.IGNORECASE | re.DOTALL),
        re.compile(r'\/\*\s*---\s*3D NEURAL NETWORK VISUALS\s*---\s*\*\/.*?animate\(\);\s*', re.IGNORECASE | re.DOTALL),
        re.compile(r'const canvas = document.getElementById\([\'"]bg-canvas[\'"]\);.*?animate\(\);\s*', re.IGNORECASE | re.DOTALL),
        re.compile(r'const canvas = document.getElementById\([\'"]bg-canvas[\'"]\);.*?draw\(\);\s*', re.IGNORECASE | re.DOTALL)
    ]
    for p in js_patterns:
        content = p.sub('', content)

    # Re-apply CSS changes if they missed
    bg_pattern = re.compile(r'(body\s*\{[^}]*?background(?:-color)?:\s*)[^;]+;')
    bg_style = r'\1#09090b;\n      background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent);'
    content = bg_pattern.sub(bg_style, content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
