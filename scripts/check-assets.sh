#!/bin/bash
set -e

expected_public_files=$'public/CNAME\npublic/assets/profile.jpg\npublic/favicon.png\npublic/files/cv.pdf\npublic/og-lorenz-smooth-2026.jpg'
actual_public_files=$(find public -type f -print | LC_ALL=C sort)
if [ "$actual_public_files" != "$expected_public_files" ]; then
  echo "Unexpected public files"
  exit 1
fi

test ! -e public/files/teaching
test $(git ls-files 'public/files/teaching/**' | wc -l) -eq 0
test $(wc -c < public/og-lorenz-smooth-2026.jpg) -lt 300000

if ! cmp -s public/files/cv.pdf out/files/cv.pdf; then
  echo "The exported CV differs from public/files/cv.pdf."
  exit 1
fi
main_cv=../curriculum-vitae/cv-main.pdf
if [ -f "$main_cv" ] && ! cmp -s "$main_cv" public/files/cv.pdf; then
  echo "Refresh public/files/cv.pdf from ../curriculum-vitae/cv-main.pdf."
  exit 1
fi

echo OK
