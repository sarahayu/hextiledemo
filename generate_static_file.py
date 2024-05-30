"""
My way of simulating multi-pages in React, since GitHub Pages does not
support React Routers (and I don't like HashRouters).

Collects all jsx files ending in App (i.e. MainApp.jsx, AltApp.jsx)
and replace `APP_COMPONENT` keyword in an index.jsx.template file with
the App names. This generates variations of the React project with the
App being the main component, and puts these variations in subfolders 
within the generated `out` folder. This script also generates an 
`index.html` file that will have links to these subfolders, simulating
a table of contents main page.

Usage: python3 generate_static_site.py
"""

import os
import re

SRC_DIR = 'src'
BUILD_DIR = 'dist'
OUT_DIR = 'out'
APP_COMPONENT_PATTERN = 'APP_COMPONENT'

apps = [f.split('.')[0] for f in os.listdir(SRC_DIR) if re.match(r'\w*App\b.jsx', f)]

# rename existing index.jsx to an alternate name. we'll restore this later
os.rename(os.path.join(SRC_DIR, 'index.jsx'), os.path.join(SRC_DIR, 'index.jsx.bk'))

# remove `out` directory from previous builds
os.system(f'rm -r { OUT_DIR }')
os.mkdir(OUT_DIR)

for app_name in apps:

    # process template file and generate index.jsx file
    with open(os.path.join(SRC_DIR, 'index.jsx.template'), 'r') as template_file:
        template_contents = template_file.read()
        template_contents = template_contents.replace(APP_COMPONENT_PATTERN, app_name)

    with open(os.path.join(SRC_DIR, 'index.jsx'), 'w') as app_index_file:
        app_index_file.write(template_contents)
        
    # compile and move build files to `out` folder
    os.system('npm run build')
    os.rename(f'{BUILD_DIR}/', os.path.join(OUT_DIR, app_name))
            

# restore renamed index.jsx
os.rename(os.path.join(SRC_DIR, 'index.jsx.bk'), os.path.join(SRC_DIR, 'index.jsx'))

# generate index.html to link to Apps
with open(os.path.join(OUT_DIR, 'index.html'), 'w') as index_file:
    newline = '\n'
    index_file.write(f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Start Page</title>
    <style>
        body {{
            display: grid;
            place-items: center;
            min-height: 100vh;
            font-size: 2rem;
            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
            margin: 0;
            background-color: aliceblue;
        }}

        main {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}

        a {{
            padding: 1rem;
            text-decoration: none;
            color: darkslateblue;
        }}
    </style>
</head>
<body>
    <main>
    { newline.join([f'<a href="{app_name}/">{app_name}</a>' for app_name in apps]) }
    </main>
</body>
</html>
    """)