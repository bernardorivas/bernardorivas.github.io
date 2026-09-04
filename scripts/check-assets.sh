#!/bin/bash
set -e
test -f public/files/cv.pdf
test ! -e public/files/teaching
test $(git ls-files 'public/files/teaching/**' | wc -l) -eq 0
test ! -f public/assets/og-formalized-dynamics.png
test $(wc -c < public/og-lorenz-smooth-2026.jpg) -lt 300000
echo OK
