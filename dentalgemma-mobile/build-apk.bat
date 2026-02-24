@echo off
echo ========================================
echo DentalGemma Mobile - APK Builder
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found!
    echo Please run this script from dentalgemma-mobile directory
    pause
    exit /b 1
)

echo Step 1: Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found! Please install Node.js 22.11.0 or higher
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo Step 2: Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo Error: Java not found! Please install JDK 17 or higher
    pause
    exit /b 1
)
echo Java found!
echo.

echo Step 3: Checking .env file...
if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env and add your GOOGLE_PLACES_API_KEY
    echo Press any key to open .env in notepad...
    pause
    notepad .env
)
echo.

echo Step 4: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed!
    pause
    exit /b 1
)
echo.

echo Step 5: Checking keystore...
if not exist "android\app\dentalgemma-release-key.keystore" (
    echo.
    echo ========================================
    echo KEYSTORE NOT FOUND!
    echo ========================================
    echo.
    echo You need to generate a release keystore first.
    echo.
    echo Run this command:
    echo cd android\app
    echo keytool -genkeypair -v -storetype PKCS12 -keystore dentalgemma-release-key.keystore -alias dentalgemma-key-alias -keyalg RSA -keysize 2048 -validity 10000
    echo.
    echo Then configure android\gradle.properties with your keystore details.
    echo.
    echo See BUILD_APK_GUIDE.md for detailed instructions.
    echo.
    pause
    exit /b 1
)
echo Keystore found!
echo.

echo Step 6: Cleaning previous builds...
call npm run clean:android
echo.

echo Step 7: Building APK...
echo This may take 5-10 minutes...
echo.
call npm run build:apk
if errorlevel 1 (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Keystore configuration in gradle.properties
    echo 2. Android SDK not found - create android\local.properties
    echo 3. Missing dependencies
    echo.
    echo Check BUILD_APK_GUIDE.md for troubleshooting
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your APK is ready at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo File size:
dir android\app\build\outputs\apk\release\app-release.apk | findstr "app-release.apk"
echo.
echo Next steps:
echo 1. Transfer app-release.apk to your Android device
echo 2. Enable "Install from unknown sources" in device settings
echo 3. Open the APK file on your device to install
echo.
echo Or install via USB:
echo   cd android
echo   gradlew installRelease
echo.
pause
