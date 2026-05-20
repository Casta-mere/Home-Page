docker compose down
cd home-page
npm run build
cd ..
docker compose up -d

# metacubexd is on Docker's default bridge; attach it to homepage's network so
# the health probe can reach it by name, bypassing the clash-meta intercept.
docker network connect home-page_default metacubexd 2>/dev/null || true
