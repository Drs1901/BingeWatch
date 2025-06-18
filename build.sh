#!/bin/bash

# Install dependencies
npm ci

# Build the project
npm run build

# Copy _redirects to dist folder for Render.com
cp public/_redirects dist/_redirects

echo "Build completed successfully!"