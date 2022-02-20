# Nearpass Web Extension

Open-source, decentralized and private password manager built on Near Protocol. This repo contains code for the web
extension for Chrome.

## Installing and Running

1. Run `yarn` to install the dependencies.
2. Provide environment configuration for the extension by copying `.env.example` to `.env` and making changes to the
   environment variables as needed.
3. Run `yarn start`
4. Load your extension on Chrome following:
    1. Access `chrome://extensions/`
    2. Check `Developer mode`
    3. Click on `Load unpacked extension`
    4. Select the `build` folder.
5. Happy hacking.

# Installing from Pre-built Zip

1. Download the [pre-built zip file](zips/nearpass.ext.zip) from GitHub.
2. Extract it.
3. Load your extension on Chrome following:
    1. Access `chrome://extensions/`
    2. Check `Developer mode`
    3. Click on `Load unpacked extension`
    4. Select the folder where you extracted the zip to.
4. Happy hacking.
