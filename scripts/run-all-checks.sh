#!/usr/bin/env bash
# Full regression: run with the dev server on :5177 (and `npm run preview -- --port 4173` for smoothness).
cd "$(dirname "$0")/.."
npx vite build 2>&1 | grep -E "rror|built in"
echo "== original suites"
for s in verify verify-commerce-v4 verify-menu-rebuild verify-home-restoration; do node scripts/$s.mjs > output/t-$s.log 2>&1; echo "$s passed=$(grep -c '"passed": true' output/t-$s.log) failed=$(grep -c '"passed": false' output/t-$s.log)"; done
node scripts/check-layouts.mjs > output/t-layouts.log 2>&1; echo "check-layouts overflow=$(grep -c '"overflow": true' output/t-layouts.log)"
echo "== overflow/errors, 7 sizes x 6 pages"; node scripts/check-v6.mjs > output/t-v6.json; node -e "const r=require('./output/t-v6.json');let bad=0;for(const x of r){if(x.reducedMotion)continue;if(x.pageOver||x.errors.length)bad++}console.log('problems:',bad)"
echo "== pinned scenes (portrait phones, tablets, desktop)"; SIZES=390x844,441x690,360x640,412x915,768x1024,820x1180,1024x768,1440x900 node scripts/check-pins.mjs 2>&1 | grep -E "FAIL|problems"
echo "== photo pile"; node scripts/check-pile.mjs | tail -1
echo "== route"; node scripts/check-route.mjs 2>&1 | grep -v "^   "
echo "== touch"; node scripts/check-touch.mjs | tail -1
echo "== reduced motion"; node scripts/check-static.mjs | tail -1
echo "== landscape phones (auto calm layout)"; SIZES=844x390,740x360,932x430 NOREDUCE=1 node scripts/check-static.mjs | tail -1
echo "== SEO"; node scripts/check-seo.mjs | cut -c1-60
