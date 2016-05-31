#!/bin/sh

./node_modules/.bin/tsc
cp src/index.html src/wikipedia.css src/wikipedia.js src/wikipedia.js.map dist/
