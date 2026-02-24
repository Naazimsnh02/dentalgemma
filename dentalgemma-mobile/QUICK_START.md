# Quick Start - Build APK in 5 Minutes

## Prerequisites Check

Open Command Prompt and verify:

```cmd
node --version
java -version
```

Need to install?
- Node.js: https://nodejs.org/ (v22.11.0+)
- Java JDK: https://adoptium.net/ (v17+)

## Fast Build Steps

### 1. Navigate to Mobile App

```cmd
cd dentalgemma-mobile
```

### 2. Install Dependencies

```cmd
npm install
```

### 3. Setup Environment

```cmd
copy .env.example .env
notepad .env
```

Add your Google Places API key (get from https://console.cloud.google.com/)

### 4. Generate Keystore (First Time Only)

```cmd
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore dentalgemma-release-key.keystore -alias dentalgemma-key-alias -keyalg RSA -keysize 2048 -validity 10000
cd ..\..
```

Enter a password when prompted (remember it!)

### 5. Configure Signing

Edit `android/gradle.properties` and add at the end:

```properties
DENTALGEMMA_UPLOAD_STORE_FILE=dentalgemma-release-key.keystore
DENTALGEMMA_UPLOAD_KEY_ALIAS=dentalgemma-key-alias
DENTALGEMMA_UPLOAD_STORE_PASSWORD=your-password-here
DENTALGEMMA_UPLOAD_KEY_PASSWORD=your-password-here
```

### 6. Build APK

```cmd
npm run build:apk
```

Wait 5-10 minutes...

### 7. Get Your APK

```cmd
android\app\build\outputs\apk\release\app-release.apk
```

## Install on Device

### Option 1: USB Install
```cmd
cd android
.\gradlew installRelease
```

### Option 2: Manual Install
1. Copy `app-release.apk` to your phone
2. Open the file
3. Allow installation from unknown sources
4. Install!

## Automated Build

Or just run:

```cmd
build-apk.bat
```

This script does everything automatically!

## Troubleshooting

**"SDK location not found"**

Create `android/local.properties`:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**"Keystore not found"**

Make sure `dentalgemma-release-key.keystore` is in `android/app/` folder

**Build takes forever**

First build downloads dependencies. Subsequent builds are faster.

## Need Help?

See detailed guide: `BUILD_APK_GUIDE.md`
