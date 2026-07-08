#!/bin/zsh
set -e

# Build the image first, then recreate — the site is only down for the
# container swap (seconds), not the whole build.
docker compose build
docker compose up -d

# metacubexd / ch-ui live on other networks; attach them to homepage's network
# so the health probe can reach them by name, bypassing the clash-meta intercept.
docker network connect home-page_default metacubexd 2>/dev/null || true
docker network connect home-page_default ch-ui 2>/dev/null || true
