"""
Auto-generate index.jsx file because I am too lazy to update with new links manually

Usage: python3 generate_index.py
"""

import os
import re

SRC_DIR = 'src'
PUBLIC_DIR = 'public'

# collect all jsx files ending in 'App'
apps = [f.split('.')[0] for f in os.listdir(SRC_DIR) if re.match(r'\w*App\b.jsx', f)]

# collect all png files ending in 'App'
app_pics = [f.split('.')[0] for f in os.listdir(PUBLIC_DIR) if re.match(r'\w*App\b.png', f)]

def lazyDefn(app_name):
    return f"const {app_name} = React.lazy(() => import(\"./{app_name}\"));"

def linkElem(app_name):
  # modified from https://stackoverflow.com/a/9283563
  # e.g. Election2020App -> Election 2020 App
  space_case = re.sub(r'((?<=[a-z])[A-Z\d]|(?<!\A)[A-Z\d](?=[a-z]))', r' \1', app_name)

  # remove 'App' at the end of app name, e.g. Election 2020 App -> Election 2020
  space_case = ' '.join(space_case.split(' ')[:-1])

  if app_name in app_pics:
    return f"<Link to=\"{ app_name }\" title=\"{ space_case }\" ><img src=\"{ app_name }.png\" className=\"linkPics\" /></Link>"
  return f"<Link to=\"{ app_name }\">{ space_case }</Link>"

def routeElem(app_name):
    return f"""<Route
        path="{ app_name }"
        element={{
          <React.Suspense fallback={{<>...</>}}>
            <{ app_name } />
          </React.Suspense>
        }}
      />"""

# generate index.html to link to Apps
with open(os.path.join(SRC_DIR, 'index.jsx'), 'w') as index_file:
    newline = '\n'
    index_file.write(f"""// generated using `generate_index.py`

import React from "react";
import ReactDOM from "react-dom/client";
import {{ HashRouter, Link, Route, Routes }} from "react-router-dom";

{ f'{newline}'.join(list(map(lazyDefn, apps))) }


export function renderToDOM(container) {{
  ReactDOM.createRoot(container).render(
    <HashRouter>
        <Routes>
        <Route
            index
            element={{
            <main id=\"index-main\">
                <div className=\"main-container\">
                    { f'{newline}            '.join(list(map(linkElem, apps))) }
                </div>
            </main>
            }}
        />
        { f'{newline}      '.join(list(map(routeElem, apps))) }
        </Routes>
    </HashRouter>
  );
}}

    """)