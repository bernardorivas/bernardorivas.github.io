#!/bin/bash
set -e
test -f "public/files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf"
test -f public/files/cv.pdf
test $(find public/files/teaching/calculus-i -name 'workshop-*.pdf' | wc -l) -eq 14
test ! -f public/files/teaching/real-analysis/workshop-04.pdf   # intentional gap
test ! -f public/files/teaching/real-analysis/workshop-06.pdf   # intentional gap
test ! -f public/assets/og-formalized-dynamics.png
test $(wc -c < public/og-dynamics-2026.jpg) -lt 300000
echo OK
