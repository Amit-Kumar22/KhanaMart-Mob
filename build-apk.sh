#!/bin/bash
set -e

echo "🔨 Building KhanaMart Debug APK..."
echo ""

cd "$(dirname "$0")/android"

# Clean old build artifacts
echo "🧹 Cleaning old builds..."
./gradlew clean

# Build debug APK
echo ""
echo "📦 Building APK (this takes 5-10 minutes)..."
./gradlew assembleDebug --no-daemon --warning-mode=all

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo ""
    echo "✅ BUILD SUCCESS!"
    echo ""
    echo "📱 APK Location:"
    echo "   $(pwd)/$APK_PATH"
    echo ""
    echo "📊 APK Size: $APK_SIZE"
    echo ""
    echo "📲 To install on Android device:"
    echo "   1. Connect phone via USB"
    echo "   2. Enable USB debugging on phone"
    echo "   3. Run: adb install -r $APK_PATH"
    echo ""
    echo "   OR transfer APK to phone and install manually"
    echo ""
else
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi
