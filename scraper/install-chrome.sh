#!/bin/bash

# Install Chrome for Puppeteer on Render
echo "Installing Chrome for Puppeteer..."

# Download and install Chrome
curl -L -o google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome.deb || apt-get -fy install
rm google-chrome.deb

# Verify installation
which google-chrome || which google-chrome-stable

echo "Chrome installation completed"