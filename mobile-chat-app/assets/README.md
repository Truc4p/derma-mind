# Mobile App Assets

Place your app icons and splash screens in this directory.

## Required Assets

### Icon
- **File:** `icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Usage:** App icon on home screen

### Splash Screen
- **File:** `splash.png`
- **Size:** 1242x2436 pixels (or larger)
- **Format:** PNG
- **Usage:** Loading screen when app starts
- **Background Color:** #EEF2FF (set in app.json)

### Adaptive Icon (Android)
- **File:** `adaptive-icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Usage:** Android adaptive icon
- **Note:** Center 512x512 area should contain your logo

### Favicon (Web)
- **File:** `favicon.png`
- **Size:** 48x48 pixels (or 96x96)
- **Format:** PNG
- **Usage:** Browser tab icon when running on web

## Temporary Setup

Until you create custom assets, you can use placeholder images:

1. Create a simple colored square as `icon.png`
2. Create a simple splash screen as `splash.png`
3. Copy `icon.png` to `adaptive-icon.png`
4. Resize icon to 48x48 for `favicon.png`

## Design Guidelines

### Icon Design
- Keep it simple and recognizable
- Use your brand colors (primary: #6366F1)
- Should work well at small sizes
- Test on both light and dark backgrounds

### Splash Screen
- Match your app's color scheme
- Can include your logo or app name
- Keep it simple - shows briefly on launch

## Generating Assets

You can use these tools to generate all required sizes:

1. **Icon Kitchen**: https://icon.kitchen/
2. **AppIcon**: https://www.appicon.co/
3. **Expo Icon Generator**: Built into Expo

Or design in Figma/Sketch and export at required sizes.

## Current Configuration

See `app.json` for current asset configuration:

```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "backgroundColor": "#EEF2FF"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#EEF2FF"
    }
  }
}
```
