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
echo OK
