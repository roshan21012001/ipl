#!/usr/bin/env bash

# Exit on error
set -o errexit

# Install dependencies
npm install

# Ensure the Puppeteer cache directory exists and is persistent
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome to the persistent cache directory
# This command ensures Chrome is downloaded to the specified cache directory
npx puppeteer browsers install chrome

# Optional: Store/pull Puppeteer cache with build cache (for faster subsequent builds)
# This part helps in caching the downloaded Chromium binary
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  # Copying from the actual path where Puppeteer stores its Chrome binary
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
fi
