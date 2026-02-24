# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep llama.rn native library
-keep class com.rnllama.** { *; }

# Keep react-native-config
-keep class com.lugg.ReactNativeConfig.** { *; }

# Keep react-native-maps
-keep class com.google.android.gms.maps.** { *; }

# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep RNFS
-keep class com.rnfs.** { *; }

# Keep image picker
-keep class com.imagepicker.** { *; }

# Keep device info
-keep class com.learnium.RNDeviceInfo.** { *; }

# Disabling obfuscation is useful if you collect stack traces from production crashes
-dontobfuscate
