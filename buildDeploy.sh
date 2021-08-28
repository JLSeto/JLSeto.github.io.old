#!/bin/bash
ng build --configuration production --output-path docs --base-href https://jlseto.github.io
cp docs/index.html docs/404.html
touch docs/.nojekyll
git add *
git commit -am "updates"
git push