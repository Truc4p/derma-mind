# Installation Script for Skin Study Mobile App

This script installs all dependencies and sets up the mobile app.

## Usage

```bash
chmod +x install.sh
./install.sh
```

## What it does:

1. Checks for Node.js and npm
2. Installs project dependencies
3. Verifies Expo CLI installation
4. Checks backend availability
5. Provides next steps

## Manual Installation

If the script doesn't work, install manually:

```bash
# Install dependencies
npm install

# Install Expo CLI globally (if needed)
npm install -g expo-cli

# Start the app
npm start
```

## Requirements

- Node.js v14 or higher
- npm v6 or higher
- Internet connection

## Troubleshooting

If installation fails:

1. Check Node.js version: `node --version`
2. Update npm: `npm install -g npm@latest`
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and try again:
   ```bash
   rm -rf node_modules
   npm install
   ```
