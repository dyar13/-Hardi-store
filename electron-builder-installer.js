/**
 * Electron Builder Installer Configuration
 * Professional Custom Installer for Hardi Store
 * Created By: DYAR - 2026
 */

const path = require('path');

module.exports = {
  "build": {
    "appId": "com.hardistore.desktop",
    "productName": "Hardi Store",
    "artifactName": "Hardi-Store-Setup-${version}.${ext}",
    
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    
    "directories": {
      "buildResources": ".",
      "output": "dist-installer"
    },
    
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "HARDI_STORE_DESKTOP.ico",
      "certificateFile": null,
      "certificatePassword": null,
      "signingHashAlgorithms": ["sha256"]
    },
    
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Hardi Store",
      "installerIcon": "HARDI_STORE_DESKTOP.ico",
      "uninstallerIcon": "HARDI_STORE_DESKTOP.ico",
      "installerHeaderIcon": "HARDI_STORE_DESKTOP.ico",
      "installerSidebarImage": "HARDI_STORE_DESKTOP.ico",
      "runAfterFinish": true,
      "deleteAppDataOnUninstall": false,
      "artifactName": "Hardi-Store-${version}-Setup.exe"
    }
  }
};
