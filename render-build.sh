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